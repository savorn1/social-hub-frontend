import { defineStore } from 'pinia'
import type { Inbox } from '~/types'
import { facebookService } from '~/services/facebook.service'

export const useFacebookStore = defineStore('facebook', () => {
  const inboxes = ref<Inbox[]>([])
  const loading = ref(false)

  async function fetchInboxes() {
    loading.value = true
    try {
      inboxes.value = await facebookService.getInboxes()
    } finally {
      loading.value = false
    }
  }

  async function createInbox(payload: Parameters<typeof facebookService.createInbox>[0]) {
    const inbox = await facebookService.createInbox(payload)
    inboxes.value.push(inbox)
    return inbox
  }

  async function toggleInbox(id: string, isActive: boolean) {
    const updated = await facebookService.updateInbox(id, { isActive })
    const idx = inboxes.value.findIndex((i) => i.id === id)
    if (idx !== -1) inboxes.value[idx] = updated
  }

  async function removeInbox(id: string) {
    await facebookService.deleteInbox(id)
    inboxes.value = inboxes.value.filter((i) => i.id !== id)
  }

  return { inboxes, loading, fetchInboxes, createInbox, toggleInbox, removeInbox }
})
