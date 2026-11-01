<template>
  <main class="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16">
    <CommonGridShape />
    <section
      class="relative z-10 w-full max-w-xl rounded-3xl border border-gray-200 bg-white/95 p-6 text-center shadow-theme-xl backdrop-blur sm:p-10 dark:border-gray-800 dark:bg-gray-900/95"
      aria-labelledby="not-found-title"
    >
      <div class="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-2xl text-brand-600 dark:bg-brand-500/15 dark:text-brand-300" aria-hidden="true">
        ?
      </div>
      <p class="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">DIXITCODER · 404</p>
      <h1 id="not-found-title" class="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        Page not found
      </h1>
      <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
        The link may be incorrect, or this page may have moved. Choose a destination below to continue.
      </p>
      <p v-if="requestedPath" class="mx-auto mt-5 max-w-full break-all rounded-xl bg-gray-50 px-4 py-3 font-mono text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
        {{ requestedPath }}
      </p>
      <nav class="mt-7 flex flex-col justify-center gap-3 sm:flex-row" aria-label="404 page actions">
        <RouterLink
          to="/"
          class="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
        >
          Go to dashboard
        </RouterLink>
        <RouterLink
          to="/documentation"
          class="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Help &amp; learning
        </RouterLink>
      </nav>
      <RouterLink to="/signin" class="mt-5 inline-flex min-h-9 items-center text-sm font-medium text-brand-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300">
        Sign in
      </RouterLink>
    </section>
    <p class="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
      &copy; {{ currentYear }} DixitCoder
    </p>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import CommonGridShape from '@/components/common/CommonGridShape.vue'

const route = useRoute()
const currentYear = new Date().getFullYear()
const requestedPath = computed(() => {
  const path = route.path
  return path === '/error-404' ? '' : path
})
</script>
