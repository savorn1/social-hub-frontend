<template>
  <div class="p-6 max-w-3xl">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/chatbot" class="text-gray-400 hover:text-gray-600">
        <ChevronLeftIcon class="w-5 h-5" />
      </NuxtLink>
      <h1 class="text-xl font-bold text-gray-900">{{ bot?.name ?? 'Flow Builder' }}</h1>
      <span v-if="saved" class="ml-2 text-xs text-green-600 font-medium">Saved ✓</span>
    </div>

    <div v-if="loading" class="text-sm text-gray-400">Loading…</div>

    <template v-else-if="bot">
      <!-- Flow Steps -->
      <div class="space-y-4 mb-6">
        <div v-for="(step, i) in steps" :key="i" class="card p-5 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-gray-700">Step {{ i + 1 }}</span>
            <button
              class="text-gray-300 hover:text-red-500 transition-colors"
              @click="removeStep(i)"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>

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
            <label class="label"
              >Keywords <span class="text-gray-400 font-normal">(comma-separated)</span></label
            >
            <input
              :value="(step.keywords ?? []).join(', ')"
              class="input"
              placeholder="price, hours, location"
              @input="setKeywords(step, ($event.target as HTMLInputElement).value)"
            />
          </div>

          <!-- Response mode -->
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input v-model="step.useAI" type="checkbox" class="w-4 h-4 accent-blue-600" />
              <span class="text-sm text-gray-700">Use AI to generate reply</span>
            </label>
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
          </div>
          <div v-else class="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
            AI will generate a reply using the bot's knowledge base and prompt.
          </div>
        </div>

        <div v-if="steps.length === 0" class="card p-8 text-center text-gray-400 text-sm">
          No flow steps yet. Add one below to start handling messages automatically.
        </div>
      </div>

      <!-- Add step -->
      <button class="btn-secondary w-full mb-6" @click="addStep">+ Add Step</button>

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
import { ChevronLeftIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { Chatbot } from '~/types'
import { chatbotService } from '~/services/chatbot.service'

interface FlowStep {
  trigger: 'keyword' | 'greeting' | 'fallback'
  keywords?: string[]
  response?: string
  useAI?: boolean
}

definePageMeta({ middleware: 'auth' })

const route = useRoute()

const bot = ref<Chatbot | null>(null)
const steps = ref<FlowStep[]>([])
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)

onMounted(async () => {
  const data = await chatbotService.findOne(route.params.id as string)
  bot.value = data
  steps.value = (data.flows ?? []).map((s) => ({ ...s })) as FlowStep[]
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
  await chatbotService.update(route.params.id as string, { flows: steps.value })
  saving.value = false
  saved.value = true
  setTimeout(() => {
    saved.value = false
  }, 2500)
}
</script>
