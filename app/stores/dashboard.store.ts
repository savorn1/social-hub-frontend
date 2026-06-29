import { defineStore } from 'pinia'
import type { DashboardStats, PlatformCount, Conversation } from '~/types'
import { dashboardService } from '~/services/dashboard.service'

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats | null>(null)
  const byPlatform = ref<PlatformCount[]>([])
  const recentActivity = ref<Conversation[]>([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const [s, p, r] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getByPlatform(),
        dashboardService.getRecentActivity(),
      ])
      stats.value = s
      byPlatform.value = p
      recentActivity.value = r
    } finally {
      loading.value = false
    }
  }

  return { stats, byPlatform, recentActivity, loading, fetchAll }
})
