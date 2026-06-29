<template>
  <div class="flex h-full overflow-hidden">
    <!-- Conversation sidebar -->
    <div class="w-80 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white overflow-hidden">
      <!-- Status tabs -->
      <div class="flex border-b border-gray-100 px-2 pt-2 gap-0.5">
        <button
          v-for="s in statusTabs"
          :key="s.value"
          class="flex-1 text-xs font-medium py-1.5 rounded-t-md transition-colors"
          :class="
            store.statusFilter === s.value
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'
          "
          @click="setStatus(s.value)"
        >
          {{ s.label }}
        </button>
      </div>

      <!-- Archive toggle -->
      <div class="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
        <span class="text-xs text-gray-500">Archived</span>
        <button
          class="relative inline-flex h-4 w-8 items-center rounded-full transition-colors"
          :class="store.showArchived ? 'bg-blue-600' : 'bg-gray-200'"
          @click="toggleArchived"
        >
          <span
            class="inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform"
            :class="store.showArchived ? 'translate-x-4' : 'translate-x-0.5'"
          />
        </button>
      </div>

      <!-- Platform pills -->
      <div class="flex gap-1.5 px-3 py-2 border-b border-gray-100 overflow-x-auto scrollbar-thin">
        <button
          v-for="p in platformOptions"
          :key="p.value ?? 'all'"
          class="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition-colors"
          :class="
            store.platformFilter === p.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
          "
          @click="setPlatform(p.value)"
        >
          <span
            v-if="p.dot"
            class="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle"
            :class="p.dot"
          />
          {{ p.label }}
        </button>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto">
        <ConversationList
          :conversations="store.conversations"
          :active-id="activeId"
          :loading="store.loading"
          @select="select"
          @search="onSearch"
        />
      </div>
    </div>

    <!-- Chat area -->
    <div class="flex-1 overflow-hidden flex flex-col">
      <ChatWindow
        v-if="store.activeConversation"
        :conversation="store.activeConversation"
        :messages="store.messages"
        :loading="store.loading"
        :typing-users="store.typingUsers"
        @send="store.sendMessage"
        @update-status="(s) => store.updateStatus(store.activeConversation!.id, s)"
        @assign="(agentId) => store.assign(store.activeConversation!.id, agentId)"
        @toggle-handover="(mode) => store.toggleHandover(store.activeConversation!.id, mode)"
        @set-priority="(p) => store.setPriority(store.activeConversation!.id, p)"
        @set-labels="(labels) => store.setLabels(store.activeConversation!.id, labels)"
        @archive="(isArchived) => store.archive(store.activeConversation!.id, isArchived)"
        @typing="emitTyping"
        @stop-typing="emitStopTyping"
      />
      <EmptyState
        v-else
        :icon="ChatBubbleLeftRightIcon"
        title="Select a conversation"
        subtitle="Choose one from the list to start chatting"
        class="flex-1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline'
import type { Socket } from 'socket.io-client'
import type { Message } from '~/types'

definePageMeta({ middleware: 'auth' })

const store = useInboxStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const activeId = computed(() => route.query.id as string | undefined)

const statusTabs = [
  { label: 'All', value: undefined },
  { label: 'Open', value: 'open' },
  { label: 'Pending', value: 'pending' },
  { label: 'Resolved', value: 'resolved' },
]

const platformOptions = [
  { label: 'All', value: undefined },
  { label: 'Facebook', value: 'facebook', dot: 'bg-blue-500' },
  { label: 'Telegram', value: 'telegram', dot: 'bg-sky-400' },
  { label: 'Instagram', value: 'instagram', dot: 'bg-pink-500' },
  { label: 'WhatsApp', value: 'whatsapp', dot: 'bg-green-500' },
  { label: 'Web', value: 'web', dot: 'bg-gray-400' },
]

function setStatus(value: string | undefined) {
  store.statusFilter = value
  store.fetchConversations(true)
}

function toggleArchived() {
  store.showArchived = !store.showArchived
  store.fetchConversations(true)
}

function setPlatform(value: string | undefined) {
  store.platformFilter = value
  store.fetchConversations(true)
}

let socket: Socket | null = null
let prevConversationId: string | null = null

function select(id: string) {
  router.push({ query: { id } })
  if (socket && prevConversationId) socket.emit('leaveConversation', prevConversationId)
  if (socket) socket.emit('joinConversation', id)
  prevConversationId = id
  store.selectConversation(id)
}

function emitTyping() {
  if (socket && store.activeConversation) {
    socket.emit('typing', {
      conversationId: store.activeConversation.id,
      userId: authStore.user?.id,
      userName: authStore.user
        ? `${authStore.user.firstName} ${authStore.user.lastName}`
        : undefined,
    })
  }
}

function emitStopTyping() {
  if (socket && store.activeConversation) {
    socket.emit('stopTyping', {
      conversationId: store.activeConversation.id,
      userId: authStore.user?.id,
    })
  }
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null
function onSearch(query: string) {
  store.searchQuery = query
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => store.fetchConversations(true), 300)
}

onMounted(async () => {
  await store.fetchConversations(true)

  const { connect } = useSocket()
  socket = connect()

  if (socket) {
    socket.on('newMessage', (msg: Message) => store.pushMessage(msg))
    socket.on('userTyping', (data: { userId?: string; userName?: string }) => store.setTyping(data))
    socket.on('userStopTyping', (data: { userId?: string }) => store.clearTyping(data.userId))
  }

  if (activeId.value) {
    socket?.emit('joinConversation', activeId.value)
    prevConversationId = activeId.value
    store.selectConversation(activeId.value)
  }
})

onUnmounted(() => {
  if (socket) {
    if (prevConversationId) socket.emit('leaveConversation', prevConversationId)
    socket.off('newMessage')
    socket.off('userTyping')
    socket.off('userStopTyping')
  }
})
</script>
