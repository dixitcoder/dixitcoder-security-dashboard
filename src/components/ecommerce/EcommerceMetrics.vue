<template>
  <section aria-label="GitHub profile metrics">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">
          Developer profile
        </p>
        <h2 class="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">GitHub overview</h2>
      </div>
      <a
        href="https://github.com/dixitcoder"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-cyan-500 hover:text-cyan-700 dark:border-gray-700 dark:text-gray-200"
      >
        Open GitHub <span aria-hidden="true">↗</span>
      </a>
    </div>

    <p v-if="error" class="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200" role="alert">
      GitHub profile could not be loaded: {{ error }}
      <button class="ml-2 font-semibold underline underline-offset-2" type="button" @click="loadProfile">
        Retry
      </button>
    </p>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <article v-for="metric in metrics" :key="metric.label" class="metric-card">
        <span class="metric-icon" aria-hidden="true">{{ metric.icon }}</span>
        <div>
          <p>{{ metric.label }}</p>
          <span v-if="loading" class="metric-skeleton" aria-label="Loading GitHub statistics"></span>
          <strong v-else>{{ metric.value }}</strong>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const profile = computed(() => store.getters['profile/getProfile'])
const repositories = computed(() => store.getters['profile/getRepos'])
const loading = computed(() => store.getters['profile/isLoading'])
const error = computed(() => store.getters['profile/getError'])

const metrics = computed(() => [
  { label: 'Public repositories', value: repositories.value.length, icon: '⌘' },
  { label: 'Followers', value: profile.value.followers ?? '—', icon: '◎' },
  { label: 'Following', value: profile.value.following ?? '—', icon: '↗' },
])

function loadProfile(): void {
  void store.dispatch('profile/fetchGithubProfile')
}

onMounted(loadProfile)
</script>

<style scoped>
.metric-card {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid rgb(148 163 184 / 18%);
  border-radius: 16px;
  background: rgb(255 255 255 / 78%);
  transition: transform 160ms ease, border-color 160ms ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  border-color: rgb(6 182 212 / 42%);
}

:global(.dark) .metric-card {
  border-color: rgb(148 163 184 / 14%);
  background: rgb(15 23 42 / 72%);
}

.metric-icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  border: 1px solid rgb(6 182 212 / 22%);
  border-radius: 12px;
  color: #0e7490;
  background: rgb(6 182 212 / 7%);
  font: 600 17px ui-monospace, monospace;
}

:global(.dark) .metric-icon {
  color: #67e8f9;
}

.metric-card > div {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.metric-card p {
  margin: 0;
  color: #667085;
  font-size: 11px;
}

.metric-card strong {
  color: #101828;
  font-size: 20px;
}

:global(.dark) .metric-card p {
  color: #a6b3c5;
}

:global(.dark) .metric-card strong {
  color: #f8fafc;
}

.metric-skeleton {
  width: 54px;
  height: 22px;
  border-radius: 5px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 42%, #e2e8f0 63%);
  background-size: 300% 100%;
  animation: metric-shimmer 1.4s ease infinite;
}

@keyframes metric-shimmer {
  to { background-position: -120% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .metric-card,
  .metric-skeleton {
    animation: none;
    transition: none;
  }
}
</style>
