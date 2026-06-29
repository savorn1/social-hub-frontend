export function useFacebook() {
  const store = useFacebookStore()
  const { request, loading, error } = useApi()

  onMounted(() => {
    store.fetchInboxes()
    store.fetchWebhookInfo()
  })

  async function addInbox(name: string, pageId: string, accessToken: string) {
    return request(() => store.createInbox({ name, pageId, accessToken }))
  }

  async function toggleInbox(id: string, isActive: boolean) {
    return request(() => store.toggleInbox(id, isActive))
  }

  async function deleteInbox(id: string) {
    return request(() => store.removeInbox(id))
  }

  async function syncPages(userAccessToken: string) {
    return request(() => store.syncPages(userAccessToken))
  }

  async function connectPage(page: { id: string; name: string; access_token: string }) {
    const alreadyConnected = store.inboxes.some((i) => i.pageId === page.id)
    if (alreadyConnected) return
    return request(() => store.createInbox({ name: page.name, pageId: page.id, accessToken: page.access_token }))
  }

  return {
    inboxes: computed(() => store.inboxes),
    pages: computed(() => store.pages),
    pagesLoading: computed(() => store.pagesLoading),
    webhookInfo: computed(() => store.webhookInfo),
    loading,
    error,
    addInbox,
    toggleInbox,
    deleteInbox,
    syncPages,
    connectPage,
  }
}
