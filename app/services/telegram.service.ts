import type { Inbox } from '~/types'
import { useHttp } from '~/composables/useHttp'

export interface TelegramBotInfo {
  id: number
  username: string
  first_name: string
}

export interface TelegramWebhookInfo {
  url: string
  has_custom_certificate: boolean
  pending_update_count: number
  last_error_date?: number
  last_error_message?: string
  expectedUrl: string
  isRegistered: boolean
}

export const useTelegramService = () => {
  const http = useHttp()

  return {
    getInboxes: () => http.get<Inbox[]>('/inbox', { params: { platform: 'telegram' } }),
    createInbox: (payload: { name: string; botToken: string }) =>
      http.post<Inbox>('/inbox', {
        name: payload.name,
        platform: 'telegram',
        config: { botToken: payload.botToken },
      }),
    updateInbox: (id: string, payload: { isActive?: boolean }) =>
      http.patch<Inbox>(`/integrations/telegram/inboxes/${id}`, payload),
    deleteInbox: (id: string) =>
      http.delete(`/integrations/telegram/inboxes/${id}`),
    validateBot: (botToken: string) =>
      http.post<TelegramBotInfo>('/integrations/telegram/bots/validate', { botToken }),
    setWebhook: (inboxId: string) =>
      http.post<{ success: boolean; webhookUrl: string }>(`/integrations/telegram/inboxes/${inboxId}/set-webhook`, {}),
    deleteWebhook: (inboxId: string) =>
      http.delete(`/integrations/telegram/inboxes/${inboxId}/webhook`),
    getWebhookInfo: (inboxId: string) =>
      http.get<TelegramWebhookInfo>(`/integrations/telegram/inboxes/${inboxId}/webhook-info`),
    getBotInfo: (inboxId: string) =>
      http.get<TelegramBotInfo>(`/integrations/telegram/inboxes/${inboxId}/bot-info`),
  }
}
