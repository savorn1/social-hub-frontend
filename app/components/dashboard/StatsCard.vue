<template>
  <div class="card p-5 group hover:shadow-md hover:shadow-gray-100/80 transition-all duration-150 relative overflow-hidden">
    <div class="absolute inset-x-0 top-0 h-0.5 rounded-t-xl" :class="bar" />
    <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{{ label }}</p>
    <p class="text-3xl font-bold tabular-nums leading-none text-gray-900">
      {{ Number(value).toLocaleString() }}
    </p>
    <div class="flex items-center gap-2 mt-3">
      <div class="w-7 h-7 rounded-lg flex items-center justify-center" :class="bg">
        <component :is="icon" class="w-3.5 h-3.5" :class="iconColor" />
      </div>
      <span v-if="sub" class="text-xs text-gray-400">{{ sub }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
defineProps<{
  icon: Component
  label: string
  value: number | string
  sub?: string
  bg?: string
  iconColor?: string
  bar?: string
}>()
</script>
