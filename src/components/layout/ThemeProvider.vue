<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, watch, computed } from 'vue'
import { preferences } from '@/composables/useDashboardPreferences'

type Theme = 'light' | 'dark'

const theme = ref<Theme>(preferences.value.theme)
const isInitialized = ref(false)

const isDarkMode = computed(() => theme.value === 'dark')

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

onMounted(() => {
  const initialTheme = preferences.value.theme

  theme.value = initialTheme
  isInitialized.value = true
})

watch([theme, isInitialized], ([newTheme, newIsInitialized]) => {
  if (newIsInitialized) {
    preferences.value.theme = newTheme
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
})

watch(() => preferences.value.theme, (savedTheme) => {
  theme.value = savedTheme
})

provide('theme', {
  isDarkMode,
  toggleTheme,
})
</script>

<script lang="ts">
import { inject } from 'vue'

export function useTheme() {
  const theme = inject('theme')
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return theme
}
</script>
