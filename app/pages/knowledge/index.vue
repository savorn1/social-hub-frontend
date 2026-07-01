<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-slate-100">Knowledge Base</h1>
        <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
          Train your chatbots with Q&amp;A pairs and documents
        </p>
      </div>
      <button class="btn-primary" @click="createBaseDialog = true">
        <PlusIcon class="w-4 h-4" /> New Base
      </button>
    </div>

    <!-- AI Search -->
    <div class="card p-4 mb-6 flex gap-3 items-center">
      <SparklesIcon class="w-5 h-5 text-blue-500 flex-shrink-0" />
      <div class="flex-1 relative">
        <input
          v-model="searchQuery"
          class="input pr-24 text-sm"
          placeholder="AI Search — ask a question across all knowledge…"
          @keydown.enter="search"
        />
        <button
          class="absolute right-1.5 top-1/2 -translate-y-1/2 btn-primary text-xs py-1 px-3"
          :disabled="!searchQuery.trim() || searching"
          @click="search"
        >
          {{ searching ? '…' : 'Search' }}
        </button>
      </div>
      <button
        v-if="searchResults.length || searchQuery"
        class="text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
        @click="clearSearch"
      >
        Clear
      </button>
    </div>

    <!-- Search results -->
    <div v-if="searchResults.length" class="card divide-y divide-gray-100 dark:divide-slate-700 mb-6">
      <p class="px-4 pt-3 pb-2 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
        {{ searchResults.length }} result{{ searchResults.length !== 1 ? 's' : '' }}
      </p>
      <div v-for="item in searchResults" :key="item.id" class="px-4 py-3">
        <div class="flex items-center gap-2 mb-1">
          <span
            v-if="item.source"
            class="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            :class="sourceStyle(item.sourceType)"
          >
            <component :is="sourceIcon(item.sourceType)" class="w-2.5 h-2.5" />
            {{ item.source }}
          </span>
        </div>
        <p class="text-sm font-medium text-gray-900 dark:text-slate-100">{{ item.question }}</p>
        <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2">{{ item.answer }}</p>
      </div>
    </div>

    <!-- Bases grid -->
    <div v-if="!searchResults.length" class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div v-for="kb in bases" :key="kb.id" class="card p-5 flex flex-col gap-4">
        <!-- Base header -->
        <div class="flex items-start justify-between">
          <div>
            <p class="font-semibold text-gray-900 dark:text-slate-100">{{ kb.name }}</p>
            <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{{ kb.description || 'No description' }}</p>
          </div>
          <div class="flex gap-2">
            <label
              class="btn-secondary text-xs py-1.5 cursor-pointer flex items-center gap-1"
              :title="'Upload PDF, DOCX, or TXT'"
            >
              <ArrowUpTrayIcon class="w-3.5 h-3.5" />
              Upload
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                class="hidden"
                @change="(e) => onFileUpload(e, kb.id)"
              />
            </label>
            <button class="btn-secondary text-xs py-1.5" @click="openAddItem(kb.id)">
              <PlusIcon class="w-3.5 h-3.5" /> Add Q&amp;A
            </button>
          </div>
        </div>

        <!-- Upload progress -->
        <div
          v-if="uploadingBase === kb.id"
          class="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2"
        >
          <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
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
          Parsing &amp; embedding document…
        </div>
        <div
          v-if="uploadResultBase === kb.id && uploadResult"
          class="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2"
        >
          ✓ Inserted {{ uploadResult.inserted }} chunks from document
        </div>

        <!-- Items preview -->
        <div v-if="kb.items?.length" class="space-y-2">
          <div
            v-for="item in kb.items.slice(0, 3)"
            :key="item.id"
            class="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/60 group"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 mb-0.5">
                <span
                  v-if="item.source"
                  class="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                  :class="sourceStyle(item.sourceType)"
                >
                  <component :is="sourceIcon(item.sourceType)" class="w-2 h-2" />
                  {{ item.sourceType?.toUpperCase() }}
                </span>
              </div>
              <p class="text-xs font-medium text-gray-700 dark:text-slate-300 truncate">{{ item.question }}</p>
              <p class="text-xs text-gray-400 dark:text-slate-500 truncate">{{ item.answer }}</p>
            </div>
            <div
              class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <button class="text-[11px] text-blue-600 hover:underline" @click="openEditItem(item)">
                Edit
              </button>
              <button
                class="text-[11px] text-red-500 hover:underline"
                @click="deleteItem(item.id, kb.id)"
              >
                Del
              </button>
            </div>
          </div>
          <button
            v-if="kb.items.length > 3"
            class="text-xs text-blue-600 hover:underline w-full text-center py-1"
            @click="openViewAll(kb)"
          >
            View all {{ kb.items.length }} items →
          </button>
        </div>
        <p v-else class="text-xs text-gray-400 dark:text-slate-500 italic">
          No items yet — add Q&amp;A or upload a document.
        </p>
      </div>

      <div v-if="!bases.length && !loading" class="md:col-span-2">
        <EmptyState
          :icon="BookOpenIcon"
          title="No knowledge bases"
          subtitle="Create one to start training your chatbots"
        >
        </EmptyState>
      </div>
    </div>

    <!-- Create base dialog -->
    <TransitionRoot :show="createBaseDialog" as="template">
      <Dialog class="relative z-50" @close="createBaseDialog = false">
        <div class="dialog-overlay" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="card p-6 w-full max-w-md shadow-dialog">
            <DialogTitle class="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4"
              >New Knowledge Base</DialogTitle
            >
            <div class="space-y-3">
              <div>
                <label class="label">Name</label>
                <input v-model="baseForm.name" class="input" placeholder="e.g. Product FAQ" />
              </div>
              <div>
                <label class="label">Description</label>
                <textarea v-model="baseForm.description" class="input" rows="2" />
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button class="btn-secondary" @click="createBaseDialog = false">Cancel</button>
              <button class="btn-primary" :disabled="!baseForm.name" @click="createBase">
                Create
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Add / Edit item dialog -->
    <TransitionRoot :show="itemDialog" as="template">
      <Dialog class="relative z-50" @close="itemDialog = false">
        <div class="dialog-overlay" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="card p-6 w-full max-w-lg shadow-dialog">
            <DialogTitle class="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4">
              {{ editingItemId ? 'Edit Item' : 'Add Q&A Item' }}
            </DialogTitle>
            <div class="space-y-3">
              <div>
                <label class="label">Question</label>
                <input
                  v-model="itemForm.question"
                  class="input"
                  placeholder="e.g. What are your business hours?"
                />
              </div>
              <div>
                <label class="label">Answer</label>
                <textarea
                  v-model="itemForm.answer"
                  class="input"
                  rows="4"
                  placeholder="e.g. We're open Mon–Fri 9am–6pm."
                />
              </div>
              <div>
                <label class="label"
                  >Tags <span class="text-gray-400 dark:text-slate-500 font-normal">(comma-separated)</span></label
                >
                <input
                  v-model="itemTagsRaw"
                  class="input"
                  placeholder="hours, schedule, availability"
                />
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button class="btn-secondary" @click="itemDialog = false">Cancel</button>
              <button
                class="btn-primary"
                :disabled="!itemForm.question || !itemForm.answer || savingItem"
                @click="saveItem"
              >
                <svg v-if="savingItem" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
                {{ editingItemId ? 'Update' : 'Add' }}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- View all items dialog -->
    <TransitionRoot :show="viewAllDialog" as="template">
      <Dialog class="relative z-50" @close="viewAllDialog = false">
        <div class="dialog-overlay" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="card p-6 w-full max-w-2xl shadow-dialog max-h-[80vh] flex flex-col">
            <DialogTitle class="text-base font-semibold text-gray-900 dark:text-slate-100 mb-1">{{
              viewAllBase?.name
            }}</DialogTitle>
            <p class="text-xs text-gray-400 dark:text-slate-500 mb-4">{{ viewAllBase?.items?.length }} items</p>
            <div class="flex-1 overflow-y-auto space-y-2 pr-1">
              <div
                v-for="item in viewAllBase?.items"
                :key="item.id"
                class="flex items-start justify-between gap-3 p-3 rounded-lg border border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 group"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5 mb-1">
                    <span
                      v-if="item.source"
                      class="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                      :class="sourceStyle(item.sourceType)"
                    >
                      <component :is="sourceIcon(item.sourceType)" class="w-2 h-2" />
                      {{ item.source }}
                    </span>
                  </div>
                  <p class="text-xs font-medium text-gray-800 dark:text-slate-100">{{ item.question }}</p>
                  <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2">{{ item.answer }}</p>
                </div>
                <div
                  class="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button class="text-xs text-blue-600 hover:underline" @click="openEditItem(item)">
                    Edit
                  </button>
                  <button
                    class="text-xs text-red-500 hover:underline"
                    @click="deleteItem(item.id, viewAllBase!.id)"
                  >
                    Del
                  </button>
                </div>
              </div>
            </div>
            <div class="flex justify-end mt-4">
              <button class="btn-secondary" @click="viewAllDialog = false">Close</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot } from '@headlessui/vue'
import {
  PlusIcon,
  BookOpenIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  DocumentIcon,
  CodeBracketIcon,
} from '@heroicons/vue/24/outline'
import type { KnowledgeBase, KnowledgeItem } from '~/types'
import { useKnowledgeService } from '~/services/knowledge.service'

definePageMeta({ middleware: 'auth' })

const knowledgeService = useKnowledgeService()
const toast = useToast()
const bases = ref<KnowledgeBase[]>([])
const loading = ref(false)

// search
const searchQuery = ref('')
const searchResults = ref<KnowledgeItem[]>([])
const searching = ref(false)

// upload
const uploadingBase = ref<string | null>(null)
const uploadResultBase = ref<string | null>(null)
const uploadResult = ref<{ inserted: number } | null>(null)

// create base
const createBaseDialog = ref(false)
const baseForm = reactive({ name: '', description: '' })

// add/edit item
const itemDialog = ref(false)
const editingItemId = ref<string | null>(null)
const activeBaseId = ref<string | null>(null)
const savingItem = ref(false)
const itemForm = reactive({ question: '', answer: '' })
const itemTagsRaw = ref('')

// view all
const viewAllDialog = ref(false)
const viewAllBase = ref<KnowledgeBase | null>(null)

function sourceStyle(type?: string) {
  if (type === 'pdf') return 'bg-red-50 text-red-600'
  if (type === 'docx') return 'bg-blue-50 text-blue-600'
  return 'bg-gray-100 text-gray-600'
}

function sourceIcon(type?: string) {
  if (type === 'pdf') return DocumentTextIcon
  if (type === 'docx') return CodeBracketIcon
  return DocumentIcon
}

async function load() {
  loading.value = true
  try {
    const allBases = await knowledgeService.findAllBases()
    bases.value = await Promise.all(allBases.map((b) => knowledgeService.findOneBase(b.id)))
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function search() {
  if (!searchQuery.value.trim()) return
  searching.value = true
  try {
    searchResults.value = await knowledgeService.search(searchQuery.value)
  } finally {
    searching.value = false
  }
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
}

async function createBase() {
  try {
    await knowledgeService.createBase(baseForm)
    createBaseDialog.value = false
    Object.assign(baseForm, { name: '', description: '' })
    await load()
    toast.success('Knowledge base created')
  } catch {
    toast.error('Failed to create knowledge base')
  }
}

async function onFileUpload(e: Event, baseId: string) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  input.value = ''
  uploadingBase.value = baseId
  uploadResultBase.value = null
  uploadResult.value = null
  try {
    const result = await knowledgeService.uploadDocument(baseId, file)
    uploadResult.value = result
    uploadResultBase.value = baseId
    await load()
    toast.success(`Inserted ${result.inserted} chunks from document`)
    setTimeout(() => {
      uploadResultBase.value = null
    }, 4000)
  } catch {
    toast.error('Failed to upload document')
  } finally {
    uploadingBase.value = null
  }
}

function openAddItem(baseId: string) {
  activeBaseId.value = baseId
  editingItemId.value = null
  Object.assign(itemForm, { question: '', answer: '' })
  itemTagsRaw.value = ''
  itemDialog.value = true
}

function openEditItem(item: KnowledgeItem) {
  activeBaseId.value = item.knowledgeBaseId
  editingItemId.value = item.id
  Object.assign(itemForm, { question: item.question, answer: item.answer })
  itemTagsRaw.value = (item.tags ?? []).join(', ')
  itemDialog.value = true
  viewAllDialog.value = false
}

async function saveItem() {
  savingItem.value = true
  try {
    const tags = itemTagsRaw.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (editingItemId.value) {
      await knowledgeService.updateItem(editingItemId.value, { ...itemForm, tags })
      toast.success('Item updated')
    } else {
      await knowledgeService.addItem(activeBaseId.value!, { ...itemForm, tags })
      toast.success('Item added')
    }
    itemDialog.value = false
    await load()
  } catch {
    toast.error('Failed to save item')
  } finally {
    savingItem.value = false
  }
}

async function deleteItem(id: string, baseId: string) {
  try {
    await knowledgeService.removeItem(id)
    const base = bases.value.find((b) => b.id === baseId)
    if (base?.items) base.items = base.items.filter((i) => i.id !== id)
    if (viewAllBase.value?.id === baseId && viewAllBase.value.items) {
      viewAllBase.value.items = viewAllBase.value.items.filter((i) => i.id !== id)
    }
    toast.success('Item deleted')
  } catch {
    toast.error('Failed to delete item')
  }
}

function openViewAll(kb: KnowledgeBase) {
  viewAllBase.value = kb
  viewAllDialog.value = true
}
</script>
