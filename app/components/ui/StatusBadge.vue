<template>
  <span class="inline-flex items-center gap-1 badge" :class="styles[status] ?? styles.closed">
    <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="dots[status] ?? dots.closed" />
    {{ labels[status] ?? status }}
  </span>
</template>

<script setup lang="ts">
import type { ConversationStatus } from '~/types'

defineProps<{ status: ConversationStatus }>()

const styles: Record<string, string> = {
  open: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  pending: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  resolved: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  closed: 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400',
}

const dots: Record<string, string> = {
  open: 'bg-emerald-500',
  pending: 'bg-amber-400',
  resolved: 'bg-violet-500',
  closed: 'bg-gray-400',
}

const labels: Record<string, string> = {
  open: 'Open',
  pending: 'Pending',
  resolved: 'Resolved',
  closed: 'Closed',
}
</script>
