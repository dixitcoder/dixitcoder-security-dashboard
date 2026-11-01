<template>
  <AdminLayout>
   <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div
      class="rounded-2xl border p-5 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-800"
    >
      <h1 class="text-2xl font-bold mb-4">🔍 Service Detector</h1>

      <!-- Input Form -->
      <form @submit.prevent="startScan" class="space-y-4">
        <div>
          <label class="block font-medium mb-1">Target Host/IP</label>
          <input
            v-model="host"
            type="text"
            placeholder="example.com or 192.168.1.1"
            class="w-full px-3 py-2 rounded-md bg-white text-gray-900 border border-gray-300 focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            required
          />
        </div>

        <div>
          <label class="block font-medium mb-1">Ports (comma-separated)</label>
          <input
            v-model="ports"
            type="text"
            placeholder="80,443,22"
            class="w-full px-3 py-2 rounded-md bg-white text-gray-900 border border-gray-300 focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          />
        </div>

        <div class="flex flex-wrap gap-4 text-sm">
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" v-model="options.tcp" class="rounded text-blue-600" /> <span>TCP</span>
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" v-model="options.udp" class="rounded text-blue-600" /> <span>UDP</span>
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" v-model="options.banner" class="rounded text-blue-600" /> <span>Banner</span>
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" v-model="options.ssl" class="rounded text-blue-600" /> <span>SSL/TLS</span>
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" v-model="options.web" class="rounded text-blue-600" /> <span>Web Info</span>
          </label>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          >
            <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h3v2H4v10h12V5h-3V3h3a2 2 0 012 2v11a1 1 0 01-1 1H3a1 1 0 01-1-1V5z" />
              <path d="M7 9h6v2H7V9z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v4m0 12v4m8-8h-4M4 12H0" />
            </svg>
            <span>{{ loading ? 'Scanning...' : 'Start Scan' }}</span>
          </button>

          <button
            type="button"
            @click="clearResults"
            class="ml-2 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-sm dark:text-gray-200"
          >
            Clear
          </button>

          <div class="ml-auto text-sm text-gray-600 dark:text-gray-400">
            <span v-if="lastScan">Last scan: {{ lastScan }}</span>
          </div>
        </div>
      </form>

      <!-- Results -->
      <div v-if="loading" class="mt-6 text-yellow-600 dark:text-yellow-400">Scanning in progress...</div>

      <div v-if="results.length" class="mt-6">
        <h2 class="text-xl font-semibold mb-3">Scan Results</h2>

        <div class="overflow-x-auto rounded-lg border dark:border-gray-700">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr :class="['text-sm', 'uppercase']">
                <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">Port</th>
                <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">Protocol</th>
                <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">Status</th>
                <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">Banner</th>
                <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">SSL/TLS</th>
                <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">Web Info</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(r, i) in results"
                :key="i"
                class="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <td class="px-3 py-2 border-b border-gray-100 dark:border-gray-700">{{ r.port }}</td>
                <td class="px-3 py-2 border-b border-gray-100 dark:border-gray-700">{{ r.protocol }}</td>
                <td
                  class="px-3 py-2 border-b border-gray-100 dark:border-gray-700"
                  :class="{
                    'text-green-400': r.status === 'open',
                    'text-red-400': r.status === 'closed',
                    'text-yellow-400': r.status === 'unknown'
                  }"
                >
                  {{ r.status }}
                </td>
                <td class="px-3 py-2 border-b border-gray-100 dark:border-gray-700 break-words">{{ r.banner || '-' }}</td>
                <td class="px-3 py-2 border-b border-gray-100 dark:border-gray-700 break-words">{{ r.ssl || '-' }}</td>
                <td class="px-3 py-2 border-b border-gray-100 dark:border-gray-700 break-words">{{ r.web ? formatWeb(r.web) : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-3 flex gap-2">
          <button @click="exportJson" class="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">⬇ JSON</button>
          <button @click="exportCsv" class="px-3 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600">⬇ CSV</button>
        </div>
      </div>

      <div v-else-if="!loading" class="text-gray-500 dark:text-gray-400 mt-6">
        No results yet. Enter a host and scan.
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { isResponsibleUseCancellation } from '@/composables/useResponsibleUse'
import { beginScanTask } from '@/composables/useScanTask'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

// server storage
import {computed} from 'vue';
import {useStore} from 'vuex'
const store = useStore()
const localServerIP = computed(() => store.getters['profile/getLocalServerIP'] || '')


const currentPageTitle = ref('Service Detector')

const host = ref('')
const ports = ref('80,443')
const options = ref({
  tcp: true,
  udp: false,
  banner: true,
  ssl: true,
  web: true
})

const results = ref([])
const loading = ref(false)
const lastScan = ref(null)

const clearResults = () => {
  results.value = []
  lastScan.value = null
}

const formatWeb = (web) => {
  if (!web) return '-'
  if (typeof web === 'object') {
    return `${web.httpStatus || ''} ${web.serverHeader || ''} ${web.title ? `| ${web.title}` : ''}`.trim()
  }
  return String(web)
}

const startScan = async () => {
  if (!host.value) return alert('Enter a host/IP first!')
  const task = beginScanTask('Service detection', host.value)
  if (!task) return
  loading.value = true
  results.value = []

  try {
    const portsArray = ports.value
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => parseInt(p))
      .filter(n => !Number.isNaN(n))

    const { data } = await axios.post(`${localServerIP.value}/advanced-scan`, {
      host: host.value,
      ports: portsArray,
      options: options.value
    }, { signal: task.signal })
    // backend returns data.results array
    results.value = data.results || []
    lastScan.value = new Date().toLocaleString()
  } catch (err) {
    if (isResponsibleUseCancellation(err)) return
    console.error(err)
    alert('Error performing scan! Ensure your backend is running and reachable.')
  } finally {
    task.finish()
    loading.value = false
  }
}

const exportJson = () => {
  const blob = new Blob([JSON.stringify(results.value, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${host.value || 'scan'}-results.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

const exportCsv = () => {
  const header = ['Port','Protocol','Status','Banner','SSL','Web'].join(',')
  const rows = results.value.map(r => {
    const web = (r.web && typeof r.web === 'object') ? `${r.web.httpStatus || ''} ${r.web.serverHeader || ''}` : (r.web || '')
    return [r.port, r.protocol, r.status, (r.banner||''), (r.ssl||''), web].map(v => `"${String(v||'')}"`).join(',')
  })
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${host.value || 'scan'}-results.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<style>
/* Small UI polish for dark/light theme consistency */
input::placeholder { color: rgba(107,114,128,0.8); } /* gray-500 */
.dark input::placeholder { color: rgba(203,213,225,0.6); } /* lighter placeholder in dark */
table th, table td { vertical-align: top; }
</style>
