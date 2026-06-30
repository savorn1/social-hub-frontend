<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Roles</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage roles and their permissions</p>
      </div>
      <button class="btn-primary" @click="openCreate"><PlusIcon class="w-4 h-4" /> New Role</button>
    </div>

    <div class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-gray-500 w-32">Code</th>
            <th class="text-left px-4 py-3 font-medium text-gray-500">Name</th>
            <th class="text-left px-4 py-3 font-medium text-gray-500">Description</th>
            <th class="text-center px-4 py-3 font-medium text-gray-500 w-24">Default</th>
            <th class="px-4 py-3 w-24" />
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr v-for="i in 4" :key="i" class="border-b border-gray-50 last:border-0">
              <td class="px-4 py-3"><div class="h-3 bg-gray-100 rounded w-20 animate-pulse" /></td>
              <td class="px-4 py-3"><div class="h-3 bg-gray-100 rounded w-28 animate-pulse" /></td>
              <td class="px-4 py-3"><div class="h-3 bg-gray-100 rounded w-48 animate-pulse" /></td>
              <td class="px-4 py-3"><div class="h-3 bg-gray-100 rounded w-8 mx-auto animate-pulse" /></td>
              <td class="px-4 py-3" />
            </tr>
          </template>
          <tr
            v-for="role in roles"
            :key="role.id"
            class="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ role.code }}</td>
            <td class="px-4 py-3 font-medium text-gray-900">{{ role.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ role.description ?? '—' }}</td>
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
          <DialogPanel class="card p-6 w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
            <DialogTitle class="text-base font-semibold text-gray-900 mb-4">
              {{ editing ? 'Edit Role' : 'New Role' }}
            </DialogTitle>

            <div class="space-y-3 flex-1 overflow-y-auto">
              <div>
                <label class="label">Name</label>
                <input v-model="form.name" class="input" placeholder="e.g. agent" />
              </div>
              <div>
                <label class="label">Description</label>
                <input
                  v-model="form.description"
                  class="input"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label class="label mb-2 block">Permissions</label>
                <div v-if="!permissions.length" class="text-sm text-gray-400 italic">
                  No permissions available
                </div>
                <div class="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1">
                  <label
                    v-for="p in permissions"
                    :key="p.id"
                    class="flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors"
                    :class="
                      form.permissionIds.includes(p.id)
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    "
                  >
                    <input
                      type="checkbox"
                      :value="p.id"
                      v-model="form.permissionIds"
                      class="accent-blue-600"
                    />
                    <span class="text-xs font-medium text-gray-700 truncate">{{ p.name }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
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
const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editing = ref<Role | null>(null)
const form = reactive({ name: '', description: '', permissionIds: [] as string[] })

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
  form.permissionIds = []
  dialog.value = true
}

function openEdit(role: Role) {
  editing.value = role
  form.name = role.name
  form.description = role.description ?? ''
  form.permissionIds = role.permissions?.map((p) => p.id) ?? []
  dialog.value = true
}

async function save() {
  saving.value = true
  const payload = {
    name: form.name,
    description: form.description || undefined,
    permissionIds: form.permissionIds,
  }
  if (editing.value) {
    await $api.patch(`/roles/${editing.value.id}`, payload)
  } else {
    await $api.post('/roles', payload)
  }
  await load()
  dialog.value = false
  saving.value = false
}

async function deleteRole(id: string) {
  await $api.delete(`/roles/${id}`)
  await load()
}
</script>
