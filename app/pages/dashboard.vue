<template>
  <div class="p-6 space-y-6">
    <!-- Welcome banner -->
    <div
      class="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 shadow-lg shadow-blue-200/50 flex items-center justify-between gap-4"
    >
      <div>
        <p class="text-blue-200 text-sm font-medium">
          {{ greeting }}, {{ user?.firstName || 'there' }} 👋
        </p>
        <h1 class="text-2xl font-bold text-white mt-1">Here's what's happening</h1>
        <p class="text-blue-300 text-sm mt-1">{{ currentDate }}</p>
      </div>
      <div class="hidden sm:flex items-center gap-4 flex-shrink-0">
        <div class="text-right">
          <p class="text-blue-200 text-xs mb-0.5">Resolution rate</p>
          <p class="text-white text-2xl font-bold tabular-nums">
            {{ responseRate
            }}<span v-if="responseRate !== '—'" class="text-lg text-blue-300">%</span>
          </p>
        </div>
        <div class="w-px h-10 bg-blue-500/60" />
        <div class="text-right">
          <p class="text-blue-200 text-xs mb-0.5">Platforms</p>
          <p class="text-white text-2xl font-bold tabular-nums">{{ store.byPlatform.length }}</p>
        </div>
      </div>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <template v-if="store.loading">
        <div v-for="i in 4" :key="i" class="card p-5 animate-pulse">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <div class="h-3 w-20 bg-gray-100 rounded mb-3" />
              <div class="h-8 w-14 bg-gray-100 rounded" />
            </div>
            <div class="h-12 w-12 rounded-2xl bg-gray-100 flex-shrink-0" />
          </div>
        </div>
      </template>
      <template v-else-if="store.stats">
        <StatsCard
          :icon="ChatBubbleLeftRightIcon"
          label="Total"
          :value="store.stats.totalConversations"
          bg="bg-blue-50"
          icon-color="text-blue-600"
        />
        <StatsCard
          :icon="ChatBubbleOvalLeftEllipsisIcon"
          label="Open"
          :value="store.stats.openConversations"
          bg="bg-emerald-50"
          icon-color="text-emerald-600"
        />
        <StatsCard
          :icon="CheckCircleIcon"
          label="Resolved"
          :value="store.stats.resolvedConversations"
          bg="bg-violet-50"
          icon-color="text-violet-600"
        />
        <StatsCard
          :icon="UsersIcon"
          label="Agents"
          :value="store.stats.totalAgents"
          bg="bg-amber-50"
          icon-color="text-amber-600"
        />
      </template>
    </div>

    <!-- Charts + activity row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Status donut chart -->
      <div class="card p-5">
        <h2 class="text-sm font-semibold text-gray-800 mb-5">Conversation Status</h2>
        <template v-if="store.loading">
          <div class="flex justify-center">
            <div class="w-44 h-44 rounded-full bg-gray-100 animate-pulse" />
          </div>
        </template>
        <template v-else-if="store.stats">
          <UiDonutChart :segments="donutSegments" :size="180" :stroke-width="26" />
        </template>
        <EmptyState v-else :icon="ChartPieIcon" title="No data yet" />
      </div>

      <!-- Platform bar chart -->
      <div class="card p-5">
        <h2 class="text-sm font-semibold text-gray-800 mb-5">By Platform</h2>
        <template v-if="store.loading">
          <div class="flex items-end gap-3 h-36 px-2">
            <div
              v-for="i in 4"
              :key="i"
              class="flex-1 bg-gray-100 animate-pulse rounded-t"
              :style="{ height: `${30 + i * 18}%` }"
            />
          </div>
        </template>
        <template v-else-if="store.byPlatform.length">
          <UiBarChart :bars="barData" :height="160" />
        </template>
        <EmptyState v-else :icon="ChartBarIcon" title="No platform data" />
      </div>

      <!-- Recent activity -->
      <div class="card flex flex-col overflow-hidden">
        <div
          class="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0"
        >
          <h2 class="text-sm font-semibold text-gray-800">Recent Activity</h2>
          <NuxtLink
            to="/inbox"
            class="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View all →
          </NuxtLink>
        </div>
        <div class="flex-1 overflow-y-auto divide-y divide-gray-50">
          <NuxtLink
            v-for="conv in store.recentActivity"
            :key="conv.id"
            :to="`/inbox?id=${conv.id}`"
            class="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
              :class="platformColor(conv.platform)"
            >
              {{ (conv.contactName || conv.contactId || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors"
              >
                {{ conv.contactName || conv.contactId || 'Unknown' }}
              </p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <PlatformBadge :platform="conv.platform" />
                <StatusBadge :status="conv.status" />
              </div>
            </div>
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <span class="text-xs text-gray-400">{{ timeAgo(conv.updatedAt) }}</span>
              <ChevronRightIcon
                class="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-colors"
              />
            </div>
          </NuxtLink>
          <EmptyState
            v-if="!store.recentActivity.length && !store.loading"
            :icon="ClockIcon"
            title="No recent activity"
            subtitle="Conversations will appear here"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CheckCircleIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  ChevronRightIcon,
  ChartPieIcon,
} from '@heroicons/vue/24/outline'
import { platformColor, platformLabel, timeAgo } from '~/utils'

definePageMeta({ middleware: 'auth' })

const store = useDashboardStore()
const { user } = useAuth()

onMounted(() => store.fetchAll())

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})

const currentDate = computed(() =>
  new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(
    new Date()
  )
)

const responseRate = computed(() => {
  const s = store.stats
  if (!s || !s.totalConversations) return '—'
  return Math.round((s.resolvedConversations / s.totalConversations) * 100)
})

const donutSegments = computed(() => {
  const s = store.stats
  if (!s) return []
  const pending = Math.max(0, s.totalConversations - s.openConversations - s.resolvedConversations)
  return [
    { label: 'Open', value: s.openConversations, color: '#10b981' },
    { label: 'Resolved', value: s.resolvedConversations, color: '#8b5cf6' },
    { label: 'Pending', value: pending, color: '#f59e0b' },
  ]
})

const platformColorHex: Record<string, string> = {
  facebook: '#2563eb',
  telegram: '#0ea5e9',
  instagram: '#db2777',
  whatsapp: '#22c55e',
  web: '#64748b',
}

const barData = computed(() =>
  store.byPlatform.map((p) => ({
    label: platformLabel(p.platform),
    value: +p.count,
    color: platformColorHex[p.platform] ?? '#94a3b8',
  }))
)
</script>
