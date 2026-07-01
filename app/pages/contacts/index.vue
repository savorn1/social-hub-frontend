<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-slate-100">Contacts</h1>
        <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">View and search your customer contacts</p>
      </div>
    </div>

    <!-- Search -->
    <div class="mb-5">
      <div class="relative max-w-xs">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
        <input
          v-model="search"
          class="input pl-9"
          placeholder="Search by name or ID…"
          @input="onSearch"
        />
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="card overflow-hidden">
      <div
        v-for="i in 6"
        :key="i"
        class="flex items-center gap-4 px-4 py-3.5 border-b border-gray-50 dark:border-slate-700/50 last:border-0 animate-pulse"
      >
        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex-shrink-0" />
        <div class="flex-1 space-y-1.5">
          <div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-32" />
          <div class="h-2.5 bg-gray-100 dark:bg-slate-700 rounded w-24" />
        </div>
        <div class="h-5 bg-gray-100 dark:bg-slate-700 rounded-full w-16" />
        <div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-20" />
      </div>
    </div>

    <div v-else-if="contacts.length === 0" class="card p-10 text-center">
      <div class="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-700/60 flex items-center justify-center mx-auto mb-3">
        <UserGroupIcon class="w-6 h-6 text-gray-300 dark:text-slate-500" />
      </div>
      <p class="text-sm font-semibold text-gray-600 dark:text-slate-300">No contacts found</p>
      <p class="text-xs text-gray-400 dark:text-slate-500 mt-1">Contacts appear when customers message you</p>
    </div>

    <div v-else class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50/80 dark:bg-slate-700/40 border-b border-gray-100 dark:border-slate-700">
          <tr>
            <th class="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
              Contact
            </th>
            <th class="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
              Platform
            </th>
            <th class="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
              Conversations
            </th>
            <th class="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
              Last Activity
            </th>
            <th class="px-4 py-3.5" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50 dark:divide-slate-700/50">
          <tr
            v-for="c in filteredContacts"
            :key="`${c.contactId}-${c.platform}`"
            class="hover:bg-gray-50/60 dark:hover:bg-slate-700/30 transition-colors group"
          >
            <td class="px-4 py-3.5">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-semibold text-sm flex-shrink-0 shadow-sm"
                >
                  {{ (c.contactName || c.contactId || '?').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="font-semibold text-gray-900 dark:text-slate-100 leading-tight">{{ c.contactName || '—' }}</div>
                  <div class="text-xs text-gray-400 dark:text-slate-500 font-mono mt-0.5">{{ c.contactId }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3.5">
              <span
                class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                :class="platformClass(c.platform)"
              >
                {{ c.platform }}
              </span>
            </td>
            <td class="px-4 py-3.5">
              <span class="text-sm font-semibold text-gray-700 dark:text-slate-300">{{ c.conversationCount }}</span>
            </td>
            <td class="px-4 py-3.5 text-sm text-gray-500 dark:text-slate-400">{{ formatDate(c.lastActivity) }}</td>
            <td class="px-4 py-3.5 text-right">
              <NuxtLink
                :to="`/inbox?contactId=${c.contactId}`"
                class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-all"
              >
                View →
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center gap-1.5 mt-6">
      <button
        v-for="p in totalPages"
        :key="p"
        class="w-8 h-8 rounded-xl text-sm font-medium transition-all"
        :class="
          p === page
            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-btn-blue'
            : 'border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
        "
        @click="goTo(p)"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
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
    facebook: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    telegram: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
    whatsapp: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    instagram: 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
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
