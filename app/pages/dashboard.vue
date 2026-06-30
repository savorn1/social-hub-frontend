<template>
  <div class="p-6 space-y-5">
    <!-- Page header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-slate-100">Dashboard</h1>
        <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
          {{ greeting }}, <span class="font-medium text-gray-700 dark:text-slate-300">{{ user?.firstName || 'there' }}</span> —
          {{ currentDate }}
        </p>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <button
          class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 rounded-lg px-3 py-2 transition-colors shadow-sm dark:shadow-none"
          @click="store.fetchAll()"
        >
          <ArrowPathIcon class="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <template v-if="store.loading">
        <div v-for="i in 4" :key="i" class="card p-5 animate-pulse">
          <div class="h-3 w-16 bg-gray-100 dark:bg-slate-700 rounded mb-3" />
          <div class="h-9 w-12 bg-gray-100 dark:bg-slate-700 rounded mb-3" />
          <div class="h-2.5 w-20 bg-gray-100 dark:bg-slate-700 rounded" />
        </div>
      </template>
      <template v-else-if="store.stats">
        <div
          v-for="stat in statCards"
          :key="stat.label"
          class="card p-5 group hover:shadow-md hover:shadow-gray-100/80 transition-all duration-150 relative overflow-hidden"
        >
          <div
            class="absolute inset-x-0 top-0 h-0.5 rounded-t-xl"
            :class="stat.bar"
          />
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">
            {{ stat.label }}
          </p>
          <p class="text-3xl font-bold tabular-nums leading-none" :class="stat.valueColor">
            {{ Number(stat.value).toLocaleString() }}
          </p>
          <div class="flex items-center gap-2 mt-3">
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center"
              :class="stat.iconBg"
            >
              <component :is="stat.icon" class="w-3.5 h-3.5" :class="stat.iconColor" />
            </div>
            <span class="text-xs text-gray-400 dark:text-slate-500">{{ stat.sub }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <NuxtLink
        to="/inbox"
        class="group card p-4 flex items-center gap-4 hover:shadow-md hover:shadow-blue-50 hover:border-blue-100 transition-all duration-150"
      >
        <div
          class="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <InboxIcon class="w-5 h-5 text-blue-600" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-900 dark:text-slate-100">Open Inbox</p>
          <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">View all conversations</p>
        </div>
        <ChevronRightIcon class="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-blue-400 ml-auto flex-shrink-0 transition-colors" />
      </NuxtLink>

      <NuxtLink
        to="/contacts"
        class="group card p-4 flex items-center gap-4 hover:shadow-md hover:shadow-emerald-50 dark:hover:shadow-none hover:border-emerald-100 dark:hover:border-emerald-800 transition-all duration-150"
      >
        <div
          class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <UserGroupIcon class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-900 dark:text-slate-100">Contacts</p>
          <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Browse all contacts</p>
        </div>
        <ChevronRightIcon class="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-emerald-400 ml-auto flex-shrink-0 transition-colors" />
      </NuxtLink>

      <NuxtLink
        to="/chatbot"
        class="group card p-4 flex items-center gap-4 hover:shadow-md hover:shadow-violet-50 dark:hover:shadow-none hover:border-violet-100 dark:hover:border-violet-800 transition-all duration-150"
      >
        <div
          class="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <BoltIcon class="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-900 dark:text-slate-100">Chatbots</p>
          <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Manage AI automation</p>
        </div>
        <ChevronRightIcon class="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-violet-400 ml-auto flex-shrink-0 transition-colors" />
      </NuxtLink>
    </div>

    <!-- Charts + activity row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Status donut -->
      <div class="card p-5 flex flex-col">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-sm font-semibold text-gray-800 dark:text-slate-200">Conversation Status</h2>
            <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Current breakdown</p>
          </div>
          <span
            v-if="store.stats"
            class="text-xs font-semibold text-gray-900 dark:text-slate-100 bg-gray-100 dark:bg-slate-700 rounded-lg px-2.5 py-1"
          >
            {{ store.stats.totalConversations }} total
          </span>
        </div>
        <div class="flex-1 flex flex-col items-center justify-center">
          <template v-if="store.loading">
            <div class="w-44 h-44 rounded-full bg-gray-100 dark:bg-slate-700 animate-pulse" />
          </template>
          <template v-else-if="store.stats">
            <UiDonutChart :segments="donutSegments" :size="180" :stroke-width="26" />
            <div class="flex items-center justify-center gap-4 mt-4">
              <div v-for="s in donutSegments" :key="s.label" class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: s.color }" />
                <span class="text-xs text-gray-500 dark:text-slate-400">{{ s.label }}</span>
                <span class="text-xs font-semibold text-gray-700 dark:text-slate-200">{{ s.value }}</span>
              </div>
            </div>
          </template>
          <EmptyState v-else :icon="ChartPieIcon" title="No data yet" />
        </div>
      </div>

      <!-- Platform bar chart -->
      <div class="card p-5 flex flex-col">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-sm font-semibold text-gray-800 dark:text-slate-200">By Platform</h2>
            <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Conversations per channel</p>
          </div>
        </div>
        <div class="flex-1 flex flex-col justify-center">
          <template v-if="store.loading">
            <div class="flex items-end gap-3 h-36 px-2">
              <div
                v-for="i in 4"
                :key="i"
                class="flex-1 bg-gray-100 dark:bg-slate-700 animate-pulse rounded-t"
                :style="{ height: `${30 + i * 18}%` }"
              />
            </div>
          </template>
          <template v-else-if="store.byPlatform.length">
            <UiBarChart :bars="barData" :height="160" />
          </template>
          <EmptyState v-else :icon="ChartBarIcon" title="No platform data" />
        </div>
      </div>

      <!-- Recent activity -->
      <div class="card flex flex-col overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 class="text-sm font-semibold text-gray-800 dark:text-slate-200">Recent Activity</h2>
            <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Latest conversations</p>
          </div>
          <NuxtLink
            to="/inbox"
            class="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View all →
          </NuxtLink>
        </div>
        <div class="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-700/50">
          <NuxtLink
            v-for="conv in store.recentActivity"
            :key="conv.id"
            :to="`/inbox?id=${conv.id}`"
            class="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
              :class="platformColor(conv.platform)"
            >
              {{ (conv.contactName || conv.contactId || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium text-gray-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              >
                {{ conv.contactName || conv.contactId || 'Unknown' }}
              </p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <PlatformBadge :platform="conv.platform" />
                <StatusBadge :status="conv.status" />
              </div>
            </div>
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <span class="text-xs text-gray-400 dark:text-slate-500">{{ timeAgo(conv.updatedAt) }}</span>
              <ChevronRightIcon
                class="w-3.5 h-3.5 text-gray-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors"
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
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  ChevronRightIcon,
  ChartPieIcon,
  ArrowPathIcon,
  InboxIcon,
  BoltIcon,
} from '@heroicons/vue/24/outline'
import type { Component } from 'vue'
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

const statCards = computed<
  {
    label: string
    value: number
    sub: string
    icon: Component
    iconBg: string
    iconColor: string
    valueColor: string
    bar: string
  }[]
>(() => {
  const s = store.stats
  if (!s) return []
  return [
    {
      label: 'Total',
      value: s.totalConversations,
      sub: 'All conversations',
      icon: ChatBubbleLeftRightIcon,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-gray-900 dark:text-slate-100',
      bar: 'bg-blue-500',
    },
    {
      label: 'Open',
      value: s.openConversations,
      sub: 'Awaiting reply',
      icon: ChatBubbleOvalLeftEllipsisIcon,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
      bar: 'bg-emerald-500',
    },
    {
      label: 'Resolved',
      value: s.resolvedConversations,
      sub: 'Closed conversations',
      icon: CheckCircleIcon,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      valueColor: 'text-violet-700',
      bar: 'bg-violet-500',
    },
    {
      label: 'Agents',
      value: s.totalAgents,
      sub: 'Active team members',
      icon: UsersIcon,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
      bar: 'bg-amber-500',
    },
  ]
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
