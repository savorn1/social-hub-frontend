import type { Inbox } from '~/types'
import { useHttp } from '~/composables/useHttp'

export const useTelegramService = () => {
  const http = useHttp()

  return {
    getInboxes: () => http.get<Inbox[]>('/inbox', { params: { platform: 'telegram' } }),
    createInbox: (payload: { name: string; botToken: string }) =>
      http.post<Inbox>('/inbox', {
        ...payload,
        platform: 'telegram',
        config: { botToken: payload.botToken },
      }),
  }
}
