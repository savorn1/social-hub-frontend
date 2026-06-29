import type { Contact, PaginatedResult } from '~/types'
import { useHttp } from '~/composables/useHttp'

export const useContactsService = () => {
  const http = useHttp()

  return {
    findAll: (page = 1, limit = 20) =>
      http.get<PaginatedResult<Contact>>('/conversations/contacts', { params: { page, limit } }),
  }
}
