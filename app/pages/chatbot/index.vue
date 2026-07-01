<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-slate-100">Chatbots</h1>
        <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Automate responses with AI-powered bots</p>
      </div>
      <button class="btn-primary" @click="dialog = true">
        <PlusIcon class="w-4 h-4" /> New Chatbot
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="store.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="card p-5 animate-pulse space-y-3">
        <div class="h-5 bg-gray-100 dark:bg-slate-700 rounded w-2/3" />
        <div class="h-4 bg-gray-100 dark:bg-slate-700 rounded w-full" />
        <div class="h-8 bg-gray-100 dark:bg-slate-700 rounded w-1/2" />
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="bot in store.chatbots" :key="bot.id" class="card p-5 flex flex-col gap-3 hover:shadow-md hover:shadow-gray-100/80 transition-shadow duration-150">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <CpuChipIcon class="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div class="min-w-0">
              <span class="font-semibold text-gray-900 dark:text-slate-100 text-sm block truncate">{{ bot.name }}</span>
              <span
                class="inline-flex items-center gap-1 text-[10px] font-medium mt-0.5"
                :class="bot.isActive ? 'text-green-600' : 'text-gray-400 dark:text-slate-500'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="bot.isActive ? 'bg-green-500' : 'bg-gray-300'" />
                {{ bot.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
          <!-- Toggle -->
          <button
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none flex-shrink-0"
            :class="bot.isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'"
            :title="bot.isActive ? 'Deactivate' : 'Activate'"
            @click="store.toggle(bot.id, !bot.isActive)"
          >
            <span
              class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
              :class="bot.isActive ? 'translate-x-4' : 'translate-x-1'"
            />
          </button>
        </div>

        <p v-if="bot.description" class="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{{ bot.description }}</p>

        <div class="flex flex-wrap gap-1.5">
          <span v-if="bot.knowledgeBaseId" class="badge bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
            <BookOpenIcon class="w-3 h-3 mr-0.5" /> Knowledge
          </span>
          <span v-if="bot.promptId" class="badge bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
            <DocumentTextIcon class="w-3 h-3 mr-0.5" /> Prompt
          </span>
          <span v-if="!bot.knowledgeBaseId && !bot.promptId" class="text-[11px] text-gray-400 dark:text-slate-500 italic">No AI config</span>
        </div>

        <div class="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-slate-700">
          <NuxtLink
            :to="`/chatbot/${bot.id}`"
            class="btn-secondary flex-1 justify-center text-xs py-1.5"
          >
            <Cog6ToothIcon class="w-3.5 h-3.5" /> Configure
          </NuxtLink>
          <button
            class="p-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete"
            @click="confirmRemove(bot.id)"
          >
            <TrashIcon class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Create dialog -->
    <TransitionRoot :show="dialog" as="template">
      <Dialog class="relative z-50" @close="dialog = false">
        <div class="dialog-overlay" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="card p-6 w-full max-w-md shadow-dialog">
            <DialogTitle class="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4"
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
              <button class="btn-secondary" @click="closeDialog">Cancel</button>
              <button class="btn-primary" :disabled="!form.name.trim()" @click="create">Create</button>
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
import { PlusIcon, CpuChipIcon, TrashIcon, BookOpenIcon, DocumentTextIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'

definePageMeta({ middleware: 'auth' })

const store = useChatbotStore()
const toast = useToast()
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
  if (removeId.value) {
    try {
      await store.remove(removeId.value)
      toast.success('Chatbot deleted')
    } catch {
      toast.error('Failed to delete chatbot')
    }
  }
}
function closeDialog() {
  dialog.value = false
  Object.assign(form, { name: '', description: '' })
}

async function create() {
  try {
    await store.create(form)
    closeDialog()
    toast.success('Chatbot created')
  } catch {
    toast.error('Failed to create chatbot')
  }
}
</script>
