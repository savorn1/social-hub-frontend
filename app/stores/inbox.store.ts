import { defineStore } from 'pinia'
import type { Conversation, Message, PaginatedResult } from '~/types'
import { conversationService } from '~/services/conversation.service'

export const useInboxStore = defineStore('inbox', () => {
  const conversations = ref<Conversation[]>([])
  const activeConversation = ref<Conversation | null>(null)
  const messages = ref<Message[]>([])
  const total = ref(0)
  const page = ref(1)
  const loading = ref(false)
  const platformFilter = ref<string | undefined>(undefined)
  const statusFilter = ref<string | undefined>(undefined)
  const searchQuery = ref('')
  const typingUsers = ref<{ userId?: string; userName?: string }[]>([])

  async function fetchConversations(reset = false) {
    if (reset) page.value = 1
    loading.value = true
    try {
      const result: PaginatedResult<Conversation> = await conversationService.findAll({
        page: page.value,
        limit: 30,
        platform: platformFilter.value,
        status: statusFilter.value,
        search: searchQuery.value || undefined,
      })
      conversations.value = reset ? result.data : [...conversations.value, ...result.data]
      total.value = result.meta.total
    } finally {
      loading.value = false
    }
  }

  async function selectConversation(id: string) {
    loading.value = true
    typingUsers.value = []
    try {
      activeConversation.value = await conversationService.findOne(id)
      const result = await conversationService.getMessages(id, { limit: 50 })
      messages.value = result.data.reverse()
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(content: string) {
    if (!activeConversation.value) return
    const msg = await conversationService.sendMessage({
      conversationId: activeConversation.value.id,
      content,
    })
    messages.value.push(msg)
  }

  function pushMessage(msg: Message) {
    if (msg.conversationId === activeConversation.value?.id) {
      messages.value.push(msg)
    }
    const conv = conversations.value.find((c) => c.id === msg.conversationId)
    if (conv) conv.updatedAt = msg.createdAt
  }

  async function updateStatus(id: string, status: string) {
    const updated = await conversationService.update(id, { status })
    const idx = conversations.value.findIndex((c) => c.id === id)
    if (idx !== -1) conversations.value[idx] = updated
    if (activeConversation.value?.id === id) activeConversation.value = updated
  }

  async function assign(id: string, assignedAgentId: string | null) {
    const updated = await conversationService.update(id, {
      assignedAgentId: assignedAgentId ?? undefined,
    })
    const idx = conversations.value.findIndex((c) => c.id === id)
    if (idx !== -1) conversations.value[idx] = updated
    if (activeConversation.value?.id === id) activeConversation.value = updated
  }

  function setTyping(user: { userId?: string; userName?: string }) {
    if (!typingUsers.value.find((u) => u.userId === user.userId)) {
      typingUsers.value.push(user)
    }
  }

  function clearTyping(userId?: string) {
    typingUsers.value = typingUsers.value.filter((u) => u.userId !== userId)
  }

  return {
    conversations,
    activeConversation,
    messages,
    total,
    page,
    loading,
    platformFilter,
    statusFilter,
    searchQuery,
    typingUsers,
    fetchConversations,
    selectConversation,
    sendMessage,
    pushMessage,
    updateStatus,
    assign,
    setTyping,
    clearTyping,
  }
})
