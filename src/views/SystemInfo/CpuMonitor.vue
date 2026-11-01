<template>
  <AdminLayout>
    <PageBreadcrumb
      :items="[
        { text: 'Dashboard', to: '/' },
        { text: 'CPU Monitor', active: true }
      ]"
    />

    <div class="p-5 space-y-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">🧠 CPU Monitor</h1>

      <!-- Refresh Button -->
      <button
        @click="fetchCpuInfo"
        class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
      >
        🔄 Refresh CPU Info
      </button>

      <div v-if="loading" class="text-yellow-500 mt-4">Loading CPU info...</div>

      <!-- CPU Info -->
      <div v-if="cpu" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <!-- CPU Card -->
        <div class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow">
          <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">⚙️ CPU Info</h2>
          <ul class="text-gray-700 dark:text-gray-300 space-y-1">
            <li><strong>Brand:</strong> {{ cpu.brand }}</li>
            <li><strong>Speed:</strong> {{ cpu.speed }} GHz</li>
            <li><strong>Cores:</strong> {{ cpu.cores }} ({{ cpu.physicalCores }} physical)</li>
            <li><strong>Temperature:</strong> {{ cpu.temperature ? cpu.temperature + '°C' : 'N/A' }}</li>
          </ul>
        </div>

        <!-- Total CPU Load -->
        <div class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow">
          <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">📊 Total Load</h2>
          <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4">
            <div
              class="h-4 rounded-full bg-green-500 dark:bg-green-400"
              :style="{ width: cpu.load + '%' }"
            ></div>
          </div>
          <small class="text-gray-500 dark:text-gray-400">{{ cpu.load }}% used</small>
        </div>
      </div>

      <!-- Per Core Usage -->
      <div v-if="cpu" class="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow mt-6">
        <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">🧩 Per Core Usage</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(core, index) in cpu.loadCores"
            :key="index"
            class="space-y-2"
          >
            <span class="text-gray-700 dark:text-gray-300">Core {{ index + 1 }}: {{ core }}%</span>
            <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3">
              <div
                class="h-3 rounded-full bg-blue-500 dark:bg-blue-400"
                :style="{ width: core + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
// server storage
import {computed} from 'vue';
import {useStore} from 'vuex'
const store = useStore()
const localServerIP = computed(() => store.getters['profile/getLocalServerIP'] || '')

const cpu = ref(null)
const loading = ref(false)

const fetchCpuInfo = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${localServerIP.value}/cpu-monitor`)
    cpu.value = data
  } catch (err) {
    console.error(err)
    alert('Error fetching CPU info!')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCpuInfo()
  setInterval(fetchCpuInfo, 5000) // auto-refresh every 5s
})
</script>
