<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'System Admin Tools' }, { text: 'ARP Table Viewer' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-4">🖧 ARP Table Viewer</h2>

      <button
        @click="fetchARP"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
        :disabled="loading"
      >
        {{ loading ? 'Loading...' : 'Refresh Table' }}
      </button>

      <div v-if="error" class="dashboard-error-state mb-4" role="alert">{{ error }}</div>

      <div v-else-if="loading" class="dashboard-skeleton mb-4 h-16" role="status" aria-label="Loading ARP entries"></div>

      <div v-else-if="arpTable.length" class="max-w-full overflow-x-auto" tabindex="0" role="region" aria-label="ARP table; scroll horizontally on small screens">
        <table class="min-w-full border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
          <thead class="bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <tr>
              <th class="px-3 py-2 border">IP Address</th>
              <th class="px-3 py-2 border">MAC Address</th>
              <th class="px-3 py-2 border">Interface</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in arpTable" :key="item.ip" class="hover:bg-gray-100 dark:hover:bg-gray-700">
              <td class="border px-3 py-2">{{ item.ip }}</td>
              <td class="border px-3 py-2">{{ item.mac }}</td>
              <td class="border px-3 py-2">{{ item.interface }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="dashboard-empty-state" role="status">No ARP entries found.</div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';

const arpTable = ref([]);
const loading = ref(false);
const error = ref(null);
let intervalId = null;

const fetchARP = async () => {
  loading.value = true;
  error.value = null;

  try {
    const res = await axios.get('/api/arp-table');
    arpTable.value = res.data;
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to fetch ARP table.';
  } finally {
    loading.value = false;
  }
};

// Auto-refresh every 5 seconds
onMounted(() => {
  fetchARP(); // initial fetch
  intervalId = setInterval(fetchARP, 5000); // auto-refresh
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>
