<template>
  <button
    v-if="isMobileOpen"
    type="button"
    class="mobile-sidebar-backdrop fixed inset-0 border-0 p-0 bg-gray-900/50 z-9999 lg:hidden"
    aria-label="Close navigation menu"
    @click="toggleMobileSidebar"
  ></button>
</template>

<script setup lang="ts">
import { useSidebar } from '@/composables/useSidebar'
const { toggleMobileSidebar, isMobileOpen } = useSidebar()
</script>
