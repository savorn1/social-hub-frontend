<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-slate-100">Prompt Templates</h1>
        <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Manage reusable AI prompt templates</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <PlusIcon class="w-4 h-4" /> New Prompt
      </button>
    </div>

    <!-- Category tabs -->
    <div class="flex gap-1 mb-5 border-b border-gray-200 dark:border-slate-700">
      <button
        v-for="tab in categoryTabs"
        :key="tab.value ?? 'all'"
        class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
        :class="
          activeCategory === tab.value
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
        "
        @click="setCategory(tab.value)"
      >
        <span
          v-if="tab.dot"
          class="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
          :class="tab.dot"
        />
        {{ tab.label }}
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="i in 4" :key="i" class="card p-5 animate-pulse space-y-3">
        <div class="h-5 bg-gray-100 dark:bg-slate-700 rounded w-1/2" />
        <div class="h-16 bg-gray-100 dark:bg-slate-700 rounded" />
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="p in prompts" :key="p.id" class="card p-5 flex flex-col gap-3">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span
              class="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0"
              :class="categoryStyle(p.category)"
              >{{ p.category }}</span
            >
            <p class="font-semibold text-gray-900 dark:text-slate-100 text-sm truncate">{{ p.name }}</p>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <button
              class="text-xs text-purple-600 hover:underline flex items-center gap-0.5"
              @click="openHistory(p)"
            >
              <ClockIcon class="w-3 h-3" /> v{{ p.currentVersion }}
            </button>
            <button class="text-xs text-blue-600 hover:underline" @click="openEdit(p)">Edit</button>
            <button class="text-xs text-red-500 hover:text-red-700" @click="confirmRemove(p.id)">
              Delete
            </button>
          </div>
        </div>

        <p v-if="p.description" class="text-xs text-gray-500 dark:text-slate-400">{{ p.description }}</p>

        <pre
          class="text-xs bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600 rounded-lg p-3 overflow-hidden max-h-24 text-gray-700 dark:text-slate-300 whitespace-pre-wrap"
          >{{ p.content.slice(0, 200) }}{{ p.content.length > 200 ? '…' : '' }}</pre>

        <div v-if="p.variables?.length" class="flex flex-wrap gap-1.5">
          <span v-for="v in p.variables" :key="v" class="badge bg-blue-50 text-blue-700">{{
            wrapVar(v)
          }}</span>
        </div>
      </div>

      <div v-if="!prompts.length" class="md:col-span-2">
        <EmptyState
          :icon="DocumentTextIcon"
          title="No prompts yet"
          subtitle="Create prompt templates for your AI responses"
        >
          <button class="btn-primary mt-4" @click="openCreate">
            <PlusIcon class="w-4 h-4" /> New Prompt
          </button>
        </EmptyState>
      </div>
    </div>

    <!-- Create / Edit dialog -->
    <TransitionRoot :show="dialog" as="template">
      <Dialog class="relative z-50" @close="closeDialog">
        <div class="dialog-overlay" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="card p-6 w-full max-w-lg shadow-dialog">
            <DialogTitle class="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4">
              {{ editingId ? 'Edit Prompt' : 'New Prompt' }}
            </DialogTitle>
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Name</label>
                  <input v-model="form.name" class="input" placeholder="e.g. Support Greeting" />
                </div>
                <div>
                  <label class="label">Category</label>
                  <select v-model="form.category" class="input">
                    <option value="general">General</option>
                    <option value="system">System</option>
                    <option value="sales">Sales</option>
                    <option value="support">Support</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="label">Description</label>
                <input
                  v-model="form.description"
                  class="input"
                  placeholder="Optional short description"
                />
              </div>
              <div>
                <label class="label">Content</label>
                <p class="text-xs text-gray-400 dark:text-slate-500 mb-1">
                  Use &#123;&#123;variable&#125;&#125; syntax for dynamic values
                </p>
                <textarea v-model="form.content" class="input font-mono text-xs" rows="7" />
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button class="btn-secondary" @click="closeDialog">Cancel</button>
              <button
                class="btn-primary"
                :disabled="saving || !form.name || !form.content"
                @click="save"
              >
                <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
                {{ editingId ? 'Update' : 'Create' }}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Version history dialog -->
    <TransitionRoot :show="historyDialog" as="template">
      <Dialog class="relative z-50" @close="historyDialog = false">
        <div class="dialog-overlay" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="card p-6 w-full max-w-xl shadow-dialog max-h-[80vh] flex flex-col">
            <DialogTitle class="text-base font-semibold text-gray-900 dark:text-slate-100 mb-1">
              Version History
            </DialogTitle>
            <p class="text-xs text-gray-400 dark:text-slate-500 mb-4">{{ historyPrompt?.name }}</p>

            <div v-if="versionsLoading" class="flex justify-center py-8">
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

            <div v-else-if="!versions.length" class="text-sm text-gray-400 dark:text-slate-500 text-center py-8">
              No previous versions. Edit the content to start tracking versions.
            </div>

            <div v-else class="flex-1 overflow-y-auto space-y-3 pr-1">
              <div
                v-for="v in versions"
                :key="v.id"
                class="border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-2"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-gray-700 dark:text-slate-300">Version {{ v.version }}</span>
                  <div class="flex items-center gap-3">
                    <span class="text-[11px] text-gray-400 dark:text-slate-500">{{ formatDate(v.createdAt) }}</span>
                    <button
                      class="text-xs text-blue-600 hover:underline font-medium"
                      @click="restore(v)"
                    >
                      Restore
                    </button>
                  </div>
                </div>
                <pre
                  class="text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2.5 max-h-28 overflow-hidden whitespace-pre-wrap"
                  >{{ v.content.slice(0, 300) }}{{ v.content.length > 300 ? '…' : '' }}</pre>
              </div>
            </div>

            <div class="flex justify-end mt-4">
              <button class="btn-secondary" @click="historyDialog = false">Close</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>

    <ConfirmDialog
      v-model="confirmDialog"
      message="Delete this prompt permanently?"
      confirm-label="Delete"
      confirm-color="danger"
      @confirm="remove"
    />
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot } from '@headlessui/vue'
import { PlusIcon, DocumentTextIcon, ClockIcon } from '@heroicons/vue/24/outline'
import type { Prompt, PromptVersion, PromptCategory } from '~/types'
import { usePromptsService } from '~/services/prompts.service'
import { wrapVar, formatDate } from '~/utils'

definePageMeta({ middleware: 'auth' })

const promptsService = usePromptsService()
const toast = useToast()

const prompts = ref<Prompt[]>([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editingId = ref<string | null>(null)
const activeCategory = ref<PromptCategory | undefined>(undefined)
const confirmDialog = ref(false)
const removeId = ref<string | null>(null)

const form = reactive<{
  name: string
  description: string
  content: string
  category: PromptCategory
}>({ name: '', description: '', content: '', category: 'general' })

// version history
const historyDialog = ref(false)
const historyPrompt = ref<Prompt | null>(null)
const versions = ref<PromptVersion[]>([])
const versionsLoading = ref(false)

const categoryTabs: { label: string; value: PromptCategory | undefined; dot?: string }[] = [
  { label: 'All', value: undefined },
  { label: 'System', value: 'system', dot: 'bg-gray-500' },
  { label: 'Support', value: 'support', dot: 'bg-blue-500' },
  { label: 'Sales', value: 'sales', dot: 'bg-green-500' },
  { label: 'Marketing', value: 'marketing', dot: 'bg-pink-500' },
  { label: 'General', value: 'general', dot: 'bg-purple-400' },
]

function categoryStyle(cat: PromptCategory) {
  return (
    {
      system: 'bg-gray-100 text-gray-600',
      support: 'bg-blue-50 text-blue-700',
      sales: 'bg-green-50 text-green-700',
      marketing: 'bg-pink-50 text-pink-700',
      general: 'bg-purple-50 text-purple-700',
    }[cat] ?? 'bg-gray-100 text-gray-600'
  )
}

async function load() {
  loading.value = true
  try {
    prompts.value = await promptsService.findAll(activeCategory.value)
  } finally {
    loading.value = false
  }
}

onMounted(load)

function setCategory(cat: PromptCategory | undefined) {
  activeCategory.value = cat
  load()
}

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', description: '', content: '', category: 'general' })
  dialog.value = true
}

function openEdit(p: Prompt) {
  editingId.value = p.id
  Object.assign(form, {
    name: p.name,
    description: p.description ?? '',
    content: p.content,
    category: p.category,
  })
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  editingId.value = null
}

async function save() {
  saving.value = true
  try {
    if (editingId.value) {
      await promptsService.update(editingId.value, { ...form })
      toast.success('Prompt updated')
    } else {
      await promptsService.create({ ...form })
      toast.success('Prompt created')
    }
    await load()
    closeDialog()
  } catch {
    toast.error('Failed to save prompt')
  } finally {
    saving.value = false
  }
}

function confirmRemove(id: string) {
  removeId.value = id
  confirmDialog.value = true
}

async function remove() {
  if (removeId.value) {
    try {
      await promptsService.remove(removeId.value)
      await load()
      removeId.value = null
      toast.success('Prompt deleted')
    } catch {
      toast.error('Failed to delete prompt')
    }
  }
}

async function openHistory(p: Prompt) {
  historyPrompt.value = p
  historyDialog.value = true
  versionsLoading.value = true
  try {
    versions.value = await promptsService.findVersions(p.id)
  } finally {
    versionsLoading.value = false
  }
}

async function restore(v: PromptVersion) {
  if (!historyPrompt.value) return
  try {
    await promptsService.restore(historyPrompt.value.id, v.id)
    historyDialog.value = false
    await load()
    toast.success(`Restored to version ${v.version}`)
  } catch {
    toast.error('Failed to restore version')
  }
}
</script>
