<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-white">Welcome back</h2>
      <p class="text-sm text-slate-400 mt-1">Sign in to your SocialHub account</p>
    </div>

    <div
      v-if="error"
      class="mb-4 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400"
    >
      <ExclamationCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
      {{ error }}
    </div>

    <form class="space-y-4" @submit.prevent="submit">
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
        <div class="flex items-center justify-between mb-1.5">
          <label class="label-dark uppercase tracking-wider text-xs mb-0" for="password">Password</label>
          <a href="#" class="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
        </div>
        <div class="relative">
          <LockClosedIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            id="password"
            v-model="form.password"
            :type="showPwd ? 'text' : 'password'"
            class="input-dark pl-10 pr-10"
            placeholder="••••••••"
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

      <button
        type="submit"
        class="btn-primary w-full justify-center py-2.5 mt-2"
        :disabled="loading"
      >
        <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        {{ loading ? 'Signing in…' : 'Sign In' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Don't have an account?
      <NuxtLink to="/register" class="font-medium text-blue-400 hover:text-blue-300 transition-colors">Sign up</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/vue/24/outline'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { login } = useAuth()
const error = ref<string | null>(null)
const loading = ref(false)
const showPwd = ref(false)
const form = reactive({ email: '', password: '' })

async function submit() {
  loading.value = true
  error.value = null
  try {
    await login(form.email, form.password)
  } catch (e: unknown) {
    error.value =
      (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>
