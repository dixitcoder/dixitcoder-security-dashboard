<template>
  <FullScreenLayout>
    <section class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-gray-950 sm:px-6" aria-labelledby="signup-heading">
      <section class="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 sm:p-10">
        <router-link
          to="/signin"
          class="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
        >
          <span aria-hidden="true">←</span>
          Back to sign in
        </router-link>

        <div class="mt-8">
          <span class="inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-300">
            Account access
          </span>
          <h1 id="signup-heading" class="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">Account creation is managed</h1>
          <p class="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            Self-service registration is not available for this workspace. Ask your workspace administrator to create your account.
          </p>
        </div>

        <div class="mt-6 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 dark:border-brand-900/70 dark:bg-brand-950/30">
          <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">Already have an account?</p>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Sign in with the username and password provided by your administrator.
          </p>
        </div>

        <router-link
          to="/signin"
          class="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
        >
          Go to sign in
        </router-link>
      </section>
    </section>
  </FullScreenLayout>
</template>

<script setup lang="ts">
defineOptions({ name: 'SignUpView' })

import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
</script>
