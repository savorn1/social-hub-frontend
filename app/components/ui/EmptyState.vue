<template>
  <div class="flex flex-col items-center justify-center py-16 text-center px-4">
    <div
      class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4 ring-1 ring-blue-100/80 dark:ring-blue-800/50 shadow-sm"
    >
      <component :is="icon" class="w-7 h-7 text-blue-400 dark:text-blue-500" />
    </div>
    <p class="text-sm font-semibold text-gray-800 dark:text-slate-200">{{ title }}</p>
    <p v-if="subtitle" class="text-sm text-gray-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
      {{ subtitle }}
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
defineProps<{ icon: Component; title: string; subtitle?: string }>()
</script>
