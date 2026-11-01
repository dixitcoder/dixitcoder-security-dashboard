<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'Developer Utilities' }, { text: 'Regex Tester' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-4">🔎 Regex Tester</h2>

      <!-- Input Fields -->
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="font-semibold">Regex Pattern:</label>
          <input
            v-model="pattern"
            type="text"
            placeholder="Enter regex (e.g. ^[a-z]+$)"
            class="w-full border rounded-lg p-2 dark:bg-gray-900 dark:text-white mt-1"
          />
        </div>
        <div>
          <label class="font-semibold">Flags:</label>
          <input
            v-model="flags"
            type="text"
            placeholder="Enter flags (e.g. g, i, m)"
            class="w-full border rounded-lg p-2 dark:bg-gray-900 dark:text-white mt-1"
          />
        </div>
      </div>

      <!-- Test String -->
      <div class="mt-4">
        <label class="font-semibold">Test String:</label>
        <textarea
          v-model="testString"
          rows="5"
          placeholder="Enter text to test regex"
          class="w-full border rounded-lg p-2 dark:bg-gray-900 dark:text-white mt-1"
        ></textarea>
      </div>

      <!-- Buttons -->
      <div class="flex gap-2 mt-4">
        <button
          @click="runRegex"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? "Testing..." : "Test Regex" }}
        </button>
        <button
          @click="clearAll"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Clear
        </button>
      </div>

      <!-- Results -->
      <div v-if="result" class="mt-6">
        <h3 class="font-semibold text-lg mb-2">Matches:</h3>
        <pre
          class="bg-gray-100 dark:bg-gray-900 text-sm p-4 rounded-lg overflow-x-auto"
        >{{ result }}</pre>
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
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";

const pattern = ref("");
const flags = ref("");
const testString = ref("");
const result = ref(null);
const error = ref(null);
const loading = ref(false);

const runRegex = async () => {
  if (!pattern.value || !testString.value) {
    error.value = "Please enter regex and test string!";
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const res = await axios.post("/api/regex", {
      pattern: pattern.value,
      flags: flags.value,
      testString: testString.value,
    });
    result.value = JSON.stringify(res.data, null, 2);
  } catch (err) {
    error.value = err.response?.data?.error || "Something went wrong!";
  } finally {
    loading.value = false;
  }
};

const clearAll = () => {
  pattern.value = "";
  flags.value = "";
  testString.value = "";
  result.value = null;
  error.value = null;
};
</script>
