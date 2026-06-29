<template>
  <div class="min-h-screen bg-gray-950 flex">
    <!-- Left panel: branding -->
    <div
      class="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30"
        >
          <ChatBubbleLeftRightIcon class="w-5 h-5 text-white" />
        </div>
        <span class="text-lg font-bold text-white">SocialHub</span>
      </div>

      <div>
        <blockquote class="text-2xl font-semibold text-white leading-snug mb-4">
          "Manage every customer conversation from one place — no tab switching, no missed
          messages."
        </blockquote>
        <div class="flex items-center gap-3 mt-6">
          <div class="flex -space-x-2">
            <div
              v-for="i in 3"
              :key="i"
              class="w-8 h-8 rounded-full bg-blue-500/20 border-2 border-gray-800 flex items-center justify-center"
            >
              <UserIcon class="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p class="text-sm text-gray-400">Trusted by support teams everywhere</p>
        </div>
      </div>

      <div class="flex gap-6">
        <div>
          <p class="text-2xl font-bold text-white">5+</p>
          <p class="text-sm text-gray-500 mt-0.5">Platforms</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-white">∞</p>
          <p class="text-sm text-gray-500 mt-0.5">Conversations</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-white">AI</p>
          <p class="text-sm text-gray-500 mt-0.5">Powered</p>
        </div>
      </div>
    </div>

    <!-- Right panel: form -->
    <div class="flex-1 flex flex-col items-center justify-center p-6">
      <!-- Mobile brand -->
      <div class="lg:hidden flex items-center gap-2 mb-8">
        <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
          <ChatBubbleLeftRightIcon class="w-4 h-4 text-white" />
        </div>
        <span class="text-base font-bold text-white">SocialHub</span>
      </div>

      <div class="w-full max-w-sm">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatBubbleLeftRightIcon, UserIcon } from '@heroicons/vue/24/solid'
</script>
