import type { Conversation, ConversationNote, Message, PaginatedResult, Platform, ConversationPriority } from '~/types'
import { useHttp } from '~/composables/useHttp'

type CreateConversationPayload = {
  platform: Platform
  contactName?: string
  contactId?: string
  pageId?: string
  externalId?: string
}

type CreateMessagePayload = { conversationId: string; content: string; type?: string }
type UpdateConversationPayload = {
  status?: string
  assignedAgentId?: string
  handoverMode?: boolean
  priority?: ConversationPriority
  labels?: string[]
  isArchived?: boolean
}

export const useConversationService = () => {
  const http = useHttp()

  return {
    findAll: (
      params: {
        page?: number
        limit?: number
        platform?: string
        status?: string
        priority?: string
        search?: string
        isArchived?: boolean
      } = {}
    ) => http.get<PaginatedResult<Conversation>>('/conversations', { params }),
    findOne: (id: string) => http.get<Conversation>(`/conversations/${id}`),
    create: (payload: CreateConversationPayload) =>
      http.post<Conversation>('/conversations', payload),
    update: (id: string, payload: UpdateConversationPayload) =>
      http.patch<Conversation>(`/conversations/${id}`, payload),
    getMessages: (conversationId: string, params: { page?: number; limit?: number } = {}) =>
      http.get<PaginatedResult<Message>>(`/conversations/${conversationId}/messages`, { params }),
    sendMessage: (payload: CreateMessagePayload) =>
      http.post<Message>('/conversations/messages', payload),
    sendReply: (conversationId: string, content: string, platform: Platform) => {
      if (platform === 'facebook') {
        return http.post<Message>(`/integrations/facebook/conversations/${conversationId}/send`, { content })
      }
      if (platform === 'telegram') {
        return http.post<Message>(`/integrations/telegram/conversations/${conversationId}/send`, { content })
      }
      return http.post<Message>('/conversations/messages', { conversationId, content })
    },
    getNotes: (conversationId: string) =>
      http.get<ConversationNote[]>(`/conversations/${conversationId}/notes`),
    addNote: (conversationId: string, content: string) =>
      http.post<ConversationNote>(`/conversations/${conversationId}/notes`, { content }),
    deleteNote: (noteId: string) =>
      http.delete(`/conversations/notes/${noteId}`),
  }
}
