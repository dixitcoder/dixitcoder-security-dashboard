<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'Security & Privacy Tools' }, { text: 'DNS Leak Test' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-4">🔏 DNS Leak Test</h2>

      <!-- Domain Input -->
      <div class="flex gap-2 mb-4">
        <input
          v-model="domain"
          type="text"
          placeholder="Enter domain (example.com)"
          class="flex-1 border rounded-lg p-2 dark:bg-gray-900 dark:text-white"
        />
        <button
          @click="testDNSLeak"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? "Checking..." : "Check DNS" }}
        </button>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>

      <!-- Results -->
      <div v-if="result" class="mt-4">
        <h3 class="font-semibold text-lg mb-2">DNS Records for {{ result.domain }}</h3>
        <pre class="bg-gray-100 dark:bg-gray-900 text-sm p-4 rounded-lg overflow-x-auto">
{{ JSON.stringify(result.records, null, 2) }}
        </pre>

        <!-- Copy / Download -->
        <div class="flex gap-2 mt-4">
          <button @click="copyResult" class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">📋 Copy JSON</button>
          <button @click="downloadJSON" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">⬇️ Download JSON</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { isResponsibleUseCancellation } from "@/composables/useResponsibleUse";
import { beginScanTask } from "@/composables/useScanTask";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
// server storage
import {computed} from 'vue';
import {useStore} from 'vuex'
const store = useStore()
const localServerIP = computed(() => store.getters['profile/getLocalServerIP'] || '')

const domain = ref("");
const result = ref(null);
const error = ref(null);
const loading = ref(false);

const testDNSLeak = async () => {
  if (!domain.value) {
    error.value = "⚠️ Please enter a domain!";
    return;
  }

  loading.value = true;
  const task = beginScanTask("DNS leak test", domain.value);
  if (!task) {
    loading.value = false;
    return;
  }
  error.value = null;
  result.value = null;

  try {
    const res = await axios.post(`${localServerIP.value}/api/dns-leak`, { domain: domain.value }, { signal: task.signal });
    result.value = res.data;
  } catch (err) {
    if (isResponsibleUseCancellation(err)) return
    error.value = err.response?.data?.error || "Something went wrong!";
  } finally {
    task.finish();
    loading.value = false;
  }
};

// Copy JSON
const copyResult = () => {
  if (result.value) navigator.clipboard.writeText(JSON.stringify(result.value, null, 2));
};

// Download JSON
const downloadJSON = () => {
  if (!result.value) return;
  const blob = new Blob([JSON.stringify(result.value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${result.value.domain}-dns-leak.json`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>
