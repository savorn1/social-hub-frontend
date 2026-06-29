<template>
  <div class="flex flex-col items-center">
    <!-- SVG donut -->
    <div class="relative">
      <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="-rotate-90">
        <!-- Track -->
        <circle :cx="cx" :cy="cy" :r="r" fill="none" stroke="#f3f4f6" :stroke-width="sw" />
        <!-- Segments -->
        <circle
          v-for="(arc, i) in arcs"
          :key="i"
          :cx="cx"
          :cy="cy"
          :r="r"
          fill="none"
          :stroke="arc.color"
          :stroke-width="sw"
          stroke-linecap="butt"
          :stroke-dasharray="`${arc.len} ${circ}`"
          :stroke-dashoffset="-arc.start"
          style="
            transition:
              stroke-dasharray 0.7s ease,
              stroke-dashoffset 0.7s ease;
          "
        />
      </svg>

      <!-- Centre label -->
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-3xl font-bold text-gray-900 tabular-nums leading-none">{{ total }}</span>
        <span class="text-xs text-gray-400 mt-1">total</span>
      </div>
    </div>

    <!-- Legend -->
    <div class="w-full mt-5 space-y-2.5">
      <div v-for="seg in segments" :key="seg.label" class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: seg.color }" />
        <span class="text-sm text-gray-600 flex-1">{{ seg.label }}</span>
        <span class="text-sm font-semibold text-gray-800 tabular-nums">{{ seg.value }}</span>
        <span class="text-xs text-gray-400 tabular-nums w-8 text-right">
          {{ total ? Math.round((seg.value / total) * 100) : 0 }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Segment {
  label: string
  value: number
  color: string
}

const props = defineProps<{
  segments: Segment[]
  size?: number
  strokeWidth?: number
}>()

const size = props.size ?? 180
const sw = props.strokeWidth ?? 26
const cx = size / 2
const cy = size / 2
const r = (size - sw) / 2
const circ = 2 * Math.PI * r
const GAP = 3

const total = computed(() => props.segments.reduce((s, seg) => s + seg.value, 0))

const arcs = computed(() => {
  if (!total.value) return []
  let start = 0
  return props.segments
    .filter((seg) => seg.value > 0)
    .map((seg) => {
      const len = Math.max(0, (seg.value / total.value) * circ - GAP)
      const arc = { ...seg, len, start }
      start += len + GAP
      return arc
    })
})
</script>
