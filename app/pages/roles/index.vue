<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-slate-100">Roles</h1>
        <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Manage roles and their permissions</p>
      </div>
      <button class="btn-primary" @click="openCreate"><PlusIcon class="w-4 h-4" /> New Role</button>
    </div>

    <div class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400 w-32">Code</th>
            <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Name</th>
            <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Description</th>
            <th class="text-center px-4 py-3 font-medium text-gray-500 dark:text-slate-400 w-24">Default</th>
            <th class="px-4 py-3 w-24" />
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr v-for="i in 4" :key="i" class="border-b border-gray-50 dark:border-slate-700 last:border-0">
              <td class="px-4 py-3"><div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-20 animate-pulse" /></td>
              <td class="px-4 py-3"><div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-28 animate-pulse" /></td>
              <td class="px-4 py-3"><div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-48 animate-pulse" /></td>
              <td class="px-4 py-3"><div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-8 mx-auto animate-pulse" /></td>
              <td class="px-4 py-3" />
            </tr>
          </template>
          <tr
            v-for="role in roles"
            :key="role.id"
            class="border-b border-gray-50 dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <td class="px-4 py-3 font-mono text-xs text-gray-600 dark:text-slate-400">{{ role.code }}</td>
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{{ role.name }}</td>
            <td class="px-4 py-3 text-gray-500 dark:text-slate-400">{{ role.description ?? '—' }}</td>
            <td class="px-4 py-3 text-center">
              <span
                v-if="role.isDefault"
                class="inline-block w-2 h-2 rounded-full bg-green-500"
                title="Default role"
              />
              <span v-else class="text-gray-300">—</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-2">
                <button class="btn-secondary text-xs px-3 py-1.5" @click="openEdit(role)">Edit</button>
                <button
                  class="text-xs px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  @click="deleteRole(role.id)"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && !roles.length">
            <td colspan="5" class="px-4 py-10">
              <EmptyState
                :icon="ShieldCheckIcon"
                title="No roles yet"
                subtitle="Create a role to assign to users"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create / Edit dialog -->
    <TransitionRoot :show="dialog" as="template">
      <Dialog class="relative z-50" @close="dialog = false">
        <div class="dialog-overlay" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="card p-6 w-full max-w-lg shadow-dialog max-h-[90vh] flex flex-col">
            <DialogTitle class="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4">
              {{ editing ? 'Edit Role' : 'New Role' }}
            </DialogTitle>

            <div class="space-y-3 flex-1 overflow-y-auto">
              <div>
                <label class="label">Name</label>
                <input
                  v-model="form.name"
                  class="input"
                  :class="{ 'border-red-400 focus:ring-red-400': errors.name }"
                  placeholder="e.g. agent"
                  @input="errors.name = ''"
                />
                <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
              </div>
              <div>
                <label class="label">Code</label>
                <input
                  :value="editing ? editing.code : previewCode"
                  class="input bg-gray-50 dark:bg-slate-700/50 text-gray-400 dark:text-slate-500 font-mono text-xs cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label class="label">Description</label>
                <input
                  v-model="form.description"
                  class="input"
                  placeholder="Optional description"
                />
              </div>
              <div class="flex items-center justify-between py-1">
                <div>
                  <p class="text-sm font-medium text-gray-700 dark:text-slate-300">Default role</p>
                  <p class="text-xs text-gray-400 dark:text-slate-500">Assigned automatically to new users</p>
                </div>
                <button
                  type="button"
                  class="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
                  :class="form.isDefault ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'"
                  @click="form.isDefault = !form.isDefault"
                >
                  <span
                    class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200"
                    :class="form.isDefault ? 'translate-x-4' : 'translate-x-0'"
                  />
                </button>
              </div>
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="label">Permissions</label>
                  <button
                    v-if="permissions.length"
                    type="button"
                    class="text-xs text-blue-500 hover:text-blue-700"
                    @click="toggleAll"
                  >
                    {{ isAllSelected ? 'Deselect all' : 'Select all' }}
                  </button>
                </div>
                <div v-if="!permissions.length" class="text-sm text-gray-400 italic">
                  No permissions available
                </div>
                <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
                  <div v-for="(group, resource) in permissionsByResource" :key="resource">
                    <div class="flex items-center gap-2 mb-1.5">
                      <span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">{{ resource }}</span>
                      <div class="flex-1 h-px bg-gray-100 dark:bg-slate-700" />
                      <button
                        type="button"
                        class="text-xs text-blue-500 hover:text-blue-700"
                        @click="toggleModule(group)"
                      >
                        {{ isModuleAllSelected(group) ? 'Deselect all' : 'Select all' }}
                      </button>
                    </div>
                    <div class="grid grid-cols-2 gap-1.5">
                      <label
                        v-for="p in group"
                        :key="p.id"
                        class="flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors"
                        :class="
                          form.permissionIds.includes(p.id)
                            ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-100 dark:border-slate-600 hover:border-gray-200 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        "
                      >
                        <input
                          v-model="form.permissionIds"
                          type="checkbox"
                          :value="p.id"
                          class="accent-blue-600"
                        >
                        <span class="text-xs font-medium text-gray-700 dark:text-slate-300 truncate">{{ p.action }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button class="btn-secondary" @click="dialog = false">Cancel</button>
              <button class="btn-primary" :disabled="saving" @click="save">
                {{ editing ? 'Save' : 'Create' }}
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
import { PlusIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'
import type { Role, Permission } from '~/types'

definePageMeta({ middleware: 'auth' })

const { $api } = useNuxtApp()
const toast = useToast()
const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])

const permissionsByResource = computed(() =>
  permissions.value.reduce<Record<string, Permission[]>>((acc, p) => {
    ;(acc[p.resource] ??= []).push(p)
    return acc
  }, {}),
)

function isModuleAllSelected(group: Permission[]) {
  return group.every((p) => form.permissionIds.includes(p.id))
}

function toggleModule(group: Permission[]) {
  if (isModuleAllSelected(group)) {
    const ids = group.map((p) => p.id)
    form.permissionIds = form.permissionIds.filter((id) => !ids.includes(id))
  } else {
    const ids = group.map((p) => p.id)
    form.permissionIds = [...new Set([...form.permissionIds, ...ids])]
  }
}
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editing = ref<Role | null>(null)
const form = reactive({ name: '', description: '', isDefault: false, permissionIds: [] as string[] })
const errors = reactive({ name: '' })

const previewCode = computed(() =>
  form.name.trim().replace(/[^a-z0-9]+/gi, '_').toUpperCase(),
)

const isAllSelected = computed(
  () => permissions.value.length > 0 && permissions.value.every((p) => form.permissionIds.includes(p.id)),
)

function toggleAll() {
  if (isAllSelected.value) {
    form.permissionIds = []
  } else {
    form.permissionIds = permissions.value.map((p) => p.id)
  }
}

async function load() {
  loading.value = true
  const [rolesRes, permsRes] = await Promise.all([$api.get('/roles'), $api.get('/permissions')])
  roles.value = rolesRes.data.data ?? []
  permissions.value = permsRes.data.data ?? []
  loading.value = false
}
onMounted(load)

function openCreate() {
  editing.value = null
  form.name = ''
  form.description = ''
  form.isDefault = false
  form.permissionIds = []
  errors.name = ''
  dialog.value = true
}

function openEdit(role: Role) {
  editing.value = role
  form.name = role.name
  form.description = role.description ?? ''
  form.isDefault = role.isDefault
  form.permissionIds = role.permissions?.map((p) => p.id) ?? []
  errors.name = ''
  dialog.value = true
}

async function save() {
  errors.name = ''
  if (!form.name.trim()) {
    errors.name = 'Name is required'
    return
  }
  saving.value = true
  const payload = {
    name: form.name,
    description: form.description || undefined,
    isDefault: form.isDefault,
    permissionIds: form.permissionIds,
  }
  try {
    if (editing.value) {
      await $api.patch(`/roles/${editing.value.id}`, payload)
      toast.success('Role updated successfully')
    } else {
      await $api.post('/roles', payload)
      toast.success('Role created successfully')
    }
    await load()
    dialog.value = false
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    if (msg?.toLowerCase().includes('name')) {
      errors.name = msg
    } else {
      toast.error(msg ?? 'Something went wrong')
    }
  } finally {
    saving.value = false
  }
}

async function deleteRole(id: string) {
  try {
    await $api.delete(`/roles/${id}`)
    await load()
    toast.success('Role deleted')
  } catch {
    toast.error('Failed to delete role')
  }
}
</script>
