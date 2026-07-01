<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-white">Create your account</h2>
      <p class="text-sm text-slate-400 mt-1">Start managing all your conversations in one place</p>
    </div>

    <div
      v-if="error"
      class="mb-4 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400"
    >
      <ExclamationCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
      {{ error }}
    </div>

    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="label-dark uppercase tracking-wider text-xs" for="firstName">First Name</label>
          <div class="relative">
            <UserIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              class="input-dark pl-10"
              placeholder="John"
              required
            />
          </div>
        </div>
        <div>
          <label class="label-dark uppercase tracking-wider text-xs" for="lastName">Last Name</label>
          <div class="relative">
            <UserIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              class="input-dark pl-10"
              placeholder="Doe"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <label class="label-dark uppercase tracking-wider text-xs" for="email">Email Address</label>
        <div class="relative">
          <EnvelopeIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="input-dark pl-10"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <div>
        <label class="label-dark uppercase tracking-wider text-xs" for="password">Password</label>
        <div class="relative">
          <LockClosedIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            id="password"
            v-model="form.password"
            :type="showPwd ? 'text' : 'password'"
            class="input-dark pl-10 pr-10"
            placeholder="Min. 8 characters"
            minlength="8"
            required
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            @click="showPwd = !showPwd"
          >
            <EyeSlashIcon v-if="showPwd" class="w-4 h-4" />
            <EyeIcon v-else class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <label class="label-dark uppercase tracking-wider text-xs" for="confirm">Confirm Password</label>
        <div class="relative">
          <LockClosedIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            id="confirm"
            v-model="form.confirm"
            :type="showConfirm ? 'text' : 'password'"
            class="input-dark pl-10 pr-10"
            :class="mismatch ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30' : ''"
            placeholder="Re-enter your password"
            required
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            @click="showConfirm = !showConfirm"
          >
            <EyeSlashIcon v-if="showConfirm" class="w-4 h-4" />
            <EyeIcon v-else class="w-4 h-4" />
          </button>
        </div>
        <p v-if="mismatch" class="mt-1 text-xs text-red-400">Passwords do not match</p>
      </div>

      <button
        type="submit"
        class="btn-primary w-full justify-center py-2.5 mt-2"
        :disabled="loading || mismatch"
      >
        <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        {{ loading ? 'Creating account…' : 'Create Account' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Already have an account?
      <NuxtLink to="/login" class="font-medium text-blue-400 hover:text-blue-300 transition-colors">Sign in</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon, EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/vue/24/outline'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { register } = useAuth()
const error = ref<string | null>(null)
const loading = ref(false)
const showPwd = ref(false)
const showConfirm = ref(false)
const form = reactive({ firstName: '', lastName: '', email: '', password: '', confirm: '' })

const mismatch = computed(() => form.confirm.length > 0 && form.password !== form.confirm)

async function submit() {
  if (mismatch.value) return
  loading.value = true
  error.value = null
  try {
    await register(form.firstName, form.lastName, form.email, form.password)
  } catch (e: unknown) {
    error.value =
      (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
