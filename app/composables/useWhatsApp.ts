export function useWhatsApp() {
  const store = useWhatsAppStore()
  const { request, loading, error } = useApi()

  onMounted(async () => {
    await store.fetchInboxes()
    await store.fetchWebhookInfo()
  })

  async function addInbox(name: string, phoneNumberId: string, accessToken: string) {
    return request(() => store.createInbox({ name, phoneNumberId, accessToken }))
  }

  async function toggleInbox(id: string, isActive: boolean) {
    return request(() => store.toggleInbox(id, isActive))
  }

  async function deleteInbox(id: string) {
    return request(() => store.removeInbox(id))
  }

  return {
    inboxes: computed(() => store.inboxes),
    webhookInfo: computed(() => store.webhookInfo),
    loading,
    error,
    addInbox,
    toggleInbox,
    deleteInbox,
  }
}
