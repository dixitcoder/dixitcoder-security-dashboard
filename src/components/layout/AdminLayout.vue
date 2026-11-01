<template>
  <div class="dashboard-layout min-h-screen xl:flex">
    <a class="skip-to-content" href="#dashboard-main">Skip to main content</a>
    <app-sidebar />
    <Backdrop />
    <div
      class="flex-1 transition-all duration-300 ease-in-out"
      :class="[isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]']"
    >
      <app-header />
      <main
        id="dashboard-main"
        class="dashboard-content p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6"
        tabindex="-1"
      >
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { useSidebar } from '@/composables/useSidebar'
import Backdrop from './Backdrop.vue'
const { isExpanded, isHovered } = useSidebar()
</script>
