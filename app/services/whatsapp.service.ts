import type { Inbox } from '~/types'
import { useHttp } from '~/composables/useHttp'

export interface WhatsAppWebhookInfo {
  callbackUrl: string
  verifyToken: string
  subscribeFields: string[]
  setupSteps: string[]
}

export const useWhatsAppService = () => {
  const http = useHttp()

  return {
    getInboxes: () => http.get<Inbox[]>('/inbox', { params: { platform: 'whatsapp' } }),
    createInbox: (payload: { name: string; phoneNumberId: string; accessToken: string }) =>
      http.post<Inbox>('/inbox', {
        name: payload.name,
        platform: 'whatsapp',
        pageId: payload.phoneNumberId,
        accessToken: payload.accessToken,
      }),
    updateInbox: (id: string, payload: { isActive?: boolean }) =>
      http.patch<Inbox>(`/integrations/whatsapp/inboxes/${id}`, payload),
    deleteInbox: (id: string) => http.delete(`/integrations/whatsapp/inboxes/${id}`),
    getWebhookInfo: () => http.get<WhatsAppWebhookInfo>('/integrations/whatsapp/webhook/info'),
  }
}
