import type { Chatbot } from '~/types'
import { useHttp } from '~/composables/useHttp'

export const useChatbotService = () => {
  const http = useHttp()

  return {
    findAll: () => http.get<Chatbot[]>('/chatbot'),
    findOne: (id: string) => http.get<Chatbot>(`/chatbot/${id}`),
    create: (payload: {
      name: string
      description?: string
      knowledgeBaseId?: string
      promptId?: string
    }) => http.post<Chatbot>('/chatbot', payload),
    update: (
      id: string,
      payload: Partial<{ name: string; description: string; isActive: boolean; flows: unknown[] }>
    ) => http.patch<Chatbot>(`/chatbot/${id}`, payload),
    remove: (id: string) => http.delete(`/chatbot/${id}`),
  }
}
