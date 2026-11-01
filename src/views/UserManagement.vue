<template>
  <section class="mx-auto max-w-7xl space-y-6 pb-8 pt-6 sm:pt-8">
    <header class="relative overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-white via-brand-50/70 to-indigo-50 px-5 py-6 shadow-theme-xs dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-brand-950/30 sm:px-8 sm:py-8">
      <div class="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-brand-200/30 blur-3xl dark:bg-brand-500/10"></div>
      <div class="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div class="max-w-2xl">
          <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:border-brand-900 dark:bg-gray-900/80 dark:text-brand-300">
            <span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
            Administration
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">User management</h1>
          <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
            Manage workspace access, roles, and account status from one place.
          </p>
        </div>
        <div class="flex items-center gap-3 self-start rounded-xl border border-white/80 bg-white/80 px-4 py-3 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900/80 sm:self-center">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300" aria-hidden="true">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m16 0v-2a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
            </svg>
          </span>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Active accounts</p>
            <p class="text-lg font-bold leading-6 text-gray-900 dark:text-white">{{ activeUsers }} <span class="text-sm font-medium text-gray-400">/ {{ users.length }}</span></p>
          </div>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <article class="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 sm:p-5">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300" aria-hidden="true">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m16 0v-2a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" /></svg>
        </span>
        <div><p class="text-sm text-gray-500 dark:text-gray-400">Total accounts</p><p class="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white">{{ users.length }}</p></div>
      </article>
      <article class="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 sm:p-5">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-300" aria-hidden="true">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6" /></svg>
        </span>
        <div><p class="text-sm text-gray-500 dark:text-gray-400">Active accounts</p><p class="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white">{{ activeUsers }}</p></div>
      </article>
      <article class="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 sm:p-5">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300" aria-hidden="true">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3 4.5 6v5.5c0 4.3 3.2 8.1 7.5 9.5 4.3-1.4 7.5-5.2 7.5-9.5V6L12 3Z" /><path stroke-linecap="round" stroke-linejoin="round" d="m9 12 2 2 4-4" /></svg>
        </span>
        <div><p class="text-sm text-gray-500 dark:text-gray-400">Administrators</p><p class="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white">{{ adminUsers }}</p></div>
      </article>
    </div>

    <p v-if="pageError" class="flex items-start gap-3 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900 dark:bg-error-950/30 dark:text-error-300" role="alert">
      <span class="font-bold" aria-hidden="true">!</span>{{ pageError }}
    </p>
    <p v-if="notice" class="flex items-start gap-3 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-900 dark:bg-success-950/30 dark:text-success-300" role="status">
      <span class="font-bold" aria-hidden="true">✓</span>{{ notice }}
    </p>

    <div class="grid items-start gap-6 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.8fr)]">
      <section class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div class="border-b border-gray-100 bg-gray-50/70 px-5 py-5 dark:border-gray-800 dark:bg-gray-800/30 sm:px-6">
          <div class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-theme-xs" aria-hidden="true">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14" /></svg>
            </span>
            <div>
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">Add a user</h2>
              <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Create a new workspace account</p>
            </div>
          </div>
        </div>
        <form class="space-y-5 p-5 sm:p-6" @submit.prevent="createUser">
          <div>
            <label for="new-username" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input
              id="new-username"
              v-model.trim="newUser.username"
              autocomplete="off"
              minlength="3"
              maxlength="32"
              pattern="[A-Za-z0-9_-]{3,32}"
              required
              placeholder="e.g. jane_doe"
              class="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <p class="mt-1.5 text-xs leading-5 text-gray-500 dark:text-gray-400">Use 3–32 letters, numbers, underscores, or hyphens.</p>
          </div>
          <div>
            <label for="new-full-name" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
            <input
              id="new-full-name"
              v-model.trim="newUser.fullName"
              maxlength="100"
              autocomplete="name"
              required
              placeholder="e.g. Jane Doe"
              class="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label for="new-email" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              id="new-email"
              v-model.trim="newUser.email"
              type="email"
              maxlength="254"
              autocomplete="email"
              required
              placeholder="name@example.com"
              class="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label for="new-phone" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
            <input
              id="new-phone"
              v-model.trim="newUser.phone"
              type="tel"
              maxlength="32"
              autocomplete="tel"
              required
              placeholder="e.g. +1 555 0100"
              class="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label for="new-department" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
            <input
              id="new-department"
              v-model.trim="newUser.department"
              maxlength="100"
              autocomplete="organization-title"
              required
              placeholder="e.g. Engineering"
              class="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label for="new-password" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Temporary password</label>
            <input
              id="new-password"
              v-model="newUser.password"
              type="password"
              autocomplete="new-password"
              minlength="8"
              maxlength="1024"
              required
              placeholder="At least 8 characters"
              class="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <p class="mt-1.5 text-xs leading-5 text-gray-500 dark:text-gray-400">Passwords are securely hashed before they are stored.</p>
          </div>
          <div>
            <label for="new-role" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Access role</label>
            <select
              id="new-role"
              v-model="newUser.role"
              class="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            :disabled="isCreating"
            class="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            <svg v-if="!isCreating" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14" /></svg>
            {{ isCreating ? 'Creating account…' : 'Create user' }}
          </button>
        </form>
      </section>

      <section class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div class="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">Accounts</h2>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage roles and access to your workspace.</p>
          </div>
          <button
            type="button"
            :disabled="isLoading"
            aria-label="Refresh users"
            class="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 sm:self-auto"
            @click="loadUsers"
          >
            <svg class="h-4 w-4" :class="{ 'animate-spin': isLoading }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7v5h-5M4 17v-5h5m10.2-2A7 7 0 0 0 6.4 6.4L4 9m16 6-2.4 2.6A7 7 0 0 1 4.8 14" /></svg>
            {{ isLoading ? 'Refreshing…' : 'Refresh' }}
          </button>
        </div>

        <div class="border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
          <label class="relative block">
            <span class="sr-only">Search accounts</span>
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7" /><path stroke-linecap="round" d="m16 16 4 4" /></svg>
            <input
              v-model.trim="searchQuery"
              type="search"
              placeholder="Search by username…"
              class="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900 sm:max-w-xs"
            />
          </label>
        </div>

        <div v-if="isLoading && !users.length" class="space-y-3 p-5 sm:p-6" aria-label="Loading accounts">
          <div v-for="item in 3" :key="item" class="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"></div>
        </div>
        <div v-else-if="!users.length" class="px-6 py-14 text-center">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800" aria-hidden="true">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m16 0v-2a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" /></svg>
          </span>
          <p class="mt-3 text-sm font-semibold text-gray-900 dark:text-white">No accounts yet</p>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Create a user to give someone access to this workspace.</p>
        </div>
        <div v-else-if="!filteredUsers.length" class="px-6 py-14 text-center">
          <p class="text-sm font-semibold text-gray-900 dark:text-white">No matching accounts</p>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Try another username.</p>
        </div>
        <ul v-else class="divide-y divide-gray-100 dark:divide-gray-800" aria-label="User accounts">
          <li v-for="user in filteredUsers" :key="user.id" class="px-5 py-4 transition hover:bg-gray-50/70 dark:hover:bg-gray-800/30 sm:px-6">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-sm font-bold uppercase text-white shadow-theme-xs">
                  {{ user.username.slice(0, 1) }}
                </span>
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {{ user.fullName || user.username }}
                    <span v-if="user.id === currentUserId" class="ml-1.5 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">You</span>
                  </p>
                  <p class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{{ user.username }} · Added {{ formatDate(user.createdAt) }}</p>
                  <div class="mt-2 grid gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400 sm:grid-cols-2">
                    <a v-if="user.email" :href="`mailto:${user.email}`" class="truncate hover:text-brand-600 dark:hover:text-brand-300">{{ user.email }}</a>
                    <span v-else>Email not provided</span>
                    <a v-if="user.phone" :href="`tel:${user.phone}`" class="truncate hover:text-brand-600 dark:hover:text-brand-300">{{ user.phone }}</a>
                    <span v-else>Phone not provided</span>
                    <span class="truncate sm:col-span-2">{{ user.department || 'Department not provided' }}</span>
                  </div>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-3 pl-14 lg:pl-0">
                <select
                  :value="user.role"
                  :disabled="user.id === currentUserId || isUpdating === user.id"
                  :aria-label="`Role for ${user.username}`"
                  class="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  @change="updateUser(user, { role: ($event.target as HTMLSelectElement).value as UserRole })"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium"
                  :class="user.active
                    ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="user.active ? 'bg-success-500' : 'bg-gray-400'"></span>
                  {{ user.active ? 'Active' : 'Disabled' }}
                </span>
                <button
                  type="button"
                  :disabled="isUpdating === user.id"
                  class="min-h-9 rounded-lg px-3 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-brand-300 dark:hover:bg-brand-500/10"
                  @click="toggleProfileEditor(user)"
                >
                  {{ editingProfileId === user.id ? 'Cancel edit' : 'Edit details' }}
                </button>
                <button
                  type="button"
                  :disabled="user.id === currentUserId || isUpdating === user.id"
                  class="ml-auto min-h-9 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 lg:ml-0"
                  :class="user.active
                    ? 'text-error-600 hover:bg-error-50 dark:text-error-300 dark:hover:bg-error-950/30'
                    : 'text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10'"
                  @click="updateUser(user, { active: !user.active })"
                >
                  {{ isUpdating === user.id ? 'Saving…' : user.active ? 'Disable' : 'Enable' }}
                </button>
              </div>
            </div>
            <form
              v-if="editingProfileId === user.id"
              class="mt-5 grid gap-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-800/40 sm:grid-cols-2"
              @submit.prevent="updateUserProfile(user)"
            >
              <div>
                <label :for="`profile-name-${user.id}`" class="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Full name</label>
                <input :id="`profile-name-${user.id}`" v-model.trim="profileForm.fullName" required maxlength="100" class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label :for="`profile-email-${user.id}`" class="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input :id="`profile-email-${user.id}`" v-model.trim="profileForm.email" type="email" required maxlength="254" class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label :for="`profile-phone-${user.id}`" class="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input :id="`profile-phone-${user.id}`" v-model.trim="profileForm.phone" type="tel" required maxlength="32" class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label :for="`profile-department-${user.id}`" class="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Department</label>
                <input :id="`profile-department-${user.id}`" v-model.trim="profileForm.department" required maxlength="100" class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <div class="flex justify-end gap-2 sm:col-span-2">
                <button type="submit" :disabled="isUpdating === user.id" class="min-h-9 rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60">
                  {{ isUpdating === user.id ? 'Saving…' : 'Save details' }}
                </button>
              </div>
            </form>
          </li>
        </ul>
        <div v-if="users.length" class="flex flex-col gap-1 border-t border-gray-100 bg-gray-50/60 px-5 py-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/20 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>Showing {{ filteredUsers.length }} of {{ users.length }} accounts</span>
          <span>Account passwords are stored securely.</span>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, reactive, ref } from 'vue'

type UserRole = 'admin' | 'user'

interface ManagedUser {
  id: string
  username: string
  fullName: string
  email: string
  phone: string
  department: string
  role: UserRole
  active: boolean
  createdAt: string
}

interface UserPatch {
  role?: UserRole
  active?: boolean
  fullName?: string
  email?: string
  phone?: string
  department?: string
}

const users = ref<ManagedUser[]>([])
const currentUserId = ref('')
const searchQuery = ref('')
const editingProfileId = ref('')
const isLoading = ref(false)
const isCreating = ref(false)
const isUpdating = ref('')
const pageError = ref('')
const notice = ref('')
const newUser = reactive<{
  username: string
  password: string
  fullName: string
  email: string
  phone: string
  department: string
  role: UserRole
}>({
  username: '',
  password: '',
  fullName: '',
  email: '',
  phone: '',
  department: '',
  role: 'user',
})
const profileForm = reactive({
  fullName: '',
  email: '',
  phone: '',
  department: '',
})

const activeUsers = computed(() => users.value.filter((user) => user.active).length)
const adminUsers = computed(() => users.value.filter((user) => user.role === 'admin').length)
const filteredUsers = computed(() => {
  const query = searchQuery.value.toLocaleLowerCase()
  return users.value.filter((user) =>
    [user.username, user.fullName, user.email, user.phone, user.department]
      .some((value) => value.toLocaleLowerCase().includes(query)),
  )
})

function apiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || fallback
  }
  return fallback
}

async function loadUsers(): Promise<void> {
  isLoading.value = true
  pageError.value = ''
  try {
    const [userResponse, usersResponse] = await Promise.all([
      axios.get<{ user: ManagedUser }>('/api/auth/me'),
      axios.get<{ users: ManagedUser[] }>('/api/auth/users'),
    ])
    currentUserId.value = userResponse.data.user.id
    users.value = usersResponse.data.users
  } catch (error: unknown) {
    pageError.value = apiError(error, 'Could not load user accounts.')
  } finally {
    isLoading.value = false
  }
}

async function createUser(): Promise<void> {
  isCreating.value = true
  pageError.value = ''
  notice.value = ''
  try {
    await axios.post('/api/auth/users', newUser)
    newUser.username = ''
    newUser.password = ''
    newUser.fullName = ''
    newUser.email = ''
    newUser.phone = ''
    newUser.department = ''
    newUser.role = 'user'
    notice.value = 'User account created.'
    await loadUsers()
  } catch (error: unknown) {
    pageError.value = apiError(error, 'Could not create the user account.')
  } finally {
    isCreating.value = false
  }
}

async function updateUser(user: ManagedUser, updates: UserPatch): Promise<void> {
  isUpdating.value = user.id
  pageError.value = ''
  notice.value = ''
  try {
    await axios.patch(`/api/auth/users/${encodeURIComponent(user.id)}`, updates)
    notice.value = `${user.username}'s account was updated.`
    await loadUsers()
  } catch (error: unknown) {
    pageError.value = apiError(error, `Could not update ${user.username}'s account.`)
    await loadUsers()
  } finally {
    isUpdating.value = ''
  }
}

function toggleProfileEditor(user: ManagedUser): void {
  if (editingProfileId.value === user.id) {
    editingProfileId.value = ''
    return
  }
  editingProfileId.value = user.id
  profileForm.fullName = user.fullName
  profileForm.email = user.email
  profileForm.phone = user.phone
  profileForm.department = user.department
}

async function updateUserProfile(user: ManagedUser): Promise<void> {
  isUpdating.value = user.id
  pageError.value = ''
  notice.value = ''
  try {
    await axios.patch(`/api/auth/users/${encodeURIComponent(user.id)}`, { ...profileForm })
    editingProfileId.value = ''
    notice.value = `${user.username}'s details were updated.`
    await loadUsers()
  } catch (error: unknown) {
    pageError.value = apiError(error, `Could not update ${user.username}'s details.`)
  } finally {
    isUpdating.value = ''
  }
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'unknown date' : date.toLocaleDateString()
}

onMounted(() => {
  void loadUsers()
})
</script>
