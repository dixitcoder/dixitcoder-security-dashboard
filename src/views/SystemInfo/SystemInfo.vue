<template>
  <AdminLayout>
    <PageBreadcrumb
      :items="[
        { text: 'Dashboard', to: '/' },
        { text: 'System Info', active: true }
      ]"
    />

    <div class="p-5 space-y-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">💻 System Information</h1>

      <button
        @click="fetchSystemInfo"
        class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
      >
        🔄 Fetch System Info
      </button>

      <div v-if="loading" class="text-yellow-500 mt-4">Loading system info...</div>

      <div v-if="system" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">

        <!-- CPU Card -->
        <div class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow hover:shadow-lg transition">
          <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">🧠 CPU</h2>
          <ul class="space-y-1 text-gray-700 dark:text-gray-300">
            <li><strong>Manufacturer:</strong> {{ system.cpu.manufacturer }}</li>
            <li><strong>Brand:</strong> {{ system.cpu.brand }}</li>
            <li><strong>Cores:</strong> {{ system.cpu.cores }}</li>
            <li><strong>Physical Cores:</strong> {{ system.cpu.physicalCores }}</li>
            <li><strong>Speed:</strong> {{ system.cpu.speed }} GHz</li>
            <li><strong>Virtualization:</strong> {{ system.cpu.virtualization ? 'Yes' : 'No' }}</li>
          </ul>
        </div>

        <!-- Memory Card -->
        <div class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow hover:shadow-lg transition">
          <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">🗄️ Memory</h2>
          <ul class="space-y-1 text-gray-700 dark:text-gray-300">
            <li><strong>Total:</strong> {{ formatBytes(system.mem.total) }}</li>
            <li><strong>Used:</strong> {{ formatBytes(system.mem.used) }}</li>
            <li><strong>Free:</strong> {{ formatBytes(system.mem.free) }}</li>
          </ul>
        </div>

        <!-- OS Card -->
        <div class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow hover:shadow-lg transition">
          <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">🖥️ OS</h2>
          <ul class="space-y-1 text-gray-700 dark:text-gray-300">
            <li><strong>Platform:</strong> {{ system.os.platform }}</li>
            <li><strong>Distro:</strong> {{ system.os.distro }}</li>
            <li><strong>Kernel:</strong> {{ system.os.kernel }}</li>
            <li><strong>Hostname:</strong> {{ system.os.hostname }}</li>
          </ul>
        </div>
<div class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow hover:shadow-lg transition">
  <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">🧠 CPU Usage</h2>
  <div class="text-gray-700 dark:text-gray-300 mb-2">
    <span>Speed: {{ system.cpu.speed }} GHz</span> |
    <span>Cores: {{ system.cpu.cores }}</span>
  </div>
  <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4">
    <div
      class="h-4 rounded-full bg-green-500 dark:bg-green-400"
      :style="{ width: system.cpuUsage + '%' }"
    ></div>
  </div>
  <small class="text-gray-500 dark:text-gray-400">{{ system.cpuUsage }}% used</small>
</div>

<div class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow hover:shadow-lg transition">
  <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">🗄️ Memory Usage</h2>
  <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4">
    <div
      class="h-4 rounded-full bg-blue-500 dark:bg-blue-400"
      :style="{ width: ((system.mem.used/system.mem.total)*100).toFixed(1) + '%' }"
    ></div>
  </div>
  <small class="text-gray-500 dark:text-gray-400">
    {{ formatBytes(system.mem.used) }} / {{ formatBytes(system.mem.total) }}
  </small>
</div>

    <!-- Uptime Card -->
<div class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow">
  <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">⏳ Uptime</h2>
  <p class="text-gray-700 dark:text-gray-300">
    {{ Math.floor(system.uptime.uptime / 3600) }} hrs
  </p>
</div>

<!-- User Card -->
<div class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow">
  <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">👤 Logged-in Users</h2>
  <ul class="space-y-1 text-gray-700 dark:text-gray-300">
    <li v-for="u in system.users" :key="u.user">
      {{ u.user }} ({{ u.tty }})
    </li>
  </ul>
</div>

<!-- Battery Card -->
<div class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow">
  <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">🔋 Battery</h2>
  <ul class="space-y-1 text-gray-700 dark:text-gray-300">
    <li><strong>Percent:</strong> {{ system.battery.percent }}%</li>
    <li><strong>Charging:</strong> {{ system.battery.isCharging ? "Yes ⚡" : "No" }}</li>
    <li><strong>Remaining:</strong> {{ system.battery.remaining || "N/A" }} mins</li>
  </ul>
</div>

<!-- GPU Card -->
<div class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow">
  <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">🎮 GPU</h2>
  <ul class="space-y-1 text-gray-700 dark:text-gray-300">
    <li v-for="card in system.gpu.controllers" :key="card.model">
      {{ card.vendor }} - {{ card.model }} ({{ card.vram }} MB)
    </li>
  </ul>
</div>
    <!-- Network Card -->
        <div class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow hover:shadow-lg transition col-span-1 md:col-span-2 lg:col-span-3">
          <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">🌐 Network Interfaces</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <th class="px-3 py-2 border">Interface</th>
                  <th class="px-3 py-2 border">IPv4</th>
                  <th class="px-3 py-2 border">IPv6</th>
                  <th class="px-3 py-2 border">MAC</th>
                  <th class="px-3 py-2 border">Speed</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="iface in system.network" :key="iface.iface" class="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td class="border px-3 py-2">{{ iface.iface }}</td>
                  <td class="border px-3 py-2">{{ iface.ip4 }}</td>
                  <td class="border px-3 py-2">{{ iface.ip6 }}</td>
                  <td class="border px-3 py-2">{{ iface.mac }}</td>
                  <td class="border px-3 py-2">{{ iface.speed || 'N/A' }} Mbps</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Disk Card -->
        <div class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow hover:shadow-lg transition col-span-1 md:col-span-2 lg:col-span-3">
          <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">💾 Disk</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <th class="px-3 py-2 border">Mount</th>
                  <th class="px-3 py-2 border">FS</th>
                  <th class="px-3 py-2 border">Type</th>
                  <th class="px-3 py-2 border">Size</th>
                  <th class="px-3 py-2 border">Used</th>
                  <th class="px-3 py-2 border">Available</th>
                  <th class="px-3 py-2 border">Usage %</th>
                </tr>
              </thead>
              <tbody>
👤 Logged-
                <tr v-for="d in system.disk" :key="d.fs" class="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td class="border px-3 py-2">{{ d.mount }}</td>
                  <td class="border px-3 py-2">{{ d.fs }}</td>
                  <td class="border px-3 py-2">{{ d.type }}</td>
                  <td class="border px-3 py-2">{{ formatBytes(d.size) }}</td>
                  <td class="border px-3 py-2">{{ formatBytes(d.used) }}</td>
                  <td class="border px-3 py-2">{{ formatBytes(d.available) }}</td>
                  <td class="border px-3 py-2">{{ d.use }}%</td>
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
import { ref } from 'vue'
import axios from 'axios'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
// server storage
import {computed} from 'vue';
import {useStore} from 'vuex'
const store = useStore()
const localServerIP = computed(() => store.getters['profile/getLocalServerIP'] || '')

const system = ref(null)
const loading = ref(false)

const fetchSystemInfo = async () => {
  loading.value = true
  system.value = null
  try {
    const { data } = await axios.get(`${localServerIP.value}/system-info`)
    system.value = data
  } catch (err) {
    console.error(err)
    alert('Error fetching system info!')
  } finally {
    loading.value = false
  }
}

const formatBytes = (bytes) => {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
