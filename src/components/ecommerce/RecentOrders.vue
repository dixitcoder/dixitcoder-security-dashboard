<template>
  <section class="project-panel" aria-labelledby="recent-projects-title">
    <div class="project-heading">
      <div>
        <p class="project-kicker">OPEN SOURCE</p>
        <h2 id="recent-projects-title">Recently updated repositories</h2>
      </div>
      <a href="https://github.com/dixitcoder?tab=repositories" target="_blank" rel="noopener noreferrer">
        View all <span aria-hidden="true">↗</span>
      </a>
    </div>

    <p v-if="error" class="project-state project-error" role="alert">
      GitHub repositories could not be loaded: {{ error }}
      <button type="button" @click="loadRepositories">Retry</button>
    </p>
    <div v-else-if="loading" class="project-table-wrap" role="status" aria-label="Loading repositories">
      <span class="sr-only">Loading repositories</span>
      <div v-for="row in 3" :key="row" class="project-skeleton-row">
        <span></span><span></span><span></span>
      </div>
    </div>
    <p v-else-if="!repositories.length" class="project-state" role="status">
      No public repositories were returned by GitHub.
    </p>
    <div v-else class="project-table-wrap" tabindex="0" aria-label="Repository list; scroll horizontally on small screens">
      <table>
        <thead>
          <tr>
            <th scope="col">Repository</th>
            <th scope="col">Description</th>
            <th scope="col">Language</th>
            <th scope="col">Updated</th>
            <th scope="col">Stars</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="repository in repositories" :key="repository.id">
            <td>
              <a :href="repository.html_url" target="_blank" rel="noopener noreferrer">
                {{ repository.name }} <span aria-hidden="true">↗</span>
              </a>
            </td>
            <td>{{ repository.description || 'No description provided' }}</td>
            <td>{{ repository.language || '—' }}</td>
            <td><time :datetime="repository.updated_at">{{ formatDate(repository.updated_at) }}</time></td>
            <td>{{ repository.stargazers_count.toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const repositories = computed(() => store.getters['profile/getRepos'])
const loading = computed(() => store.getters['profile/isLoading'])
const error = computed(() => store.getters['profile/getError'])

function loadRepositories(): void {
  void store.dispatch('profile/fetchGithubProfile')
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Unknown'
    : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

onMounted(loadRepositories)
</script>

<style scoped>
.project-panel {
  overflow: hidden;
  border: 1px solid rgb(148 163 184 / 17%);
  border-radius: 16px;
  background: rgb(255 255 255 / 80%);
}

:global(.dark) .project-panel {
  border-color: rgb(148 163 184 / 14%);
  background: rgb(15 23 42 / 72%);
}

.project-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
}

.project-kicker {
  margin: 0 0 4px;
  color: #0e7490;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.15em;
}

.project-heading h2 {
  margin: 0;
  color: #101828;
  font-size: 17px;
  font-weight: 700;
}

:global(.dark) .project-heading h2 {
  color: #f8fafc;
}

.project-heading > a {
  flex: 0 0 auto;
  color: #0e7490;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
}

:global(.dark) .project-heading > a {
  color: #67e8f9;
}

.project-table-wrap {
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
}

.project-table-wrap:focus-visible {
  outline: 2px solid #06b6d4;
  outline-offset: -2px;
}

table {
  width: 100%;
  min-width: 680px;
  border-collapse: collapse;
  text-align: left;
}

th,
td {
  padding: 12px 16px;
  border-top: 1px solid rgb(148 163 184 / 14%);
  vertical-align: top;
}

th {
  color: #667085;
  font-size: 11px;
  font-weight: 600;
}

td {
  color: #475467;
  font-size: 12px;
  line-height: 1.5;
}

:global(.dark) td {
  color: #cbd5e1;
}

td:first-child {
  min-width: 155px;
}

td:first-child a {
  color: #0e7490;
  font-weight: 600;
  text-decoration: none;
}

:global(.dark) td:first-child a {
  color: #67e8f9;
}

.project-state {
  margin: 0;
  padding: 18px 20px;
  border-top: 1px solid rgb(148 163 184 / 14%);
  color: #667085;
  font-size: 12px;
}

.project-error {
  color: #b42318;
  background: #fffbfa;
}

:global(.dark) .project-error {
  color: #fda29b;
  background: rgb(127 29 29 / 12%);
}

.project-error button {
  margin-left: 8px;
  color: inherit;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.project-skeleton-row {
  display: grid;
  grid-template-columns: 1.2fr 2fr 1fr;
  gap: 16px;
  padding: 15px 20px;
  border-top: 1px solid rgb(148 163 184 / 14%);
}

.project-skeleton-row span {
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 42%, #e2e8f0 63%);
  background-size: 300% 100%;
  animation: project-shimmer 1.4s ease infinite;
}

@keyframes project-shimmer {
  to { background-position: -120% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .project-skeleton-row span {
    animation: none;
  }
}
</style>
