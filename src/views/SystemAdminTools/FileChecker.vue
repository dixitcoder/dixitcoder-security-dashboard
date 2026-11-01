<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'System Admin Tools' }, { text: 'File Integrity Checker' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-4">📂 File Integrity Checker</h2>

      <div class="flex gap-2 mb-4">
        <input
          v-model="filePath"
          type="text"
          placeholder="Enter file path (e.g., /etc/passwd)"
          class="flex-1 border rounded-lg p-2 dark:bg-gray-900 dark:text-white"
        />
        <button
          @click="checkFile"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? "Checking..." : "Check" }}
        </button>
      </div>

      <div v-if="result" class="mt-4">
        <h3 class="font-semibold text-lg mb-2">Result:</h3>
        <pre class="bg-gray-100 dark:bg-gray-900 text-sm p-4 rounded-lg overflow-x-auto">
{{ result }}
        </pre>
      </div>

      <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";

const filePath = ref("");
const result = ref(null);
const error = ref(null);
const loading = ref(false);

const checkFile = async () => {
  if (!filePath.value) {
    error.value = "Please enter a file path!";
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const res = await axios.post("/api/file-check", { path: filePath.value });
    result.value = JSON.stringify(res.data, null, 2);
  } catch (err) {
    error.value = err.response?.data?.error || "Something went wrong!";
  } finally {
    loading.value = false;
  }
};
</script>
