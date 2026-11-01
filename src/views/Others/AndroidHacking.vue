<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'Android Tools' }, { text: 'Unavailable' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-4">Android payload tools unavailable</h2>
      <p class="text-gray-600 dark:text-gray-300">
        APK generation and remote handler endpoints are disabled. No payloads or handlers are launched by this dashboard.
      </p>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
</script>
