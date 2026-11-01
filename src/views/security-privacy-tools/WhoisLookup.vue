<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'Security & Privacy Tools' }, { text: 'Whois Lookup' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-4">🕵️ Whois Lookup</h2>

      <!-- Input -->
      <div class="flex gap-2 mb-4">
        <input
          v-model="domain"
          type="text"
          placeholder="Enter domain (example.com)"
          class="flex-1 border rounded-lg p-2 dark:bg-gray-900 dark:text-white"
        />
        <button
          @click="lookupWhois"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? "Searching..." : "Lookup" }}
        </button>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-red-500 mt-4">
        {{ error }}
      </div>

      <!-- Results -->
      <div v-if="result" class="mt-6 space-y-4">
        <h3 class="font-semibold text-lg mb-2">📑 Whois Result</h3>

        <!-- Main Info -->
        <div class="grid md:grid-cols-2 gap-4">
          <div class="p-4 border rounded-lg dark:border-gray-700">
            <p><strong>🌍 Domain:</strong> {{ result.domain }}</p>
            <p><strong>🏢 Registrar:</strong> {{ result.registrar }}</p>
            <p><strong>📅 Created:</strong> {{ result.creationDate }}</p>
            <p><strong>📅 Expires:</strong> {{ result.expiryDate }}</p>
            <p><strong>📅 Updated:</strong> {{ result.updatedDate }}</p>
          </div>

          <div class="p-4 border rounded-lg dark:border-gray-700">
            <p><strong>📡 Nameservers:</strong></p>
            <ul class="list-disc list-inside">
              <li v-for="ns in normalizedNameservers" :key="ns">{{ ns }}</li>
            </ul>
            <p class="mt-2"><strong>📧 Emails:</strong></p>
            <ul class="list-disc list-inside">
              <li v-for="email in normalizedEmails" :key="email">{{ email }}</li>
            </ul>
          </div>
        </div>

        <!-- Copy / Export -->
        <div class="flex gap-2 mt-4">
          <button @click="copyResult" class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
            📋 Copy JSON
          </button>
          <button @click="downloadJSON" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
            ⬇️ Download JSON
          </button>
        </div>

        <!-- Raw JSON (optional toggle) -->
        <details class="mt-4">
          <summary class="cursor-pointer text-blue-500">Show Raw Data</summary>
          <pre class="bg-gray-100 dark:bg-gray-900 text-sm p-4 rounded-lg overflow-x-auto">
{{ result.raw }}
          </pre>
        </details>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";

// server storage
import {useStore} from 'vuex'
const store = useStore()
const localServerIP = computed(() => store.getters['profile/getLocalServerIP'] || '')


const domain = ref("");
const result = ref(null);
const error = ref(null);
const loading = ref(false);

const normalizedNameservers = computed(() => {
  if (!result.value?.nameServers) return [];
  return Array.isArray(result.value.nameServers)
    ? result.value.nameServers
    : [result.value.nameServers];
});

const normalizedEmails = computed(() => {
  if (!result.value?.emails) return [];
  return Array.isArray(result.value.emails)
    ? result.value.emails
    : [result.value.emails];
});

const lookupWhois = async () => {
  if (!domain.value) {
    error.value = "⚠️ Please enter a domain!";
    return;
  }

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const res = await axios.post(`${localServerIP.value}/api/whois`, { domain: domain.value });
    result.value = res.data;
  } catch (err) {
    error.value = err.response?.data?.error || "Something went wrong!";
  } finally {
    loading.value = false;
  }
};

// 📋 Copy result
const copyResult = () => {
  if (result.value) {
    navigator.clipboard.writeText(JSON.stringify(result.value, null, 2));
    alert("Copied to clipboard!");
  }
};

// ⬇️ Download JSON
const downloadJSON = () => {
  if (result.value) {
    const blob = new Blob([JSON.stringify(result.value, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.value.domain}-whois.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
</script>
