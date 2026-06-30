<template>
  <div class="flex flex-col h-full">
    <!-- Search -->
    <div class="px-3 py-2.5 border-b border-gray-100 dark:border-slate-700">
      <div class="relative">
        <MagnifyingGlassIcon
          class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-500 pointer-events-none"
        />
        <input
          v-model="search"
          type="text"
          placeholder="Search conversations…"
          class="input pl-8 text-sm py-1.5 bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-800"
          @input="emit('search', search)"
        />
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <button
        v-for="conv in conversations"
        :key="conv.id"
        class="w-full flex items-start gap-3 px-4 py-3.5 transition-colors text-left relative group"
        :class="activeId === conv.id ? 'bg-blue-50/80 dark:bg-blue-900/20' : 'hover:bg-gray-50/80 dark:hover:bg-slate-800/50'"
        @click="emit('select', conv.id)"
      >
        <!-- Active indicator bar -->
        <span
          class="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full transition-all duration-150"
          :class="activeId === conv.id ? 'bg-blue-500' : 'bg-transparent'"
        />

        <!-- Avatar -->
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm mt-0.5"
          :class="platformColor(conv.platform)"
        >
          {{ (conv.contactName || conv.contactId || '?').charAt(0).toUpperCase() }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1 mb-1">
            <span
              class="text-sm font-semibold truncate"
              :class="activeId === conv.id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-slate-100'"
            >
              {{ conv.contactName || conv.contactId || 'Unknown' }}
            </span>
            <span class="text-[11px] text-gray-400 dark:text-slate-500 flex-shrink-0 tabular-nums">{{
              timeAgo(conv.updatedAt)
            }}</span>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <PlatformBadge :platform="conv.platform" />
            <StatusBadge :status="conv.status" />
            <span
              v-if="conv.handoverMode"
              class="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800"
            >
              <CpuChipIcon class="w-2.5 h-2.5" /> Agent
            </span>
            <span
              v-if="conv.priority && conv.priority !== 'normal'"
              class="text-[10px] font-medium px-1.5 py-0.5 rounded-full border"
              :class="{
                'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800': conv.priority === 'urgent',
                'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800': conv.priority === 'high',
                'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400 border-gray-100 dark:border-slate-600': conv.priority === 'low',
              }"
            >
              {{ conv.priority }}
            </span>
          </div>
        </div>
      </button>

      <div v-if="!conversations.length && !loading" class="pt-4">
        <EmptyState
          :icon="InboxIcon"
          :title="search ? 'No results found' : 'No conversations yet'"
          :subtitle="search ? 'Try a different search term' : 'Conversations will appear here'"
        />
      </div>

      <div v-if="loading" class="flex flex-col gap-2 p-3">
        <div v-for="i in 5" :key="i" class="flex items-start gap-3 p-2 animate-pulse">
          <div class="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-700 flex-shrink-0" />
          <div class="flex-1 space-y-2 pt-0.5">
            <div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-3/4" />
            <div class="h-2.5 bg-gray-100 dark:bg-slate-700 rounded w-1/2" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { InboxIcon, MagnifyingGlassIcon, CpuChipIcon } from '@heroicons/vue/24/outline'
import type { Conversation } from '~/types'
import { platformColor, timeAgo } from '~/utils'

defineProps<{ conversations: Conversation[]; activeId?: string | null; loading?: boolean }>()
const emit = defineEmits<{ select: [id: string]; search: [query: string] }>()

const search = ref('')
</script>
