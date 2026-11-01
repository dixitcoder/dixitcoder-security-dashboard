<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'Developer Utilities' }, { text: 'Hash Generator' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-4">🔑 Hash Generator (MD5 / SHA256 / SHA512)</h2>

      <!-- Input -->
      <textarea
        v-model="inputText"
        placeholder="Enter text to hash..."
        rows="4"
        class="w-full border rounded-lg p-3 mb-4 dark:bg-gray-900 dark:text-white"
      ></textarea>

      <!-- Algorithm Selector -->
      <div class="flex gap-4 items-center mb-4">
        <label class="font-semibold">Select Algorithm:</label>
        <select v-model="algorithm" class="border rounded-lg p-2 dark:bg-gray-900 dark:text-white">
          <option value="md5">MD5</option>
          <option value="sha256">SHA256</option>
          <option value="sha512">SHA512</option>
        </select>
      </div>

      <!-- Generate Button -->
      <button
        @click="generateHash"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        :disabled="loading"
      >
        {{ loading ? "Generating..." : "Generate Hash" }}
      </button>

      <!-- Results -->
      <div v-if="hashResult" class="mt-6">
        <h3 class="font-semibold mb-2">Result:</h3>
        <pre
          class="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg text-sm overflow-x-auto"
        >{{ hashResult }}</pre>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-red-500 mt-4">
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

const inputText = ref("");
const algorithm = ref("md5");
const hashResult = ref(null);
const error = ref(null);
const loading = ref(false);

const generateHash = async () => {
  if (!inputText.value) {
    error.value = "⚠️ Please enter text to hash!";
    return;
  }

  loading.value = true;
  error.value = null;
  hashResult.value = null;

  try {
    const res = await axios.post("/api/hash", {
      text: inputText.value,
      algorithm: algorithm.value,
    });
    hashResult.value = res.data.hash;
  } catch (err) {
    error.value = err.response?.data?.error || "Something went wrong!";
  } finally {
    loading.value = false;
  }
};
</script>
