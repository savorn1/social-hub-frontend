import { defineStore } from 'pinia'
import type { User, LoginPayload, RegisterPayload } from '~/types'
import { useAuthService } from '~/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const authService = useAuthService()

  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  function _persist(data: { user: User; accessToken: string; refreshToken: string }) {
    user.value = data.user
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    if (import.meta.client) {
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      const serialized = JSON.stringify(data.user)
      if (serialized) localStorage.setItem('user', serialized)
    }
  }

  function hydrate() {
    if (!import.meta.client) return
    const t = localStorage.getItem('accessToken')
    const r = localStorage.getItem('refreshToken')
    const u = localStorage.getItem('user')
    if (t && r && u) {
      try {
        accessToken.value = t
        refreshToken.value = r
        user.value = JSON.parse(u)
      } catch {
        logout()
      }
    }
  }

  async function login(payload: LoginPayload) {
    const result = await authService.login(payload)
    _persist(result)
  }

  async function register(payload: RegisterPayload) {
    const result = await authService.register(payload)
    _persist(result)
  }

  async function refresh() {
    if (!refreshToken.value) throw new Error('No refresh token')
    const tokens = await authService.refresh(refreshToken.value)
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    if (import.meta.client) {
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
    }
  }

  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    if (import.meta.client) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    hydrate,
    login,
    register,
    refresh,
    logout,
  }
})
