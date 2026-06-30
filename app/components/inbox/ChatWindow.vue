<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Header -->
    <div class="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white flex-shrink-0">
      <div
        class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
        :class="platformColor(conversation.platform)"
      >
        {{ (conversation.contactName || conversation.contactId || '?').charAt(0).toUpperCase() }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-900 truncate leading-tight">
          {{ conversation.contactName || conversation.contactId }}
        </p>
        <div class="flex items-center gap-1.5 mt-0.5">
          <PlatformBadge :platform="conversation.platform" />
          <StatusBadge :status="conversation.status" />
          <span v-if="conversation.assignedAgent" class="text-[11px] text-gray-400">
            → {{ conversation.assignedAgent.firstName }} {{ conversation.assignedAgent.lastName }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1.5 flex-shrink-0">
        <!-- Human handover toggle -->
        <button
          class="text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5"
          :class="
            conversation.handoverMode
              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
          "
          :title="
            conversation.handoverMode
              ? 'Bot is paused — click to return control to bot'
              : 'Take over from bot'
          "
          @click="emit('toggleHandover', !conversation.handoverMode)"
        >
          <CpuChipIcon class="w-3.5 h-3.5" />
          {{ conversation.handoverMode ? 'Return to Bot' : 'Take Over' }}
        </button>

        <!-- Assign agent -->
        <div ref="assignRef" class="relative">
          <button
            class="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 flex items-center gap-1.5 transition-colors"
            @click="assignOpen = !assignOpen"
          >
            <UserIcon class="w-3.5 h-3.5" />
            Assign
          </button>
          <div
            v-if="assignOpen"
            class="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-200/60 z-20 overflow-hidden"
          >
            <div v-if="agentsLoading" class="px-3 py-3 text-xs text-gray-400 text-center">
              Loading…
            </div>
            <template v-else>
              <button
                class="w-full text-left px-3 py-2.5 text-xs text-gray-400 hover:bg-gray-50 border-b border-gray-50"
                @click="assign(null)"
              >
                Unassign
              </button>
              <button
                v-for="agent in agents"
                :key="agent.id"
                class="w-full text-left px-3 py-2.5 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors"
                :class="
                  conversation.assignedAgentId === agent.id
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700'
                "
                @click="assign(agent.id)"
              >
                <span
                  class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 flex-shrink-0"
                >
                  {{ initials(`${agent.firstName} ${agent.lastName}`) }}
                </span>
                {{ agent.firstName }} {{ agent.lastName }}
              </button>
            </template>
          </div>
        </div>

        <!-- Status actions -->
        <div class="flex gap-1">
          <button
            v-for="s in statuses"
            :key="s.value"
            class="text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all"
            :class="
              conversation.status === s.value
                ? s.activeClass
                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
            "
            @click="emit('updateStatus', s.value)"
          >
            {{ s.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Secondary action bar -->
    <div
      class="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50/50 flex-shrink-0 flex-wrap"
    >
      <!-- Tab switcher -->
      <div
        class="flex rounded-lg bg-white border border-gray-200 overflow-hidden text-xs p-0.5 gap-0.5 mr-1"
      >
        <button
          class="px-3 py-1 font-medium rounded-md transition-all duration-150"
          :class="
            activeTab === 'chat'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50'
          "
          @click="activeTab = 'chat'"
        >
          Chat
        </button>
        <button
          class="px-3 py-1 font-medium rounded-md transition-all duration-150"
          :class="
            activeTab === 'notes'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50'
          "
          @click="activeTab = 'notes'"
        >
          Notes
        </button>
      </div>

      <!-- Priority dropdown -->
      <div ref="priorityRef" class="relative">
        <button
          class="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors"
          :class="priorityClass(conversation.priority)"
          @click="priorityOpen = !priorityOpen"
        >
          <FlagIcon class="w-3 h-3" />
          {{ capitalize(conversation.priority ?? 'normal') }}
          <ChevronDownIcon class="w-3 h-3 opacity-60" />
        </button>
        <div
          v-if="priorityOpen"
          class="absolute left-0 top-full mt-1.5 w-36 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-200/60 z-20 overflow-hidden py-0.5"
        >
          <button
            v-for="p in priorities"
            :key="p.value"
            class="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors"
            :class="p.color"
            @click="setPriority(p.value)"
          >
            <FlagIcon class="w-3 h-3" />
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- Labels -->
      <div class="flex items-center gap-1 flex-wrap">
        <span
          v-for="label in conversation.labels"
          :key="label"
          class="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium border border-violet-100"
        >
          {{ label }}
          <button class="hover:text-violet-900 leading-none" @click="removeLabel(label)">×</button>
        </span>
        <div ref="labelRef" class="relative">
          <button
            class="text-[11px] px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-colors"
            @click="labelInputOpen = !labelInputOpen"
          >
            + label
          </button>
          <div
            v-if="labelInputOpen"
            class="absolute left-0 top-full mt-1.5 z-20 bg-white border border-gray-100 rounded-xl shadow-lg p-2 w-44"
          >
            <input
              ref="labelInputEl"
              v-model="newLabel"
              class="input text-xs w-full"
              placeholder="Tag name, Enter"
              @keydown.enter.prevent="confirmLabel"
              @keydown.esc="labelInputOpen = false"
            />
          </div>
        </div>
      </div>

      <div class="flex-1" />

      <!-- Archive button -->
      <button
        class="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 flex items-center gap-1.5 transition-colors"
        :title="conversation.isArchived ? 'Unarchive' : 'Archive conversation'"
        @click="emit('archive', !conversation.isArchived)"
      >
        <ArchiveBoxIcon class="w-3.5 h-3.5" />
        {{ conversation.isArchived ? 'Unarchive' : 'Archive' }}
      </button>
    </div>

    <!-- Notes panel -->
    <div v-if="activeTab === 'notes'" class="flex flex-col flex-1 overflow-hidden bg-amber-50/30">
      <div class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        <p v-if="!store.notes.length" class="text-sm text-gray-400 text-center mt-10 italic">
          No internal notes yet
        </p>
        <div
          v-for="note in store.notes"
          :key="note.id"
          class="bg-white border border-amber-100 rounded-xl px-4 py-3 shadow-sm"
        >
          <p class="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {{ note.content }}
          </p>
          <div class="flex items-center justify-between mt-2.5 pt-2 border-t border-amber-50">
            <span class="text-[11px] text-gray-400">{{ formatDate(note.createdAt) }}</span>
            <button
              class="text-[11px] text-red-400 hover:text-red-600 transition-colors"
              @click="store.deleteNote(note.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <div class="flex gap-2 px-4 py-3 border-t border-amber-100 bg-white flex-shrink-0">
        <textarea
          v-model="noteDraft"
          rows="2"
          placeholder="Write an internal note… (Ctrl+Enter to save)"
          class="flex-1 input resize-none text-sm border-amber-200 focus:border-amber-400 focus:ring-amber-300/30"
          style="field-sizing: content"
          @keydown.ctrl.enter.prevent="submitNote"
        />
        <button
          class="btn py-2 px-3 flex-shrink-0 self-end bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400 shadow-sm"
          :disabled="!noteDraft.trim()"
          @click="submitNote"
        >
          <PaperAirplaneIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div v-else ref="scrollEl" class="flex-1 overflow-y-auto px-5 py-5 space-y-3 bg-gray-50/40">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex items-end gap-2"
        :class="msg.isFromContact ? 'justify-start' : 'justify-end'"
      >
        <div
          v-if="msg.isFromContact"
          class="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold mb-0.5 shadow-sm"
          :class="platformColor(conversation.platform)"
        >
          {{ (conversation.contactName || '?').charAt(0).toUpperCase() }}
        </div>

        <div class="max-w-[66%] group">
          <div
            class="px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm"
            :class="
              msg.isFromContact
                ? 'bg-white border border-gray-100 text-gray-800 rounded-bl-md'
                : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
            "
          >
            <template v-if="msg.type === 'image' && msg.mediaUrl">
              <img :src="mediaBase + msg.mediaUrl" class="max-w-full rounded-lg mb-1 block" />
              <span v-if="msg.content && msg.content !== 'Image'" class="text-sm block mt-1">{{
                msg.content
              }}</span>
            </template>
            <template v-else-if="msg.type === 'file' && msg.mediaUrl">
              <a
                :href="mediaBase + msg.mediaUrl"
                target="_blank"
                class="flex items-center gap-2 font-medium"
                :class="
                  msg.isFromContact
                    ? 'text-blue-600 hover:text-blue-700'
                    : 'text-white/90 hover:text-white'
                "
              >
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  :class="msg.isFromContact ? 'bg-blue-50' : 'bg-white/20'"
                >
                  <PaperClipIcon class="w-4 h-4" />
                </div>
                <span class="text-sm truncate">{{ msg.content || 'Download file' }}</span>
              </a>
            </template>
            <template v-else>{{ msg.content }}</template>
          </div>
          <p
            class="text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            :class="msg.isFromContact ? 'text-gray-400 pl-1' : 'text-gray-400 text-right pr-1'"
          >
            {{ formatDate(msg.createdAt) }}
          </p>
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="typingUsers?.length" class="flex items-end gap-2 justify-start">
        <div
          class="bg-white border border-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-1.5"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
            style="animation-delay: 0ms"
          />
          <span
            class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
            style="animation-delay: 150ms"
          />
          <span
            class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
            style="animation-delay: 300ms"
          />
          <span class="text-xs text-gray-400 ml-1">{{ typingLabel }}</span>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-4">
        <svg class="w-5 h-5 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    </div>

    <!-- Canned responses picker -->
    <div
      v-if="activeTab === 'chat' && cannedOpen && activePrompts.length"
      class="border-t border-gray-100 bg-white max-h-44 overflow-y-auto shadow-[0_-4px_12px_rgba(0,0,0,0.04)]"
    >
      <p class="px-4 pt-2.5 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        Quick replies
      </p>
      <button
        v-for="prompt in activePrompts"
        :key="prompt.id"
        class="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
        @click="insertCanned(prompt.content)"
      >
        <span class="font-medium text-gray-800">{{ prompt.name }}</span>
        <span class="text-gray-400 ml-2 text-xs">{{ truncate(prompt.content, 55) }}</span>
      </button>
    </div>

    <!-- Input -->
    <div
      v-if="activeTab === 'chat'"
      class="flex items-end gap-2 px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0"
    >
      <input ref="fileInput" type="file" class="hidden" @change="onFileChange" />
      <button
        class="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        title="Attach file"
        @click="fileInput?.click()"
      >
        <PaperClipIcon class="w-4 h-4" />
      </button>
      <button
        class="flex-shrink-0 p-2 rounded-lg transition-colors"
        :class="
          cannedOpen
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
        "
        title="Quick replies"
        @click="toggleCanned"
      >
        <BoltIcon class="w-4 h-4" />
      </button>
      <textarea
        v-model="draft"
        rows="1"
        placeholder="Type a message… (Enter to send)"
        class="flex-1 input resize-none max-h-28 overflow-y-auto text-sm border-gray-200"
        style="field-sizing: content"
        @keydown.enter.exact.prevent="send"
        @input="onInput"
        @blur="onBlur"
      />
      <button
        class="btn-primary py-2.5 px-3.5 flex-shrink-0 self-end"
        :disabled="!draft.trim()"
        @click="send"
      >
        <PaperAirplaneIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PaperAirplaneIcon } from '@heroicons/vue/24/solid'
import {
  UserIcon,
  BoltIcon,
  PaperClipIcon,
  CpuChipIcon,
  FlagIcon,
  ChevronDownIcon,
  ArchiveBoxIcon,
} from '@heroicons/vue/24/outline'
import type { Conversation, ConversationPriority, Message, User, Prompt } from '~/types'
import { platformColor, formatDate, truncate, initials } from '~/utils'
import { useInboxStore } from '~/stores/inbox.store'

const props = defineProps<{
  conversation: Conversation
  messages: Message[]
  loading?: boolean
  typingUsers?: { userId?: string; userName?: string }[]
}>()
const emit = defineEmits<{
  send: [content: string]
  updateStatus: [status: string]
  assign: [agentId: string | null]
  toggleHandover: [handoverMode: boolean]
  setPriority: [priority: ConversationPriority]
  setLabels: [labels: string[]]
  archive: [isArchived: boolean]
  typing: []
  stopTyping: []
}>()

const config = useRuntimeConfig()
const mediaBase = config.public.baseUrl as string
const store = useInboxStore()

const draft = ref('')
const noteDraft = ref('')
const activeTab = ref<'chat' | 'notes'>('chat')
const scrollEl = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()
const assignRef = ref<HTMLElement>()
const priorityRef = ref<HTMLElement>()
const labelRef = ref<HTMLElement>()
const labelInputEl = ref<HTMLInputElement>()
const assignOpen = ref(false)
const priorityOpen = ref(false)
const labelInputOpen = ref(false)
const newLabel = ref('')
const cannedOpen = ref(false)
const agents = ref<User[]>([])
const agentsLoading = ref(false)
const activePrompts = ref<Prompt[]>([])

const statuses = [
  {
    value: 'open',
    label: 'Open',
    activeClass: 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-100',
  },
  {
    value: 'pending',
    label: 'Pending',
    activeClass: 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-100',
  },
  {
    value: 'resolved',
    label: 'Resolved',
    activeClass: 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-100',
  },
]

const priorities = [
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'normal', label: 'Normal', color: 'text-blue-600' },
  { value: 'low', label: 'Low', color: 'text-gray-500' },
]

function priorityClass(p?: string) {
  if (p === 'urgent') return 'bg-red-50 text-red-700 border-red-200'
  if (p === 'high') return 'bg-orange-50 text-orange-700 border-orange-200'
  if (p === 'low') return 'bg-gray-50 text-gray-500 border-gray-200'
  return 'bg-blue-50 text-blue-700 border-blue-100'
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function setPriority(value: string) {
  emit('setPriority', value as ConversationPriority)
  priorityOpen.value = false
}

function removeLabel(label: string) {
  const labels = (props.conversation.labels ?? []).filter((l) => l !== label)
  emit('setLabels', labels)
}

async function confirmLabel() {
  const tag = newLabel.value.trim()
  if (!tag) return
  const labels = [...(props.conversation.labels ?? []), tag]
  emit('setLabels', labels)
  newLabel.value = ''
  labelInputOpen.value = false
}

async function submitNote() {
  if (!noteDraft.value.trim()) return
  await store.addNote(props.conversation.id, noteDraft.value.trim())
  noteDraft.value = ''
}

watch(activeTab, async (tab) => {
  if (tab === 'notes') await store.fetchNotes(props.conversation.id)
})

watch(labelInputOpen, async (open) => {
  if (open) {
    await nextTick()
    labelInputEl.value?.focus()
  }
})

const typingLabel = computed(() => {
  const users = props.typingUsers ?? []
  if (!users.length) return ''
  const names = users.map((u) => u.userName ?? 'Someone')
  return `${names.join(', ')} ${users.length === 1 ? 'is' : 'are'} typing…`
})

async function loadAgents() {
  if (agents.value.length) return
  agentsLoading.value = true
  try {
    const { $api } = useNuxtApp()
    const { data } = await $api.get('/users', { params: { limit: 100 } })
    agents.value = (data.data?.data ?? []) as User[]
  } finally {
    agentsLoading.value = false
  }
}

async function loadPrompts() {
  if (activePrompts.value.length) return
  const { $api } = useNuxtApp()
  const { data } = await $api.get('/prompts')
  activePrompts.value = ((data.data ?? []) as Prompt[]).filter((p) => p.isActive)
}

function assign(agentId: string | null) {
  emit('assign', agentId)
  assignOpen.value = false
}

function toggleCanned() {
  cannedOpen.value = !cannedOpen.value
  if (cannedOpen.value) loadPrompts()
}

function insertCanned(content: string) {
  draft.value = content
  cannedOpen.value = false
}

function send() {
  if (!draft.value.trim()) return
  emit('send', draft.value)
  draft.value = ''
  emit('stopTyping')
}

let typingTimer: ReturnType<typeof setTimeout> | null = null
let isTyping = false

function onInput() {
  if (!isTyping) {
    isTyping = true
    emit('typing')
  }
  if (typingTimer) clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    isTyping = false
    emit('stopTyping')
  }, 2000)
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  const { $api } = useNuxtApp()
  await $api.post(`/conversations/${props.conversation.id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  input.value = ''
}

function onBlur() {
  if (isTyping) {
    isTyping = false
    emit('stopTyping')
    if (typingTimer) clearTimeout(typingTimer)
  }
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as Node
    if (assignRef.value && !assignRef.value.contains(target)) assignOpen.value = false
    if (priorityRef.value && !priorityRef.value.contains(target)) priorityOpen.value = false
    if (labelRef.value && !labelRef.value.contains(target)) labelInputOpen.value = false
  })
})

watch(assignOpen, (open) => {
  if (open) loadAgents()
})

watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  }
)
</script>
