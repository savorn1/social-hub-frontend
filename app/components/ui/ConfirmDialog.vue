<template>
  <TransitionRoot :show="modelValue" as="template">
    <Dialog class="relative z-50" @close="emit('update:modelValue', false)">
      <TransitionChild
        enter="ease-out duration-200"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-150"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/40" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild
          enter="ease-out duration-200"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="ease-in duration-150"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel class="card p-6 w-full max-w-sm shadow-dialog">
            <DialogTitle class="text-base font-semibold text-gray-900 dark:text-slate-100 mb-2">{{
              title ?? 'Confirm'
            }}</DialogTitle>
            <p class="text-sm text-gray-600 dark:text-slate-400">{{ message }}</p>
            <div class="flex justify-end gap-3 mt-6">
              <button class="btn-secondary" @click="emit('update:modelValue', false)">
                Cancel
              </button>
              <button
                :class="confirmColor === 'danger' ? 'btn-danger' : 'btn-primary'"
                @click="confirm"
              >
                {{ confirmLabel ?? 'Confirm' }}
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'

defineProps<{
  modelValue: boolean
  title?: string
  message: string
  confirmLabel?: string
  confirmColor?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [boolean]; confirm: [] }>()
function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>
