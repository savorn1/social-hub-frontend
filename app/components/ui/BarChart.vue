<template>
  <div class="w-full">
    <svg :viewBox="`0 0 ${W} ${H}`" :height="H" class="w-full overflow-visible" aria-hidden="true">
      <!-- Y grid lines -->
      <line
        v-for="tick in yTicks"
        :key="tick"
        x1="0"
        :x2="W"
        :y1="yPos(tick)"
        :y2="yPos(tick)"
        stroke="#f3f4f6"
        stroke-width="1"
      />

      <!-- Bars -->
      <g v-for="(bar, i) in bars" :key="bar.label">
        <!-- Bar fill -->
        <rect
          :x="bar.x"
          :y="yPos(bar.value)"
          :width="barW"
          :height="H - PAD_B - yPos(bar.value)"
          :fill="bar.color"
          rx="4"
          ry="4"
          class="transition-all duration-700 cursor-pointer"
          :opacity="hovered === i ? 1 : 0.85"
          @mouseenter="hovered = i"
          @mouseleave="hovered = -1"
        />
        <!-- Value label on top -->
        <text
          :x="bar.x + barW / 2"
          :y="yPos(bar.value) - 5"
          text-anchor="middle"
          class="text-[10px] font-semibold fill-gray-600 select-none"
          font-size="10"
          font-weight="600"
          fill="#4b5563"
        >
          {{ bar.value }}
        </text>
        <!-- X label -->
        <text
          :x="bar.x + barW / 2"
          :y="H - 4"
          text-anchor="middle"
          font-size="10"
          fill="#9ca3af"
          class="select-none"
        >
          {{ bar.label }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
interface Bar {
  label: string
  value: number
  color: string
}

const props = defineProps<{ bars: Bar[]; height?: number }>()

const W = 320
const H = props.height ?? 160
const PAD_B = 22 // bottom padding for x labels
const PAD_T = 20 // top padding for value labels

const hovered = ref(-1)

const maxVal = computed(() => Math.max(...props.bars.map((b) => b.value), 1))

const barW = computed(() => Math.floor((W / props.bars.length) * 0.55))
const gap = computed(() => (W - barW.value * props.bars.length) / (props.bars.length + 1))

const bars = computed(() =>
  props.bars.map((b, i) => ({
    ...b,
    x: gap.value + i * (barW.value + gap.value),
  }))
)

const yTicks = computed(() => {
  const steps = 4
  return Array.from({ length: steps + 1 }, (_, i) => Math.round((maxVal.value / steps) * i))
})

function yPos(val: number) {
  const usable = H - PAD_B - PAD_T
  return PAD_T + usable * (1 - val / maxVal.value)
}
</script>
