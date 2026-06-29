import { defineStore } from 'pinia'
import type {
  Conversation,
  ConversationNote,
  ConversationPriority,
  Message,
  PaginatedResult,
} from '~/types'
import { useConversationService } from '~/services/conversation.service'

export const useInboxStore = defineStore('inbox', () => {
  const conversationService = useConversationService()

  const conversations = ref<Conversation[]>([])
  const activeConversation = ref<Conversation | null>(null)
  const messages = ref<Message[]>([])
  const notes = ref<ConversationNote[]>([])
  const total = ref(0)
  const page = ref(1)
  const loading = ref(false)
  const platformFilter = ref<string | undefined>(undefined)
  const statusFilter = ref<string | undefined>(undefined)
  const priorityFilter = ref<string | undefined>(undefined)
  const searchQuery = ref('')
  const showArchived = ref(false)
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
        priority: priorityFilter.value,
        search: searchQuery.value || undefined,
        isArchived: showArchived.value,
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
    const conv = activeConversation.value
    const msg = await conversationService.sendReply(conv.id, content, conv.platform)
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

  async function toggleHandover(id: string, handoverMode: boolean) {
    const updated = await conversationService.update(id, { handoverMode })
    const idx = conversations.value.findIndex((c) => c.id === id)
    if (idx !== -1) conversations.value[idx] = updated
    if (activeConversation.value?.id === id) activeConversation.value = updated
  }

  async function setPriority(id: string, priority: ConversationPriority) {
    const updated = await conversationService.update(id, { priority })
    const idx = conversations.value.findIndex((c) => c.id === id)
    if (idx !== -1) conversations.value[idx] = updated
    if (activeConversation.value?.id === id) activeConversation.value = updated
  }

  async function setLabels(id: string, labels: string[]) {
    const updated = await conversationService.update(id, { labels })
    const idx = conversations.value.findIndex((c) => c.id === id)
    if (idx !== -1) conversations.value[idx] = updated
    if (activeConversation.value?.id === id) activeConversation.value = updated
  }

  async function archive(id: string, isArchived: boolean) {
    await conversationService.update(id, { isArchived })
    conversations.value = conversations.value.filter((c) => c.id !== id)
    if (activeConversation.value?.id === id) activeConversation.value = null
  }

  async function fetchNotes(conversationId: string) {
    notes.value = await conversationService.getNotes(conversationId)
  }

  async function addNote(conversationId: string, content: string) {
    const note = await conversationService.addNote(conversationId, content)
    notes.value.unshift(note)
  }

  async function deleteNote(noteId: string) {
    await conversationService.deleteNote(noteId)
    notes.value = notes.value.filter((n) => n.id !== noteId)
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
    notes,
    total,
    page,
    loading,
    platformFilter,
    statusFilter,
    priorityFilter,
    searchQuery,
    showArchived,
    typingUsers,
    fetchConversations,
    selectConversation,
    sendMessage,
    pushMessage,
    updateStatus,
    assign,
    toggleHandover,
    setPriority,
    setLabels,
    archive,
    fetchNotes,
    addNote,
    deleteNote,
    setTyping,
    clearTyping,
  }
})
