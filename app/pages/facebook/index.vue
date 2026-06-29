<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Facebook Integration</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage your Facebook Page connections</p>
      </div>
      <button class="btn-primary" @click="dialog = true">
        <PlusIcon class="w-4 h-4" /> Connect Page
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="inbox in inboxes" :key="inbox.id" class="card p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <span class="text-white font-bold text-sm">f</span>
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">{{ inbox.name }}</p>
              <p class="text-xs text-gray-400">{{ inbox.pageId }}</p>
            </div>
          </div>
          <!-- Active toggle -->
          <button
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
            :class="inbox.isActive ? 'bg-blue-600' : 'bg-gray-200'"
            :title="inbox.isActive ? 'Deactivate' : 'Activate'"
            @click="toggleInbox(inbox.id, !inbox.isActive)"
          >
            <span
              class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
              :class="inbox.isActive ? 'translate-x-4' : 'translate-x-1'"
            />
          </button>
        </div>

        <div class="flex gap-2 mt-3">
          <NuxtLink
            to="/inbox?platform=facebook"
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
          :icon="ChatBubbleOvalLeftIcon"
          title="No Facebook pages connected"
          subtitle="Connect a page to receive messages"
        >
          <button class="btn-primary mt-4" @click="dialog = true">
            <PlusIcon class="w-4 h-4" /> Connect Page
          </button>
        </EmptyState>
      </div>
    </div>

    <!-- Connect dialog -->
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
                >Connect Facebook Page</DialogTitle
              >
              <div
                class="rounded-lg bg-blue-50 border border-blue-200 p-3 mb-4 text-sm text-blue-700"
              >
                You need a Facebook App and Page Access Token from Meta Developer Console.
              </div>
              <div class="space-y-3">
                <div>
                  <label class="label">Channel Name</label
                  ><input v-model="form.name" class="input" placeholder="My Facebook Page" />
                </div>
                <div>
                  <label class="label">Page ID</label
                  ><input v-model="form.pageId" class="input" placeholder="123456789" />
                </div>
                <div>
                  <label class="label">Page Access Token</label
                  ><input
                    v-model="form.accessToken"
                    class="input"
                    type="password"
                    placeholder="EAAxxxxx…"
                  />
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button class="btn-secondary" @click="dialog = false">Cancel</button>
                <button class="btn-primary" :disabled="loading" @click="connect">Connect</button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <ConfirmDialog
      v-model="confirmDialog"
      message="Disconnect this Facebook page? This cannot be undone."
      confirm-label="Disconnect"
      confirm-color="danger"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { PlusIcon, ChatBubbleOvalLeftIcon, TrashIcon } from '@heroicons/vue/24/outline'

definePageMeta({ middleware: 'auth' })

const { inboxes, loading, error, addInbox, toggleInbox, deleteInbox } = useFacebook()
const dialog = ref(false)
const confirmDialog = ref(false)
const deleteId = ref<string | null>(null)
const form = reactive({ name: '', pageId: '', accessToken: '' })

async function connect() {
  await addInbox(form.name, form.pageId, form.accessToken)
  if (!error.value) {
    dialog.value = false
    Object.assign(form, { name: '', pageId: '', accessToken: '' })
  }
}

function confirmDelete(id: string) {
  deleteId.value = id
  confirmDialog.value = true
}

async function doDelete() {
  if (deleteId.value) await deleteInbox(deleteId.value)
}
</script>
