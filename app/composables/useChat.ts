import type { Message } from '~/types'

export function useChat(conversationId: Ref<string | null>) {
  const inboxStore = useInboxStore()
  const { connect } = useSocket()
  let socket = connect()

  watch(
    conversationId,
    (id, oldId) => {
      if (!socket) socket = connect()
      if (oldId) socket?.emit('leaveConversation', oldId)
      if (id) {
        socket?.emit('joinConversation', id)
        inboxStore.selectConversation(id)
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    socket?.on('newMessage', (msg: Message) => {
      inboxStore.pushMessage(msg)
    })
  })

  onUnmounted(() => {
    if (conversationId.value) socket?.emit('leaveConversation', conversationId.value)
    socket?.off('newMessage')
  })

  async function send(content: string) {
    if (!content.trim() || !conversationId.value) return
    await inboxStore.sendMessage(content)
  }

  return {
    messages: computed(() => inboxStore.messages),
    loading: computed(() => inboxStore.loading),
    send,
  }
}
