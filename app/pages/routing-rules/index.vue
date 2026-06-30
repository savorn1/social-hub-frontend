<template>
  <div class="p-6 max-w-6xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-gray-900 dark:text-slate-100">Routing Rules</h1>
      <button class="btn-primary" @click="openCreate">+ New Rule</button>
    </div>

    <div v-if="loading" class="text-sm text-gray-400 dark:text-slate-500">Loading…</div>

    <div v-else class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-slate-400">Name</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-slate-400">Status</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-slate-400">Priority</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-slate-400">Conditions</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-slate-400">Assign Agent</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
          <tr v-if="rules.length === 0">
            <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-400 dark:text-slate-500">No data</td>
          </tr>
          <tr v-for="rule in rules" :key="rule.id" class="hover:bg-gray-50 dark:hover:bg-slate-700/30">
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{{ rule.name }}</td>
            <td class="px-4 py-3">
              <span
                class="text-xs px-1.5 py-0.5 rounded"
                :class="rule.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'"
              >
                {{ rule.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500 dark:text-slate-400">{{ rule.priority }}</td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="(cond, i) in rule.conditions"
                  :key="i"
                  class="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full"
                >
                  {{ cond.field }} {{ cond.operator }} "{{ cond.value }}"
                </span>
                <span v-if="!rule.conditions?.length" class="text-gray-400 dark:text-slate-500">—</span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-500 dark:text-slate-400 font-mono text-xs">
              {{ rule.assignedAgentId ?? '—' }}
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-2 justify-end">
                <button class="btn-secondary text-xs" @click="openEdit(rule)">Edit</button>
                <button class="btn-secondary text-xs text-red-600" @click="deleteRule(rule.id)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="modalOpen" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="dialog-overlay absolute inset-0" @click="modalOpen = false" />
      <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-dialog w-full max-w-lg p-6 z-10">
        <h2 class="text-lg font-semibold dark:text-slate-100 mb-4">{{ editing ? 'Edit Rule' : 'New Rule' }}</h2>

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
              <label class="label">Priority (lower = higher)</label>
              <input v-model.number="form.priority" type="number" class="input" min="0" />
            </div>
            <div class="flex items-end pb-1">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="form.isActive" type="checkbox" class="w-4 h-4 accent-indigo-600" />
                <span class="text-sm text-gray-700 dark:text-slate-300">Active</span>
              </label>
            </div>
          </div>

          <!-- Conditions -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="label mb-0">Conditions (ALL must match)</label>
              <button class="text-xs text-indigo-600 hover:underline" @click="addCondition">
                + Add
              </button>
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
              <button class="text-gray-400 dark:text-slate-500 hover:text-red-500" @click="removeCondition(i)">
                ✕
              </button>
            </div>
          </div>

          <!-- Action -->
          <div>
            <label class="label">Assign Agent ID</label>
            <input v-model="form.assignedAgentId" class="input" placeholder="Agent UUID" />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button class="btn-secondary" @click="modalOpen = false">Cancel</button>
          <button class="btn-primary" :disabled="saving || !form.name.trim()" @click="save">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  if (!confirm('Delete this rule?')) return
  try {
    await service.remove(id)
    await loadRules()
    toast.success('Rule deleted')
  } catch {
    toast.error('Failed to delete rule')
  }
}
</script>
