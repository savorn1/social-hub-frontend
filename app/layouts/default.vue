<template>
  <div class="fixed inset-0 flex bg-gray-50/80 dark:bg-slate-950 overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="flex flex-col bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-700 shadow-sidebar transition-all duration-200 flex-shrink-0"
      :class="collapsed ? 'w-[68px]' : 'w-64'"
    >
      <!-- Brand -->
      <div
        class="flex items-center gap-3 px-4 h-14 border-b border-gray-100 dark:border-slate-700 flex-shrink-0"
      >
        <div
          class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-200 dark:shadow-blue-900"
        >
          <ChatBubbleLeftRightIcon class="w-4 h-4 text-white" />
        </div>
        <span
          v-if="!collapsed"
          class="font-bold text-gray-900 dark:text-slate-100 truncate tracking-tight text-[15px]"
          >SocialHub</span
        >
        <button
          v-if="!collapsed"
          class="ml-auto p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          @click="collapsed = true"
        >
          <ChevronLeftIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- User profile -->
      <div
        class="flex-shrink-0 border-b border-gray-100 dark:border-slate-700"
        :class="collapsed ? 'flex justify-center py-3' : 'px-3 py-3'"
      >
        <template v-if="!collapsed">
          <div
            class="flex items-center gap-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-3 py-2.5"
          >
            <div
              class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm select-none"
            >
              <span class="text-xs font-bold text-white">{{
                initials((user?.firstName ?? '') + ' ' + (user?.lastName ?? ''))
              }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate leading-tight">
                {{ user?.firstName }} {{ user?.lastName }}
              </p>
              <p class="text-[11px] text-gray-500 dark:text-slate-400 truncate">{{ user?.email }}</p>
            </div>
            <button
              class="p-1 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-300 transition-colors flex-shrink-0"
              title="Logout"
              @click="logout"
            >
              <ArrowRightEndOnRectangleIcon class="w-4 h-4" />
            </button>
          </div>
        </template>
        <template v-else>
          <div
            class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm select-none cursor-pointer"
            :title="`${user?.firstName} ${user?.lastName}`"
            @click="collapsed = false"
          >
            <span class="text-xs font-bold text-white">{{
              initials((user?.firstName ?? '') + ' ' + (user?.lastName ?? ''))
            }}</span>
          </div>
        </template>
      </div>

      <!-- Expand button when collapsed -->
      <button
        v-if="collapsed"
        class="mx-auto mt-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
        title="Expand sidebar"
        @click="collapsed = false"
      >
        <ChevronRightIcon class="w-4 h-4" />
      </button>

      <!-- Nav groups -->
      <nav class="flex-1 overflow-y-auto py-3 px-3 space-y-4 scrollbar-none">
        <div v-for="group in navGroups" :key="group.label">
          <p
            v-if="!collapsed"
            class="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 select-none"
          >
            {{ group.label }}
          </p>
          <div v-if="collapsed" class="h-px bg-gray-100 dark:bg-slate-700 mx-1 mb-2" />
          <div class="space-y-0.5">
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              :title="collapsed ? item.title : undefined"
              class="flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-slate-200 transition-all duration-100 group/nav"
              :class="collapsed ? 'justify-center' : ''"
              active-class="!bg-blue-600 !text-white hover:!bg-blue-700 hover:!text-white shadow-nav-active"
            >
              <div class="relative flex-shrink-0">
                <component
                  :is="item.icon"
                  class="w-5 h-5 transition-transform duration-100 group-hover/nav:scale-105"
                />
                <span
                  v-if="item.dot"
                  class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-[1.5px] border-white dark:border-slate-900"
                  :class="item.dot"
                />
              </div>
              <span v-if="!collapsed" class="truncate">{{ item.title }}</span>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- Settings link at bottom -->
      <div class="border-t border-gray-100 dark:border-slate-700 p-3 flex-shrink-0">
        <NuxtLink
          to="/settings"
          :title="collapsed ? 'Settings' : undefined"
          class="flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
          :class="collapsed ? 'justify-center' : ''"
          active-class="!bg-blue-600 !text-white hover:!bg-blue-700 shadow-nav-active"
        >
          <Cog6ToothIcon class="w-5 h-5 flex-shrink-0" />
          <span v-if="!collapsed">Settings</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top bar -->
      <header
        class="h-14 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 flex items-center px-6 gap-3 flex-shrink-0 shadow-topbar"
      >
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <h1 class="text-base font-semibold text-gray-900 dark:text-slate-100 truncate">{{ pageTitle }}</h1>
        </div>
        <!-- Dark mode toggle -->
        <button
          class="p-2 rounded-lg text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggle"
        >
          <SunIcon v-if="isDark" class="w-5 h-5" />
          <MoonIcon v-else class="w-5 h-5" />
        </button>
        <CommonNotificationBell />
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto bg-gray-50/80 dark:bg-slate-950">
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
  PaperAirplaneIcon,
  PhoneIcon,
  BoltIcon,
  BookOpenIcon,
  DocumentTextIcon,
  UsersIcon,
  UserGroupIcon,
  ShareIcon,
  ShieldCheckIcon,
  SunIcon,
  MoonIcon,
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
const { isDark, toggle, init } = useDarkMode()
onMounted(init)

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
      { title: 'Telegram', icon: PaperAirplaneIcon, to: '/telegram', dot: 'bg-sky-400' },
      { title: 'WhatsApp', icon: PhoneIcon, to: '/whatsapp', dot: 'bg-green-500' },
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
