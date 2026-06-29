import { defineStore } from 'pinia'
import type { Chatbot } from '~/types'
import { chatbotService } from '~/services/chatbot.service'

export const useChatbotStore = defineStore('chatbot', () => {
  const chatbots = ref<Chatbot[]>([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      chatbots.value = await chatbotService.findAll()
    } finally {
      loading.value = false
    }
  }

  async function create(payload: Parameters<typeof chatbotService.create>[0]) {
    const bot = await chatbotService.create(payload)
    chatbots.value.unshift(bot)
    return bot
  }

  async function toggle(id: string, isActive: boolean) {
    const updated = await chatbotService.update(id, { isActive })
    const idx = chatbots.value.findIndex((b) => b.id === id)
    if (idx !== -1) chatbots.value[idx] = updated
  }

  async function remove(id: string) {
    await chatbotService.remove(id)
    chatbots.value = chatbots.value.filter((b) => b.id !== id)
  }

  return { chatbots, loading, fetchAll, create, toggle, remove }
})
