<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="HTTP Security Headers" />
    <main class="mx-auto grid max-w-5xl gap-5">
      <header class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <p class="text-xs font-bold tracking-widest text-cyan-700 dark:text-cyan-300">DEFENSIVE WEB CHECK</p>
        <h1 class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">HTTP Security Headers Checker</h1>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Review common browser security headers on a public site you own or are authorized to assess.</p>
        <form class="mt-5 flex flex-wrap gap-2" @submit.prevent="checkHeaders">
          <input v-model.trim="url" class="min-w-0 flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700" type="url" required placeholder="https://example.com" aria-label="Website URL" />
          <button class="rounded-lg bg-cyan-700 px-4 py-2 font-semibold text-white disabled:opacity-60" type="submit" :disabled="loading">{{ loading ? 'Checking…' : 'Check headers' }} <kbd class="ml-1 rounded bg-white/20 px-1 text-xs">Ctrl+Enter</kbd></button>
        </form>
        <p v-if="error" class="mt-3 text-sm text-red-600" role="alert">{{ error }}</p>
      </header>
      <section v-if="result" class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">HTTP {{ result.status }} · {{ result.url }}</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">A missing header is not automatically a vulnerability; assess it against your application and deployment.</p>
        <ul class="mt-4 divide-y divide-gray-200 dark:divide-gray-800">
          <li v-for="header in headerRows" :key="header.name" class="grid gap-1 py-3 sm:grid-cols-[220px_1fr]">
            <strong class="text-sm text-gray-900 dark:text-white"><span :class="header.value ? 'text-emerald-600' : 'text-amber-600'">{{ header.value ? 'Present' : 'Not detected' }}</span> · {{ header.name }}</strong>
            <code class="break-all text-xs text-gray-600 dark:text-gray-300">{{ header.value || header.guidance }}</code>
          </li>
        </ul>
      </section>
      <p class="text-xs text-gray-500">Checks use the configured backend. Redirects to other hosts are not followed.</p>
    </main>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import axios from 'axios'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { confirmResponsibleUse, recordCompletedScan } from '@/composables/useResponsibleUse'

interface HeaderResult { url: string; status: number; headers: Record<string, string> }
const url = ref('')
const result = ref<HeaderResult | null>(null)
const loading = ref(false)
const error = ref('')
const headerGuidance: Record<string, string> = {
  'content-security-policy': 'Consider a policy appropriate to the site.',
  'strict-transport-security': 'Enable HSTS after verifying HTTPS deployment.',
  'x-content-type-options': 'Recommended value: nosniff.',
  'x-frame-options': 'Use CSP frame-ancestors or X-Frame-Options for framing policy.',
  'referrer-policy': 'Choose an explicit referrer policy.',
  'permissions-policy': 'Review browser features the site needs.',
}
const headerRows = computed(() => Object.entries(headerGuidance).map(([name, guidance]) => ({
  name,
  guidance,
  value: Object.entries(result.value?.headers || {}).find(([key]) => key.toLowerCase() === name)?.[1] || '',
})))

function handleShortcut(event: KeyboardEvent): void {
  if (event.ctrlKey && event.key === 'Enter' && !event.altKey && !event.metaKey) {
    event.preventDefault()
    if (!loading.value && url.value) void checkHeaders()
  }
}

async function checkHeaders(): Promise<void> {
  if (!confirmResponsibleUse('HTTP security headers check', url.value)) return
  loading.value = true
  error.value = ''
  result.value = null
  const startedAt = Date.now()
  try {
    const { data } = await axios.post<HeaderResult>('/api/security-tools/headers', { url: url.value }, { timeout: 15000 })
    result.value = data
    recordCompletedScan('HTTP Security Headers', data.url, startedAt, headerRows.value)
  } catch (cause) {
    console.error('HTTP security headers check failed', cause)
    error.value = axios.isAxiosError(cause)
      ? cause.response?.data?.error || cause.message
      : cause instanceof Error ? cause.message : 'Header check failed.'
  } finally {
    loading.value = false
  }
}

onMounted(() => window.addEventListener('keydown', handleShortcut))
onUnmounted(() => window.removeEventListener('keydown', handleShortcut))
</script>
