<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="API Diagnostics" />
    <main class="mx-auto grid max-w-5xl gap-5">
      <header class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <p class="text-[10px] font-bold tracking-[0.18em] text-cyan-700 dark:text-cyan-300">DIXITCODER · DIAGNOSTICS</p>
        <div class="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Backend API health</h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Checks <code>{{ healthEndpoint }}</code> only. This page never starts a scan.
            </p>
          </div>
          <button
            type="button"
            class="min-h-10 rounded-lg bg-cyan-700 px-4 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-60"
            :disabled="apiStatus === 'checking'"
            @click="checkApiHealth"
          >{{ apiStatus === 'checking' ? 'Checking…' : 'Run check now' }}</button>
        </div>
      </header>

      <section class="grid gap-4 sm:grid-cols-3" aria-label="API status details">
        <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p class="text-xs text-gray-500 dark:text-gray-400">Current status</p>
          <p class="mt-2 text-lg font-bold" :class="statusClass" role="status">{{ statusLabel }}</p>
          <p v-if="apiError" class="mt-2 break-words text-xs text-red-600 dark:text-red-300" role="alert">{{ apiError }}</p>
        </article>
        <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p class="text-xs text-gray-500 dark:text-gray-400">Response time</p>
          <p class="mt-2 text-lg font-bold text-gray-900 dark:text-white">
            {{ apiLatencyMs === null ? '—' : `${apiLatencyMs} ms` }}
          </p>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">5 second timeout</p>
        </article>
        <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p class="text-xs text-gray-500 dark:text-gray-400">Last checked</p>
          <time v-if="lastCheckedAt" class="mt-2 block text-sm font-semibold text-gray-900 dark:text-white" :datetime="lastCheckedAt">
            {{ formatDate(lastCheckedAt) }}
          </time>
          <p v-else class="mt-2 text-sm text-gray-500">No check completed yet.</p>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Health response must contain status: ok</p>
        </article>
      </section>

      <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 class="text-base font-bold text-gray-900 dark:text-white">Troubleshooting</h2>
        <ol class="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-300">
          <li>Confirm the DixitCoder backend is running and reachable (the development setup uses port 3001).</li>
          <li>Check <code>VITE_API_BASE_URL</code> if your backend is hosted at a different origin.</li>
          <li>Inspect the browser Network panel for connection, CORS, or HTTP errors from <code>/api/health</code>.</li>
          <li>If automatic checks are disabled, use “Run check now” or enable them in Settings.</li>
        </ol>
        <RouterLink class="mt-4 inline-flex text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-300" to="/settings">
          Open API refresh settings ↗
        </RouterLink>
      </section>
    </main>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { useApiHealth } from '@/composables/useApiHealth'
import { API_BASE_URL } from '@/services/api'

defineOptions({ name: 'ApiDiagnostics' })

const { apiStatus, apiError, apiLatencyMs, lastCheckedAt, checkApiHealth } = useApiHealth()
const healthEndpoint = `${API_BASE_URL}/api/health`
const statusLabel = computed(() => ({
  checking: 'Checking',
  online: 'Operational',
  offline: 'Unavailable',
})[apiStatus.value])
const statusClass = computed(() => ({
  checking: 'text-amber-600 dark:text-amber-300',
  online: 'text-emerald-600 dark:text-emerald-300',
  offline: 'text-red-600 dark:text-red-300',
})[apiStatus.value])

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Unknown time'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'long' }).format(date)
}
</script>
