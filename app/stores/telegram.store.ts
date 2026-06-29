import { defineStore } from 'pinia'
import type { Inbox } from '~/types'
import { telegramService } from '~/services/telegram.service'

export const useTelegramStore = defineStore('telegram', () => {
  const inboxes = ref<Inbox[]>([])
  const loading = ref(false)

  async function fetchInboxes() {
    loading.value = true
    try {
      inboxes.value = await telegramService.getInboxes()
    } finally {
      loading.value = false
    }
  }

  async function createInbox(payload: Parameters<typeof telegramService.createInbox>[0]) {
    const inbox = await telegramService.createInbox(payload)
    inboxes.value.push(inbox)
    return inbox
  }

  return { inboxes, loading, fetchInboxes, createInbox }
})
