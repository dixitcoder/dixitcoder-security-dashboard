<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'Advanced Network Tools' }, { text: 'Bandwidth Tester' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-4">🚦 Bandwidth Tester</h2>

      <div class="flex gap-2 mb-4">
        <input
          v-model="target"
          type="text"
          placeholder="Enter host or IP (example.com)"
          class="flex-1 border rounded-lg p-2 dark:bg-gray-900 dark:text-white"
        />
        <button
          @click="startTest"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? "Testing..." : "Start Test" }}
        </button>
      </div>

      <div v-if="result" class="mt-4">
        <h3 class="font-semibold text-lg mb-2">Result:</h3>
        <pre class="bg-gray-100 dark:bg-gray-900 text-sm p-4 rounded-lg overflow-x-auto">
{{ result }}
        </pre>
      </div>

      <div v-if="error" class="text-red-500 mt-4">
        {{ error }}
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios'
import { isResponsibleUseCancellation } from '@/composables/useResponsibleUse'
import { beginScanTask } from '@/composables/useScanTask'
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';

const target = ref('');
const result = ref(null);
const error = ref(null);
const loading = ref(false);

const startTest = async () => {
  if (!target.value) {
    error.value = "Please enter a host/IP!";
    return;
  }

  loading.value = true;
  const task = beginScanTask('Bandwidth test', target.value);
  if (!task) {
    loading.value = false;
    return;
  }
  error.value = null;
  result.value = null;

  try {
    const res = await axios.post('/api/bandwidth-test', { host: target.value }, { signal: task.signal });
    result.value = JSON.stringify(res.data, null, 2);
  } catch (err) {
    if (isResponsibleUseCancellation(err)) return;
    error.value = err.response?.data?.error || 'Something went wrong!';
  } finally {
    task.finish();
    loading.value = false;
  }
};
</script>
