import type { Prompt } from '~/types'
import { useHttp } from '~/composables/useHttp'

export const usePromptsService = () => {
  const http = useHttp()

  return {
    findAll: () => http.get<Prompt[]>('/prompts'),
  }
}
