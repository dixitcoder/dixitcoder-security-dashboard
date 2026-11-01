<template>
  <span
    class="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase"
    :class="badgeClasses"
    aria-label="Shortcut key"
  >
    {{ normalizedKeys }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    keys?: string
    tone?: 'neutral' | 'brand' | 'success'
  }>(),
  {
    keys: 'Enter',
    tone: 'neutral',
  },
)

const normalizedKeys = computed(() => props.keys.trim() || 'Enter')

const badgeClasses = computed(() => {
  switch (props.tone) {
    case 'brand':
      return 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-300'
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'
    default:
      return 'border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
  }
})
</script>
