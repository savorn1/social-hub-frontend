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
  open: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  resolved: 'bg-violet-50 text-violet-700',
  closed: 'bg-gray-100 text-gray-500',
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
