import { defineStore } from 'pinia'
import type { Inbox } from '~/types'
import {
  useFacebookService,
  type FacebookPage,
  type FacebookWebhookInfo,
} from '~/services/facebook.service'

export const useFacebookStore = defineStore('facebook', () => {
  const facebookService = useFacebookService()

  const inboxes = ref<Inbox[]>([])
  const loading = ref(false)
  const pages = ref<FacebookPage[]>([])
  const pagesLoading = ref(false)
  const webhookInfo = ref<FacebookWebhookInfo | null>(null)

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

  async function syncPages(userAccessToken: string) {
    pagesLoading.value = true
    try {
      pages.value = await facebookService.syncPages(userAccessToken)
    } finally {
      pagesLoading.value = false
    }
  }

  async function fetchWebhookInfo() {
    try {
      webhookInfo.value = await facebookService.getWebhookInfo()
    } catch {
      // silently skip if API unreachable
    }
  }

  return {
    inboxes,
    loading,
    pages,
    pagesLoading,
    webhookInfo,
    fetchInboxes,
    createInbox,
    toggleInbox,
    removeInbox,
    syncPages,
    fetchWebhookInfo,
  }
})
