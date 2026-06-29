import { defineStore } from 'pinia'
import type { Inbox } from '~/types'
import {
  useTelegramService,
  type TelegramBotInfo,
  type TelegramWebhookInfo,
} from '~/services/telegram.service'

export const useTelegramStore = defineStore('telegram', () => {
  const telegramService = useTelegramService()

  const inboxes = ref<Inbox[]>([])
  const loading = ref(false)
  const botInfos = ref<Record<string, TelegramBotInfo>>({})
  const webhookInfos = ref<Record<string, TelegramWebhookInfo>>({})

  async function fetchInboxes() {
    loading.value = true
    try {
      inboxes.value = await telegramService.getInboxes()
    } finally {
      loading.value = false
    }
  }

  async function createInbox(payload: { name: string; botToken: string }) {
    const inbox = await telegramService.createInbox(payload)
    inboxes.value.push(inbox)
    return inbox
  }

  async function toggleInbox(id: string, isActive: boolean) {
    const updated = await telegramService.updateInbox(id, { isActive })
    const idx = inboxes.value.findIndex((i) => i.id === id)
    if (idx !== -1) inboxes.value[idx] = updated
  }

  async function removeInbox(id: string) {
    await telegramService.deleteInbox(id)
    inboxes.value = inboxes.value.filter((i) => i.id !== id)
    delete botInfos.value[id]
    delete webhookInfos.value[id]
  }

  async function fetchBotInfo(inboxId: string) {
    try {
      botInfos.value[inboxId] = await telegramService.getBotInfo(inboxId)
    } catch {
      // token may be invalid — silently skip
    }
  }

  async function fetchWebhookInfo(inboxId: string) {
    try {
      webhookInfos.value[inboxId] = await telegramService.getWebhookInfo(inboxId)
    } catch {
      // webhook may not be set — silently skip
    }
  }

  async function setWebhook(inboxId: string) {
    const result = await telegramService.setWebhook(inboxId)
    await fetchWebhookInfo(inboxId)
    return result
  }

  async function deleteWebhook(inboxId: string) {
    await telegramService.deleteWebhook(inboxId)
    await fetchWebhookInfo(inboxId)
  }

  return {
    inboxes,
    loading,
    botInfos,
    webhookInfos,
    fetchInboxes,
    createInbox,
    toggleInbox,
    removeInbox,
    fetchBotInfo,
    fetchWebhookInfo,
    setWebhook,
    deleteWebhook,
  }
})
