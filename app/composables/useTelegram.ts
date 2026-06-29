import { useTelegramService } from '~/services/telegram.service'

export function useTelegram() {
  const store = useTelegramStore()
  const service = useTelegramService()
  const { request, loading, error } = useApi()

  onMounted(async () => {
    await store.fetchInboxes()
    for (const inbox of store.inboxes) {
      store.fetchBotInfo(inbox.id)
      store.fetchWebhookInfo(inbox.id)
    }
  })

  async function addInbox(name: string, botToken: string) {
    const inbox = await request(() => store.createInbox({ name, botToken }))
    if (inbox) {
      store.fetchBotInfo(inbox.id)
    }
    return inbox
  }

  async function toggleInbox(id: string, isActive: boolean) {
    return request(() => store.toggleInbox(id, isActive))
  }

  async function deleteInbox(id: string) {
    return request(() => store.removeInbox(id))
  }

  async function setWebhook(inboxId: string) {
    return request(() => store.setWebhook(inboxId))
  }

  async function deleteWebhook(inboxId: string) {
    return request(() => store.deleteWebhook(inboxId))
  }

  async function validateBot(botToken: string) {
    return service.validateBot(botToken)
  }

  return {
    inboxes: computed(() => store.inboxes),
    botInfos: computed(() => store.botInfos),
    webhookInfos: computed(() => store.webhookInfos),
    loading,
    error,
    addInbox,
    toggleInbox,
    deleteInbox,
    setWebhook,
    deleteWebhook,
    validateBot,
  }
}
