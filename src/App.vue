<template>
  <ThemeProvider>
    <SidebarProvider>
      <RouterView v-slot="{ Component, route }">
        <Transition name="page-transition" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
      <ScanTaskStatus />
    </SidebarProvider>
    <CursorAura />
  </ThemeProvider>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import ThemeProvider from './components/layout/ThemeProvider.vue'
import SidebarProvider from './components/layout/SidebarProvider.vue'
import ScanTaskStatus from './components/layout/ScanTaskStatus.vue'
import CursorAura from './components/layout/CursorAura.vue'
import { startApiHealthMonitor } from './composables/useApiHealth'
import { startSecurityMonitors } from './composables/useSecurityMonitors'

onMounted(() => {
  startApiHealthMonitor()
  startSecurityMonitors()
})
</script>
