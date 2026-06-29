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
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-gray-600">User</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Roles</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading">
            <td colspan="4" class="px-4 py-8 text-center text-gray-400">Loading…</td>
          </tr>
          <tr v-for="u in users" :key="u.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"
                >
                  <span class="text-xs font-semibold text-blue-700">{{
                    initials(u.firstName + ' ' + u.lastName)
                  }}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ u.firstName }} {{ u.lastName }}</p>
                  <p class="text-xs text-gray-400">{{ u.email }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <span v-for="r in u.roles" :key="r.id" class="badge bg-gray-100 text-gray-700">{{
                  r.name
                }}</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <span
                :class="
                  u.status === 'active'
                    ? 'badge bg-green-100 text-green-700'
                    : 'badge bg-gray-100 text-gray-500'
                "
              >
                {{ u.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <button class="text-xs text-red-500 hover:text-red-700" @click="removeUser(u.id)">
                Remove
              </button>
            </td>
          </tr>
          <tr v-if="!users.length && !loading">
            <td colspan="4">
              <EmptyState :icon="UsersIcon" title="No users yet" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Invite dialog -->
    <TransitionRoot :show="dialog" as="template">
      <Dialog class="relative z-50" @close="dialog = false">
        <div class="fixed inset-0 bg-black/40" />
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
import type { User } from '~/types'
import { initials } from '~/utils'

definePageMeta({ middleware: 'auth' })

const { $api } = useNuxtApp()
const users = ref<User[]>([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const form = reactive({ firstName: '', lastName: '', email: '', password: '' })

async function load() {
  loading.value = true
  const { data } = await $api.get('/users', { params: { limit: 100 } })
  users.value = data.data?.data ?? []
  loading.value = false
}
onMounted(load)

async function invite() {
  saving.value = true
  await $api.post('/users', form)
  await load()
  dialog.value = false
  saving.value = false
}
async function removeUser(id: string) {
  await $api.delete(`/users/${id}`)
  await load()
}
</script>
