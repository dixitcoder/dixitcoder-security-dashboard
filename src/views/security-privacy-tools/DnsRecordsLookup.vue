<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="DNS Records Lookup" />
    <main class="mx-auto grid max-w-5xl gap-5">
      <header class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <p class="text-xs font-bold tracking-widest text-cyan-700 dark:text-cyan-300">PUBLIC DNS LOOKUP</p>
        <h1 class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">DNS Records Lookup</h1>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Look up A, MX, TXT, and NS records for a hostname.</p>
        <form class="mt-5 flex flex-wrap gap-2" @submit.prevent="lookup">
          <input v-model.trim="host" class="min-w-0 flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700" type="text" required placeholder="example.com" aria-label="Hostname" />
          <button class="rounded-lg bg-cyan-700 px-4 py-2 font-semibold text-white disabled:opacity-60" type="submit" :disabled="loading">{{ loading ? 'Looking up…' : 'Look up records' }} <kbd class="ml-1 rounded bg-white/20 px-1 text-xs">Ctrl+Enter</kbd></button>
        </form>
        <p v-if="error" class="mt-3 text-sm text-red-600" role="alert">{{ error }}</p>
      </header>
      <section v-if="result" class="grid gap-4 sm:grid-cols-2">
        <article v-for="type in recordTypes" :key="type" class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 class="font-bold text-gray-900 dark:text-white">{{ type }} records <span class="text-xs font-normal text-gray-500">({{ result.records[type]?.length || 0 }})</span></h2>
          <pre v-if="result.records[type]?.length" class="mt-3 whitespace-pre-wrap break-all text-sm text-gray-700 dark:text-gray-300">{{ formatRecords(result.records[type]) }}</pre>
          <p v-else class="mt-3 text-sm text-gray-500">No records returned.</p>
        </article>
      </section>
    </main>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import axios from 'axios'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { recordCompletedScan } from '@/composables/useResponsibleUse'

type DnsRecord = string | { exchange: string; priority: number }
interface DnsResult { host: string; records: Record<string, DnsRecord[]> }
const recordTypes = ['A', 'MX', 'TXT', 'NS']
const host = ref('')
const result = ref<DnsResult | null>(null)
const loading = ref(false)
const error = ref('')

function handleShortcut(event: KeyboardEvent): void {
  if (event.ctrlKey && event.key === 'Enter' && !event.altKey && !event.metaKey) {
    event.preventDefault()
    if (!loading.value && host.value) void lookup()
  }
}

function formatRecords(records: DnsRecord[]): string {
  return records.map((record) => typeof record === 'string'
    ? record
    : `${record.exchange} (priority ${record.priority})`).join('\n')
}

async function lookup(): Promise<void> {
  loading.value = true
  error.value = ''
  result.value = null
  const startedAt = Date.now()
  try {
    const { data } = await axios.post<DnsResult>('/api/security-tools/dns-records', { host: host.value }, { timeout: 15000 })
    result.value = data
    recordCompletedScan('DNS Records Lookup', data.host, startedAt, Object.values(data.records).flat())
  } catch (cause) {
    console.error('DNS records lookup failed', cause)
    error.value = axios.isAxiosError(cause)
      ? cause.response?.data?.error || cause.message
      : cause instanceof Error ? cause.message : 'DNS lookup failed.'
  } finally {
    loading.value = false
  }
}

onMounted(() => window.addEventListener('keydown', handleShortcut))
onUnmounted(() => window.removeEventListener('keydown', handleShortcut))
</script>
