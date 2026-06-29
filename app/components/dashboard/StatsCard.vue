<template>
  <div class="card p-5 hover:shadow-md transition-all group">
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ label }}</p>
        <p class="text-3xl font-bold text-gray-900 mt-2 tabular-nums leading-none">
          {{ Number(value).toLocaleString() }}
        </p>
      </div>
      <div
        class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
        :class="bg"
      >
        <component :is="icon" class="w-6 h-6" :class="iconColor" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
defineProps<{
  icon: Component
  label: string
  value: number | string
  bg?: string
  iconColor?: string
}>()
</script>
