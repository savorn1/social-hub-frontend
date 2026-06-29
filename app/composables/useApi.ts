export function useApi() {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function request<T>(fn: () => Promise<T>): Promise<T | null> {
    loading.value = true
    error.value = null
    try {
      return await fn()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg ?? 'Something went wrong'
      return null
    } finally {
      loading.value = false
    }
  }

  return { $api, loading, error, request }
}
