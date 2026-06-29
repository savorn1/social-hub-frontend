<template>
  <Menu as="div" class="relative">
    <MenuButton
      class="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none"
    >
      <BellIcon class="w-5 h-5" />
      <span
        v-if="store.unreadCount > 0"
        class="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
      >
        {{ store.unreadCount > 9 ? '9+' : store.unreadCount }}
      </span>
    </MenuButton>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <MenuItems
        class="absolute right-0 mt-2 w-80 card shadow-lg z-50 focus:outline-none overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span class="text-sm font-semibold text-gray-900">Notifications</span>
          <button
            v-if="store.unreadCount > 0"
            class="text-xs text-blue-600 hover:text-blue-700 font-medium"
            @click="store.markAllAsRead()"
          >
            Mark all read
          </button>
        </div>

        <!-- List -->
        <div class="max-h-80 overflow-y-auto divide-y divide-gray-50">
          <MenuItem v-for="n in store.items" :key="n.id" v-slot="{ active }">
            <button
              :class="[
                'w-full text-left px-4 py-3 flex gap-3 transition-colors',
                active ? 'bg-gray-50' : '',
                n.status === 'unread' ? 'bg-blue-50' : '',
              ]"
              @click="store.markAsRead(n.id)"
            >
              <span
                class="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
                :class="n.status === 'unread' ? 'bg-blue-500' : 'bg-gray-300'"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ n.title }}</p>
                <p v-if="n.body" class="text-xs text-gray-500 mt-0.5 truncate">{{ n.body }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ timeAgo(n.createdAt) }}</p>
              </div>
            </button>
          </MenuItem>

          <div v-if="!store.items.length" class="px-4 py-8 text-center text-sm text-gray-400">
            No notifications
          </div>
        </div>
      </MenuItems>
    </Transition>
  </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { BellIcon } from '@heroicons/vue/24/outline'
import { timeAgo } from '~/utils'

const store = useNotificationStore()
onMounted(() => {
  store.fetchNotifications()
  store.fetchUnreadCount()
})
</script>
