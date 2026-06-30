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
  facebook: 'bg-blue-50 text-blue-700',
  telegram: 'bg-sky-50 text-sky-700',
  instagram: 'bg-pink-50 text-pink-700',
  whatsapp: 'bg-green-50 text-green-700',
  web: 'bg-slate-50 text-slate-600',
}

const dots: Record<string, string> = {
  facebook: 'bg-blue-500',
  telegram: 'bg-sky-500',
  instagram: 'bg-pink-500',
  whatsapp: 'bg-green-500',
  web: 'bg-slate-400',
}
</script>
