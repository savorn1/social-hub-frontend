export function useFacebook() {
  const store = useFacebookStore()
  const { request, loading, error } = useApi()

  onMounted(() => store.fetchInboxes())

  async function addInbox(name: string, pageId: string, accessToken: string) {
    return request(() => store.createInbox({ name, pageId, accessToken }))
  }

  async function toggleInbox(id: string, isActive: boolean) {
    return request(() => store.toggleInbox(id, isActive))
  }

  async function deleteInbox(id: string) {
    return request(() => store.removeInbox(id))
  }

  return {
    inboxes: computed(() => store.inboxes),
    loading,
    error,
    addInbox,
    toggleInbox,
    deleteInbox,
  }
}
