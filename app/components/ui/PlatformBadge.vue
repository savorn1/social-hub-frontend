<template>
  <span class="inline-flex items-center gap-1 badge" :class="styles[platform] ?? styles.web">
    <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="dots[platform] ?? 'bg-gray-400'" />
    {{ platformLabel(platform) }}
  </span>
</template>

<script setup lang="ts">
import type { Platform } from '~/types'
import { platformLabel } from '~/utils'

defineProps<{ platform: Platform }>()

const styles: Record<string, string> = {
  facebook: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  telegram: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  instagram: 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
  whatsapp: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  web: 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
}

const dots: Record<string, string> = {
  facebook: 'bg-blue-500',
  telegram: 'bg-sky-500',
  instagram: 'bg-pink-500',
  whatsapp: 'bg-green-500',
  web: 'bg-slate-400',
}
</script>
