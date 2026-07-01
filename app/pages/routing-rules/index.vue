<template>
  <div class="p-6 max-w-6xl">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-slate-100">Routing Rules</h1>
        <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Automatically assign conversations to agents</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <PlusIcon class="w-4 h-4" /> New Rule
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="card overflow-hidden">
      <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-5 py-4 border-b border-gray-50 dark:border-slate-700/50 last:border-0 animate-pulse">
        <div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-36" />
        <div class="h-5 bg-gray-100 dark:bg-slate-700 rounded-full w-16" />
        <div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-8" />
        <div class="h-5 bg-gray-100 dark:bg-slate-700 rounded-full w-32" />
      </div>
    </div>

    <div v-else class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50/80 dark:bg-slate-700/40 border-b border-gray-100 dark:border-slate-700">
          <tr>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Name</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Priority</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Conditions</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Assign Agent</th>
            <th class="px-5 py-3.5" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50 dark:divide-slate-700/50">
          <tr v-if="rules.length === 0">
            <td colspan="6">
              <EmptyState
                :icon="ShareIcon"
                title="No routing rules yet"
                subtitle="Create a rule to auto-assign conversations to agents"
              >
              </EmptyState>
            </td>
          </tr>
          <tr
            v-for="rule in rules"
            :key="rule.id"
            class="hover:bg-gray-50/60 dark:hover:bg-slate-700/30 transition-colors group"
          >
            <td class="px-5 py-3.5 font-semibold text-gray-900 dark:text-slate-100">{{ rule.name }}</td>
            <td class="px-5 py-3.5">
              <span
                class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                :class="rule.isActive
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="rule.isActive ? 'bg-emerald-500' : 'bg-gray-400'" />
                {{ rule.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-gray-500 dark:text-slate-400 tabular-nums">{{ rule.priority }}</td>
            <td class="px-5 py-3.5">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="(cond, i) in rule.conditions"
                  :key="i"
                  class="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 px-2 py-0.5 rounded-full"
                >
                  {{ cond.field }} {{ cond.operator }} "{{ cond.value }}"
                </span>
                <span v-if="!rule.conditions?.length" class="text-gray-400 dark:text-slate-500">—</span>
              </div>
            </td>
            <td class="px-5 py-3.5 text-gray-500 dark:text-slate-400 font-mono text-xs">
              {{ rule.assignedAgentId ?? '—' }}
            </td>
            <td class="px-5 py-3.5">
              <div class="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="btn-secondary text-xs px-3 py-1.5" @click="openEdit(rule)">Edit</button>
                <button
                  class="text-xs px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  @click="confirmDeleteId = rule.id; confirmDialog = true"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create / Edit dialog -->
    <TransitionRoot :show="modalOpen" as="template">
      <Dialog class="relative z-50" @close="modalOpen = false">
        <TransitionChild
          enter="ease-out duration-200"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-150"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="dialog-overlay" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-200"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-150"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="card p-6 w-full max-w-lg shadow-dialog">
              <DialogTitle class="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4">
                {{ editing ? 'Edit Rule' : 'New Rule' }}
              </DialogTitle>

              <div class="space-y-4">
                <div>
                  <label class="label">Name</label>
                  <input
                    v-model="form.name"
                    class="input"
                    placeholder="e.g. Assign Facebook to agent A"
                  />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="label">Priority <span class="font-normal text-gray-400 dark:text-slate-500">(lower = first)</span></label>
                    <input v-model.number="form.priority" type="number" class="input" min="0" />
                  </div>
                  <div class="flex items-end pb-1">
                    <label
                      class="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <button
                        type="button"
                        class="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
                        :class="form.isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'"
                        @click="form.isActive = !form.isActive"
                      >
                        <span
                          class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200"
                          :class="form.isActive ? 'translate-x-4' : 'translate-x-0'"
                        />
                      </button>
                      <span class="text-sm text-gray-700 dark:text-slate-300">Active</span>
                    </label>
                  </div>
                </div>

                <!-- Conditions -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="label mb-0">Conditions <span class="font-normal text-gray-400 dark:text-slate-500">(ALL must match)</span></label>
                    <button class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" @click="addCondition">
                      + Add
                    </button>
                  </div>
                  <div v-if="!form.conditions.length" class="text-xs text-gray-400 dark:text-slate-500 italic py-1">
                    No conditions — rule matches all conversations.
                  </div>
                  <div v-for="(cond, i) in form.conditions" :key="i" class="flex gap-2 mb-2">
                    <select v-model="cond.field" class="input flex-1">
                      <option value="platform">Platform</option>
                      <option value="contactId">Contact ID</option>
                    </select>
                    <select v-model="cond.operator" class="input w-32">
                      <option value="equals">equals</option>
                      <option value="contains">contains</option>
                    </select>
                    <input v-model="cond.value" class="input flex-1" placeholder="value" />
                    <button
                      class="p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                      @click="removeCondition(i)"
                    >
                      <XMarkIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- Action -->
                <div>
                  <label class="label">Assign Agent ID</label>
                  <input v-model="form.assignedAgentId" class="input font-mono text-xs" placeholder="Agent UUID (optional)" />
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button class="btn-secondary" @click="modalOpen = false">Cancel</button>
                <button class="btn-primary" :disabled="saving || !form.name.trim()" @click="save">
                  {{ saving ? 'Saving…' : (editing ? 'Save' : 'Create') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <ConfirmDialog
      v-model="confirmDialog"
      message="Delete this routing rule permanently?"
      confirm-label="Delete"
      confirm-color="danger"
      @confirm="deleteRule(confirmDeleteId!)"
    />
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { PlusIcon, ShareIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useRoutingRulesService } from '~/services/routing-rules.service'
import type { RoutingRule, RuleCondition } from '~/types'

definePageMeta({ middleware: 'auth' })

const service = useRoutingRulesService()
const toast = useToast()

const rules = ref<RoutingRule[]>([])
const loading = ref(true)
const saving = ref(false)
const modalOpen = ref(false)
const editing = ref<string | null>(null)
const confirmDialog = ref(false)
const confirmDeleteId = ref<string | null>(null)

const defaultForm = () => ({
  name: '',
  priority: 0,
  isActive: true,
  conditions: [] as RuleCondition[],
  assignedAgentId: '',
})
const form = reactive(defaultForm())

onMounted(loadRules)

async function loadRules() {
  loading.value = true
  try {
    rules.value = (await service.findAll()) ?? []
  } catch {
    toast.error('Failed to load rules')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  Object.assign(form, defaultForm())
  editing.value = null
  modalOpen.value = true
}

function openEdit(rule: RoutingRule) {
  Object.assign(form, {
    name: rule.name,
    priority: rule.priority,
    isActive: rule.isActive,
    conditions: rule.conditions.map((c: RuleCondition) => ({ ...c })),
    assignedAgentId: rule.assignedAgentId ?? '',
  })
  editing.value = rule.id
  modalOpen.value = true
}

function addCondition() {
  form.conditions.push({ field: 'platform', operator: 'equals', value: '' })
}

function removeCondition(i: number) {
  form.conditions.splice(i, 1)
}

async function save() {
  saving.value = true
  const dto = {
    name: form.name,
    priority: form.priority,
    isActive: form.isActive,
    conditions: form.conditions,
    action: 'assign_agent' as const,
    assignedAgentId: form.assignedAgentId || undefined,
  }
  try {
    if (editing.value) {
      await service.update(editing.value, dto)
      toast.success('Rule updated')
    } else {
      await service.create(dto)
      toast.success('Rule created')
    }
    modalOpen.value = false
    await loadRules()
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    toast.error(msg ?? 'Failed to save rule')
  } finally {
    saving.value = false
  }
}

async function deleteRule(id: string) {
  try {
    await service.remove(id)
    await loadRules()
    toast.success('Rule deleted')
  } catch {
    toast.error('Failed to delete rule')
  }
}
</script>
