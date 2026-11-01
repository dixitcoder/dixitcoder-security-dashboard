<template>
  <admin-layout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="rounded-2xl border p-5">
      <h3 class="mb-5 text-lg font-semibold">🛡️ Advanced Network Scanner</h3>

      <section class="mb-5 rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-950/30" aria-labelledby="scan-target-heading">
        <h4 id="scan-target-heading" class="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">1. Target</h4>
        <div class="flex flex-col gap-3 md:flex-row">
        <label class="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
          Host or IP address
        <input
          v-model="host"
          placeholder="Enter host (e.g., 127.0.0.1)"
          autocomplete="off"
          class="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        </label>
        <label class="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
          Ports or ranges
        <input
          v-model="portString"
          placeholder="Enter ports (comma or ranges: 20-25,80,443)"
          class="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        </label>
        <button
          @click="scanPorts"
          :disabled="loading"
          :aria-busy="loading"
          class="mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 font-semibold text-white hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-60"
        >
          <span v-if="loading" class="dashboard-spinner" aria-hidden="true"></span>
          {{ loading ? 'Scanning…' : 'Run scan' }}
        </button>
      </div>
      </section>

      <!-- Scan Options -->
      <fieldset class="mb-5 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
        <legend class="px-2 text-sm font-semibold text-gray-800 dark:text-gray-100">2. Scan options</legend>
      <div class="flex flex-wrap gap-x-5 gap-y-3">
        <label class="inline-flex items-center gap-1">
          <input type="checkbox" v-model="options.tcp" /> TCP
        </label>
        <label class="inline-flex items-center gap-1">
          <input type="checkbox" v-model="options.udp" /> UDP
        </label>
        <label class="inline-flex items-center gap-1">
          <input type="checkbox" v-model="options.sctp" /> SCTP
        </label>
        <label class="inline-flex items-center gap-1">
          <input type="checkbox" v-model="options.rpc" /> RPC
        </label>
        <label class="inline-flex items-center gap-1">
          <input type="checkbox" v-model="options.banner" /> Service Banners
        </label>
        <label class="inline-flex items-center gap-1">
          <input type="checkbox" v-model="options.ssl" /> SSL/TLS Info
        </label>
        <label class="inline-flex items-center gap-1">
          <input type="checkbox" v-model="options.web" /> Web Server Info
        </label>
      </div>
      </fieldset>

      <p v-if="scanError" class="dashboard-error-state mb-4" role="alert">{{ scanError }}</p>

      <!-- Loading / Progress -->
      <div v-if="loading" class="mb-4">
        ⏳ Scanning... {{ progress }}/{{ totalPorts }}
        <div class="w-full bg-gray-200 rounded h-2 mt-2" role="progressbar" aria-label="Scan progress" :aria-valuenow="totalPorts ? Math.round((progress / totalPorts) * 100) : 0" aria-valuemin="0" aria-valuemax="100">
          <div
            class="bg-cyan-600 h-2 rounded transition-[width] duration-300"
            :style="{ width: ((progress / totalPorts) * 100) + '%' }"
          ></div>
        </div>
      </div>

      <!-- Scan Results -->
      <div v-if="scanResults.length" class="overflow-x-auto">
        <table class="w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr class="bg-gray-50">
              <th class="border p-2" :aria-sort="sortKey === 'port' ? ariaSort : 'none'"><button type="button" class="whitespace-nowrap font-semibold" @click="sortBy('port')">Port{{ sortIndicator('port') }}</button></th>
              <th class="border p-2" :aria-sort="sortKey === 'protocol' ? ariaSort : 'none'"><button type="button" class="whitespace-nowrap font-semibold" @click="sortBy('protocol')">Protocol{{ sortIndicator('protocol') }}</button></th>
              <th class="border p-2" :aria-sort="sortKey === 'status' ? ariaSort : 'none'"><button type="button" class="whitespace-nowrap font-semibold" @click="sortBy('status')">Status{{ sortIndicator('status') }}</button></th>
              <th class="border p-2" :aria-sort="sortKey === 'banner' ? ariaSort : 'none'"><button type="button" class="whitespace-nowrap font-semibold" @click="sortBy('banner')">Service / Banner{{ sortIndicator('banner') }}</button></th>
              <th class="border p-2" :aria-sort="sortKey === 'details' ? ariaSort : 'none'"><button type="button" class="whitespace-nowrap font-semibold" @click="sortBy('details')">SSL / Web Info{{ sortIndicator('details') }}</button></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in sortedScanResults" :key="r.port + r.protocol" class="hover:bg-gray-100">
              <td class="border p-2">{{ r.port }}</td>
              <td class="border p-2">{{ r.protocol }}</td>
              <td class="border p-2">
                <span
                  :class="{
                    'text-green-600 font-medium': r.status === 'open',
                    'text-red-600 font-medium': r.status === 'closed',
                    'text-yellow-600 font-medium': r.status === 'unknown'
                  }"
                >
                  {{ r.status }}
                </span>
              </td>
              <td class="border p-2">{{ r.banner || '-' }}</td>
              <td class="border p-2">{{ r.ssl || r.web || '-' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Export Buttons -->
        <div class="mt-3 flex gap-2">
          <button @click="exportJson" class="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">
            ⬇ JSON
          </button>
          <button @click="exportCsv" class="px-3 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600">
            ⬇ CSV
          </button>
        </div>
      </div>

      <div v-else-if="!loading" class="text-gray-400">
        No results yet. Enter a host and scan.
      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import AdminLayout from '../../components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'
import { isResponsibleUseCancellation } from '@/composables/useResponsibleUse'
import { beginScanTask } from '@/composables/useScanTask'

const store = useStore()
const localServerIP = computed(() => store.getters['profile/getLocalServerIP'] || '')

const currentPageTitle = ref('Advanced Network Scanner')

const host = ref('')
const route = useRoute()
onMounted(() => {
  if (typeof route.query.target === 'string') host.value = route.query.target
})
const portString = ref('20-25,80,443')
const scanResults = ref([])
const loading = ref(false)
const progress = ref(0)
const totalPorts = ref(0)
const scanHistory = ref([])
const scanError = ref('')
const sortKey = ref('port')
const sortDirection = ref(1)
const ariaSort = computed(() => sortDirection.value === 1 ? 'ascending' : 'descending')
const sortedScanResults = computed(() => [...scanResults.value].sort((a, b) => {
  const valueFor = (row) => {
    if (sortKey.value === 'details') return row.ssl || row.web || ''
    return row[sortKey.value] ?? ''
  }
  const left = valueFor(a)
  const right = valueFor(b)
  const order = sortKey.value === 'port'
    ? Number(left) - Number(right)
    : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' })
  return order * sortDirection.value
}))

const sortBy = (key) => {
  if (sortKey.value === key) sortDirection.value *= -1
  else {
    sortKey.value = key
    sortDirection.value = 1
  }
}
const sortIndicator = (key) => sortKey.value === key ? (sortDirection.value === 1 ? ' ↑' : ' ↓') : ''

const options = ref({
  tcp: true,
  udp: false,
  sctp: false,
  rpc: false,
  banner: true,
  ssl: false,
  web: false
})

// Utility: expand port ranges
const parsePorts = (str) => {
  const ports = []
  str.split(',').forEach(part => {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number)
      for (let i = start; i <= end; i++) ports.push(i)
    } else {
      const p = parseInt(part.trim())
      if (!isNaN(p)) ports.push(p)
    }
  })
  return ports
}

// Scan function
const scanPorts = async () => {
  const task = beginScanTask('Port scan', host.value)
  if (!task) return
  const ports = parsePorts(portString.value)
  totalPorts.value = ports.length * Object.keys(options.value).filter(k => options.value[k]).length
  progress.value = 0
  loading.value = true
  scanResults.value = []
  scanError.value = ''

  try {
    const { data } = await axios.post(`${localServerIP.value}/advanced-scan`, {
      host: host.value,
      ports,
      options: options.value
    }, {
      signal: task.signal,
    })
    scanResults.value = data.results
    scanHistory.value.push({ host: host.value, results: data.results, date: new Date().toISOString() })
  } catch (err) {
    if (isResponsibleUseCancellation(err)) return
    console.error(err)
    const detail = err?.response?.data?.error || err?.response?.data?.details || err?.message
    scanError.value = `Scan failed: ${detail || 'Unexpected API error'}. Check API Diagnostics for backend connection help.`
  } finally {
    task.finish()
    loading.value = false
  }
}

// Export functions
const exportJson = () => {
  const payload = JSON.stringify(scanResults.value, null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${host.value || 'scan'}-results.json`
  a.click()
}

const exportCsv = () => {
  const header = 'Port,Protocol,Status,Banner,SSL/Web'
  const rows = scanResults.value.map(r => `${r.port},${r.protocol},${r.status},"${r.banner || ''}","${r.ssl || r.web || ''}"`)
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${host.value || 'scan'}-results.csv`
  a.click()
}
</script>

<style>
/* Optional: spinner or table styling */
</style>
