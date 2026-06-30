<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-slate-100">WhatsApp Integration</h1>
        <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Manage your WhatsApp Business phone numbers</p>
      </div>
      <button class="btn-primary" @click="connectDialog = true">
        <PlusIcon class="w-4 h-4" /> Add Number
      </button>
    </div>

    <!-- Phone number cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="inbox in inboxes" :key="inbox.id" class="card p-5 space-y-4">
        <!-- Card header -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0"
            >
              <PhoneIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-slate-100 text-sm">{{ inbox.name }}</p>
              <p class="text-xs text-green-600 font-mono">{{ inbox.pageId }}</p>
            </div>
          </div>
          <!-- Active toggle -->
          <button
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
            :class="inbox.isActive ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-600'"
            :title="inbox.isActive ? 'Deactivate' : 'Activate'"
            @click="toggleInbox(inbox.id, !inbox.isActive)"
          >
            <span
              class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
              :class="inbox.isActive ? 'translate-x-4' : 'translate-x-1'"
            />
          </button>
        </div>

        <!-- Status indicator -->
        <div
          class="rounded-lg border p-3"
          :class="inbox.isActive ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50'"
        >
          <div class="flex items-center gap-1.5">
            <span
              class="w-2 h-2 rounded-full"
              :class="inbox.isActive ? 'bg-green-500' : 'bg-gray-300'"
            />
            <span
              class="text-xs font-medium"
              :class="inbox.isActive ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-slate-400'"
            >
              {{ inbox.isActive ? 'Active — receiving messages' : 'Inactive' }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <NuxtLink
            to="/inbox?platform=whatsapp"
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
          :icon="PhoneIcon"
          title="No WhatsApp numbers connected"
          subtitle="Add a WhatsApp Business phone number using its Phone Number ID and access token"
        >
          <button class="btn-primary mt-4" @click="connectDialog = true">
            <PlusIcon class="w-4 h-4" /> Add Number
          </button>
        </EmptyState>
      </div>
    </div>

    <!-- Webhook info card -->
    <div v-if="webhookInfo" class="card p-5 space-y-4">
      <h2 class="text-sm font-semibold text-gray-700 dark:text-slate-300">Webhook Configuration</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1">
          <p class="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">Callback URL</p>
          <p
            class="text-sm font-mono bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 break-all dark:text-slate-300"
          >
            {{ webhookInfo.callbackUrl }}
          </p>
        </div>
        <div class="space-y-1">
          <p class="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">Verify Token</p>
          <p class="text-sm font-mono bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 dark:text-slate-300">
            {{ webhookInfo.verifyToken }}
          </p>
        </div>
      </div>

      <div>
        <p class="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Setup Steps</p>
        <ol class="space-y-2">
          <li
            v-for="(step, i) in webhookInfo.setupSteps"
            :key="i"
            class="flex gap-2.5 text-sm text-gray-600 dark:text-slate-400"
          >
            <span
              class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold flex items-center justify-center mt-0.5"
              >{{ i + 1 }}</span
            >
            <span>{{ step }}</span>
          </li>
        </ol>
      </div>
    </div>

    <!-- Connect dialog -->
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
            <DialogPanel class="card p-6 w-full max-w-md shadow-dialog">
              <DialogTitle class="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Add WhatsApp Phone Number
              </DialogTitle>

              <div
                class="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 mb-4 text-sm text-green-700 dark:text-green-400"
              >
                You need a <strong>WhatsApp Business Account</strong> with a verified phone number.
                Find the Phone Number ID and System User Access Token in Meta for Developers.
              </div>

              <div class="space-y-3">
                <div>
                  <label class="label">Channel Name</label>
                  <input v-model="form.name" class="input" placeholder="WhatsApp Support" />
                </div>
                <div>
                  <label class="label">Phone Number ID</label>
                  <input
                    v-model="form.phoneNumberId"
                    class="input font-mono"
                    placeholder="1234567890"
                  />
                  <p class="text-[11px] text-gray-400 mt-1">
                    Found in Meta for Developers → WhatsApp → API Setup
                  </p>
                </div>
                <div>
                  <label class="label">System User Access Token</label>
                  <div class="relative">
                    <input
                      v-model="form.accessToken"
                      class="input pr-16"
                      :type="showToken ? 'text' : 'password'"
                      placeholder="EAAxxxxxx…"
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
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button class="btn-secondary" @click="closeConnectDialog">Cancel</button>
                <button
                  class="btn-primary"
                  :disabled="
                    loading ||
                    !form.name.trim() ||
                    !form.phoneNumberId.trim() ||
                    !form.accessToken.trim()
                  "
                  @click="connectNumber"
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
      message="Remove this WhatsApp number? Conversations will remain but the number will stop receiving messages."
      confirm-label="Remove"
      confirm-color="danger"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { PlusIcon, PhoneIcon, TrashIcon } from '@heroicons/vue/24/outline'

definePageMeta({ middleware: 'auth' })

const { inboxes, webhookInfo, loading, error, addInbox, toggleInbox, deleteInbox } = useWhatsApp()

const toast = useToast()
const connectDialog = ref(false)
const confirmDeleteDialog = ref(false)
const deleteId = ref<string | null>(null)
const showToken = ref(false)
const form = reactive({ name: '', phoneNumberId: '', accessToken: '' })

async function connectNumber() {
  const inbox = await addInbox(form.name.trim(), form.phoneNumberId.trim(), form.accessToken.trim())
  if (!error.value && inbox) {
    closeConnectDialog()
    toast.success('WhatsApp number connected')
  } else if (error.value) {
    toast.error(error.value)
  }
}

function closeConnectDialog() {
  connectDialog.value = false
  showToken.value = false
  Object.assign(form, { name: '', phoneNumberId: '', accessToken: '' })
}

function confirmDelete(id: string) {
  deleteId.value = id
  confirmDeleteDialog.value = true
}

async function doDelete() {
  if (deleteId.value) {
    await deleteInbox(deleteId.value)
    if (!error.value) {
      toast.success('Number removed')
    } else {
      toast.error(error.value)
    }
  }
}
</script>
