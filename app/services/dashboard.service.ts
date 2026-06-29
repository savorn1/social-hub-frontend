import type { DashboardStats, PlatformCount, Conversation } from '~/types'
import { useHttp } from '~/composables/useHttp'

export const useDashboardService = () => {
  const http = useHttp()

  return {
    getStats: () => http.get<DashboardStats>('/dashboard/stats'),
    getByPlatform: () => http.get<PlatformCount[]>('/dashboard/conversations-by-platform'),
    getRecentActivity: () => http.get<Conversation[]>('/dashboard/recent-activity'),
  }
}
