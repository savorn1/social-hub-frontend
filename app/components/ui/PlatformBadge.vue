<template>
  <span class="inline-flex items-center gap-1 badge bg-gray-100 text-gray-700">
    <span class="w-2 h-2 rounded-full" :class="platformColor(platform)" />
    {{ platformLabel(platform) }}
  </span>
</template>

<script setup lang="ts">
import type { Platform } from '~/types'
import { platformColor, platformLabel } from '~/utils'

defineProps<{ platform: Platform }>()
</script>
