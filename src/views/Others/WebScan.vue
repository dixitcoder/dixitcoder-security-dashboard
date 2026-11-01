<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle"  :items="[{ text: 'Dashboard', to: '/' }, { text: 'Web Server Scanner', active: true }]" />

    <div class="rounded-2xl border p-6 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-semibold">🌐 Web Server Scanner</h1>

        <div class="flex items-center gap-2">
          <button
            @click="exportJson"
            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            :disabled="!scanResult"
          >
            ⬇ JSON
          </button>
          <button
            @click="exportCsv"
            class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
            :disabled="!scanResult"
          >
            ⬇ CSV
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="startScan" class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div class="col-span-1 md:col-span-1">
          <label class="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Target host</label>
          <input
            v-model="host"
            placeholder="example.com or 192.168.1.10"
            class="w-full rounded-md border px-3 py-2 bg-white text-gray-900 dark:bg-gray-800 dark:text-white/90"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Port</label>
          <input v-model.number="port" type="number" min="1" max="65535" class="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Path</label>
          <input v-model="path" placeholder="/, /admin, /robots.txt" class="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800" />
        </div>

        <div class="col-span-1 md:col-span-3 flex gap-2 items-center">
          <label class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input type="checkbox" v-model="options.fetchRobots" class="rounded" />
            Fetch robots.txt
          </label>

          <label class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input type="checkbox" v-model="options.grabHeaders" class="rounded" />
            Grab HTTP headers
          </label>

          <label class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input type="checkbox" v-model="options.sslInfo" class="rounded" />
            SSL/TLS info
          </label>

          <label class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input type="checkbox" v-model="options.followRedirects" class="rounded" />
            Follow Redirects
          </label>

          <button
            :class="['ml-auto px-4 py-2 rounded text-white shadow', loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700']"
            :disabled="loading"
            type="submit"
          >
            <span v-if="!loading">Start Scan</span>
            <span v-else class="inline-flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path d="M4 12a8 8 0 018-8v8z" fill="currentColor" class="opacity-75" />
              </svg>
              Scanning...
            </span>
          </button>
        </div>
      </form>

      <!-- Output area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Summary -->
        <div class="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800">
          <h3 class="text-sm text-gray-500 mb-2">Summary</h3>
          <p class="text-sm"><strong>URL:</strong> {{ displayUrl }}</p>
          <p class="text-sm"><strong>Status:</strong> <span :class="statusClass(scanResult?.status)">{{ scanResult?.status ?? '—' }}</span></p>
          <p class="text-sm"><strong>Server:</strong> {{ scanResult?.server || '—' }}</p>
          <p class="text-sm"><strong>Content-Type:</strong> {{ scanResult?.contentType || '—' }}</p>
          <p class="text-sm"><strong>Response Size:</strong> {{ scanResult?.size ? scanResult.size + ' bytes' : '—' }}</p>

          <div class="mt-3 flex flex-wrap gap-2">
            <a v-if="scanResult?.finalUrl" :href="scanResult.finalUrl" target="_blank" class="text-sm px-3 py-1 bg-white dark:bg-gray-700 rounded border">Open final URL</a>
            <button v-if="scanResult" @click="copyJson" class="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded border">Copy JSON</button>
          </div>
        </div>

        <!-- Headers & robots -->
        <div class="p-4 rounded-lg border bg-white dark:bg-gray-900 lg:col-span-2">
          <h3 class="text-sm text-gray-500 mb-3">Details</h3>

          <div v-if="loading" class="text-sm text-gray-500">Fetching data…</div>

          <div v-else-if="error" class="text-sm text-red-500">{{ error }}</div>

          <div v-else-if="scanResult">
            <!-- HTTP Headers -->
            <div v-if="scanResult.headers && Object.keys(scanResult.headers).length" class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium">HTTP Headers</h4>
                <button @click="toggleHeaders" class="text-xs text-blue-600">Toggle</button>
              </div>
              <div v-show="showHeaders" class="max-h-48 overflow-auto rounded bg-gray-50 dark:bg-gray-800 p-2 border">
                <div v-for="(value, key) in scanResult.headers" :key="key" class="flex justify-between py-1 border-b last:border-b-0">
                  <div class="text-xs text-gray-600 dark:text-gray-300">{{ key }}</div>
                  <div class="text-sm font-medium text-gray-800 dark:text-white">{{ value }}</div>
                </div>
              </div>
            </div>

            <!-- robots.txt -->
            <div v-if="scanResult.robots" class="mb-4">
              <h4 class="font-medium">robots.txt (first 2KB)</h4>
              <pre class="whitespace-pre-wrap max-h-40 overflow-auto text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded border">{{ scanResult.robots }}</pre>
            </div>

            <!-- SSL/TLS -->
            <div v-if="scanResult.ssl" class="mb-4">
              <h4 class="font-medium">SSL / TLS</h4>
              <div class="grid grid-cols-2 gap-2">
                <div class="text-sm"><strong>Protocol:</strong> {{ scanResult.ssl.protocol }}</div>
                <div class="text-sm"><strong>CN:</strong> {{ scanResult.ssl.cn }}</div>
                <div class="text-sm"><strong>Issuer:</strong> {{ scanResult.ssl.issuer }}</div>
                <div class="text-sm"><strong>Valid from:</strong> {{ scanResult.ssl.valid_from }}</div>
                <div class="text-sm"><strong>Valid to:</strong> {{ scanResult.ssl.valid_to }}</div>
                <div class="text-sm"><strong>Expired:</strong> {{ scanResult.ssl.expired ? 'Yes' : 'No' }}</div>
              </div>
            </div>

            <!-- Raw body snippet -->
            <div v-if="scanResult.bodySnippet" class="mb-4">
              <h4 class="font-medium">Body Snippet</h4>
              <pre class="whitespace-pre-wrap max-h-48 overflow-auto text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded border">{{ scanResult.bodySnippet }}</pre>
            </div>
          </div>

          <div v-else class="text-sm text-gray-500">No scan yet.</div>
        </div>
      </div>
    </div>
  </AdminLayout>
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
// Pull base backend URL from Vuex if you store it there (fallback to localhost)
const localServerIP = computed(() => {
  // expecting profile.localServerIP or profile/getLocalServerIP depending on your store
  const g = store.getters?.['profile/getLocalServerIP']
  return g || store.state?.profile?.localServerIP || ''
})

const currentPageTitle = 'Web Server Scanner'

const host = ref('')
const route = useRoute()
onMounted(() => {
  if (typeof route.query.target === 'string') host.value = route.query.target
})
const port = ref(80)
const path = ref('/')
const options = ref({
  fetchRobots: true,
  grabHeaders: true,
  sslInfo: true,
  followRedirects: true
})

const loading = ref(false)
const error = ref('')
const scanResult = ref(null)
const showHeaders = ref(true)

// computed display url
const displayUrl = computed(() => {
  if (!host.value) return ''
  const p = port.value ? `:${port.value}` : ''
  const normalizedPath = path.value ? (path.value.startsWith('/') ? path.value : '/' + path.value) : '/'
  const scheme = port.value == 443 ? 'https' : 'http'
  return `${scheme}://${host.value}${p}${normalizedPath}`
})

// UI helpers
const statusClass = (s) => {
  if (!s) return 'text-gray-500'
  if (s >= 200 && s < 400) return 'text-green-600'
  if (s >= 400 && s < 500) return 'text-yellow-600'
  return 'text-red-600'
}

const startScan = async () => {
  if (!host.value) { alert('Please enter host'); return }
  const task = beginScanTask('Web scan', host.value)
  if (!task) return
  loading.value = true
  error.value = ''
  scanResult.value = null

  try {
    const payload = {
      host: host.value,
      port: port.value,
      path: path.value,
      options: options.value
    }
    const { data } = await axios.post(`${localServerIP.value}/web-scan`, payload, {
      timeout: 15000,
      signal: task.signal,
    })
    // expected data shape:
    // { status, headers, server, contentType, size, robots, ssl, bodySnippet, finalUrl }
    scanResult.value = data
  } catch (err) {
    if (isResponsibleUseCancellation(err)) return
    console.error(err)
    error.value = err?.response?.data?.error || err.message || 'Scan failed'
  } finally {
    task.finish()
    loading.value = false
  }
}

const toggleHeaders = () => (showHeaders.value = !showHeaders.value)

const copyJson = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(scanResult.value, null, 2))
    alert('Copied JSON to clipboard')
  } catch (e) {
    console.error(e)
  }
}

// export json & csv
const exportJson = () => {
  if (!scanResult.value) return
  const blob = new Blob([JSON.stringify({ url: displayUrl.value, result: scanResult.value }, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${host.value || 'web'}-scan.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

const exportCsv = () => {
  if (!scanResult.value) return
  // Make a small flat CSV with key,value pairs
  const rows = []
  rows.push(['field', 'value'])
  rows.push(['url', displayUrl.value])
  rows.push(['status', scanResult.value.status])
  rows.push(['server', scanResult.value.server || ''])
  rows.push(['contentType', scanResult.value.contentType || ''])
  rows.push(['size', scanResult.value.size || ''])
  if (scanResult.value.ssl) {
    rows.push(['ssl_protocol', scanResult.value.ssl.protocol || ''])
    rows.push(['ssl_cn', scanResult.value.ssl.cn || ''])
    rows.push(['ssl_issuer', scanResult.value.ssl.issuer || ''])
    rows.push(['ssl_valid_from', scanResult.value.ssl.valid_from || ''])
    rows.push(['ssl_valid_to', scanResult.value.ssl.valid_to || ''])
  }
  // add first 10 headers
  if (scanResult.value.headers) {
    const keys = Object.keys(scanResult.value.headers).slice(0, 20)
    for (const k of keys) rows.push([`header:${k}`, (scanResult.value.headers[k] || '').toString().replace(/\n/g, ' ')])
  }

  const csv = rows.map(r => `"${String(r[0]).replace(/"/g,'""')}","${String(r[1]).replace(/"/g,'""')}"`).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${host.value || 'web'}-scan.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<style scoped>
/* small tweaks for light/dark */
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Segoe UI Mono", monospace;
}
</style>
