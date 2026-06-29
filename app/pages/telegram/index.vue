<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Telegram Integration</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage your Telegram Bot connections</p>
      </div>
      <button class="btn-primary" @click="dialog = true">
        <PlusIcon class="w-4 h-4" /> Add Bot
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="inbox in inboxes" :key="inbox.id" class="card p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
              <PaperAirplaneIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">{{ inbox.name }}</p>
              <p class="text-xs text-gray-400">Telegram Bot</p>
            </div>
          </div>
          <span
            :class="
              inbox.isActive
                ? 'badge bg-green-100 text-green-700'
                : 'badge bg-gray-100 text-gray-500'
            "
          >
            {{ inbox.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <NuxtLink
          to="/inbox?platform=telegram"
          class="btn-secondary w-full justify-center text-xs py-1.5"
        >
          View Conversations
        </NuxtLink>
      </div>

      <div v-if="!inboxes.length && !loading" class="sm:col-span-2 lg:col-span-3">
        <EmptyState
          :icon="PaperAirplaneIcon"
          title="No Telegram bots connected"
          subtitle="Add a bot token to get started"
        >
          <button class="btn-primary mt-4" @click="dialog = true">
            <PlusIcon class="w-4 h-4" /> Add Bot
          </button>
        </EmptyState>
      </div>
    </div>

    <TransitionRoot :show="dialog" as="template">
      <Dialog class="relative z-50" @close="dialog = false">
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
            <DialogPanel class="card p-6 w-full max-w-md shadow-xl">
              <DialogTitle class="text-base font-semibold text-gray-900 mb-4"
                >Connect Telegram Bot</DialogTitle
              >
              <div class="rounded-lg bg-sky-50 border border-sky-200 p-3 mb-4 text-sm text-sky-700">
                Create a bot with @BotFather on Telegram and paste the token below.
              </div>
              <div class="space-y-3">
                <div>
                  <label class="label">Channel Name</label
                  ><input v-model="form.name" class="input" placeholder="My Support Bot" />
                </div>
                <div>
                  <label class="label">Bot Token</label
                  ><input
                    v-model="form.botToken"
                    class="input"
                    type="password"
                    placeholder="123456:ABC-DEF…"
                  />
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button class="btn-secondary" @click="dialog = false">Cancel</button>
                <button class="btn-primary" :disabled="loading" @click="connectBot">Connect</button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { PlusIcon, PaperAirplaneIcon } from '@heroicons/vue/24/outline'

definePageMeta({ middleware: 'auth' })

const { inboxes, loading, error, addInbox } = useTelegram()
const dialog = ref(false)
const form = reactive({ name: '', botToken: '' })

async function connectBot() {
  await addInbox(form.name, form.botToken)
  if (!error.value) {
    dialog.value = false
    Object.assign(form, { name: '', botToken: '' })
  }
}
</script>
