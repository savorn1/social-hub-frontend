<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Users</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage team members and agents</p>
      </div>
      <button class="btn-primary" @click="dialog = true">
        <PlusIcon class="w-4 h-4" /> Invite User
      </button>
    </div>

    <div class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50/80 border-b border-gray-100">
          <tr>
            <th
              class="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide"
            >
              User
            </th>
            <th
              class="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide"
            >
              Roles
            </th>
            <th
              class="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide"
            >
              Status
            </th>
            <th class="px-5 py-3.5" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="loading">
            <td colspan="4">
              <div class="flex flex-col gap-0">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="flex items-center gap-4 px-5 py-4 animate-pulse border-b border-gray-50"
                >
                  <div class="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0" />
                  <div class="flex-1 space-y-1.5">
                    <div class="h-3 bg-gray-100 rounded w-32" />
                    <div class="h-2.5 bg-gray-100 rounded w-44" />
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <tr v-for="u in users" :key="u.id" class="hover:bg-gray-50/60 transition-colors group">
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 shadow-sm"
                >
                  <span class="text-xs font-bold text-blue-700">{{
                    initials(u.firstName + ' ' + u.lastName)
                  }}</span>
                </div>
                <div>
                  <p class="font-semibold text-gray-900 leading-tight">
                    {{ u.firstName }} {{ u.lastName }}
                  </p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ u.email }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3.5">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="r in u.roles"
                  :key="r.id"
                  class="badge bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >{{ r.name }}</span
                >
              </div>
            </td>
            <td class="px-5 py-3.5">
              <span
                class="inline-flex items-center gap-1 badge"
                :class="
                  u.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
                "
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="u.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'"
                />
                {{ u.status === 'active' ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-right">
              <button
                class="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all px-2.5 py-1 rounded-lg hover:bg-red-50"
                @click="removeUser(u.id)"
              >
                Remove
              </button>
            </td>
          </tr>
          <tr v-if="!users.length && !loading">
            <td colspan="4">
              <EmptyState
                :icon="UsersIcon"
                title="No users yet"
                subtitle="Invite a team member to get started"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Invite dialog -->
    <TransitionRoot :show="dialog" as="template">
      <Dialog class="relative z-50" @close="dialog = false">
        <div class="dialog-overlay" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="card p-6 w-full max-w-md shadow-xl">
            <DialogTitle class="text-base font-semibold text-gray-900 mb-4"
              >Invite User</DialogTitle
            >
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">First Name</label
                  ><input v-model="form.firstName" class="input" />
                </div>
                <div>
                  <label class="label">Last Name</label
                  ><input v-model="form.lastName" class="input" />
                </div>
              </div>
              <div>
                <label class="label">Email</label
                ><input v-model="form.email" class="input" type="email" />
              </div>
              <div>
                <label class="label">Password</label
                ><input v-model="form.password" class="input" type="password" />
              </div>
              <div>
                <label class="label mb-1.5 block">Roles</label>
                <div class="flex flex-wrap gap-1.5">
                  <label
                    v-for="r in availableRoles"
                    :key="r.id"
                    class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer text-xs font-medium transition-colors"
                    :class="
                      form.roleIds.includes(r.id)
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-gray-100 hover:border-gray-200 text-gray-600'
                    "
                  >
                    <input
                      type="checkbox"
                      :value="r.id"
                      v-model="form.roleIds"
                      class="accent-indigo-600"
                    />
                    {{ r.name }}
                  </label>
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button class="btn-secondary" @click="dialog = false">Cancel</button>
              <button class="btn-primary" :disabled="saving" @click="invite">Invite</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot } from '@headlessui/vue'
import { PlusIcon, UsersIcon } from '@heroicons/vue/24/outline'
import type { User, Role } from '~/types'
import { initials } from '~/utils'

definePageMeta({ middleware: 'auth' })

const { $api } = useNuxtApp()
const users = ref<User[]>([])
const availableRoles = ref<Role[]>([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  roleIds: [] as string[],
})

async function load() {
  loading.value = true
  const [usersRes, rolesRes] = await Promise.all([
    $api.get('/users', { params: { limit: 100 } }),
    $api.get('/roles'),
  ])
  users.value = usersRes.data.data?.data ?? []
  availableRoles.value = rolesRes.data.data ?? []
  loading.value = false
}
onMounted(load)

async function invite() {
  saving.value = true
  const { data } = await $api.post('/users', {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    password: form.password,
  })
  const newUser = data.data
  if (form.roleIds.length && newUser?.id) {
    await $api.put(`/users/${newUser.id}/roles`, { roleIds: form.roleIds })
  }
  await load()
  dialog.value = false
  form.roleIds = []
  saving.value = false
}

async function removeUser(id: string) {
  await $api.delete(`/users/${id}`)
  await load()
}
</script>
