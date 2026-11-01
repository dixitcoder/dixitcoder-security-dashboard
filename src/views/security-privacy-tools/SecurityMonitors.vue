<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Website Monitors" />
    <main class="mx-auto grid max-w-5xl gap-5">
      <header class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <p class="text-xs font-bold tracking-widest text-cyan-700 dark:text-cyan-300">LOCAL WEBSITE MONITORING</p>
        <h1 class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Uptime & SSL Expiry Monitors</h1>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Checks are saved in this browser and run while the dashboard is open. This is not a hosted, always-on monitoring service.</p>
        <form class="mt-5 grid gap-3 sm:grid-cols-[150px_1fr_150px_auto]" @submit.prevent="add">
          <select v-model="kind" class="rounded-lg border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700" aria-label="Monitor type">
            <option value="uptime">Uptime</option><option value="ssl">SSL expiry</option>
          </select>
          <input v-model.trim="target" class="min-w-0 rounded-lg border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700" :type="kind === 'uptime' ? 'url' : 'text'" required :placeholder="kind === 'uptime' ? 'https://example.com' : 'example.com'" aria-label="Website or domain" />
          <select v-model.number="intervalMinutes" class="rounded-lg border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700" aria-label="Check interval">
            <option :value="5">Every 5 minutes</option><option :value="15">Every 15 minutes</option><option :value="60">Every hour</option>
          </select>
          <button class="rounded-lg bg-cyan-700 px-4 py-2 font-semibold text-white" type="submit">Add monitor <kbd class="ml-1 rounded bg-white/20 px-1 text-xs">Ctrl+Enter</kbd></button>
        </form>
        <p v-if="message" class="mt-3 text-sm text-red-600" role="alert">{{ message }}</p>
      </header>
      <section class="grid gap-3">
        <article v-for="(monitor, index) in securityMonitors" :key="monitor.id" class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ monitor.kind }} · every {{ monitor.intervalMinutes }} min</p>
            <h2 class="mt-1 break-all font-bold text-gray-900 dark:text-white">{{ monitor.target }}</h2>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">{{ monitor.lastMessage }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ monitor.lastCheckedAt ? `Last checked ${formatDate(monitor.lastCheckedAt)}` : 'Waiting for first check' }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="rounded-full px-3 py-1 text-xs font-bold" :class="statusClass(monitor.status)">{{ monitor.status }}</span>
            <button type="button" class="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700" @click="checkSecurityMonitor(monitor.id, true)">Check now <kbd v-if="index < 9" class="ml-1 rounded border px-1 text-xs">Ctrl+Shift+{{ index + 1 }}</kbd></button>
            <button type="button" class="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50" @click="removeSecurityMonitor(monitor.id)">Remove <kbd v-if="index < 9" class="ml-1 rounded border px-1 text-xs">Ctrl+Alt+{{ index + 1 }}</kbd></button>
          </div>
        </article>
        <p v-if="!securityMonitors.length" class="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">No monitors yet. Add an authorized website above.</p>
      </section>
    </main>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { addSecurityMonitor, checkSecurityMonitor, removeSecurityMonitor, securityMonitors } from '@/composables/useSecurityMonitors'
import { confirmResponsibleUse } from '@/composables/useResponsibleUse'

const kind = ref<'uptime' | 'ssl'>('uptime')
const target = ref('')
const intervalMinutes = ref(5)
const message = ref('')

function add(): void {
  message.value = ''
  const value = target.value.trim()
  if (kind.value === 'uptime') {
    try {
      const parsed = new URL(value)
      if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error()
    } catch {
      message.value = 'Enter a valid public HTTP or HTTPS website URL.'
      return
    }
  } else if (!/^(?=.{1,253}$)(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)(?:\.(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?))*\.?$/i.test(value)) {
    message.value = 'Enter a valid domain name.'
    return
  }
  if (securityMonitors.value.some((monitor) => monitor.kind === kind.value && monitor.target.toLowerCase() === value.toLowerCase())) {
    message.value = 'This monitor already exists.'
    return
  }
  if (!confirmResponsibleUse(`${kind.value} monitoring`, value)) return
  addSecurityMonitor(kind.value, value, intervalMinutes.value)
  target.value = ''
}

function handleShortcut(event: KeyboardEvent): void {
  if (event.key === 'Enter' && event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault()
    if (target.value) add()
    return
  }
  if (!event.ctrlKey || event.metaKey || !/^Digit[1-9]$/.test(event.code)) return
  const monitor = securityMonitors.value[Number(event.code.slice(-1)) - 1]
  if (!monitor) return
  if (event.shiftKey && !event.altKey) {
    event.preventDefault()
    void checkSecurityMonitor(monitor.id, true)
  } else if (event.altKey && !event.shiftKey) {
    event.preventDefault()
    removeSecurityMonitor(monitor.id)
  }
}

function statusClass(status: string): string {
  if (status === 'up' || status === 'valid') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  if (status === 'down' || status === 'expiring' || status === 'error') return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString()
}

onMounted(() => window.addEventListener('keydown', handleShortcut))
onUnmounted(() => window.removeEventListener('keydown', handleShortcut))
</script>
