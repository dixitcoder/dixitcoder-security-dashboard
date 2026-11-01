<template>
  <admin-layout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="p-5 border rounded-2xl">
      <h3 class="text-lg font-semibold mb-5">🌐 Advanced Ping Sweep</h3>

      <textarea v-model="hostsInput" placeholder="Enter multiple hosts, one per line"
        class="border p-2 rounded w-full mb-3 h-32 resize-none"></textarea>

      <div class="flex flex-wrap gap-2 mb-3">
        <label class="inline-flex items-center gap-1"><input type="checkbox" v-model="options.icmp" /> ICMP</label>
        <label class="inline-flex items-center gap-1"><input type="checkbox" v-model="options.tcp" /> TCP (port 80)</label>
        <label class="inline-flex items-center gap-1"><input type="checkbox" v-model="options.os" /> OS Detection</label>
      </div>

      <button @click="startPingSweep" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
        Start Ping Sweep
      </button>

      <div v-if="loading" class="mt-3">
        ⏳ Scanning {{ progress }}/{{ totalHosts }} hosts...
        <div class="w-full h-2 bg-gray-200 rounded mt-1">
          <div class="h-2 bg-green-600 rounded" :style="{ width: ((progress / totalHosts) * 100) + '%' }"></div>
        </div>
      </div>

      <div v-if="results.length" class="overflow-x-auto mt-4">
        <table class="table-auto border-collapse border border-gray-200 w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="border p-2">Host</th>
              <th class="border p-2">Status</th>
              <th class="border p-2">Response Time (ms)</th>
              <th class="border p-2">Protocol</th>
              <th class="border p-2">OS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in results" :key="r.host">
              <td class="border p-2">{{ r.host }}</td>
              <td class="border p-2">
                <span :class="{
                  'text-green-600 font-medium': r.status==='alive',
                  'text-red-600 font-medium': r.status==='dead',
                  'text-yellow-600 font-medium': r.status==='unknown'
                }">{{ r.status }}</span>
              </td>
              <td class="border p-2">{{ r.time || '-' }}</td>
              <td class="border p-2">{{ r.protocol }}</td>
              <td class="border p-2">{{ r.os || '-' }}</td>
            </tr>
          </tbody>
        </table>

        <div class="flex gap-2 mt-3">
          <button @click="exportJson" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">⬇ JSON</button>
          <button @click="exportCsv" class="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600">⬇ CSV</button>
        </div>
      </div>

      <div v-else-if="!loading" class="text-gray-400 mt-3">
        Enter hosts and click Start Ping Sweep.
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

const currentPageTitle = ref('Advanced Ping Sweep')
const hostsInput = ref('192.168.1.1\n192.168.1.2\n192.168.1.3')
const route = useRoute()
onMounted(() => {
  if (typeof route.query.target === 'string') hostsInput.value = route.query.target
})
const results = ref([])
const loading = ref(false)
const progress = ref(0)
const totalHosts = ref(0)

const options = ref({
  icmp: true,
  tcp: false,
  os: false
})

const parseHosts = input => input.split('\n').map(h => h.trim()).filter(Boolean)

const startPingSweep = async () => {
  const hosts = parseHosts(hostsInput.value)
  if (!hosts.length) return
  const task = beginScanTask('Ping sweep', `${hosts.length} host${hosts.length === 1 ? '' : 's'}`)
  if (!task) return
  totalHosts.value = hosts.length
  progress.value = 0
  loading.value = true
  results.value = []

  try {
    for (let i = 0; i < hosts.length; i++) {
      try {
        const { data } = await axios.post(`${localServerIP.value}/ping-sweep`, {
          hosts: [hosts[i]],
          options: options.value
        }, { signal: task.signal })
        results.value.push(...data.results)
      } catch (error) {
        if (isResponsibleUseCancellation(error)) break
        results.value.push({ host: hosts[i], status: 'unknown', protocol: '-', time: '-', os: '-' })
      }
      progress.value++
      task.setProgress(progress.value, totalHosts.value)
    }
  } finally {
    task.finish()
    loading.value = false
  }
}

// Export
const exportJson = () => {
  const blob = new Blob([JSON.stringify(results.value, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `ping-sweep-results.json`
  a.click()
}

const exportCsv = () => {
  const header = 'Host,Status,ResponseTime,Protocol,OS'
  const rows = results.value.map(r => `${r.host},${r.status},${r.time || ''},${r.protocol},${r.os || ''}`)
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `ping-sweep-results.csv`
  a.click()
}
</script>
