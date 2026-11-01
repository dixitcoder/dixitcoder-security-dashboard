<template>
  <AdminLayout>
    <PageBreadcrumb
      :items="[{ text: 'Dashboard', to: '/' }, { text: 'Network Mapper', active: true }]"
    />

    <div class="rounded-2xl border p-5 bg-white dark:bg-gray-900 dark:border-gray-800">
      <h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">🌍 Network Mapper</h1>

      <!-- Input Form -->
      <form @submit.prevent="startMapping" class="space-y-4">
        <div>
          <label class="block font-medium mb-1 text-gray-700 dark:text-gray-300">
            Target Host/IP
          </label>
          <input
            v-model="host"
            type="text"
            placeholder="example.com or 8.8.8.8"
            class="w-full px-3 py-2 rounded-md border text-black dark:text-gray-100 dark:bg-gray-800 dark:border-gray-700"
            required
          />
        </div>

        <button
          type="submit"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
        >
          Start Mapping
        </button>
      </form>

      <!-- Progress -->
      <div v-if="loading" class="mt-6 text-yellow-500 dark:text-yellow-400">
        🔄 Mapping in progress...
      </div>

      <!-- Results -->
      <div v-if="results.length" class="mt-6">
        <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Traceroute Hops</h2>

<!-- Table -->
<table class="w-full text-left border-collapse mt-4">
  <thead>
    <tr class="bg-gray-200 dark:bg-gray-800">
      <th class="px-3 py-2 border">Hop</th>
      <th class="px-3 py-2 border">IP</th>
      <th class="px-3 py-2 border">Host</th>
      <th class="px-3 py-2 border">Latency (ms)</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(r, i) in results" :key="i" class="hover:bg-gray-100 dark:hover:bg-gray-700">
      <td class="px-3 py-2 border">{{ r.hop }}</td>
      <td class="px-3 py-2 border">{{ r.ip !== '*' ? r.ip : '-' }}</td>
      <td class="px-3 py-2 border">{{ r.hostname !== '*' ? r.hostname : '-' }}</td>
      <td class="px-3 py-2 border">{{ r.rtt !== '*' ? r.rtt : '-' }}</td>
    </tr>
  </tbody>
</table>

<!-- Topology Map -->
<div class="mt-6 flex flex-wrap items-center gap-4 overflow-x-auto">
  <div v-for="(r, i) in results" :key="'map-' + i" class="flex items-center gap-2">
    <div
      class="rounded-full px-4 py-2 bg-blue-500 text-white shadow text-sm font-medium"
    >
      {{ r.ip !== '*' ? r.ip : '–' }}
    </div>
    <span v-if="i < results.length - 1" class="text-gray-500 dark:text-gray-300">➡</span>
  </div>
</div>


        <!-- Topology Map -->

      </div>

      <div v-else-if="!loading" class="mt-6 text-gray-500 dark:text-gray-400">
        Enter a host/IP and click Start Mapping to see results.
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
const results = ref([])
const loading = ref(false)

const startMapping = async () => {
  if (!host.value) return alert('Enter a host/IP first!')
  const task = beginScanTask('Network mapping', host.value)
  if (!task) return
  loading.value = true
  results.value = []

  try {
    const { data } = await axios.post(`${localServerIP.value}/network-mapper`, {
      host: host.value
    }, { signal: task.signal })
    results.value = data.results
  } catch (err) {
    if (isResponsibleUseCancellation(err)) return
    console.error(err)
    alert('Error performing network mapping!')
  } finally {
    task.finish()
    loading.value = false
  }
}
</script>
