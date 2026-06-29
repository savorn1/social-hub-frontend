export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()

  async function login(email: string, password: string) {
    await store.login({ email, password })
    await router.push('/dashboard')
  }

  async function register(firstName: string, lastName: string, email: string, password: string) {
    await store.register({ firstName, lastName, email, password })
    await router.push('/dashboard')
  }

  async function logout() {
    try {
      await useNuxtApp().$api.post('/auth/logout')
    } catch {
      /* ignore */
    }
    store.logout()
    await router.push('/login')
  }

  return {
    user: computed(() => store.user),
    isAuthenticated: computed(() => store.isAuthenticated),
    login,
    register,
    logout,
  }
}
