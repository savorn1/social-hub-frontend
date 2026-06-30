import { defineStore } from 'pinia'
import type { Inbox } from '~/types'
import { useWhatsAppService, type WhatsAppWebhookInfo } from '~/services/whatsapp.service'

export const useWhatsAppStore = defineStore('whatsapp', () => {
  const whatsappService = useWhatsAppService()

  const inboxes = ref<Inbox[]>([])
  const webhookInfo = ref<WhatsAppWebhookInfo | null>(null)
  const loading = ref(false)

  async function fetchInboxes() {
    loading.value = true
    try {
      inboxes.value = await whatsappService.getInboxes()
    } finally {
      loading.value = false
    }
  }

  async function fetchWebhookInfo() {
    try {
      webhookInfo.value = await whatsappService.getWebhookInfo()
    } catch {
      // silently skip if not configured
    }
  }

  async function createInbox(payload: {
    name: string
    phoneNumberId: string
    accessToken: string
  }) {
    const inbox = await whatsappService.createInbox(payload)
    inboxes.value.push(inbox)
    return inbox
  }

  async function toggleInbox(id: string, isActive: boolean) {
    const updated = await whatsappService.updateInbox(id, { isActive })
    const idx = inboxes.value.findIndex((i) => i.id === id)
    if (idx !== -1) inboxes.value[idx] = updated
  }

  async function removeInbox(id: string) {
    await whatsappService.deleteInbox(id)
    inboxes.value = inboxes.value.filter((i) => i.id !== id)
  }

  return {
    inboxes,
    webhookInfo,
    loading,
    fetchInboxes,
    fetchWebhookInfo,
    createInbox,
    toggleInbox,
    removeInbox,
  }
})
