<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'System Admin Tools' }, { text: 'Port Forwarding Checker' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-4">📦 Port Forwarding Checker</h2>

      <div class="flex flex-col md:flex-row gap-2 mb-4">
        <input
          v-model="host"
          type="text"
          placeholder="Enter host (example.com)"
          class="flex-1 border rounded-lg p-2 dark:bg-gray-900 dark:text-white"
        />
        <input
          v-model.number="port"
          type="number"
          placeholder="Enter port (e.g., 80)"
          class="flex-1 border rounded-lg p-2 dark:bg-gray-900 dark:text-white"
        />
        <button
          @click="checkPort"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? "Checking..." : "Check Port" }}
        </button>
      </div>

      <div v-if="result" class="mt-4">
        <h3 class="font-semibold text-lg mb-2">Result:</h3>
        <p :class="result.open ? 'text-green-500' : 'text-red-500'">
          Port {{ result.port }} on {{ result.host }} is
          <strong>{{ result.open ? 'OPEN' : 'CLOSED' }}</strong>
        </p>
      </div>

      <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';

const host = ref('');
const port = ref(null);
const result = ref(null);
const error = ref(null);
const loading = ref(false);

const checkPort = async () => {
  if (!host.value || !port.value) {
    error.value = 'Please enter host and port!';
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const res = await axios.post('/api/port-forwarding', {
      host: host.value,
      port: port.value,
    });
    result.value = res.data;
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to check port';
  } finally {
    loading.value = false;
  }
};
</script>
