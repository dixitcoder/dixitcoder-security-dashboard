<template>
  <AdminLayout>
    <PageBreadcrumb
      :items="[
        { text: 'Dashboard', to: '/' },
        { text: 'Debug Tools', active: true }
      ]"
    />

    <div class="p-6 space-y-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
        🛠️ Debug Tools
      </h1>

      <div v-if="loading" class="text-yellow-500">Loading system info...</div>

      <div v-else-if="system" class="space-y-8">

        <!-- CPU -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 border dark:border-gray-800">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">🧠 CPU</h2>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700 dark:text-gray-300">
            <li><strong>Manufacturer:</strong> {{ system.cpu.manufacturer }}</li>
            <li><strong>Brand:</strong> {{ system.cpu.brand }}</li>
            <li><strong>Speed:</strong> {{ system.cpu.speed }} GHz</li>
            <li><strong>Cores:</strong> {{ system.cpu.cores }}</li>
            <li><strong>Physical Cores:</strong> {{ system.cpu.physicalCores }}</li>
            <li><strong>Performance Cores:</strong> {{ system.cpu.performanceCores }}</li>
            <li><strong>Flags:</strong> <span class="break-words">{{ system.cpu.flags }}</span></li>
          </ul>
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Cache</h3>
          <ul class="text-gray-700 dark:text-gray-300">
            <li>L1d: {{ formatBytes(system.cpu.cache.l1d) }}</li>
            <li>L1i: {{ formatBytes(system.cpu.cache.l1i) }}</li>
            <li>L2: {{ formatBytes(system.cpu.cache.l2) }}</li>
            <li>L3: {{ formatBytes(system.cpu.cache.l3) }}</li>
          </ul>
        </div>

        <!-- Memory -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 border dark:border-gray-800">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">🗄️ Memory</h2>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700 dark:text-gray-300">
            <li><strong>Total:</strong> {{ formatBytes(system.mem.total) }}</li>
            <li><strong>Used:</strong> {{ formatBytes(system.mem.used) }}</li>
            <li><strong>Free:</strong> {{ formatBytes(system.mem.free) }}</li>
            <li><strong>Available:</strong> {{ formatBytes(system.mem.available) }}</li>
            <li><strong>Swap Total:</strong> {{ formatBytes(system.mem.swaptotal) }}</li>
            <li><strong>Swap Free:</strong> {{ formatBytes(system.mem.swapfree) }}</li>
          </ul>
        </div>

        <!-- OS -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 border dark:border-gray-800">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">🖥️ OS</h2>
          <ul class="text-gray-700 dark:text-gray-300 space-y-1">
            <li><strong>Platform:</strong> {{ system.os.platform }}</li>
            <li><strong>Distro:</strong> {{ system.os.distro }}</li>
            <li><strong>Kernel:</strong> {{ system.os.kernel }}</li>
            <li><strong>Arch:</strong> {{ system.os.arch }}</li>
            <li><strong>Hostname:</strong> {{ system.os.hostname }}</li>
            <li><strong>UEFI:</strong> {{ system.os.uefi ? 'Yes' : 'No' }}</li>
          </ul>
        </div>

        <!-- Disk -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 border dark:border-gray-800 overflow-x-auto">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">💾 Disks</h2>
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
              <tr v-for="d in system.disk" :key="d.fs" class="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td class="border px-3 py-2">{{ d.mount }}</td>
                <td class="border px-3 py-2">{{ d.fs }}</td>
                <td class="border px-3 py-2">{{ d.type }}</td>
                <td class="border px-3 py-2">{{ formatBytes(d.size) }}</td>
                <td class="border px-3 py-2">{{ formatBytes(d.used) }}</td>
                <td class="border px-3 py-2">{{ formatBytes(d.available) }}</td>
                <td class="border px-3 py-2">{{ d.use.toFixed(2) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Network -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 border dark:border-gray-800 overflow-x-auto">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">🌐 Network Interfaces</h2>
          <table class="min-w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <th class="px-3 py-2 border">Iface</th>
                <th class="px-3 py-2 border">IPv4</th>
                <th class="px-3 py-2 border">IPv6</th>
                <th class="px-3 py-2 border">MAC</th>
                <th class="px-3 py-2 border">Speed</th>
                <th class="px-3 py-2 border">State</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="iface in system.network" :key="iface.iface" class="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td class="border px-3 py-2">{{ iface.iface }}</td>
                <td class="border px-3 py-2">{{ iface.ip4 }}</td>
                <td class="border px-3 py-2">{{ iface.ip6 }}</td>
                <td class="border px-3 py-2">{{ iface.mac }}</td>
                <td class="border px-3 py-2">{{ iface.speed || 'N/A' }}</td>
                <td class="border px-3 py-2">{{ iface.operstate }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Processes -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 border dark:border-gray-800 overflow-x-auto">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">⚙️ Processes</h2>
          <p class="mb-2 text-gray-700 dark:text-gray-300">
            <strong>Total:</strong> {{ system.processes.all }} |
            <strong>Running:</strong> {{ system.processes.running }} |
            <strong>Sleeping:</strong> {{ system.processes.sleeping }}
          </p>
          <table class="min-w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <th class="px-3 py-2 border">PID</th>
                <th class="px-3 py-2 border">Name</th>
                <th class="px-3 py-2 border">CPU%</th>
                <th class="px-3 py-2 border">MEM%</th>
                <th class="px-3 py-2 border">User</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in system.processes.list.slice(0,10)" :key="p.pid" class="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td class="border px-3 py-2">{{ p.pid }}</td>
                <td class="border px-3 py-2">{{ p.name }}</td>
                <td class="border px-3 py-2">{{ p.cpu.toFixed(1) }}</td>
                <td class="border px-3 py-2">{{ p.mem.toFixed(1) }}</td>
                <td class="border px-3 py-2">{{ p.user }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
// server storage
import {computed} from 'vue';
import {useStore} from 'vuex'
const store = useStore()
const localServerIP = computed(() => store.getters['profile/getLocalServerIP'] || '')

const system = ref(null)
const loading = ref(false)

const fetchDebugInfo = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${localServerIP.value}/api/debug-tools`)
    system.value = data
  } catch (err) {
    console.error(err)
    alert("Error fetching debug tools info!")
  } finally {
    loading.value = false
  }
}

const formatBytes = (bytes) => {
  if (!bytes) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

onMounted(() => {
  fetchDebugInfo()
})
</script>
