import type { RoutingRule } from '~/types'
import { useHttp } from '~/composables/useHttp'

export const useRoutingRulesService = () => {
  const http = useHttp()

  return {
    findAll: () => http.get<RoutingRule[]>('/routing-rules'),
    create: (dto: Partial<RoutingRule>) => http.post<RoutingRule>('/routing-rules', dto),
    update: (id: string, dto: Partial<RoutingRule>) =>
      http.patch<RoutingRule>(`/routing-rules/${id}`, dto),
    remove: (id: string) => http.delete(`/routing-rules/${id}`),
  }
}
