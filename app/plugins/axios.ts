import axios from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const api = axios.create({
    baseURL: `${config.public.baseUrl}/api`,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  })

  api.interceptors.request.use((req) => {
    const token = authStore.accessToken
    if (token) req.headers.Authorization = `Bearer ${token}`
    return req
  })

  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true
        try {
          await authStore.refresh()
          original.headers.Authorization = `Bearer ${authStore.accessToken}`
          return api(original)
        } catch {
          authStore.logout()
          navigateTo('/login')
        }
      }
      return Promise.reject(error)
    }
  )

  return { provide: { api } }
})
