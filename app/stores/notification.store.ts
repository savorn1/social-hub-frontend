import { defineStore } from 'pinia'
import type { Notification } from '~/types'

export const useNotificationStore = defineStore('notification', () => {
  const items = ref<Notification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)

  async function fetchNotifications() {
    const { $api } = useNuxtApp()
    loading.value = true
    try {
      const { data } = await $api.get('/notifications', { params: { limit: 20 } })
      items.value = data.data?.data ?? []
    } finally {
      loading.value = false
    }
  }

  async function fetchUnreadCount() {
    const { $api } = useNuxtApp()
    const { data } = await $api.get('/notifications/unread-count')
    unreadCount.value = data.data ?? 0
  }

  async function markAsRead(id: string) {
    const { $api } = useNuxtApp()
    await $api.patch(`/notifications/${id}/read`)
    const n = items.value.find((i) => i.id === id)
    if (n) {
      n.status = 'read'
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  async function markAllAsRead() {
    const { $api } = useNuxtApp()
    await $api.patch('/notifications/read-all')
    items.value.forEach((n) => (n.status = 'read'))
    unreadCount.value = 0
  }

  function pushNotification(n: Notification) {
    items.value.unshift(n)
    unreadCount.value++
  }

  return {
    items,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    pushNotification,
  }
})
