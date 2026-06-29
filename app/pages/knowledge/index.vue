<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Knowledge Base</h1>
        <p class="text-sm text-gray-500 mt-0.5">Train your chatbots with Q&amp;A pairs</p>
      </div>
      <button class="btn-primary" @click="createBaseDialog = true">
        <PlusIcon class="w-4 h-4" /> New Base
      </button>
    </div>

    <!-- Search -->
    <div class="relative mb-6">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        v-model="searchQuery"
        class="input pl-9"
        placeholder="Search knowledge items…"
        @input="search"
      />
    </div>

    <!-- Search results -->
    <div v-if="searchResults.length" class="card divide-y divide-gray-100 mb-6">
      <div v-for="item in searchResults" :key="item.id" class="px-4 py-3">
        <p class="text-sm font-medium text-gray-900">{{ item.question }}</p>
        <p class="text-sm text-gray-500 mt-0.5">{{ item.answer }}</p>
      </div>
    </div>

    <!-- Bases grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="kb in bases" :key="kb.id" class="card p-5">
        <div class="flex items-start justify-between mb-2">
          <p class="font-semibold text-gray-900">{{ kb.name }}</p>
          <button
            class="text-xs text-blue-600 hover:underline"
            @click="navigateTo(`/knowledge/${kb.id}`)"
          >
            View all →
          </button>
        </div>
        <p class="text-sm text-gray-500 mb-4">{{ kb.description || 'No description' }}</p>
        <button class="btn-secondary text-xs py-1.5" @click="openAddItem(kb.id)">
          <PlusIcon class="w-3.5 h-3.5" /> Add Item
        </button>
      </div>

      <div v-if="!bases.length && !loading" class="md:col-span-2">
        <EmptyState
          :icon="BookOpenIcon"
          title="No knowledge bases"
          subtitle="Create one to start training your chatbots"
        >
          <button class="btn-primary mt-4" @click="createBaseDialog = true">
            <PlusIcon class="w-4 h-4" /> New Base
          </button>
        </EmptyState>
      </div>
    </div>

    <!-- Create base dialog -->
    <TransitionRoot :show="createBaseDialog" as="template">
      <Dialog class="relative z-50" @close="createBaseDialog = false">
        <div class="fixed inset-0 bg-black/40" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="card p-6 w-full max-w-md shadow-xl">
            <DialogTitle class="text-base font-semibold text-gray-900 mb-4"
              >New Knowledge Base</DialogTitle
            >
            <div class="space-y-3">
              <div>
                <label class="label">Name</label><input v-model="baseForm.name" class="input" />
              </div>
              <div>
                <label class="label">Description</label
                ><textarea v-model="baseForm.description" class="input" rows="2" />
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button class="btn-secondary" @click="createBaseDialog = false">Cancel</button>
              <button class="btn-primary" :disabled="loading" @click="createBase">Create</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Add item dialog -->
    <TransitionRoot :show="addItemDialog" as="template">
      <Dialog class="relative z-50" @close="addItemDialog = false">
        <div class="fixed inset-0 bg-black/40" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="card p-6 w-full max-w-lg shadow-xl">
            <DialogTitle class="text-base font-semibold text-gray-900 mb-4"
              >Add Knowledge Item</DialogTitle
            >
            <div class="space-y-3">
              <div>
                <label class="label">Question</label
                ><input v-model="itemForm.question" class="input" />
              </div>
              <div>
                <label class="label">Answer</label
                ><textarea v-model="itemForm.answer" class="input" rows="4" />
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button class="btn-secondary" @click="addItemDialog = false">Cancel</button>
              <button class="btn-primary" :disabled="loading" @click="addItem">Add</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot } from '@headlessui/vue'
import { PlusIcon, MagnifyingGlassIcon, BookOpenIcon } from '@heroicons/vue/24/outline'
import type { KnowledgeBase, KnowledgeItem } from '~/types'
import { useKnowledgeService } from '~/services/knowledge.service'
import { useApi } from '~/composables/useApi'

definePageMeta({ middleware: 'auth' })

const knowledgeService = useKnowledgeService()
const { loading, request } = useApi()
const bases = ref<KnowledgeBase[]>([])
const searchQuery = ref('')
const searchResults = ref<KnowledgeItem[]>([])
const createBaseDialog = ref(false)
const addItemDialog = ref(false)
const activeBaseId = ref<string | null>(null)
const baseForm = reactive({ name: '', description: '' })
const itemForm = reactive({ question: '', answer: '' })

onMounted(async () => {
  bases.value = await knowledgeService.findAllBases()
})

function openAddItem(id: string) {
  activeBaseId.value = id
  addItemDialog.value = true
}

async function createBase() {
  await request(() => knowledgeService.createBase(baseForm))
  bases.value = await knowledgeService.findAllBases()
  createBaseDialog.value = false
  Object.assign(baseForm, { name: '', description: '' })
}

async function addItem() {
  if (!activeBaseId.value) return
  await request(() => knowledgeService.addItem(activeBaseId.value!, itemForm))
  addItemDialog.value = false
  Object.assign(itemForm, { question: '', answer: '' })
}

async function search() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  searchResults.value = await knowledgeService.search(searchQuery.value)
}
</script>
