<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'Security & Privacy Tools' }, { text: 'Firewall Tester' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-4">🛡️ Firewall Tester</h2>

      <!-- Domain input -->
      <div class="flex gap-2 mb-4">
        <input
          v-model="domain"
          type="text"
          placeholder="Enter domain (example.com)"
          class="flex-1 border rounded-lg p-2 dark:bg-gray-900 dark:text-white"
        />
        <button
          @click="testFirewall"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? "Testing..." : "Test Firewall" }}
        </button>
      </div>

      <!-- Ports input -->
      <div class="flex gap-2 mb-4">
        <input
          v-model="portsInput"
          type="text"
          placeholder="Ports (comma separated, e.g., 80,443,22)"
          class="flex-1 border rounded-lg p-2 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <!-- Error -->
      <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>

      <!-- Results -->
      <div v-if="result" class="mt-6">
        <h3 class="font-semibold text-lg mb-2">Result for {{ result.domain }}</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div
            v-for="item in result.results"
            :key="item.port"
            class="p-4 border rounded-lg dark:border-gray-700 flex justify-between items-center"
          >
            <span>Port: {{ item.port }}</span>
            <span
              :class="item.status === 'Open' ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'"
            >
              {{ item.status }}
            </span>
          </div>
        </div>

        <!-- Copy / Download -->
        <div class="flex gap-2 mt-4">
          <button @click="copyResult" class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
            📋 Copy JSON
          </button>
          <button @click="downloadJSON" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
            ⬇️ Download JSON
          </button>
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
const portsInput = ref(""); // e.g. "80,443,22"
const result = ref(null);
const error = ref(null);
const loading = ref(false);

const testFirewall = async () => {
  if (!domain.value) {
    error.value = "⚠️ Please enter a domain!";
    return;
  }

  loading.value = true;
  const task = beginScanTask("Firewall test", domain.value);
  if (!task) {
    loading.value = false;
    return;
  }
  error.value = null;
  result.value = null;

  const ports = portsInput.value
    ? portsInput.value.split(",").map((p) => parseInt(p.trim()))
    : undefined;

  try {
    const res = await axios.post(`${localServerIP.value}/api/firewall-test`, { domain: domain.value, ports }, { signal: task.signal });
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
  a.download = `${result.value.domain}-firewall.json`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>
