<template>
  <Menu as="div" class="relative">
    <MenuButton
      class="relative p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-300 transition-all focus:outline-none"
    >
      <BellIcon class="w-5 h-5" />
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-50"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-50"
      >
        <span
          v-if="store.unreadCount > 0"
          class="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm"
        >
          {{ store.unreadCount > 9 ? '9+' : store.unreadCount }}
        </span>
      </Transition>
    </MenuButton>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="scale-95 opacity-0 -translate-y-1"
      enter-to-class="scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="scale-100 opacity-100 translate-y-0"
      leave-to-class="scale-95 opacity-0 -translate-y-1"
    >
      <MenuItems
        class="absolute right-0 mt-2 w-80 card shadow-xl z-50 focus:outline-none overflow-hidden origin-top-right"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700/60 bg-gradient-to-r from-gray-50/80 to-transparent dark:from-slate-700/30 dark:to-transparent">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-900 dark:text-slate-100">Notifications</span>
            <span
              v-if="store.unreadCount > 0"
              class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold"
            >
              {{ store.unreadCount }}
            </span>
          </div>
          <button
            v-if="store.unreadCount > 0"
            class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            @click="store.markAllAsRead()"
          >
            Mark all read
          </button>
        </div>

        <!-- List -->
        <div class="max-h-[340px] overflow-y-auto divide-y divide-gray-50 dark:divide-slate-700/50">
          <MenuItem v-for="n in store.items" :key="n.id" v-slot="{ active }">
            <button
              :class="[
                'w-full text-left px-3 py-3 flex gap-3 transition-colors group/item',
                active ? 'bg-gray-50 dark:bg-slate-700/40' : '',
                n.status === 'unread' ? 'bg-blue-50/50 dark:bg-blue-950/25' : '',
              ]"
              @click="store.markAsRead(n.id)"
            >
              <!-- Type icon -->
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                :class="typeConfig[n.type]?.bgClass ?? 'bg-gray-100 dark:bg-slate-700'"
              >
                <component
                  :is="typeConfig[n.type]?.icon ?? BellIcon"
                  class="w-4 h-4"
                  :class="typeConfig[n.type]?.iconClass ?? 'text-gray-500 dark:text-slate-400'"
                />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <p
                    class="text-sm leading-snug truncate"
                    :class="n.status === 'unread' ? 'font-semibold text-gray-900 dark:text-slate-100' : 'font-medium text-gray-700 dark:text-slate-300'"
                  >
                    {{ n.title }}
                  </p>
                  <span
                    v-if="n.status === 'unread'"
                    class="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"
                  />
                </div>
                <p v-if="n.body" class="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{{ n.body }}</p>
                <p class="text-[11px] text-gray-400 dark:text-slate-500 mt-1">{{ timeAgo(n.createdAt) }}</p>
              </div>
            </button>
          </MenuItem>

          <!-- Loading -->
          <div v-if="store.loading" class="divide-y divide-gray-50 dark:divide-slate-700/50">
            <div v-for="i in 3" :key="i" class="flex items-center gap-3 px-3 py-3 animate-pulse">
              <div class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-700 flex-shrink-0" />
              <div class="flex-1 space-y-1.5">
                <div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-3/4" />
                <div class="h-2.5 bg-gray-100 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div v-if="!store.items.length && !store.loading" class="px-4 py-10 text-center">
            <div class="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-700/60 flex items-center justify-center mx-auto mb-3">
              <BellIcon class="w-6 h-6 text-gray-300 dark:text-slate-500" />
            </div>
            <p class="text-sm font-medium text-gray-500 dark:text-slate-400">All caught up!</p>
            <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">No notifications yet</p>
          </div>
        </div>
      </MenuItems>
    </Transition>
  </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  BellIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CheckCircleIcon,
  UserIcon,
  AtSymbolIcon,
} from '@heroicons/vue/24/outline'
import type { Component } from 'vue'
import type { NotificationType } from '~/types'
import { timeAgo } from '~/utils'

const store = useNotificationStore()

const typeConfig: Record<NotificationType, { icon: Component; iconClass: string; bgClass: string }> = {
  new_conversation: {
    icon: ChatBubbleLeftRightIcon,
    iconClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
  },
  new_message: {
    icon: ChatBubbleOvalLeftEllipsisIcon,
    iconClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
  },
  assigned: {
    icon: UserIcon,
    iconClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-50 dark:bg-violet-900/30',
  },
  resolved: {
    icon: CheckCircleIcon,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/30',
  },
  mention: {
    icon: AtSymbolIcon,
    iconClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-900/30',
  },
}

let pollTimer: ReturnType<typeof setInterval>

onMounted(() => {
  store.fetchNotifications()
  store.fetchUnreadCount()
  pollTimer = setInterval(() => store.fetchUnreadCount(), 30_000)
})

onUnmounted(() => clearInterval(pollTimer))
</script>
