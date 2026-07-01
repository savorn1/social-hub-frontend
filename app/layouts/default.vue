<template>
  <div class="fixed inset-0 flex bg-gray-50 dark:bg-slate-950 overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="flex flex-col bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 transition-all duration-300 ease-in-out flex-shrink-0 shadow-sm"
      :class="collapsed ? 'w-[64px]' : 'w-64'"
    >
      <!-- Brand -->
      <div
        class="flex items-center gap-3 px-3.5 h-[58px] border-b border-gray-100 dark:border-slate-800 flex-shrink-0"
        :class="collapsed ? 'justify-center' : ''"
      >
        <div
          class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200/60 dark:shadow-blue-900/40 ring-[3px] ring-blue-100 dark:ring-blue-900/40"
        >
          <ChatBubbleLeftRightIcon class="w-4 h-4 text-white" />
        </div>
        <span
          v-if="!collapsed"
          class="font-extrabold text-[15px] tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent select-none truncate"
        >SocialHub</span>
        <button
          v-if="!collapsed"
          class="ml-auto p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-300 dark:text-slate-600 hover:text-gray-500 dark:hover:text-slate-400 transition-colors"
          @click="collapsed = true"
        >
          <ChevronLeftIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Expand button when collapsed -->
      <button
        v-if="collapsed"
        class="mx-auto mt-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-300 dark:text-slate-600 hover:text-gray-500 dark:hover:text-slate-400 transition-colors"
        title="Expand sidebar"
        @click="collapsed = false"
      >
        <ChevronRightIcon class="w-4 h-4" />
      </button>

      <!-- Nav groups -->
      <nav class="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-none">
        <div v-for="group in navGroups" :key="group.label">
          <p
            v-if="!collapsed"
            class="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-slate-600 select-none"
          >
            {{ group.label }}
          </p>
          <div v-if="collapsed" class="h-px bg-gray-100 dark:bg-slate-800 mx-2 mb-2" />
          <div class="space-y-0.5">
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              :title="collapsed ? item.title : undefined"
              class="relative flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-800 dark:hover:text-slate-200 transition-all duration-150 group/nav"
              :class="collapsed ? 'justify-center' : ''"
              active-class="!bg-blue-50 dark:!bg-blue-950/50 !text-blue-700 dark:!text-blue-300"
            >
              <!-- Active left accent -->
              <span
                v-if="!collapsed && route.path.startsWith(item.to)"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-500"
              />
              <div class="relative flex-shrink-0">
                <component
                  :is="item.icon"
                  class="w-[18px] h-[18px] transition-transform duration-150 group-hover/nav:scale-105"
                />
                <span
                  v-if="item.dot"
                  class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-[1.5px] border-white dark:border-slate-900 shadow-sm"
                  :class="item.dot"
                />
              </div>
              <span v-if="!collapsed" class="truncate">{{ item.title }}</span>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- User profile — pinned to bottom -->
      <div class="flex-shrink-0 border-t border-gray-100 dark:border-slate-800 p-2.5">
        <template v-if="!collapsed">
          <div
            class="flex items-center gap-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50 px-3 py-2.5 cursor-default"
          >
            <div class="relative flex-shrink-0">
              <div
                class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-sm ring-2 ring-blue-100 dark:ring-blue-900/40 select-none"
              >
                <span class="text-[10px] font-bold text-white">{{
                  initials((user?.firstName ?? '') + ' ' + (user?.lastName ?? ''))
                }}</span>
              </div>
              <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white dark:border-slate-800" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-gray-800 dark:text-slate-100 truncate leading-tight">
                {{ user?.firstName }} {{ user?.lastName }}
              </p>
              <p class="text-[10px] text-gray-400 dark:text-slate-500 truncate">{{ user?.email }}</p>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex justify-center">
            <div
              class="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-sm ring-2 ring-blue-100 dark:ring-blue-900/40 select-none cursor-pointer hover:ring-blue-300 dark:hover:ring-blue-700 transition-all"
              :title="`${user?.firstName} ${user?.lastName}`"
              @click="collapsed = false"
            >
              <span class="text-xs font-bold text-white">{{
                initials((user?.firstName ?? '') + ' ' + (user?.lastName ?? ''))
              }}</span>
              <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white dark:border-slate-900" />
            </div>
          </div>
        </template>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top bar -->
      <header
        class="h-[58px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800 flex items-center px-5 gap-2 flex-shrink-0 shadow-sm"
      >
        <h1 class="flex-1 min-w-0 text-[15px] font-semibold text-gray-900 dark:text-slate-100 truncate">
          {{ pageTitle }}
        </h1>

        <!-- Dark mode toggle -->
        <button
          class="p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-300 transition-all hover:scale-105 active:scale-95"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggle"
        >
          <SunIcon v-if="isDark" class="w-5 h-5" />
          <MoonIcon v-else class="w-5 h-5" />
        </button>

        <CommonNotificationBell />

        <!-- User dropdown -->
        <div ref="userMenuRef" class="relative">
          <button
            class="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center select-none hover:scale-105 active:scale-95 transition-all duration-150 ring-2 ring-blue-100 dark:ring-blue-900/50 hover:ring-blue-300 dark:hover:ring-blue-700 shadow-sm"
            :title="`${user?.firstName} ${user?.lastName}`"
            @click="userMenuOpen = !userMenuOpen"
          >
            <span class="text-xs font-bold text-white">{{
              initials((user?.firstName ?? '') + ' ' + (user?.lastName ?? ''))
            }}</span>
            <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white dark:border-slate-900" />
          </button>

          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1"
          >
            <div
              v-if="userMenuOpen"
              class="absolute right-0 top-full mt-2.5 w-56 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700/60 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right"
            >
              <!-- User info header -->
              <div class="px-4 py-3.5 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-br from-blue-50/60 to-indigo-50/30 dark:from-blue-950/30 dark:to-indigo-950/20">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-blue-100 dark:ring-blue-900/40">
                    <span class="text-xs font-bold text-white">{{
                      initials((user?.firstName ?? '') + ' ' + (user?.lastName ?? ''))
                    }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate leading-tight">
                      {{ user?.firstName }} {{ user?.lastName }}
                    </p>
                    <p class="text-[11px] text-gray-400 dark:text-slate-500 truncate">{{ user?.email }}</p>
                  </div>
                </div>
              </div>
              <!-- Menu items -->
              <div class="p-1.5 space-y-0.5">
                <NuxtLink
                  to="/settings"
                  class="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  @click="userMenuOpen = false"
                >
                  <Cog6ToothIcon class="w-4 h-4 text-gray-400 dark:text-slate-500" />
                  Settings
                </NuxtLink>
                <button
                  class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  @click="logout"
                >
                  <ArrowRightEndOnRectangleIcon class="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950">
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
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)
const route = useRoute()
const { user, logout } = useAuth()
const { isDark, toggle, init } = useDarkMode()

onMounted(() => {
  init()
  document.addEventListener('click', (e) => {
    if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
      userMenuOpen.value = false
    }
  })
})

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
