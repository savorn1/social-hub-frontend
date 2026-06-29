export const useHttp = () => {
  return {
    get: <T>(url: string, config?: object) => {
      const { $api } = useNuxtApp()
      return $api.get<{ data: T }>(url, config).then((r) => r.data.data)
    },
    post: <T>(url: string, body?: unknown) => {
      const { $api } = useNuxtApp()
      return $api.post<{ data: T }>(url, body).then((r) => r.data.data)
    },
    patch: <T>(url: string, body?: unknown) => {
      const { $api } = useNuxtApp()
      return $api.patch<{ data: T }>(url, body).then((r) => r.data.data)
    },
    delete: (url: string) => {
      const { $api } = useNuxtApp()
      return $api.delete(url)
    },
  }
}
