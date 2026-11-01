<template>
  <AdminLayout>
    <PageBreadcrumb
      :items="[
        { text: 'Dashboard', to: '/' },
        { text: 'Network Stats', active: true }
      ]"
    />

    <div class="p-5 space-y-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">🌐 Network Statistics</h1>

      <!-- Refresh Button -->
      <button
        @click="fetchNetworkStats"
        class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
      >
        🔄 Refresh Stats
      </button>

      <div v-if="loading" class="text-yellow-500 mt-4">Loading network stats...</div>

      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        <!-- Active Interface -->
        <div
          class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow hover:shadow-lg transition"
        >
          <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">📡 Active Interface</h2>
          <ul class="space-y-1 text-gray-700 dark:text-gray-300">
            <li><strong>Name:</strong> {{ stats.iface }}</li>
            <li><strong>IP:</strong> {{ stats.ip4 || 'N/A' }}</li>
            <li><strong>MAC:</strong> {{ stats.mac || 'N/A' }}</li>
            <li><strong>Type:</strong> {{ stats.type }}</li>
            <li><strong>Speed:</strong> {{ stats.speed || 'N/A' }} Mbps</li>
          </ul>
        </div>

        <!-- Realtime Speed -->
        <div
          class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow hover:shadow-lg transition"
        >
          <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">⚡ Realtime Speed</h2>
          <div class="mb-2 text-gray-700 dark:text-gray-300">
            <span>⬆ Upload: {{ formatBytes(stats.tx_sec) }}/s</span> |
            <span>⬇ Download: {{ formatBytes(stats.rx_sec) }}/s</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4 mb-2">
            <div
              class="h-4 rounded-full bg-green-500 dark:bg-green-400"
              :style="{ width: Math.min(((stats.tx_sec / (1024*1024)) * 10).toFixed(1), 100) + '%' }"
            ></div>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4">
            <div
              class="h-4 rounded-full bg-blue-500 dark:bg-blue-400"
              :style="{ width: Math.min(((stats.rx_sec / (1024*1024)) * 10).toFixed(1), 100) + '%' }"
            ></div>
          </div>
          <small class="text-gray-500 dark:text-gray-400">Realtime Upload & Download</small>
        </div>

        <!-- Data Usage -->
        <div
          class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow hover:shadow-lg transition col-span-1 md:col-span-2"
        >
          <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">📊 Data Usage</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <th class="px-3 py-2 border">Metric</th>
                  <th class="px-3 py-2 border">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr class="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td class="border px-3 py-2">Total Uploaded</td>
                  <td class="border px-3 py-2">{{ formatBytes(stats.tx_bytes) }}</td>
                </tr>
                <tr class="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td class="border px-3 py-2">Total Downloaded</td>
                  <td class="border px-3 py-2">{{ formatBytes(stats.rx_bytes) }}</td>
                </tr>
                <tr class="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td class="border px-3 py-2">Packets Sent</td>
                  <td class="border px-3 py-2">{{ stats.tx_packets }}</td>
                </tr>
                <tr class="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td class="border px-3 py-2">Packets Received</td>
                  <td class="border px-3 py-2">{{ stats.rx_packets }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from "vue"
import axios from "axios"
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
// server storage
import {computed} from 'vue';
import {useStore} from 'vuex'
const store = useStore()
const localServerIP = computed(() => store.getters['profile/getLocalServerIP'] || '')

const stats = ref(null)
const loading = ref(false)

const fetchNetworkStats = async () => {
  loading.value = true
  stats.value = null
  try {
    const { data } = await axios.get(`${localServerIP.value}/network-stats`)
    stats.value = data
  } catch (err) {
    console.error(err)
    alert("Error fetching network stats!")
  } finally {
    loading.value = false
  }
}

// auto refresh every 5s
setInterval(fetchNetworkStats, 5000)

const formatBytes = (bytes) => {
  if (!bytes) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
</script>
