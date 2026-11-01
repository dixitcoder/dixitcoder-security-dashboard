<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Security Dashboard" />
    <main class="mx-auto grid max-w-6xl gap-5">
      <header class="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div><p class="text-xs font-bold tracking-widest text-cyan-700 dark:text-cyan-300">DEFENSIVE OVERVIEW</p><h1 class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Security Dashboard</h1><p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Recent scans, alerts, monitored websites, and backend service status.</p></div>
        <RouterLink class="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white" to="/security-center">Open Security Center</RouterLink>
      </header>
      <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Security overview">
        <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><p class="text-sm text-gray-500">Saved scans</p><strong class="mt-2 block text-2xl text-gray-900 dark:text-white">{{ scanRecords.length }}</strong></article>
        <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><p class="text-sm text-gray-500">Unread alerts</p><strong class="mt-2 block text-2xl text-gray-900 dark:text-white">{{ unreadAlerts }}</strong></article>
        <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><p class="text-sm text-gray-500">Monitored websites</p><strong class="mt-2 block text-2xl text-gray-900 dark:text-white">{{ securityMonitors.length }}</strong></article>
        <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><p class="text-sm text-gray-500">Dashboard API</p><strong class="mt-2 block text-2xl" :class="apiStatus === 'online' ? 'text-emerald-600' : apiStatus === 'offline' ? 'text-red-600' : 'text-amber-600'">{{ apiStatus }}</strong><button class="mt-2 text-sm font-semibold text-cyan-700 dark:text-cyan-300" type="button" :disabled="apiStatus === 'checking'" @click="checkApiHealth">Refresh status <kbd class="ml-1 rounded border px-1 text-xs">R</kbd></button></article>
      </section>
      <section class="grid gap-5 lg:grid-cols-2">
        <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-center justify-between"><h2 class="font-bold text-gray-900 dark:text-white">Recent scans</h2><RouterLink class="text-sm text-cyan-700 dark:text-cyan-300" to="/scan-reports">View history</RouterLink></div>
          <ul v-if="scanRecords.length" class="mt-3 divide-y divide-gray-200 dark:divide-gray-800"><li v-for="scan in scanRecords.slice(0, 5)" :key="scan.id" class="py-3"><strong class="text-sm text-gray-900 dark:text-white">{{ scan.tool }}</strong><p class="break-all text-xs text-gray-500">{{ scan.target }} · {{ formatDate(scan.date) }}</p></li></ul>
          <p v-else class="mt-3 text-sm text-gray-500">No completed scans have been recorded on this device.</p>
        </article>
        <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-center justify-between"><h2 class="font-bold text-gray-900 dark:text-white">Recent alerts</h2><RouterLink class="text-sm text-cyan-700 dark:text-cyan-300" to="/settings">Notification settings</RouterLink></div>
          <ul v-if="dashboardNotifications.length" class="mt-3 divide-y divide-gray-200 dark:divide-gray-800"><li v-for="alert in dashboardNotifications.slice(0, 5)" :key="alert.id" class="py-3"><strong class="text-sm text-gray-900 dark:text-white">{{ alert.title }}</strong><p class="text-xs text-gray-500">{{ alert.message }} · {{ formatDate(alert.date) }}</p></li></ul>
          <p v-else class="mt-3 text-sm text-gray-500">No recent alerts.</p>
        </article>
      </section>
      <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div class="flex items-center justify-between"><h2 class="font-bold text-gray-900 dark:text-white">Monitored services</h2><RouterLink class="text-sm text-cyan-700 dark:text-cyan-300" to="/security-monitors">Manage monitors</RouterLink></div>
        <ul v-if="securityMonitors.length" class="mt-3 grid gap-3 sm:grid-cols-2"><li v-for="monitor in securityMonitors" :key="monitor.id" class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800"><strong class="break-all text-sm text-gray-900 dark:text-white">{{ monitor.target }}</strong><p class="mt-1 text-xs text-gray-500">{{ monitor.kind }} · {{ monitor.status }} · {{ monitor.lastMessage }}</p></li></ul>
        <p v-else class="mt-3 text-sm text-gray-500">No services are being monitored. <RouterLink class="text-cyan-700 dark:text-cyan-300" to="/security-monitors">Add a monitor</RouterLink>.</p>
        <p class="mt-4 text-xs text-gray-500">Website monitor checks run in this browser while the dashboard is open.</p>
      </section>
    </main>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { useDashboardPreferences } from '@/composables/useDashboardPreferences'
import { useApiHealth } from '@/composables/useApiHealth'
import { securityMonitors } from '@/composables/useSecurityMonitors'

const { scanRecords, dashboardNotifications } = useDashboardPreferences()
const { apiStatus, checkApiHealth } = useApiHealth()
const unreadAlerts = computed(() => dashboardNotifications.value.filter((item) => !item.read).length)
let shortcutHandler: ((event: KeyboardEvent) => void) | undefined
onMounted(() => {
  shortcutHandler = (event: KeyboardEvent) => {
    const target = event.target
    const modalOpen = document.querySelector('[role="dialog"][aria-modal="true"]')
    if (event.key.toLowerCase() === 'r' && !event.ctrlKey && !event.metaKey && !event.altKey
      && !modalOpen
      && !(target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) {
      void checkApiHealth()
    }
  }
  window.addEventListener('keydown', shortcutHandler)
})
onUnmounted(() => { if (shortcutHandler) window.removeEventListener('keydown', shortcutHandler) })

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString()
}
</script>
