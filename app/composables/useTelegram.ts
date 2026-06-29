export function useTelegram() {
  const store = useTelegramStore()
  const { request, loading, error } = useApi()

  onMounted(() => store.fetchInboxes())

  async function addInbox(name: string, botToken: string) {
    return request(() => store.createInbox({ name, botToken }))
  }

  return {
    inboxes: computed(() => store.inboxes),
    loading,
    error,
    addInbox,
  }
}
