<template>
  <AdminLayout>
    <PageBreadcrumb
      :items="[
        { text: 'Dashboard', to: '/' },
        { text: 'Vulnerability Scanner', active: true }
      ]"
    />

    <div class="rounded-2xl border p-5 bg-white dark:bg-gray-900 dark:border-gray-800">
      <h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">🛡️ Vulnerability Scanner</h1>

      <!-- Input Form -->
      <form @submit.prevent="startScan" class="space-y-4">
        <div>
          <label class="block font-medium mb-1 text-gray-700 dark:text-gray-300">
            Target Host/IP
          </label>
          <input
            v-model="host"
            type="text"
            placeholder="example.com or 192.168.1.1"
            class="w-full px-3 py-2 rounded-md border text-black dark:text-white dark:bg-gray-800 dark:border-gray-700"
            required
          />
        </div>

        <div>
          <label class="block font-medium mb-1 text-gray-700 dark:text-gray-300">
            Ports (comma-separated, e.g., 80,443,8080)
          </label>
          <input
            v-model="ports"
            type="text"
            placeholder="80,443"
            class="w-full px-3 py-2 rounded-md border text-black dark:text-white dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div class="flex flex-wrap gap-4">
          <label class="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <input type="checkbox" v-model="options.http" /> HTTP
          </label>
          <label class="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <input type="checkbox" v-model="options.https" /> HTTPS
          </label>
          <label class="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <input type="checkbox" v-model="options.ssl" /> SSL/TLS
          </label>
          <label class="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <input type="checkbox" v-model="options.headers" /> HTTP Headers
          </label>
          <label class="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <input type="checkbox" v-model="options.security" /> Security Headers
          </label>
        </div>

        <button
          type="submit"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
        >
          Start Scan
        </button>
      </form>

      <!-- Loading -->
      <div v-if="loading" class="mt-6 text-yellow-500">🔄 Scanning in progress...</div>

      <!-- Results -->
      <div v-if="results.length" class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(r, i) in results"
          :key="i"
          class="p-4 rounded-lg shadow bg-gray-100 dark:bg-gray-800 border dark:border-gray-700"
        >
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">{{ r.port }}/{{ r.protocol }}</h3>
          <p>Status: <span :class="r.status === 'open' ? 'text-green-400' : 'text-red-400'">{{ r.status }}</span></p>
          <p>Server: {{ r.server || '-' }}</p>
          <p>SSL/TLS: {{ r.ssl || '-' }}</p>
          <p v-if="r.securityHeaders">
            Security Headers:
            <span v-for="(val, key) in r.securityHeaders" :key="key">
              {{ key }}: {{ val }}<br />
            </span>
          </p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
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


const host = ref('')
const route = useRoute()
onMounted(() => {
  if (typeof route.query.target === 'string') host.value = route.query.target
})
const ports = ref('80,443')
const results = ref([])
const loading = ref(false)

const options = ref({
  http: true,
  https: true,
  ssl: true,
  headers: true,
  security: true
})

const startScan = async () => {
  if (!host.value) return alert('Enter a host/IP first!')
  const task = beginScanTask('Vulnerability scan', host.value)
  if (!task) return
  loading.value = true
  results.value = []

  try {
    const { data } = await axios.post(`${localServerIP.value}/vuln-scanner`, {
      host: host.value,
      ports: ports.value.split(',').map(p => parseInt(p.trim())).filter(Boolean),
      options: options.value
    }, {
      signal: task.signal,
    })
    results.value = data.results
  } catch (err) {
    if (isResponsibleUseCancellation(err)) return
    console.error(err)
    alert('Error performing vulnerability scan!')
  } finally {
    task.finish()
    loading.value = false
  }
}
</script>
