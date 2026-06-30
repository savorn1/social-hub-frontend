<template>
  <div class="p-6">
    <h1 class="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">Contacts</h1>

    <div class="mb-4">
      <input
        v-model="search"
        class="input max-w-xs"
        placeholder="Search by name or ID…"
        @input="onSearch"
      />
    </div>

    <div v-if="loading" class="text-sm text-gray-400 dark:text-slate-500">Loading…</div>

    <div v-else-if="contacts.length === 0" class="card p-10 text-center text-gray-400 dark:text-slate-500 text-sm">
      No contacts found.
    </div>

    <div v-else class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
          <tr>
            <th
              class="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide"
            >
              Contact
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide"
            >
              Platform
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide"
            >
              Conversations
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide"
            >
              Last Activity
            </th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
          <tr
            v-for="c in filteredContacts"
            :key="`${c.contactId}-${c.platform}`"
            class="hover:bg-gray-50 dark:hover:bg-slate-700/50"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-medium text-sm"
                >
                  {{ (c.contactName || c.contactId || '?').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-slate-100">{{ c.contactName || '—' }}</div>
                  <div class="text-xs text-gray-400 dark:text-slate-500">{{ c.contactId }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                :class="platformClass(c.platform)"
              >
                {{ c.platform }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-700 dark:text-slate-300">{{ c.conversationCount }}</td>
            <td class="px-4 py-3 text-gray-500 dark:text-slate-400">{{ formatDate(c.lastActivity) }}</td>
            <td class="px-4 py-3 text-right">
              <NuxtLink
                :to="`/inbox?contactId=${c.contactId}`"
                class="text-xs text-blue-600 hover:underline"
              >
                View
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-6">
      <button
        v-for="p in totalPages"
        :key="p"
        class="px-3 py-1 rounded text-sm border"
        :class="
          p === page
            ? 'bg-blue-600 text-white border-blue-600'
            : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
        "
        @click="goTo(p)"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Contact } from '~/types'

definePageMeta({ middleware: 'auth' })

const { $api } = useNuxtApp()

const contacts = ref<Contact[]>([])
const loading = ref(true)
const search = ref('')
const page = ref(1)
const totalPages = ref(1)

const filteredContacts = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return contacts.value
  return contacts.value.filter(
    (c) => c.contactName?.toLowerCase().includes(q) || c.contactId?.toLowerCase().includes(q)
  )
})

onMounted(() => load())

async function load() {
  loading.value = true
  const res = await $api.get('/conversations/contacts', { params: { page: page.value, limit: 25 } })
  contacts.value = res.data ?? res
  totalPages.value = res.meta?.totalPages ?? 1
  loading.value = false
}

function onSearch() {
  page.value = 1
}

async function goTo(p: number) {
  page.value = p
  await load()
}

function platformClass(platform: string) {
  const map: Record<string, string> = {
    facebook: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    telegram: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
    whatsapp: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    instagram: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
    web: 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300',
  }
  return map[platform] ?? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>
