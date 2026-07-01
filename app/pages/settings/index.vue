<template>
  <div class="p-6 max-w-3xl">
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900 dark:text-slate-100">Settings</h1>
      <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Manage your profile, security, and integrations</p>
    </div>

    <div class="space-y-5">
      <!-- Profile -->
      <div class="card p-6">
        <div class="flex items-center gap-2.5 mb-5">
          <div class="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <UserCircleIcon class="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 class="text-sm font-semibold text-gray-800 dark:text-slate-200">Profile</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label class="label">First Name <span class="text-red-400">*</span></label>
            <input v-model="form.firstName" class="input" placeholder="John">
          </div>
          <div>
            <label class="label">Last Name <span class="text-red-400">*</span></label>
            <input v-model="form.lastName" class="input" placeholder="Doe">
          </div>
          <div class="sm:col-span-2">
            <label class="label">Email</label>
            <input :value="user?.email" class="input bg-gray-50 dark:bg-slate-700/50 cursor-not-allowed" readonly>
          </div>
        </div>
        <div class="flex justify-end">
          <button class="btn-primary" :disabled="saving" @click="updateProfile">
            {{ saving ? 'Saving…' : 'Save Changes' }}
          </button>
        </div>
      </div>

      <!-- Password -->
      <div class="card p-6">
        <div class="flex items-center gap-2.5 mb-5">
          <div class="w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
            <LockClosedIcon class="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <h2 class="text-sm font-semibold text-gray-800 dark:text-slate-200">Change Password</h2>
        </div>
        <div class="space-y-3 mb-5">
          <div>
            <label class="label">Current Password</label>
            <input v-model="pwd.current" class="input" type="password" placeholder="Current password">
          </div>
          <div>
            <label class="label">New Password</label>
            <input v-model="pwd.next" class="input" type="password" placeholder="Min. 8 characters">
          </div>
          <div>
            <label class="label">Confirm Password</label>
            <input v-model="pwd.confirm" class="input" type="password" placeholder="Re-enter new password">
          </div>
        </div>
        <p v-if="pwdMismatch" class="text-xs text-red-500 -mt-2 mb-3">Passwords do not match</p>
        <div class="flex justify-end">
          <button
            class="btn-primary"
            :disabled="pwdSaving || !pwd.current.trim() || !pwd.next.trim() || !pwd.confirm.trim() || pwdMismatch"
            @click="updatePassword"
          >
            {{ pwdSaving ? 'Updating…' : 'Update Password' }}
          </button>
        </div>
      </div>

      <!-- Webhook URLs -->
      <div class="card p-6">
        <div class="flex items-center gap-2.5 mb-5">
          <div class="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
            <GlobeAltIcon class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 class="text-sm font-semibold text-gray-800 dark:text-slate-200">Webhook URLs</h2>
        </div>
        <div class="space-y-3">
          <div v-for="wb in webhooks" :key="wb.label">
            <label class="label">{{ wb.label }}</label>
            <div class="flex gap-2">
              <input
                :value="wb.url"
                class="input bg-gray-50 dark:bg-slate-700/50 flex-1 font-mono text-xs cursor-not-allowed"
                readonly
              >
              <button class="btn-secondary flex-shrink-0" @click="copy(wb.url)">
                <ClipboardIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Business Hours -->
      <div class="card p-6">
        <div class="flex items-center gap-2.5 mb-2">
          <div class="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <ClockIcon class="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 class="text-sm font-semibold text-gray-800 dark:text-slate-200">Business Hours</h2>
        </div>
        <p class="text-xs text-gray-500 dark:text-slate-400 mb-5 ml-9">
          Outside these hours, incoming messages receive an auto-away reply instead of being routed to the chatbot.
        </p>
        <div v-if="bhLoading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-center gap-4 animate-pulse">
            <div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-20" />
            <div class="h-5 bg-gray-100 dark:bg-slate-700 rounded-full w-9" />
          </div>
        </div>
        <div v-else class="space-y-3">
          <div v-for="day in businessHours" :key="day.dayOfWeek" class="flex items-center gap-4">
            <span class="w-24 text-sm font-medium text-gray-700 dark:text-slate-300 flex-shrink-0">{{ DAY_NAMES[day.dayOfWeek] }}</span>
            <button
              type="button"
              class="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
              :class="day.isEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'"
              @click="toggleDay(day)"
            >
              <span
                class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200"
                :class="day.isEnabled ? 'translate-x-4' : 'translate-x-0'"
              />
            </button>
            <template v-if="day.isEnabled">
              <input
                v-model="day.startTime"
                type="time"
                class="input w-32 text-sm"
                @change="saveDay(day)"
              >
              <span class="text-gray-400 dark:text-slate-500 text-sm">–</span>
              <input
                v-model="day.endTime"
                type="time"
                class="input w-32 text-sm"
                @change="saveDay(day)"
              >
            </template>
            <span v-else class="text-sm text-gray-400 dark:text-slate-500 italic">Closed</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ClipboardIcon,
  UserCircleIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'
import type { BusinessHours } from '~/types'

definePageMeta({ middleware: 'auth' })

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const { user } = useAuth()
const { $api } = useNuxtApp()
const toast = useToast()
const config = useRuntimeConfig()
const apiBase = `${config.public.baseUrl}/api`
const saving = ref(false)
const pwdSaving = ref(false)
const form = reactive({
  firstName: user.value?.firstName ?? '',
  lastName: user.value?.lastName ?? '',
})
const pwd = reactive({ current: '', next: '', confirm: '' })
const pwdMismatch = computed(() => pwd.confirm.length > 0 && pwd.next !== pwd.confirm)

const businessHours = ref<BusinessHours[]>([])
const bhLoading = ref(true)

const webhooks = computed(() => [
  { label: 'Facebook Webhook', url: `${apiBase}/integrations/facebook/webhook` },
  { label: 'Telegram Webhook', url: `${apiBase}/integrations/telegram/webhook` },
  { label: 'WhatsApp Webhook', url: `${apiBase}/integrations/whatsapp/webhook` },
])

onMounted(async () => {
  try {
    businessHours.value = await $api.get('/business-hours')
  } finally {
    bhLoading.value = false
  }
})

async function toggleDay(day: BusinessHours) {
  day.isEnabled = !day.isEnabled
  try {
    await $api.patch(`/business-hours/${day.dayOfWeek}`, { isEnabled: day.isEnabled })
  } catch {
    day.isEnabled = !day.isEnabled
    toast.error('Failed to update business hours')
  }
}

async function saveDay(day: BusinessHours) {
  try {
    await $api.patch(`/business-hours/${day.dayOfWeek}`, {
      startTime: day.startTime,
      endTime: day.endTime,
    })
  } catch {
    toast.error('Failed to save hours')
  }
}

async function updateProfile() {
  if (!form.firstName.trim() || !form.lastName.trim()) {
    toast.error('First and last name are required')
    return
  }
  saving.value = true
  try {
    await $api.patch(`/users/${user.value?.id}`, form)
    toast.success('Profile updated')
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    toast.error(msg ?? 'Failed to update profile')
  } finally {
    saving.value = false
  }
}

async function updatePassword() {
  if (!pwd.current.trim() || !pwd.next.trim() || !pwd.confirm.trim()) {
    toast.error('All password fields are required')
    return
  }
  if (pwd.next.length < 8) {
    toast.error('New password must be at least 8 characters')
    return
  }
  if (pwd.next !== pwd.confirm) return
  pwdSaving.value = true
  try {
    await $api.patch(`/users/${user.value?.id}/password`, {
      currentPassword: pwd.current,
      newPassword: pwd.next,
    })
    toast.success('Password updated')
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    toast.error(msg ?? 'Failed to update password')
  } finally {
    pwdSaving.value = false
  }
}

async function copy(text: string) {
  await navigator.clipboard.writeText(text)
  toast.info('Copied to clipboard')
}
</script>
