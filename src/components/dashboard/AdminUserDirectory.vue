<template>
  <section v-if="isAdmin" class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900" aria-labelledby="dashboard-users-title">
    <div class="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">Administration</p>
        <h2 id="dashboard-users-title" class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">User directory</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Workspace user contact and access information.</p>
      </div>
      <RouterLink to="/user-management" class="inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
        Manage users <span class="ml-2" aria-hidden="true">↗</span>
      </RouterLink>
    </div>

    <p v-if="errorMessage" class="m-5 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900 dark:bg-error-950/30 dark:text-error-300" role="alert">
      {{ errorMessage }}
    </p>
    <div v-else-if="isLoading" class="space-y-3 p-5 sm:p-6" aria-label="Loading user directory">
      <div v-for="item in 3" :key="item" class="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"></div>
    </div>
    <div v-else-if="!users.length" class="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
      No accounts are available.
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[760px] text-left text-sm">
        <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-5 py-3 font-semibold sm:px-6">User</th>
            <th scope="col" class="px-4 py-3 font-semibold">Contact</th>
            <th scope="col" class="px-4 py-3 font-semibold">Department</th>
            <th scope="col" class="px-4 py-3 font-semibold">Role</th>
            <th scope="col" class="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="user in users" :key="user.id" class="transition hover:bg-gray-50/70 dark:hover:bg-gray-800/30">
            <td class="px-5 py-4 sm:px-6">
              <div class="flex items-center gap-3">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-xs font-bold uppercase text-white">
                  {{ (user.fullName || user.username).slice(0, 1) }}
                </span>
                <div class="min-w-0">
                  <p class="truncate font-semibold text-gray-900 dark:text-white">{{ user.fullName || 'Name not provided' }}</p>
                  <p class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">@{{ user.username }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-4">
              <div class="grid gap-1 text-xs">
                <a v-if="user.email" :href="`mailto:${user.email}`" class="max-w-56 truncate text-brand-600 hover:underline dark:text-brand-300">{{ user.email }}</a>
                <span v-else class="text-gray-400">Email not provided</span>
                <a v-if="user.phone" :href="`tel:${user.phone}`" class="text-gray-600 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-300">{{ user.phone }}</a>
                <span v-else class="text-gray-400">Phone not provided</span>
              </div>
            </td>
            <td class="px-4 py-4 text-gray-600 dark:text-gray-300">{{ user.department || 'Not provided' }}</td>
            <td class="px-4 py-4">
              <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="user.role === 'admin' ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'">
                {{ user.role === 'admin' ? 'Admin' : 'User' }}
              </span>
            </td>
            <td class="px-4 py-4">
              <span class="inline-flex items-center gap-1.5 text-xs font-medium" :class="user.active ? 'text-success-700 dark:text-success-300' : 'text-gray-500 dark:text-gray-400'">
                <span class="h-1.5 w-1.5 rounded-full" :class="user.active ? 'bg-success-500' : 'bg-gray-400'"></span>
                {{ user.active ? 'Active' : 'Disabled' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="users.length && !errorMessage" class="border-t border-gray-100 px-5 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:px-6">
      {{ users.length }} workspace {{ users.length === 1 ? 'account' : 'accounts' }} · Contact details are visible to administrators only.
    </div>
  </section>
</template>

<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'

interface DashboardUser {
  id: string
  username: string
  fullName: string
  email: string
  phone: string
  department: string
  role: 'admin' | 'user'
  active: boolean
}

const isAdmin = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const users = ref<DashboardUser[]>([])

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || 'Could not load the user directory.'
  }
  return 'Could not load the user directory.'
}

async function loadAdminDirectory(): Promise<void> {
  try {
    const { data } = await axios.get<{ user: { role: string } }>('/api/auth/me')
    if (data.user.role !== 'admin') return
    isAdmin.value = true
    isLoading.value = true
    const response = await axios.get<{ users: DashboardUser[] }>('/api/auth/users')
    users.value = response.data.users
  } catch (error: unknown) {
    if (isAdmin.value) errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadAdminDirectory()
})
</script>
