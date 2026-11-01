<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'Developer Utilities' }, { text: 'Base64 Encode/Decode' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-4">🔤 Base64 Encode/Decode</h2>

      <!-- Input Text -->
      <textarea
        v-model="inputText"
        rows="5"
        placeholder="Enter your text here..."
        class="w-full border rounded-lg p-3 dark:bg-gray-900 dark:text-white mb-4"
      ></textarea>

      <!-- Buttons -->
      <div class="flex gap-3 mb-4">
        <button
          @click="encodeText"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          :disabled="loading"
        >
          {{ loading ? "Encoding..." : "Encode" }}
        </button>
        <button
          @click="decodeText"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? "Decoding..." : "Decode" }}
        </button>
        <button
          @click="clearAll"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Clear
        </button>
      </div>

      <!-- Result -->
      <div v-if="result" class="mt-4">
        <h3 class="font-semibold text-lg mb-2">Result:</h3>
        <pre
          class="bg-gray-100 dark:bg-gray-900 text-sm p-4 rounded-lg overflow-x-auto"
        >{{ result }}</pre>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-red-500 mt-4">
        {{ error }}
      </div>
    </div>
  </AdminLayout>
</template>
<!-- how to use api app.post("/api/base64/encode", (req, res) => {
  const { text } = req.body;
  try {
    const encoded = base64Utils.encodeBase64(text);
    res.json({ encoded });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/base64/decode", (req, res) => {
  const { encoded } = req.body;
  try {
    const decoded = base64Utils.decodeBase64(encoded);
    res.json({ decoded });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}); -->
<script setup>
import { ref } from "vue";
import axios from "axios";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";

const inputText = ref("");
const result = ref(null);
const error = ref(null);
const loading = ref(false);

// Encode Request
const encodeText = async () => {
  if (!inputText.value.trim()) {
    error.value = "⚠️ Please enter text to encode.";
    return;
  }
  await callApi("encode");
};

// Decode Request
const decodeText = async () => {
  if (!inputText.value.trim()) {
    error.value = "⚠️ Please enter text to decode.";
    return;
  }
  await callApi("decode");
};

// API Call
// API Call
const callApi = async (action) => {
  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const url =
      action === "encode"
        ? "/api/base64/encode"
        : "/api/base64/decode";

    const res = await axios.post(url, { text: inputText.value });
    result.value = res.data.result;
  } catch (err) {
    error.value = err.response?.data?.error || "❌ Something went wrong!";
  } finally {
    loading.value = false;
  }
};


// Clear Input & Result
const clearAll = () => {
  inputText.value = "";
  result.value = null;
  error.value = null;
};
</script>
  