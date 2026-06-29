import type { Inbox } from '~/types'
import { useHttp } from '~/composables/useHttp'

export interface FacebookPage {
  id: string
  name: string
  access_token: string
}

export interface FacebookWebhookInfo {
  callbackUrl: string
  verifyToken: string
  subscribeFields: string[]
  setupSteps: string[]
}

export const useFacebookService = () => {
  const http = useHttp()

  return {
    getInboxes: () => http.get<Inbox[]>('/inbox', { params: { platform: 'facebook' } }),
    createInbox: (payload: { name: string; pageId: string; accessToken: string }) =>
      http.post<Inbox>('/inbox', { ...payload, platform: 'facebook' }),
    updateInbox: (id: string, payload: Partial<{ name: string; isActive: boolean }>) =>
      http.patch<Inbox>(`/inbox/${id}`, payload),
    deleteInbox: (id: string) => http.delete(`/inbox/${id}`),
    getStatus: () =>
      http.get<{ integration: string; status: string }>('/integrations/facebook/status'),
    syncPages: (userAccessToken: string) =>
      http.post<FacebookPage[]>('/integrations/facebook/sync-pages', { userAccessToken }),
    getWebhookInfo: () => http.get<FacebookWebhookInfo>('/integrations/facebook/webhook/info'),
  }
}
