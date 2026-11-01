<template>
  <AdminLayout>
    <PageBreadcrumb :items="[{ text: 'System Admin Tools' }, { text: 'Active Processes' }]" />

    <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">🖥️ Active Processes</h2>

      <!-- Loading & Error -->
      <div v-if="loading" class="text-yellow-500 font-medium mb-4">Loading processes...</div>
      <div v-if="error" class="text-red-500 font-medium mb-4">{{ error }}</div>

      <!-- Table with Graph -->
      <div v-if="processes" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th class="px-4 py-2 text-left text-gray-700 dark:text-gray-200 font-semibold">PID</th>
              <th class="px-4 py-2 text-left text-gray-700 dark:text-gray-200 font-semibold">Name</th>
              <th class="px-4 py-2 text-left text-gray-700 dark:text-gray-200 font-semibold">CPU %</th>
              <th class="px-4 py-2 text-left text-gray-700 dark:text-gray-200 font-semibold">Memory %</th>
              <th class="px-4 py-2 text-left text-gray-700 dark:text-gray-200 font-semibold">User</th>
              <th class="px-4 py-2 text-left text-gray-700 dark:text-gray-200 font-semibold">State</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="proc in processes.list" :key="proc.pid" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <td class="px-4 py-2 font-medium text-gray-800 dark:text-gray-200">{{ proc.pid }}</td>
              <td class="px-4 py-2 text-gray-800 dark:text-gray-200">{{ proc.name }}</td>

              <!-- CPU Graph -->
              <td class="px-4 py-2">
                <div class="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded relative">
                  <div
                    class="bg-blue-500 h-4 rounded absolute top-0 left-0"
                    :style="{ width: proc.cpu + '%' }"
                  ></div>
                  <span class="absolute right-1 top-0 text-xs text-white dark:text-gray-200">{{ proc.cpu.toFixed(1) }}%</span>
                </div>
              </td>

              <!-- Memory Graph -->
              <td class="px-4 py-2">
                <div class="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded relative">
                  <div
                    class="bg-green-500 h-4 rounded absolute top-0 left-0"
                    :style="{ width: proc.mem + '%' }"
                  ></div>
                  <span class="absolute right-1 top-0 text-xs text-white dark:text-gray-200">{{ proc.mem.toFixed(1) }}%</span>
                </div>
              </td>

              <td class="px-4 py-2 text-gray-800 dark:text-gray-200">{{ proc.user }}</td>
              <td class="px-4 py-2 text-gray-800 dark:text-gray-200">{{ proc.state }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div v-if="processes" class="mt-4 text-gray-700 dark:text-gray-300">
        Total Processes: {{ processes.all }} | Running: {{ processes.running }} | Sleeping: {{ processes.sleeping }}
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const processes = ref(null)
const loading = ref(false)
const error = ref(null)

const fetchProcesses = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await axios.get('/api/process-list')
    processes.value = data
  } catch (err) {
    error.value = err.response?.data?.error || 'Error fetching processes!'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProcesses()
})
</script>

<style scoped>
/* Table container shadow & rounded */
table {
  border-radius: 12px;
  overflow: hidden;
}

/* Header colors + sticky */
thead th {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f3f4f6; /* Tailwind gray-100 */
  color: #374151; /* Tailwind gray-700 */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* Table row hover effects */
tbody tr:hover {
  background-color: #f9fafb; /* Tailwind gray-50 */
  transition: background-color 0.2s;
}

/* Dark mode overrides */
.dark thead th {
  background-color: #374151; /* Tailwind gray-700 */
  color: #f9fafb; /* Tailwind gray-100 */
}

.dark tbody tr:hover {
  background-color: #4b5563; /* Tailwind gray-700 hover */
}

/* CPU & Memory bars */
.cpu-bar, .mem-bar {
  height: 0.9rem;
  border-radius: 0.375rem; /* rounded-md */
  background-color: #e5e7eb; /* gray-200 */
  position: relative;
  overflow: hidden;
}

.cpu-bar-fill {
  height: 100%;
  background-color: #3b82f6; /* blue-500 */
  border-radius: 0.375rem;
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.3s ease;
}

.mem-bar-fill {
  height: 100%;
  background-color: #10b981; /* green-500 */
  border-radius: 0.375rem;
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.3s ease;
}

/* Badges for state */
.state-badge {
  padding: 0.125rem 0.5rem; /* px-2 py-1 */
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.75rem; /* text-xs */
  color: white;
  text-transform: uppercase;
}

/* State colors */
.running { background-color: #16a34a; }  /* green-600 */
.sleeping { background-color: #f59e0b; } /* yellow-500 */
.blocked { background-color: #dc2626; }  /* red-600 */

/* Footer summary styles */
.summary-footer {
  margin-top: 1rem;
  font-weight: 500;
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  color: #374151;
}

.dark .summary-footer {
  color: #d1d5db; /* gray-300 */
}

/* Table text */
td, th {
  padding: 0.5rem 1rem; /* px-4 py-2 */
  min-width: 120px;
  font-size: 0.875rem;
  color: #1f2937; /* gray-800 */
}

.dark td, .dark th {
  color: #f3f4f6; /* gray-100 */
}

/* Rounded progress container */
.progress-container {
  border-radius: 0.5rem;
  background-color: #d1d5db; /* gray-300 */
  height: 0.875rem;
  width: 100%;
  overflow: hidden;
  position: relative;
}

/* Fill bar inside container */
.progress-fill {
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  transition: width 0.3s ease-in-out;
  border-radius: 0.5rem;
}

/* Tooltips for bars */
.progress-container:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  top: -1.5rem;
  right: 0;
  background: #111827;
  color: #f9fafb;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  white-space: nowrap;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  height: 0.5rem;
  width: 0.5rem;
}
::-webkit-scrollbar-track {
  background: #f3f4f6; /* gray-100 */
}
::-webkit-scrollbar-thumb {
  background: #9ca3af; /* gray-400 */
  border-radius: 0.25rem;
}
.dark ::-webkit-scrollbar-track {
  background: #1f2937; /* gray-800 */
}
.dark ::-webkit-scrollbar-thumb {
  background: #6b7280; /* gray-500 */
}

/* Responsive for mobile */
@media (max-width: 768px) {
  td, th {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  .summary-footer {
    flex-direction: column;
  }
}

/* Rounded card container */
.card-container {
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1),
              0 4px 6px -2px rgba(0,0,0,0.05);
  background-color: #fff;
}

.dark .card-container {
  background-color: #1f2937;
}

/* Advanced hover effects for table rows */
tbody tr {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
tbody tr:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 10px -3px rgba(0,0,0,0.1);
}

/* Tooltip arrows */
.progress-container::before {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: #111827 transparent transparent transparent;
}
</style>
