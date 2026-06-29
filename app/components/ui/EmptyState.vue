<template>
  <div class="flex flex-col items-center justify-center py-16 text-center px-4">
    <div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <component :is="icon" class="w-7 h-7 text-gray-400" />
    </div>
    <p class="text-sm font-medium text-gray-900">{{ title }}</p>
    <p v-if="subtitle" class="text-sm text-gray-500 mt-1">{{ subtitle }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
defineProps<{ icon: Component; title: string; subtitle?: string }>()
</script>
