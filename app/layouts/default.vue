<template>
  <div class="fixed inset-0 flex bg-gray-50 overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="flex flex-col bg-gray-900 transition-all duration-200 flex-shrink-0"
      :class="collapsed ? 'w-16' : 'w-60'"
    >
      <!-- Brand -->
      <div class="flex items-center gap-3 px-4 h-14 border-b border-gray-800/80 flex-shrink-0">
        <div
          class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/30"
        >
          <ChatBubbleLeftRightIcon class="w-4 h-4 text-white" />
        </div>
        <span v-if="!collapsed" class="font-bold text-white truncate tracking-tight"
          >SocialHub</span
        >
        <button
          v-if="!collapsed"
          class="ml-auto p-1 rounded hover:bg-gray-800 text-gray-600 hover:text-gray-300 transition-colors"
          @click="collapsed = true"
        >
          <ChevronLeftIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Expand button when collapsed -->
      <button
        v-if="collapsed"
        class="mx-auto mt-3 p-1.5 rounded hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
        @click="collapsed = false"
      >
        <ChevronRightIcon class="w-4 h-4" />
      </button>

      <!-- Nav groups -->
      <nav class="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-none">
        <div v-for="group in navGroups" :key="group.label">
          <p
            v-if="!collapsed"
            class="px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600 select-none"
          >
            {{ group.label }}
          </p>
          <div v-if="collapsed" class="h-px bg-gray-800/60 mx-2 mb-1" />
          <div class="space-y-0.5">
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              :title="collapsed ? item.title : undefined"
              class="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/80 hover:text-gray-100 transition-all duration-100 group/nav"
              :class="collapsed ? 'justify-center' : ''"
              active-class="!bg-blue-600/15 !text-blue-300 hover:!bg-blue-600/20 hover:!text-blue-200"
            >
              <div class="relative flex-shrink-0">
                <component
                  :is="item.icon"
                  class="w-5 h-5 transition-transform duration-100 group-hover/nav:scale-110"
                />
                <span
                  v-if="item.dot"
                  class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-[1.5px] border-gray-900"
                  :class="item.dot"
                />
              </div>
              <span v-if="!collapsed" class="truncate">{{ item.title }}</span>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- User profile -->
      <div class="border-t border-gray-800/80 p-3 flex-shrink-0">
        <div class="flex items-center gap-2.5" :class="collapsed ? 'justify-center' : ''">
          <div
            class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 select-none ring-2 ring-gray-800 shadow"
          >
            <span class="text-xs font-bold text-white">{{
              initials((user?.firstName ?? '') + ' ' + (user?.lastName ?? ''))
            }}</span>
          </div>
          <template v-if="!collapsed">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-200 truncate leading-tight">
                {{ user?.firstName }} {{ user?.lastName }}
              </p>
              <p class="text-[11px] text-gray-500 truncate">{{ user?.email }}</p>
            </div>
            <button
              class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors flex-shrink-0"
              title="Logout"
              @click="logout"
            >
              <ArrowRightEndOnRectangleIcon class="w-4 h-4" />
            </button>
          </template>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
      <!-- Top bar -->
      <header
        class="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-3 flex-shrink-0 shadow-sm"
      >
        <h1 class="text-base font-semibold text-gray-900 flex-1">{{ pageTitle }}</h1>
        <CommonNotificationBell />
        <NuxtLink
          to="/settings"
          class="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          active-class="bg-blue-50 text-blue-600"
        >
          <Cog6ToothIcon class="w-5 h-5" />
        </NuxtLink>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  ArrowRightEndOnRectangleIcon,
  HomeIcon,
  InboxIcon,
  ChatBubbleOvalLeftIcon,
  BoltIcon,
  BookOpenIcon,
  DocumentTextIcon,
  UsersIcon,
  UserGroupIcon,
  ShareIcon,
  ShieldCheckIcon,
} from '@heroicons/vue/24/outline'
import type { Component } from 'vue'
import { initials } from '~/utils'

interface NavItem {
  title: string
  icon: Component
  to: string
  dot?: string
}
interface NavGroup {
  label: string
  items: NavItem[]
}

const collapsed = ref(false)
const route = useRoute()
const { user, logout } = useAuth()

const navGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { title: 'Dashboard', icon: HomeIcon, to: '/dashboard' },
      { title: 'Inbox', icon: InboxIcon, to: '/inbox' },
      { title: 'Contacts', icon: UserGroupIcon, to: '/contacts' },
    ],
  },
  {
    label: 'Channels',
    items: [
      { title: 'Facebook', icon: ChatBubbleOvalLeftIcon, to: '/facebook', dot: 'bg-blue-500' },
      { title: 'Telegram', icon: ChatBubbleOvalLeftIcon, to: '/telegram', dot: 'bg-sky-400' },
      { title: 'WhatsApp', icon: ChatBubbleOvalLeftIcon, to: '/whatsapp', dot: 'bg-green-500' },
    ],
  },
  {
    label: 'AI & Automation',
    items: [
      { title: 'Chatbot', icon: BoltIcon, to: '/chatbot' },
      { title: 'Knowledge', icon: BookOpenIcon, to: '/knowledge' },
      { title: 'Prompts', icon: DocumentTextIcon, to: '/prompts' },
      { title: 'Routing Rules', icon: ShareIcon, to: '/routing-rules' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { title: 'Users', icon: UsersIcon, to: '/users' },
      { title: 'Roles', icon: ShieldCheckIcon, to: '/roles' },
    ],
  },
]

const allItems = navGroups.flatMap((g) => g.items)

const pageTitle = computed(() => {
  const match = allItems.find((i) => route.path.startsWith(i.to))
  return match?.title ?? 'SocialHub'
})
</script>
