import type { Conversation, Message, PaginatedResult, Platform } from '~/types'
import { useHttp } from '~/composables/useHttp'

type CreateConversationPayload = {
  platform: Platform
  contactName?: string
  contactId?: string
  pageId?: string
  externalId?: string
}

type CreateMessagePayload = { conversationId: string; content: string; type?: string }
type UpdateConversationPayload = { status?: string; assignedAgentId?: string }

export const useConversationService = () => {
  const http = useHttp()

  return {
    findAll: (
      params: {
        page?: number
        limit?: number
        platform?: string
        status?: string
        search?: string
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
  }
}
