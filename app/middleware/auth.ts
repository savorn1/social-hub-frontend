export default defineNuxtRouteMiddleware(() => {
  const store = useAuthStore()
  store.hydrate()
  if (!store.isAuthenticated) return navigateTo('/login')
})
