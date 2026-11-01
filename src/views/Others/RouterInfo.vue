<template>
  <AdminLayout>
    <PageBreadcrumb
      :items="[{ text: 'Dashboard', to: '/' }, { text: 'Router Info', active: true }]"
    />

    <div class="rounded-2xl border p-5 bg-white dark:bg-gray-900 dark:border-gray-800">
      <h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">📡 Router Info</h1>

      <button
        @click="getRouterInfo"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
      >
        Fetch Router Info
      </button>

      <div v-if="loading" class="dashboard-skeleton mt-4 h-12" role="status" aria-label="Loading router information"></div>
      <p v-else-if="error" class="dashboard-error-state mt-4" role="alert">
        Router information could not be loaded: {{ error }}
      </p>
      <p v-else-if="!router" class="dashboard-empty-state mt-4" role="status">
        Fetch router information to view the available details.
      </p>

      <div v-if="router" class="mt-6">
        <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Router Details</h2>
        <div class="max-w-full overflow-x-auto" tabindex="0" role="region" aria-label="Router details table; scroll horizontally on small screens">
        <table class="w-full text-left border-collapse">
          <tbody>
            <tr class="hover:bg-gray-100 dark:hover:bg-gray-700">
              <td class="px-3 py-2 border font-medium text-gray-700 dark:text-gray-300">IP Address</td>
              <td class="px-3 py-2 border text-gray-900 dark:text-gray-100">{{ router.ip }}</td>
            </tr>
            <tr class="hover:bg-gray-100 dark:hover:bg-gray-700">
              <td class="px-3 py-2 border font-medium text-gray-700 dark:text-gray-300">Hostname</td>
              <td class="px-3 py-2 border text-gray-900 dark:text-gray-100">{{ router.hostname }}</td>
            </tr>
            <tr class="hover:bg-gray-100 dark:hover:bg-gray-700">
              <td class="px-3 py-2 border font-medium text-gray-700 dark:text-gray-300">Subnet Mask</td>
              <td class="px-3 py-2 border text-gray-900 dark:text-gray-100">{{ router.subnet }}</td>
            </tr>
            <tr class="hover:bg-gray-100 dark:hover:bg-gray-700">
              <td class="px-3 py-2 border font-medium text-gray-700 dark:text-gray-300">Gateway</td>
              <td class="px-3 py-2 border text-gray-900 dark:text-gray-100">{{ router.gateway }}</td>
            </tr>
            <tr class="hover:bg-gray-100 dark:hover:bg-gray-700">
              <td class="px-3 py-2 border font-medium text-gray-700 dark:text-gray-300">DNS Servers</td>
              <td class="px-3 py-2 border text-gray-900 dark:text-gray-100">{{ router.dns.join(', ') }}</td>
            </tr>
            <tr class="hover:bg-gray-100 dark:hover:bg-gray-700" v-if="router.mac">
              <td class="px-3 py-2 border font-medium text-gray-700 dark:text-gray-300">MAC Address</td>
              <td class="px-3 py-2 border text-gray-900 dark:text-gray-100">{{ router.mac }}</td>
            </tr>
            <tr class="hover:bg-gray-100 dark:hover:bg-gray-700" v-if="router.interface">
              <td class="px-3 py-2 border font-medium text-gray-700 dark:text-gray-300">Interface</td>
              <td class="px-3 py-2 border text-gray-900 dark:text-gray-100">{{ router.interface }}</td>
            </tr>
            <tr class="hover:bg-gray-100 dark:hover:bg-gray-700" v-if="router.ipv6">
              <td class="px-3 py-2 border font-medium text-gray-700 dark:text-gray-300">IPv6 Address</td>
              <td class="px-3 py-2 border text-gray-900 dark:text-gray-100">{{ router.ipv6 }}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'


// server storage
import {computed} from 'vue';
import {useStore} from 'vuex'
const store = useStore()
const localServerIP = computed(() => store.getters['profile/getLocalServerIP'] || '')


const router = ref(null)
const loading = ref(false)
const error = ref('')

const getRouterInfo = async () => {
  loading.value = true
  router.value = null
  error.value = ''

  try {
    const { data } = await axios.get(`${localServerIP.value}/router-info`)
    router.value = data
  } catch (err) {
    error.value = err.response?.data?.error || err.message || 'Unknown API error'
  } finally {
    loading.value = false
  }
}
</script>
