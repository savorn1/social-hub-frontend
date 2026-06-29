<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Prompt Templates</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage reusable AI prompt templates</p>
      </div>
      <button class="btn-primary" @click="dialog = true">
        <PlusIcon class="w-4 h-4" /> New Prompt
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="i in 4" :key="i" class="card p-5 animate-pulse space-y-3">
        <div class="h-5 bg-gray-100 rounded w-1/2" />
        <div class="h-16 bg-gray-100 rounded" />
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="p in prompts" :key="p.id" class="card p-5 flex flex-col gap-3">
        <div class="flex items-start justify-between">
          <p class="font-semibold text-gray-900 text-sm">{{ p.name }}</p>
          <div class="flex gap-2">
            <button class="text-xs text-blue-600 hover:underline" @click="edit(p)">Edit</button>
            <button class="text-xs text-red-500 hover:text-red-700" @click="remove(p.id)">
              Delete
            </button>
          </div>
        </div>
        <p v-if="p.description" class="text-xs text-gray-500">{{ p.description }}</p>
        <pre
          class="text-xs bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-hidden max-h-24 text-gray-700"
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
          <button class="btn-primary mt-4" @click="dialog = true">
            <PlusIcon class="w-4 h-4" /> New Prompt
          </button>
        </EmptyState>
      </div>
    </div>

    <!-- Create / Edit dialog -->
    <TransitionRoot :show="dialog" as="template">
      <Dialog class="relative z-50" @close="closeDialog">
        <div class="fixed inset-0 bg-black/40" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="card p-6 w-full max-w-lg shadow-xl">
            <DialogTitle class="text-base font-semibold text-gray-900 mb-4">{{
              editingId ? 'Edit Prompt' : 'New Prompt'
            }}</DialogTitle>
            <div class="space-y-3">
              <div>
                <label class="label">Name</label><input v-model="form.name" class="input" />
              </div>
              <div>
                <label class="label">Description</label
                ><input v-model="form.description" class="input" />
              </div>
              <div>
                <label class="label">Content</label>
                <p class="text-xs text-gray-400 mb-1">
                  Use &#123;&#123;variable&#125;&#125; syntax for dynamic values
                </p>
                <textarea v-model="form.content" class="input" rows="6" />
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button class="btn-secondary" @click="closeDialog">Cancel</button>
              <button class="btn-primary" :disabled="saving" @click="save">
                {{ editingId ? 'Update' : 'Create' }}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot } from '@headlessui/vue'
import { PlusIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import type { Prompt } from '~/types'
import { wrapVar } from '~/utils'

definePageMeta({ middleware: 'auth' })

const { $api } = useNuxtApp()
const prompts = ref<Prompt[]>([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({ name: '', description: '', content: '' })

async function load() {
  loading.value = true
  const { data } = await $api.get('/prompts')
  prompts.value = data.data ?? []
  loading.value = false
}
onMounted(load)

function edit(p: Prompt) {
  editingId.value = p.id
  Object.assign(form, p)
  dialog.value = true
}
function closeDialog() {
  dialog.value = false
  editingId.value = null
  Object.assign(form, { name: '', description: '', content: '' })
}

async function save() {
  saving.value = true
  if (editingId.value) await $api.patch(`/prompts/${editingId.value}`, form)
  else await $api.post('/prompts', form)
  await load()
  closeDialog()
  saving.value = false
}

async function remove(id: string) {
  await $api.delete(`/prompts/${id}`)
  await load()
}
</script>
