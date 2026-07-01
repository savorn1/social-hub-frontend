<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 lg:p-8 relative overflow-hidden"
    style="background: radial-gradient(ellipse at 20% 50%, #0c1a3a 0%, #070d1f 50%, #06091a 100%)"
  >
    <!-- Background orbs -->
    <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-700/10 rounded-full blur-[120px] pointer-events-none" />
    <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-700/10 rounded-full blur-[100px] pointer-events-none" />

    <!-- Card -->
    <div class="relative w-full max-w-[880px] flex rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7)] ring-1 ring-white/10">

      <!-- ── Left: Brand panel ─────────────────────────────────────── -->
      <div
        class="hidden lg:flex lg:w-[44%] flex-col p-10 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900"
      >
        <!-- Inner orbs -->
        <div class="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div class="absolute bottom-10 -left-10 w-48 h-48 bg-blue-300/10 rounded-full blur-2xl pointer-events-none" />
        <!-- Dot grid pattern -->
        <div
          class="absolute inset-0 opacity-[0.07] pointer-events-none"
          style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 24px 24px"
        />

        <!-- Brand -->
        <div class="relative flex items-center gap-3 mb-10 z-10">
          <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/30">
            <ChatBubbleLeftRightIcon class="w-5 h-5 text-white" />
          </div>
          <span class="text-[17px] font-bold text-white tracking-tight">SocialHub</span>
        </div>

        <!-- Feature icon grid (2×2) -->
        <div class="relative grid grid-cols-2 gap-3 mb-8 z-10">
          <div
            v-for="f in featureIcons"
            :key="f.label"
            class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-start gap-2 ring-1 ring-white/20 hover:bg-white/20 transition-colors"
          >
            <component :is="f.icon" class="w-5 h-5 text-white/80" />
            <span class="text-[11px] font-medium text-white/70 leading-tight">{{ f.label }}</span>
          </div>
        </div>

        <!-- Headline -->
        <div class="relative z-10">
          <h2 class="text-[22px] font-bold text-white leading-snug mb-2">
            Customer Support<br>Simplified
          </h2>
          <p class="text-sm text-blue-100/75 leading-relaxed">
            Manage every conversation from one place — no tab switching, no missed messages.
          </p>
        </div>

        <!-- Feature list -->
        <ul class="relative z-10 mt-5 space-y-2">
          <li v-for="f in features" :key="f" class="flex items-center gap-2.5 text-sm text-blue-100/80">
            <span class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckIcon class="w-2.5 h-2.5 text-white" />
            </span>
            {{ f }}
          </li>
        </ul>

        <!-- Bottom: platform logos -->
        <div class="relative z-10 mt-auto pt-8">
          <p class="text-[11px] text-blue-200/50 uppercase tracking-widest mb-3 font-semibold">Supported platforms</p>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-white/20 ring-1 ring-white/20 flex items-center justify-center">
              <span class="text-white font-bold text-xs">f</span>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white/20 ring-1 ring-white/20 flex items-center justify-center">
              <PaperAirplaneIcon class="w-3.5 h-3.5 text-white" />
            </div>
            <div class="w-8 h-8 rounded-xl bg-white/20 ring-1 ring-white/20 flex items-center justify-center">
              <PhoneIcon class="w-3.5 h-3.5 text-white" />
            </div>
            <span class="text-xs text-blue-200/50 ml-1">+ more</span>
          </div>
        </div>
      </div>

      <!-- ── Right: Form panel ──────────────────────────────────────── -->
      <div class="flex-1 flex flex-col justify-center px-8 py-10 lg:px-10 bg-slate-900">
        <!-- Mobile brand -->
        <div class="lg:hidden flex items-center gap-2.5 mb-8">
          <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ChatBubbleLeftRightIcon class="w-4 h-4 text-white" />
          </div>
          <span class="text-base font-bold text-white">SocialHub</span>
        </div>

        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  CheckIcon,
  InboxIcon,
  BoltIcon,
  UsersIcon,
} from '@heroicons/vue/24/solid'
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/vue/24/outline'

const featureIcons = [
  { icon: ChatBubbleOvalLeftEllipsisIcon, label: 'Multi-channel inbox' },
  { icon: BoltIcon, label: 'AI automation' },
  { icon: InboxIcon, label: 'Smart routing' },
  { icon: UsersIcon, label: 'Team collaboration' },
]

const features = [
  'AI auto-replies with knowledge base',
  'Route conversations to agents',
  'Chatbot flow builder',
]
</script>
