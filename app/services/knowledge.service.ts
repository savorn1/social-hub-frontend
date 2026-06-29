import type { KnowledgeBase, KnowledgeItem } from '~/types'
import { useHttp } from '~/composables/useHttp'

export const useKnowledgeService = () => {
  const http = useHttp()

  return {
    findAllBases: () => http.get<KnowledgeBase[]>('/knowledge/bases'),
    findOneBase: (id: string) => http.get<KnowledgeBase>(`/knowledge/bases/${id}`),
    createBase: (payload: { name: string; description?: string }) =>
      http.post<KnowledgeBase>('/knowledge/bases', payload),
    addItem: (baseId: string, payload: { question: string; answer: string; tags?: string[] }) =>
      http.post<KnowledgeItem>(`/knowledge/bases/${baseId}/items`, payload),
    updateItem: (id: string, payload: Partial<{ question: string; answer: string; tags: string[]; isActive: boolean }>) =>
      http.patch<KnowledgeItem>(`/knowledge/items/${id}`, payload),
    removeItem: (id: string) => http.delete(`/knowledge/items/${id}`),
    search: (q: string, baseId?: string) =>
      http.get<KnowledgeItem[]>('/knowledge/search', { params: { q, baseId } }),
    uploadDocument: (baseId: string, file: File) => {
      const { $api } = useNuxtApp()
      const formData = new FormData()
      formData.append('file', file)
      return $api
        .post<{ data: { inserted: number } }>(`/knowledge/bases/${baseId}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data.data)
    },
  }
}
