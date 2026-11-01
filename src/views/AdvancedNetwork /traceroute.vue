<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'Advanced Network Tools' }, { text: 'Traceroute' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-4">📶 Traceroute</h2>

      <div class="flex gap-2 mb-4">
        <input
          v-model="host"
          type="text"
          placeholder="Enter hostname or IP (e.g., google.com)"
          class="flex-1 border rounded-lg p-2 dark:bg-gray-900 dark:text-white"
        />
        <button
          @click="runTraceroute"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? "Running..." : "Start" }}
        </button>
      </div>

      <div v-if="error" class="text-red-500 mt-2">{{ error }}</div>

      <div v-if="result" class="mt-4">
        <h3 class="font-semibold text-lg mb-2">Result:</h3>
        <pre class="bg-gray-100 dark:bg-gray-900 text-sm p-4 rounded-lg overflow-x-auto">
{{ result }}
        </pre>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
defineOptions({ name: "NetworkTraceroute" });

import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { isResponsibleUseCancellation } from "@/composables/useResponsibleUse";
import { beginScanTask } from "@/composables/useScanTask";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";

const host = ref("");
const route = useRoute();
onMounted(() => {
  if (typeof route.query.target === "string") host.value = route.query.target;
});
const result = ref(null);
const error = ref(null);
const loading = ref(false);

const runTraceroute = async () => {
  if (!host.value) {
    error.value = "Please enter a hostname or IP!";
    return;
  }

  loading.value = true;
  const task = beginScanTask("Traceroute", host.value);
  if (!task) {
    loading.value = false;
    return;
  }
  result.value = null;
  error.value = null;

  try {
    const res = await axios.post("/api/traceroute", { host: host.value }, { signal: task.signal });
    result.value = res.data.result;
  } catch (err) {
    if (isResponsibleUseCancellation(err)) return
    error.value = err.response?.data?.error || "Something went wrong!";
  } finally {
    task.finish();
    loading.value = false;
  }
};
</script>
