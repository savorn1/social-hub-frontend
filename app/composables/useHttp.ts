export const useHttp = () => {
  const { $api } = useNuxtApp()

  return {
    get: <T>(url: string, config?: object) =>
      $api.get<{ data: T }>(url, config).then((r) => r.data.data),
    post: <T>(url: string, body?: unknown) =>
      $api.post<{ data: T }>(url, body).then((r) => r.data.data),
    patch: <T>(url: string, body?: unknown) =>
      $api.patch<{ data: T }>(url, body).then((r) => r.data.data),
    delete: (url: string) => $api.delete(url),
  }
}
