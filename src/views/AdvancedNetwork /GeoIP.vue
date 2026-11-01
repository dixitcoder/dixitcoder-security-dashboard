<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'Advanced Network Tools' }, { text: 'GeoIP Locator' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-4">🌍 GeoIP Locator</h2>

      <div class="flex gap-2 mb-4">
        <input
          v-model="ip"
          type="text"
          placeholder="Enter IP (example: 8.8.8.8)"
          class="flex-1 border rounded-lg p-2 dark:bg-gray-900 dark:text-white"
        />
        <button
          @click="lookupGeoIP"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? "Searching..." : "Lookup" }}
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
import { ref } from "vue";
import axios from "axios";
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const ip = ref("");
const result = ref(null);
const error = ref(null);
const loading = ref(false);

const lookupGeoIP = async () => {
  if (!ip.value) {
    error.value = "Please enter an IP address!";
    return;
  }

  loading.value = true;
  result.value = null;
  error.value = null;

  try {
    const res = await axios.post("/api/geoip", { ip: ip.value });
    result.value = JSON.stringify(res.data, null, 2);
  } catch (err) {
    error.value = err.response?.data?.error || "Something went wrong!";
  } finally {
    loading.value = false;
  }
};
</script>
