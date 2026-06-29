<template>
  <div class="p-6 max-w-3xl">
    <h1 class="text-xl font-bold text-gray-900 mb-6">Settings</h1>

    <div class="space-y-6">
      <!-- Profile -->
      <div class="card p-6">
        <h2 class="text-sm font-semibold text-gray-700 mb-4">Profile</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="label">First Name</label><input v-model="form.firstName" class="input" />
          </div>
          <div>
            <label class="label">Last Name</label><input v-model="form.lastName" class="input" />
          </div>
          <div class="sm:col-span-2">
            <label class="label">Email</label
            ><input :value="user?.email" class="input bg-gray-50" readonly />
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
        <h2 class="text-sm font-semibold text-gray-700 mb-4">Change Password</h2>
        <div class="space-y-3 mb-4">
          <div>
            <label class="label">Current Password</label
            ><input v-model="pwd.current" class="input" type="password" />
          </div>
          <div>
            <label class="label">New Password</label
            ><input v-model="pwd.next" class="input" type="password" />
          </div>
          <div>
            <label class="label">Confirm Password</label
            ><input v-model="pwd.confirm" class="input" type="password" />
          </div>
        </div>
        <div class="flex justify-end">
          <button class="btn-primary">Update Password</button>
        </div>
      </div>

      <!-- Webhook URLs -->
      <div class="card p-6">
        <h2 class="text-sm font-semibold text-gray-700 mb-4">Webhook URLs</h2>
        <div class="space-y-3">
          <div>
            <label class="label">Facebook Webhook</label>
            <div class="flex gap-2">
              <input
                :value="`${apiBase}/integrations/facebook/webhook`"
                class="input bg-gray-50 flex-1"
                readonly
              />
              <button
                class="btn-secondary"
                @click="copy(`${apiBase}/integrations/facebook/webhook`)"
              >
                <ClipboardIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label class="label">Telegram Webhook</label>
            <div class="flex gap-2">
              <input
                :value="`${apiBase}/integrations/telegram/webhook`"
                class="input bg-gray-50 flex-1"
                readonly
              />
              <button
                class="btn-secondary"
                @click="copy(`${apiBase}/integrations/telegram/webhook`)"
              >
                <ClipboardIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label class="label">WhatsApp Webhook</label>
            <div class="flex gap-2">
              <input
                :value="`${apiBase}/integrations/whatsapp/webhook`"
                class="input bg-gray-50 flex-1"
                readonly
              />
              <button
                class="btn-secondary"
                @click="copy(`${apiBase}/integrations/whatsapp/webhook`)"
              >
                <ClipboardIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Business Hours -->
      <div class="card p-6">
        <h2 class="text-sm font-semibold text-gray-700 mb-4">Business Hours</h2>
        <p class="text-xs text-gray-500 mb-4">
          Outside these hours, incoming messages receive an auto-away reply instead of being routed
          to the chatbot.
        </p>
        <div v-if="bhLoading" class="text-sm text-gray-400">Loading…</div>
        <div v-else class="space-y-3">
          <div v-for="day in businessHours" :key="day.dayOfWeek" class="flex items-center gap-4">
            <span class="w-24 text-sm text-gray-700">{{ DAY_NAMES[day.dayOfWeek] }}</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                :checked="day.isEnabled"
                class="sr-only peer"
                @change="toggleDay(day)"
              />
              <div
                class="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"
              />
            </label>
            <template v-if="day.isEnabled">
              <input
                v-model="day.startTime"
                type="time"
                class="input w-32 text-sm"
                @change="saveDay(day)"
              />
              <span class="text-gray-400 text-sm">–</span>
              <input
                v-model="day.endTime"
                type="time"
                class="input w-32 text-sm"
                @change="saveDay(day)"
              />
            </template>
            <span v-else class="text-sm text-gray-400 italic">Closed</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ClipboardIcon } from '@heroicons/vue/24/outline'
import type { BusinessHours } from '~/types'

definePageMeta({ middleware: 'auth' })

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const { user } = useAuth()
const { $api } = useNuxtApp()
const config = useRuntimeConfig()
const apiBase = `${config.public.baseUrl}/api`
const saving = ref(false)
const form = reactive({
  firstName: user.value?.firstName ?? '',
  lastName: user.value?.lastName ?? '',
})
const pwd = reactive({ current: '', next: '', confirm: '' })

const businessHours = ref<BusinessHours[]>([])
const bhLoading = ref(true)

onMounted(async () => {
  try {
    businessHours.value = await $api.get('/business-hours')
  } finally {
    bhLoading.value = false
  }
})

async function toggleDay(day: BusinessHours) {
  day.isEnabled = !day.isEnabled
  await $api.patch(`/business-hours/${day.dayOfWeek}`, { isEnabled: day.isEnabled })
}

async function saveDay(day: BusinessHours) {
  await $api.patch(`/business-hours/${day.dayOfWeek}`, {
    startTime: day.startTime,
    endTime: day.endTime,
  })
}

async function updateProfile() {
  saving.value = true
  await $api.patch(`/users/${user.value?.id}`, form)
  saving.value = false
}

async function copy(text: string) {
  await navigator.clipboard.writeText(text)
}
</script>
