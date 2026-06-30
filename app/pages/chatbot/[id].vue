<template>
  <div class="p-6 max-w-3xl">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/chatbot" class="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
        <ChevronLeftIcon class="w-5 h-5" />
      </NuxtLink>
      <h1 class="text-xl font-bold text-gray-900 dark:text-slate-100">{{ bot?.name ?? 'Flow Builder' }}</h1>
      <span v-if="saved" class="ml-2 text-xs text-green-600 font-medium">Saved ✓</span>
    </div>

    <div v-if="loading" class="text-sm text-gray-400 dark:text-slate-500">Loading…</div>

    <template v-else-if="bot">
      <!-- Language setting -->
      <div class="card p-5 mb-6">
        <h2 class="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Language</h2>
        <div class="flex items-center gap-3">
          <select v-model="language" class="input w-56 text-sm">
            <option value="">Auto-detect from user message</option>
            <option value="en">English</option>
            <option value="km">Khmer (ភាសាខ្មែរ)</option>
            <option value="zh">Chinese (中文)</option>
            <option value="ja">Japanese (日本語)</option>
            <option value="ko">Korean (한국어)</option>
            <option value="th">Thai (ภาษาไทย)</option>
            <option value="vi">Vietnamese (Tiếng Việt)</option>
            <option value="fr">French (Français)</option>
            <option value="es">Spanish (Español)</option>
            <option value="ar">Arabic (العربية)</option>
          </select>
          <p class="text-xs text-gray-400 dark:text-slate-500">
            {{
              language
                ? `Bot always replies in the selected language.`
                : "Bot detects and mirrors the user's language automatically."
            }}
          </p>
        </div>
      </div>

      <!-- Flow Steps -->
      <div class="space-y-3 mb-6">
        <div v-for="(step, i) in steps" :key="i" class="card overflow-hidden">
          <!-- Step header -->
          <div class="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-slate-700/30 border-b border-gray-100 dark:border-slate-700">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {{ i + 1 }}
              </span>
              <span class="text-sm font-semibold text-gray-700 dark:text-slate-300">
                {{ step.trigger === 'keyword' ? 'Keyword Match' : step.trigger === 'greeting' ? 'Greeting' : 'Fallback' }}
              </span>
              <span v-if="step.useAI" class="badge bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800 text-[10px]">AI</span>
            </div>
            <button
              class="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Remove step"
              @click="removeStep(i)"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>

          <div class="p-5 space-y-4">
            <!-- Trigger -->
            <div>
              <label class="label">Trigger</label>
              <select v-model="step.trigger" class="input">
                <option value="keyword">Keyword match</option>
                <option value="greeting">Greeting (hi, hello, hey…)</option>
                <option value="fallback">Fallback (no match)</option>
              </select>
            </div>

            <!-- Keywords -->
            <div v-if="step.trigger === 'keyword'">
              <label class="label">
                Keywords <span class="text-gray-400 dark:text-slate-500 font-normal">(comma-separated)</span>
              </label>
              <input
                :value="(step.keywords ?? []).join(', ')"
                class="input"
                placeholder="price, hours, location"
                @input="setKeywords(step, ($event.target as HTMLInputElement).value)"
              >
              <p v-if="!(step.keywords ?? []).length" class="mt-1 text-[11px] text-amber-600">Add at least one keyword to trigger this step.</p>
            </div>

            <!-- Response mode toggle -->
            <div class="flex items-center justify-between rounded-lg border border-gray-200 dark:border-slate-600 px-4 py-3">
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-slate-300">Use AI to generate reply</p>
                <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">AI uses the bot's knowledge base and prompt</p>
              </div>
              <button
                type="button"
                class="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
                :class="step.useAI ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'"
                @click="step.useAI = !step.useAI"
              >
                <span
                  class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200"
                  :class="step.useAI ? 'translate-x-4' : 'translate-x-0'"
                />
              </button>
            </div>

            <!-- Static response -->
            <div v-if="!step.useAI">
              <label class="label">Static Response</label>
              <textarea
                v-model="step.response"
                rows="3"
                class="input resize-none"
                placeholder="Type the reply message…"
              />
              <p v-if="!step.response?.trim()" class="mt-1 text-[11px] text-amber-600">Response cannot be empty.</p>
            </div>
          </div>
        </div>

        <div v-if="steps.length === 0" class="card p-10 text-center">
          <BoltIcon class="w-8 h-8 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
          <p class="text-sm font-medium text-gray-500 dark:text-slate-400">No flow steps yet</p>
          <p class="text-xs text-gray-400 dark:text-slate-500 mt-1">Add a step below to start handling messages automatically.</p>
        </div>
      </div>

      <!-- Add step -->
      <button class="btn-secondary w-full mb-6 border-dashed" @click="addStep">
        <PlusIcon class="w-4 h-4" /> Add Step
      </button>

      <!-- Save -->
      <div class="flex justify-end">
        <button class="btn-primary" :disabled="saving" @click="save">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
          {{ saving ? 'Saving…' : 'Save Flow' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeftIcon, TrashIcon, BoltIcon, PlusIcon } from '@heroicons/vue/24/outline'
import type { Chatbot } from '~/types'
import { useChatbotService } from '~/services/chatbot.service'

interface FlowStep {
  trigger: 'keyword' | 'greeting' | 'fallback'
  keywords?: string[]
  response?: string
  useAI?: boolean
}

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const chatbotService = useChatbotService()
const toast = useToast()

const bot = ref<Chatbot | null>(null)
const steps = ref<FlowStep[]>([])
const language = ref('')
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)

onMounted(async () => {
  const data = await chatbotService.findOne(route.params.id as string)
  bot.value = data
  steps.value = (data.flows ?? []).map((s) => ({ ...(s as unknown as FlowStep) }))
  language.value = data.language ?? ''
  loading.value = false
})

function addStep() {
  steps.value.push({ trigger: 'keyword', keywords: [], response: '', useAI: false })
}

function removeStep(i: number) {
  steps.value.splice(i, 1)
}

function setKeywords(step: FlowStep, raw: string) {
  step.keywords = raw
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
}

async function save() {
  saving.value = true
  saved.value = false
  try {
    await chatbotService.update(route.params.id as string, {
      flows: steps.value,
      language: language.value || undefined,
    })
    saved.value = true
    toast.success('Flow saved')
    setTimeout(() => {
      saved.value = false
    }, 2500)
  } catch {
    toast.error('Failed to save flow')
  } finally {
    saving.value = false
  }
}
</script>
