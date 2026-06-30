<template>
  <div class="p-6 space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Facebook Integration</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage your Facebook Page connections</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-secondary" @click="syncDialog = true">
          <ArrowPathIcon class="w-4 h-4" /> Sync Pages
        </button>
        <button class="btn-primary" @click="manualDialog = true">
          <PlusIcon class="w-4 h-4" /> Connect Page
        </button>
      </div>
    </div>

    <!-- Connected Pages -->
    <div>
      <h2 class="text-sm font-semibold text-gray-700 mb-3">Connected Pages</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="inbox in inboxes" :key="inbox.id" class="card p-5">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <span class="text-white font-bold text-sm">f</span>
              </div>
              <div>
                <p class="font-semibold text-gray-900 text-sm">{{ inbox.name }}</p>
                <p class="text-xs text-gray-400">Page ID: {{ inbox.pageId }}</p>
              </div>
            </div>
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

          <div class="flex items-center gap-2 mb-3">
            <span
              class="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium"
              :class="inbox.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="inbox.isActive ? 'bg-green-500' : 'bg-gray-400'"
              />
              {{ inbox.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="flex gap-2">
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
            subtitle="Use Sync Pages to import from Facebook, or connect manually"
          >
            <div class="flex gap-2 mt-4 justify-center">
              <button class="btn-secondary" @click="syncDialog = true">
                <ArrowPathIcon class="w-4 h-4" /> Sync Pages
              </button>
              <button class="btn-primary" @click="manualDialog = true">
                <PlusIcon class="w-4 h-4" /> Connect Manually
              </button>
            </div>
          </EmptyState>
        </div>
      </div>
    </div>

    <!-- Webhook Management -->
    <div>
      <h2 class="text-sm font-semibold text-gray-700 mb-3">Webhook Management</h2>
      <div class="card p-5 space-y-4">
        <div v-if="webhookInfo">
          <!-- Status row -->
          <div class="flex items-center justify-between pb-3 border-b border-gray-100">
            <span class="text-sm font-medium text-gray-700">Webhook Status</span>
            <span
              class="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-green-500" />
              Endpoint Active
            </span>
          </div>

          <!-- Callback URL -->
          <div>
            <p class="text-xs font-medium text-gray-500 mb-1">Callback URL</p>
            <div class="flex items-center gap-2">
              <code
                class="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 font-mono break-all"
                >{{ webhookInfo.callbackUrl }}</code
              >
              <button
                class="flex-shrink-0 p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                title="Copy"
                @click="copyToClipboard(webhookInfo.callbackUrl)"
              >
                <ClipboardDocumentIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Verify Token -->
          <div>
            <p class="text-xs font-medium text-gray-500 mb-1">Verify Token</p>
            <code
              class="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 font-mono inline-block"
              >{{ webhookInfo.verifyToken }}</code
            >
          </div>

          <!-- Subscribe Fields -->
          <div>
            <p class="text-xs font-medium text-gray-500 mb-1.5">Subscribe Fields</p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="field in webhookInfo.subscribeFields"
                :key="field"
                class="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 font-mono"
                >{{ field }}</span
              >
            </div>
          </div>

          <!-- Setup Steps -->
          <div class="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p class="text-xs font-semibold text-amber-800 mb-2">Setup Checklist</p>
            <ol class="space-y-1">
              <li
                v-for="(step, i) in webhookInfo.setupSteps"
                :key="i"
                class="text-xs text-amber-700 flex gap-2"
              >
                <span class="flex-shrink-0 font-bold">{{ i + 1 }}.</span>
                <span>{{ step }}</span>
              </li>
            </ol>
          </div>
        </div>

        <div v-else class="flex items-center gap-2 text-sm text-gray-400">
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
          Loading webhook info…
        </div>
      </div>
    </div>

    <!-- Sync Pages Dialog -->
    <TransitionRoot :show="syncDialog" as="template">
      <Dialog class="relative z-50" @close="closeSyncDialog">
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
            <DialogPanel class="card p-6 w-full max-w-lg shadow-xl">
              <DialogTitle class="text-base font-semibold text-gray-900 mb-4"
                >Sync Pages from Facebook</DialogTitle
              >

              <!-- Step 1: enter token -->
              <div v-if="!pages.length" class="space-y-4">
                <div class="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
                  Enter a Facebook <strong>User Access Token</strong> to fetch all pages you manage.
                  You can get one from the Meta Graph API Explorer.
                </div>
                <div>
                  <label class="label">User Access Token</label>
                  <textarea
                    v-model="syncToken"
                    class="input resize-none"
                    rows="3"
                    placeholder="EAAxxxxxxxx…"
                  />
                </div>
                <div class="flex justify-end gap-3">
                  <button class="btn-secondary" @click="closeSyncDialog">Cancel</button>
                  <button
                    class="btn-primary"
                    :disabled="!syncToken.trim() || pagesLoading"
                    @click="fetchPages"
                  >
                    <span v-if="pagesLoading" class="flex items-center gap-2">
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
                      Fetching…
                    </span>
                    <span v-else>Fetch Pages</span>
                  </button>
                </div>
              </div>

              <!-- Step 2: select pages -->
              <div v-else class="space-y-4">
                <p class="text-sm text-gray-600">
                  Found <strong>{{ pages.length }}</strong> page{{ pages.length !== 1 ? 's' : '' }}.
                  Select which to connect:
                </p>
                <div class="space-y-2 max-h-64 overflow-y-auto">
                  <label
                    v-for="page in pages"
                    :key="page.id"
                    class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    :class="{ 'opacity-50 cursor-not-allowed': isConnected(page.id) }"
                  >
                    <input
                      v-model="selectedPageIds"
                      type="checkbox"
                      :value="page.id"
                      :disabled="isConnected(page.id)"
                      class="w-4 h-4 text-blue-600 rounded"
                    />
                    <div
                      class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0"
                    >
                      <span class="text-white font-bold text-xs">f</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ page.name }}</p>
                      <p class="text-xs text-gray-400">{{ page.id }}</p>
                    </div>
                    <span
                      v-if="isConnected(page.id)"
                      class="text-[11px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0"
                      >Connected</span
                    >
                  </label>
                </div>
                <div class="flex justify-between gap-3">
                  <button class="btn-secondary text-xs" @click="resetSync">← Back</button>
                  <div class="flex gap-2">
                    <button class="btn-secondary" @click="closeSyncDialog">Cancel</button>
                    <button
                      class="btn-primary"
                      :disabled="!selectedPageIds.length || loading"
                      @click="connectSelected"
                    >
                      Connect {{ selectedPageIds.length ? `(${selectedPageIds.length})` : '' }}
                    </button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Manual Connect Dialog -->
    <TransitionRoot :show="manualDialog" as="template">
      <Dialog class="relative z-50" @close="manualDialog = false">
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
                >Connect Facebook Page</DialogTitle
              >
              <div
                class="rounded-lg bg-blue-50 border border-blue-200 p-3 mb-4 text-sm text-blue-700"
              >
                You need a Facebook App and Page Access Token from Meta Developer Console.
              </div>
              <div class="space-y-3">
                <div>
                  <label class="label">Channel Name</label>
                  <input v-model="form.name" class="input" placeholder="My Facebook Page" />
                </div>
                <div>
                  <label class="label">Page ID</label>
                  <input v-model="form.pageId" class="input" placeholder="123456789" />
                </div>
                <div>
                  <label class="label">Page Access Token</label>
                  <input
                    v-model="form.accessToken"
                    class="input"
                    type="password"
                    placeholder="EAAxxxxx…"
                  />
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button class="btn-secondary" @click="manualDialog = false">Cancel</button>
                <button class="btn-primary" :disabled="loading" @click="connectManual">
                  Connect
                </button>
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
import {
  PlusIcon,
  ChatBubbleOvalLeftIcon,
  TrashIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
} from '@heroicons/vue/24/outline'
import type { FacebookPage } from '~/services/facebook.service'

definePageMeta({ middleware: 'auth' })

const {
  inboxes,
  pages,
  pagesLoading,
  webhookInfo,
  loading,
  error,
  addInbox,
  toggleInbox,
  deleteInbox,
  syncPages,
  connectPage,
} = useFacebook()

const syncDialog = ref(false)
const manualDialog = ref(false)
const confirmDialog = ref(false)
const deleteId = ref<string | null>(null)
const syncToken = ref('')
const selectedPageIds = ref<string[]>([])
const form = reactive({ name: '', pageId: '', accessToken: '' })

function isConnected(pageId: string) {
  return inboxes.value.some((i) => i.pageId === pageId)
}

async function fetchPages() {
  await syncPages(syncToken.value.trim())
}

async function connectSelected() {
  const toConnect = pages.value.filter((p) => selectedPageIds.value.includes(p.id))
  for (const page of toConnect) {
    await connectPage(page)
  }
  closeSyncDialog()
}

function resetSync() {
  selectedPageIds.value = []
  // Keep pages list but go back to token entry
  const store = useFacebookStore()
  store.pages = []
}

function closeSyncDialog() {
  syncDialog.value = false
  syncToken.value = ''
  selectedPageIds.value = []
  const store = useFacebookStore()
  store.pages = []
}

async function connectManual() {
  await addInbox(form.name, form.pageId, form.accessToken)
  if (!error.value) {
    manualDialog.value = false
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

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {})
}
</script>
