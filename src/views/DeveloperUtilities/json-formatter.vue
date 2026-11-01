<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'Developer Utilities' }, { text: 'JSON Formatter' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-4">📑 JSON Formatter</h2>

      <!-- Input Section -->
      <textarea
        v-model="rawJson"
        rows="10"
        placeholder='Paste your JSON here...'
        class="w-full border rounded-lg p-3 font-mono dark:bg-gray-900 dark:text-white"
      ></textarea>

      <!-- Actions -->
      <div class="flex gap-3 mt-4">
        <button
          @click="formatJson"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Format
        </button>
        <button
          @click="minifyJson"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Minify
        </button>
        <button
          @click="validateJson"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Validate
        </button>
        <button
          @click="copyToClipboard"
          :disabled="!result"
          class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          Copy
        </button>
      </div>

      <!-- Result Section -->
      <div v-if="result" class="mt-6">
        <h3 class="text-lg font-semibold">Result:</h3>
        <pre
          class="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm font-mono"
        >{{ result }}</pre>
      </div>

      <!-- Error Section -->
      <div v-if="error" class="text-red-500 mt-4 font-semibold">
        {{ error }}
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";

const rawJson = ref("");
const result = ref(null);
const error = ref(null);

const formatJson = async () => {
  try {
    const res = await axios.post("/api/json/format", {
      json: rawJson.value,
    });
    result.value = res.data.formatted;
    error.value = null;
  } catch (err) {
    error.value = err.response?.data?.error || "Invalid JSON format!";
  }
};

const minifyJson = async () => {
  try {
    const res = await axios.post("/api/json/minify", {
      json: rawJson.value,
    });
    result.value = res.data.minified;
    error.value = null;
  } catch (err) {
    error.value = err.response?.data?.error || "Invalid JSON format!";
  }
};

const validateJson = async () => {
  try {
    const res = await axios.post("/api/json/validate", {
      json: rawJson.value,
    });
    result.value = res.data.valid
      ? "✅ JSON is valid!"
      : "❌ JSON is invalid!";
    error.value = null;
  } catch (err) {
    error.value = err.response?.data?.error || "Error validating JSON!";
  }
};

const copyToClipboard = () => {
  if (result.value) {
    navigator.clipboard.writeText(result.value);
    alert("✅ Copied to clipboard!");
  }
};
</script>
