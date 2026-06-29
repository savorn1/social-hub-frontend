<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Chatbots</h1>
        <p class="text-sm text-gray-500 mt-0.5">Automate responses with AI-powered bots</p>
      </div>
      <button class="btn-primary" @click="dialog = true">
        <PlusIcon class="w-4 h-4" /> New Chatbot
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="store.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="card p-5 animate-pulse space-y-3">
        <div class="h-5 bg-gray-100 rounded w-2/3" />
        <div class="h-4 bg-gray-100 rounded w-full" />
        <div class="h-8 bg-gray-100 rounded w-1/2" />
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="bot in store.chatbots" :key="bot.id" class="card p-5 flex flex-col gap-3">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <CpuChipIcon class="w-5 h-5 text-blue-600" />
            <span class="font-semibold text-gray-900 text-sm">{{ bot.name }}</span>
          </div>
          <!-- Toggle -->
          <button
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
            :class="bot.isActive ? 'bg-blue-600' : 'bg-gray-200'"
            @click="store.toggle(bot.id, !bot.isActive)"
          >
            <span
              class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
              :class="bot.isActive ? 'translate-x-4' : 'translate-x-1'"
            />
          </button>
        </div>

        <p v-if="bot.description" class="text-xs text-gray-500">{{ bot.description }}</p>

        <div class="flex flex-wrap gap-1.5">
          <span v-if="bot.knowledgeBaseId" class="badge bg-purple-50 text-purple-700"
            >Knowledge</span
          >
          <span v-if="bot.promptId" class="badge bg-amber-50 text-amber-700">Prompt</span>
        </div>

        <div class="flex items-center justify-between pt-1 border-t border-gray-100">
          <NuxtLink
            :to="`/chatbot/${bot.id}`"
            class="text-xs text-blue-600 font-medium hover:underline"
            >Configure</NuxtLink
          >
          <button class="text-xs text-red-500 hover:text-red-700" @click="confirmRemove(bot.id)">
            Delete
          </button>
        </div>
      </div>

      <div v-if="!store.chatbots.length" class="md:col-span-2 lg:col-span-3">
        <EmptyState
          :icon="CpuChipIcon"
          title="No chatbots yet"
          subtitle="Create your first chatbot to automate responses"
        >
          <button class="btn-primary mt-4" @click="dialog = true">
            <PlusIcon class="w-4 h-4" /> New Chatbot
          </button>
        </EmptyState>
      </div>
    </div>

    <!-- Create dialog -->
    <TransitionRoot :show="dialog" as="template">
      <Dialog class="relative z-50" @close="dialog = false">
        <div class="fixed inset-0 bg-black/40" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="card p-6 w-full max-w-md shadow-xl">
            <DialogTitle class="text-base font-semibold text-gray-900 mb-4"
              >New Chatbot</DialogTitle
            >
            <div class="space-y-3">
              <div>
                <label class="label">Name</label
                ><input v-model="form.name" class="input" placeholder="Support Bot" />
              </div>
              <div>
                <label class="label">Description</label
                ><textarea v-model="form.description" class="input" rows="2" />
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button class="btn-secondary" @click="dialog = false">Cancel</button>
              <button class="btn-primary" @click="create">Create</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>

    <ConfirmDialog
      v-model="confirmDialog"
      message="Delete this chatbot permanently?"
      confirm-label="Delete"
      confirm-color="danger"
      @confirm="remove"
    />
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot } from '@headlessui/vue'
import { PlusIcon, CpuChipIcon } from '@heroicons/vue/24/outline'

definePageMeta({ middleware: 'auth' })

const store = useChatbotStore()
onMounted(() => store.fetchAll())

const dialog = ref(false)
const confirmDialog = ref(false)
const removeId = ref<string | null>(null)
const form = reactive({ name: '', description: '' })

function confirmRemove(id: string) {
  removeId.value = id
  confirmDialog.value = true
}
async function remove() {
  if (removeId.value) await store.remove(removeId.value)
}
async function create() {
  await store.create(form)
  dialog.value = false
  Object.assign(form, { name: '', description: '' })
}
</script>
