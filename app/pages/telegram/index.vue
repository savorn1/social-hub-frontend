<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Telegram Integration</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage your Telegram Bot connections</p>
      </div>
      <button class="btn-primary" @click="connectDialog = true">
        <PlusIcon class="w-4 h-4" /> Add Bot
      </button>
    </div>

    <!-- Bot cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="inbox in inboxes" :key="inbox.id" class="card p-5 space-y-4">
        <!-- Bot header -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0"
            >
              <PaperAirplaneIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">{{ inbox.name }}</p>
              <p v-if="botInfos[inbox.id]" class="text-xs text-sky-600 font-mono">
                @{{ botInfos[inbox.id].username }}
              </p>
              <p v-else class="text-xs text-gray-400">Telegram Bot</p>
            </div>
          </div>
          <!-- Active toggle -->
          <button
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
            :class="inbox.isActive ? 'bg-sky-500' : 'bg-gray-200'"
            :title="inbox.isActive ? 'Deactivate' : 'Activate'"
            @click="toggleInbox(inbox.id, !inbox.isActive)"
          >
            <span
              class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
              :class="inbox.isActive ? 'translate-x-4' : 'translate-x-1'"
            />
          </button>
        </div>

        <!-- Webhook status -->
        <div
          class="rounded-lg border p-3 space-y-2"
          :class="
            webhookInfos[inbox.id]?.isRegistered
              ? 'border-green-200 bg-green-50'
              : 'border-amber-200 bg-amber-50'
          "
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <span
                class="w-2 h-2 rounded-full"
                :class="webhookInfos[inbox.id]?.isRegistered ? 'bg-green-500' : 'bg-amber-400'"
              />
              <span
                class="text-xs font-medium"
                :class="webhookInfos[inbox.id]?.isRegistered ? 'text-green-700' : 'text-amber-700'"
              >
                {{ webhookInfos[inbox.id]?.isRegistered ? 'Webhook Active' : 'Webhook Not Set' }}
              </span>
            </div>
            <button
              class="text-xs font-medium px-2 py-0.5 rounded-md transition-colors"
              :class="
                webhookInfos[inbox.id]?.isRegistered
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-sky-600 hover:bg-sky-100'
              "
              @click="
                webhookInfos[inbox.id]?.isRegistered
                  ? removeWebhook(inbox.id)
                  : registerWebhook(inbox.id)
              "
            >
              {{ webhookInfos[inbox.id]?.isRegistered ? 'Remove' : 'Set Webhook' }}
            </button>
          </div>

          <div v-if="webhookInfos[inbox.id]?.isRegistered">
            <p class="text-[11px] text-green-600 font-mono truncate">
              {{ webhookInfos[inbox.id].url }}
            </p>
            <p
              v-if="webhookInfos[inbox.id]?.pending_update_count > 0"
              class="text-[11px] text-amber-600 mt-0.5"
            >
              {{ webhookInfos[inbox.id].pending_update_count }} pending updates
            </p>
            <p
              v-if="webhookInfos[inbox.id]?.last_error_message"
              class="text-[11px] text-red-600 mt-0.5"
            >
              Error: {{ webhookInfos[inbox.id].last_error_message }}
            </p>
          </div>

          <div v-else>
            <p class="text-[11px] text-amber-600">
              Set a webhook so this bot can receive messages.
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <NuxtLink
            to="/inbox?platform=telegram"
            class="btn-secondary flex-1 justify-center text-xs py-1.5"
          >
            View Conversations
          </NuxtLink>
          <button
            class="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
            @click="confirmDelete(inbox.id)"
          >
            <TrashIcon class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div v-if="!inboxes.length && !loading" class="sm:col-span-2 lg:col-span-3">
        <EmptyState
          :icon="PaperAirplaneIcon"
          title="No Telegram bots connected"
          subtitle="Create a bot with @BotFather and paste the token below"
        >
          <button class="btn-primary mt-4" @click="connectDialog = true">
            <PlusIcon class="w-4 h-4" /> Add Bot
          </button>
        </EmptyState>
      </div>
    </div>

    <!-- How to set up -->
    <div class="card p-5">
      <h2 class="text-sm font-semibold text-gray-700 mb-3">Setup Guide</h2>
      <ol class="space-y-2">
        <li v-for="(step, i) in setupSteps" :key="i" class="flex gap-2.5 text-sm text-gray-600">
          <span
            class="flex-shrink-0 w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center mt-0.5"
            >{{ i + 1 }}</span
          >
          <span>{{ step }}</span>
        </li>
      </ol>
    </div>

    <!-- Connect Bot Dialog -->
    <TransitionRoot :show="connectDialog" as="template">
      <Dialog class="relative z-50" @close="closeConnectDialog">
        <TransitionChild
          enter="ease-out duration-200"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-150"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="dialog-overlay" />
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
                Create a bot with <strong>@BotFather</strong> on Telegram and paste the token below.
              </div>

              <div class="space-y-3">
                <div>
                  <label class="label">Channel Name</label>
                  <input v-model="form.name" class="input" placeholder="My Support Bot" />
                </div>
                <div>
                  <label class="label">Bot Token</label>
                  <div class="relative">
                    <input
                      v-model="form.botToken"
                      class="input pr-20"
                      :type="showToken ? 'text' : 'password'"
                      placeholder="123456:ABC-DEF…"
                    />
                    <button
                      class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 px-1"
                      type="button"
                      @click="showToken = !showToken"
                    >
                      {{ showToken ? 'Hide' : 'Show' }}
                    </button>
                  </div>
                </div>

                <!-- Validated bot preview -->
                <div
                  v-if="validatedBot"
                  class="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-3"
                >
                  <div
                    class="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0"
                  >
                    <PaperAirplaneIcon class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ validatedBot.first_name }}</p>
                    <p class="text-xs text-sky-600 font-mono">@{{ validatedBot.username }}</p>
                  </div>
                  <CheckCircleIcon class="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />
                </div>

                <button
                  class="btn-secondary w-full text-sm"
                  :disabled="!form.botToken.trim() || validating"
                  @click="doValidate"
                >
                  <span v-if="validating" class="flex items-center gap-2 justify-center">
                    <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Validating…
                  </span>
                  <span v-else>Validate Token</span>
                </button>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button class="btn-secondary" @click="closeConnectDialog">Cancel</button>
                <button
                  class="btn-primary"
                  :disabled="loading || !form.name.trim() || !form.botToken.trim()"
                  @click="connectBot"
                >
                  Connect
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <ConfirmDialog
      v-model="confirmDeleteDialog"
      message="Remove this Telegram bot? Conversations will remain but the bot will stop receiving messages."
      confirm-label="Remove"
      confirm-color="danger"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { PlusIcon, PaperAirplaneIcon, TrashIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import type { TelegramBotInfo } from '~/services/telegram.service'

definePageMeta({ middleware: 'auth' })

const {
  inboxes,
  botInfos,
  webhookInfos,
  loading,
  error,
  addInbox,
  toggleInbox,
  deleteInbox,
  setWebhook,
  deleteWebhook,
  validateBot,
} = useTelegram()

const connectDialog = ref(false)
const confirmDeleteDialog = ref(false)
const deleteId = ref<string | null>(null)
const showToken = ref(false)
const validating = ref(false)
const validatedBot = ref<TelegramBotInfo | null>(null)
const form = reactive({ name: '', botToken: '' })

const setupSteps = [
  'Open Telegram and search for @BotFather',
  'Send /newbot and follow the prompts to create your bot',
  'Copy the bot token and paste it above',
  'Click "Validate Token" to confirm it works',
  'Click "Connect" then use "Set Webhook" on the bot card to receive messages',
]

async function doValidate() {
  if (!form.botToken.trim()) return
  validating.value = true
  validatedBot.value = null
  try {
    validatedBot.value = await validateBot(form.botToken.trim())
    if (!form.name && validatedBot.value) {
      form.name = validatedBot.value.first_name
    }
  } catch {
    // error displayed via error ref
  } finally {
    validating.value = false
  }
}

async function connectBot() {
  const inbox = await addInbox(form.name, form.botToken.trim())
  if (!error.value && inbox) {
    closeConnectDialog()
  }
}

function closeConnectDialog() {
  connectDialog.value = false
  showToken.value = false
  validatedBot.value = null
  Object.assign(form, { name: '', botToken: '' })
}

async function registerWebhook(inboxId: string) {
  await setWebhook(inboxId)
}

async function removeWebhook(inboxId: string) {
  await deleteWebhook(inboxId)
}

function confirmDelete(id: string) {
  deleteId.value = id
  confirmDeleteDialog.value = true
}

async function doDelete() {
  if (deleteId.value) await deleteInbox(deleteId.value)
}
</script>
