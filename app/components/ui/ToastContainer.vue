<template>
  <Teleport to="body">
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in store.toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-start gap-3 pl-4 pr-3 py-3 rounded-2xl shadow-lg text-sm font-medium max-w-sm w-full border-l-4"
          :class="styles[toast.type]"
        >
          <component :is="icons[toast.type]" class="w-4 h-4 mt-0.5 flex-shrink-0" :class="iconColors[toast.type]" />
          <span class="flex-1 leading-snug">{{ toast.message }}</span>
          <button
            class="opacity-40 hover:opacity-80 transition-opacity flex-shrink-0 p-0.5 rounded-lg hover:bg-black/5"
            @click="store.remove(toast.id)"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { useToastStore } from '~/stores/toast.store'
import type { ToastType } from '~/stores/toast.store'
import type { Component } from 'vue'

const store = useToastStore()

const styles: Record<ToastType, string> = {
  success: 'bg-white dark:bg-slate-800 border-emerald-500 text-gray-800 dark:text-slate-100 shadow-emerald-100/50 dark:shadow-none border border-emerald-100 dark:border-slate-700',
  error:   'bg-white dark:bg-slate-800 border-red-500 text-gray-800 dark:text-slate-100 shadow-red-100/50 dark:shadow-none border border-red-100 dark:border-slate-700',
  info:    'bg-white dark:bg-slate-800 border-blue-500 text-gray-800 dark:text-slate-100 shadow-blue-100/50 dark:shadow-none border border-blue-100 dark:border-slate-700',
  warning: 'bg-white dark:bg-slate-800 border-amber-500 text-gray-800 dark:text-slate-100 shadow-amber-100/50 dark:shadow-none border border-amber-100 dark:border-slate-700',
}

const iconColors: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  info:    'text-blue-500',
  warning: 'text-amber-500',
}

const icons: Record<ToastType, Component> = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(0.75rem) scale(0.97);
}
</style>
