<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'Advanced Network Tools' }, { text: 'Packet Sniffer' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-4">🔄 Packet Sniffer (Basic)</h2>

      <div class="flex gap-2 mb-4">
        <input
          v-model="iface"
          type="text"
          placeholder="Network interface (eth0)"
          class="flex-1 border rounded-lg p-2 dark:bg-gray-900 dark:text-white"
        />
        <input
          v-model.number="packetCount"
          type="number"
          placeholder="Packet count"
          class="w-32 border rounded-lg p-2 dark:bg-gray-900 dark:text-white"
        />
        <button
          @click="startSniffer"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? "Sniffing..." : "Start Sniffer" }}
        </button>
      </div>

      <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>

      <div v-if="packets.length" class="mt-4">
        <h3 class="font-semibold text-lg mb-2">Captured Packets:</h3>
        <pre class="bg-gray-100 dark:bg-gray-900 text-sm p-4 rounded-lg overflow-x-auto">
{{ packets }}
        </pre>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { isResponsibleUseCancellation } from '@/composables/useResponsibleUse';
import { beginScanTask } from '@/composables/useScanTask';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';

const iface = ref('eth0');
const packetCount = ref(10);
const packets = ref([]);
const loading = ref(false);
const error = ref(null);

const startSniffer = async () => {
  error.value = null;
  packets.value = [];
  const task = beginScanTask('Packet capture', `${packetCount.value} packets`);
  if (!task) return;
  loading.value = true;

  try {
    const res = await axios.get('/api/packet-sniffer', {
      params: { iface: iface.value, count: packetCount.value },
      signal: task.signal,
    });
    packets.value = res.data.packets;
  } catch (err) {
    if (isResponsibleUseCancellation(err)) return
    error.value = err.response?.data?.error || err.message;
  } finally {
    task.finish();
    loading.value = false;
  }
};
</script>
