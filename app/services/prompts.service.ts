import type { Prompt, PromptVersion, PromptCategory } from '~/types'
import { useHttp } from '~/composables/useHttp'

export const usePromptsService = () => {
  const http = useHttp()

  return {
    findAll: (category?: PromptCategory) =>
      http.get<Prompt[]>('/prompts', category ? { params: { category } } : undefined),
    findOne: (id: string) => http.get<Prompt>(`/prompts/${id}`),
    create: (payload: Partial<Prompt>) => http.post<Prompt>('/prompts', payload),
    update: (id: string, payload: Partial<Prompt>) => http.patch<Prompt>(`/prompts/${id}`, payload),
    remove: (id: string) => http.delete(`/prompts/${id}`),
    findVersions: (id: string) => http.get<PromptVersion[]>(`/prompts/${id}/versions`),
    restore: (id: string, versionId: string) =>
      http.post<Prompt>(`/prompts/${id}/versions/${versionId}/restore`),
  }
}
