<template>
  <span :class="statusBadge(status)">{{ status }}</span>
</template>

<script setup lang="ts">
import type { ConversationStatus } from '~/types'
import { statusBadge } from '~/utils'

defineProps<{ status: ConversationStatus }>()
</script>
