<template>
  <Teleport to="body">
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in store.toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm w-full border"
          :class="styles[toast.type]"
        >
          <component :is="icons[toast.type]" class="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span class="flex-1 leading-snug">{{ toast.message }}</span>
          <button
            class="opacity-50 hover:opacity-100 transition-opacity flex-shrink-0 -mr-1"
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
  success: 'bg-white border-emerald-200 text-emerald-800',
  error: 'bg-white border-red-200 text-red-800',
  info: 'bg-white border-blue-200 text-blue-800',
  warning: 'bg-white border-yellow-200 text-yellow-800',
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
  transform: translateY(-0.5rem);
}
</style>
