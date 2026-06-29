<template>
  <div class="flex flex-col h-full">
    <!-- Search -->
    <div class="px-3 py-2.5 border-b border-gray-100">
      <div class="relative">
        <MagnifyingGlassIcon
          class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
        />
        <input
          v-model="search"
          type="text"
          placeholder="Search conversations…"
          class="input pl-8 text-sm py-1.5"
          @input="emit('search', search)"
        />
      </div>
    </div>

    <div class="flex-1 overflow-y-auto divide-y divide-gray-50">
      <button
        v-for="conv in conversations"
        :key="conv.id"
        class="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
        :class="
          activeId === conv.id
            ? 'bg-blue-50 border-l-2 border-blue-500'
            : 'border-l-2 border-transparent'
        "
        @click="emit('select', conv.id)"
      >
        <!-- Avatar -->
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ring-2 ring-white shadow-sm"
          :class="platformColor(conv.platform)"
        >
          {{ (conv.contactName || conv.contactId || '?').charAt(0).toUpperCase() }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1">
            <span class="text-sm font-medium text-gray-900 truncate">
              {{ conv.contactName || conv.contactId || 'Unknown' }}
            </span>
            <span class="text-[11px] text-gray-400 flex-shrink-0">{{
              timeAgo(conv.updatedAt)
            }}</span>
          </div>
          <div class="flex items-center gap-1.5 mt-1">
            <PlatformBadge :platform="conv.platform" />
            <StatusBadge :status="conv.status" />
            <span
              v-if="conv.handoverMode"
              class="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700"
            >
              <CpuChipIcon class="w-2.5 h-2.5" /> Human
            </span>
          </div>
        </div>
      </button>

      <div v-if="!conversations.length && !loading">
        <EmptyState :icon="InboxIcon" :title="search ? 'No results' : 'No conversations'" />
      </div>

      <div v-if="loading" class="flex justify-center py-6">
        <svg class="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
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
