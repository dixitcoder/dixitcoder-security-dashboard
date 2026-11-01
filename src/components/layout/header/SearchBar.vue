<template>
  <div class="global-search">
    <button
      ref="searchTrigger"
      type="button"
      class="global-search-trigger"
      aria-label="Search dashboard tools"
      @click="openPalette"
    >
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="8.8" cy="8.8" r="5.7" />
        <path d="m13.1 13.1 4 4" />
      </svg>
      <span>{{ translate('Search tools and pages', 'સાધનો અને પેજ શોધો') }}</span>
      <kbd aria-hidden="true">{{ isMac ? '⌘ K' : 'Ctrl K' }}</kbd>
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="command-backdrop"
        @click.self="closePalette()"
      >
        <section
          class="command-palette"
          role="dialog"
          aria-modal="true"
          aria-labelledby="command-title"
          @keydown.esc.stop.prevent="closePalette()"
          @keydown.down.prevent="moveSelection(1)"
          @keydown.up.prevent="moveSelection(-1)"
          @keydown.enter.prevent="selectCurrent"
          @keydown.tab="trapDialogFocus"
        >
          <h2 id="command-title" class="sr-only">Search dashboard tools and pages</h2>
          <div class="command-search-row">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="8.8" cy="8.8" r="5.7" />
              <path d="m13.1 13.1 4 4" />
            </svg>
            <input
              ref="searchInput"
              v-model="query"
              type="search"
              autocomplete="off"
              :aria-label="translate('Filter tools and pages', 'સાધનો અને પેજ ફિલ્ટર કરો')"
              :placeholder="translate('Search tools, pages, and utilities...', 'સાધનો, પેજ અને ઉપયોગિતાઓ શોધો...')"
            />
            <button type="button" class="command-close" aria-label="Close search" @click="closePalette()">
              Esc
            </button>
          </div>
          <p class="command-hint">{{ translate('Use ↑ ↓ to navigate · Enter to open · Esc to close', '↑ ↓ થી પસંદ કરો · Enter થી ખોલો · Esc થી બંધ કરો') }}</p>
          <ul v-if="filteredRoutes.length" class="command-results" aria-label="Search results">
            <li v-for="(item, index) in filteredRoutes" :key="item.path" class="command-result-item">
              <button
                type="button"
                class="command-result"
                :class="{ 'is-selected': selectedIndex === index }"
                :aria-current="selectedIndex === index ? 'true' : undefined"
                @mouseenter="selectedIndex = index"
                @click="navigateTo(item.path)"
              >
                <span class="command-result-icon" aria-hidden="true">&gt;_</span>
                <span class="command-result-copy">
                  <strong>{{ translateLabel(item.title) }}</strong>
                  <small>{{ item.path }}</small>
                </span>
              </button>
              <button
                type="button"
                class="command-favorite"
                :aria-label="isFavorite(item.path) ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`"
                :aria-pressed="isFavorite(item.path)"
                @click="toggleFavorite(item.path)"
              >{{ isFavorite(item.path) ? '★' : '☆' }}</button>
            </li>
          </ul>
          <p v-else class="command-empty" role="status">
            {{ translate('No matching tools or pages. Try another search.', 'મેળ ખાતાં સાધનો કે પેજ મળ્યાં નથી. બીજો શબ્દ શોધો.') }}
          </p>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  translate,
  translateLabel,
  useDashboardPreferences,
} from '@/composables/useDashboardPreferences'

const router = useRouter()
const route = useRoute()
const { isFavorite, toggleFavorite } = useDashboardPreferences()
const isOpen = ref(false)
const query = ref('')
const selectedIndex = ref(0)
const searchTrigger = ref<HTMLButtonElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
let previousBodyOverflow = ''

const searchableRoutes = computed(() =>
  router.getRoutes()
    .filter((item) => item.name && item.path !== '/:pathMatch(.*)*')
    .map((item) => {
      const title = String(item.meta.title || item.name)
      return {
        path: item.path,
        title,
        category: title.includes(' - ') ? title.split(' - ').pop() || 'Page' : 'Page',
        searchText: `${title} ${String(item.name)} ${item.path}`.toLowerCase(),
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title)),
)

const filteredRoutes = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return needle
    ? searchableRoutes.value.filter((item) => item.searchText.includes(needle)).slice(0, 10)
    : searchableRoutes.value.slice(0, 8)
})

async function openPalette() {
  isOpen.value = true
  query.value = ''
  selectedIndex.value = 0
  await nextTick()
  searchInput.value?.focus()
}

function closePalette(restoreFocus = true) {
  isOpen.value = false
  query.value = ''
  if (restoreFocus) nextTick(() => searchTrigger.value?.focus())
}

function moveSelection(direction: number) {
  if (!filteredRoutes.value.length) return
  selectedIndex.value =
    (selectedIndex.value + direction + filteredRoutes.value.length) % filteredRoutes.value.length
}

function selectCurrent() {
  const item = filteredRoutes.value[selectedIndex.value]
  if (item) navigateTo(item.path)
}

function trapDialogFocus(event: KeyboardEvent) {
  const focusable = (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
    'input:not(:disabled), button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
  )
  if (!focusable?.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function navigateTo(path: string) {
  closePalette(false)
  void router.push(path)
}

function handleGlobalShortcut(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (isOpen.value) closePalette()
    else void openPalette()
  }
}

watch(() => route.fullPath, () => {
  if (isOpen.value) closePalette(false)
})

watch(isOpen, (open) => {
  if (open) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = previousBodyOverflow
  }
})

watch(query, () => {
  selectedIndex.value = 0
})

onMounted(() => window.addEventListener('keydown', handleGlobalShortcut))
onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalShortcut)
  if (isOpen.value) document.body.style.overflow = previousBodyOverflow
})
</script>

<style scoped>
.global-search {
  width: 100%;
}

.global-search-trigger {
  display: flex;
  width: min(100%, 430px);
  min-height: 42px;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border: 1px solid rgb(148 163 184 / 24%);
  border-radius: 11px;
  color: #667085;
  background: rgb(148 163 184 / 5%);
  text-align: left;
  transition: border-color 160ms ease, background-color 160ms ease;
}

.global-search-trigger:hover {
  border-color: rgb(6 182 212 / 55%);
  background: rgb(6 182 212 / 5%);
}

.global-search-trigger svg,
.command-search-row > svg {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.6;
}

.global-search-trigger span {
  flex: 1;
  font-size: 13px;
}

.global-search-trigger kbd {
  padding: 3px 6px;
  border: 1px solid rgb(148 163 184 / 24%);
  border-radius: 5px;
  color: #667085;
  font-size: 10px;
  white-space: nowrap;
}

.command-backdrop {
  position: fixed;
  z-index: 100000;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: min(16vh, 120px) 18px 24px;
  background: rgb(2 6 23 / 68%);
  backdrop-filter: blur(7px);
}

.command-palette {
  width: min(100%, 620px);
  overflow: hidden;
  border: 1px solid rgb(148 163 184 / 23%);
  border-radius: 18px;
  background: #0f172a;
  box-shadow: 0 30px 90px rgb(0 0 0 / 48%);
  color: #e2e8f0;
}

.command-search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 17px 18px;
  border-bottom: 1px solid rgb(148 163 184 / 15%);
  color: #22d3ee;
}

.command-search-row input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  color: #f8fafc;
  background: transparent;
  font: inherit;
  font-size: 15px;
}

.command-search-row input::placeholder {
  color: #8492a6;
}

.command-close {
  flex: 0 0 auto;
  padding: 4px 7px;
  border: 1px solid rgb(148 163 184 / 22%);
  border-radius: 6px;
  color: #a6b3c5;
  background: rgb(255 255 255 / 4%);
  font-size: 11px;
}

.command-hint {
  margin: 0;
  padding: 10px 18px 5px;
  color: #8492a6;
  font-size: 11px;
}

.command-results {
  max-height: min(56vh, 430px);
  overflow-y: auto;
  margin: 0;
  padding: 6px 9px 10px;
  list-style: none;
}

.command-result {
  display: flex;
  width: 100%;
  min-height: 52px;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  color: #dbe5f1;
  background: transparent;
  text-align: left;
}

.command-result-item {
  display: flex;
  align-items: center;
}

.command-result-item .command-result {
  flex: 1;
}

.command-favorite {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border: 1px solid transparent;
  border-radius: 9px;
  color: #94a3b8;
  background: transparent;
  font-size: 18px;
}

.command-favorite:hover,
.command-favorite[aria-pressed='true'] {
  border-color: rgb(250 204 21 / 24%);
  color: #facc15;
  background: rgb(250 204 21 / 8%);
}

.command-result:hover,
.command-result.is-selected {
  border-color: rgb(34 211 238 / 19%);
  background: rgb(6 182 212 / 9%);
}

.command-result-icon {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  place-items: center;
  border: 1px solid rgb(34 211 238 / 24%);
  border-radius: 9px;
  color: #67e8f9;
  font: 600 11px ui-monospace, monospace;
}

.command-result-copy {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 2px;
}

.command-result-copy strong {
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command-result-copy small,
.command-result-category {
  color: #94a3b8;
  font-size: 11px;
}

.command-result-category {
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command-empty {
  padding: 18px;
  color: #a6b3c5;
  font-size: 13px;
}

@media (max-width: 1023px) {
  .global-search-trigger {
    min-height: 38px;
    padding-inline: 10px;
  }

  .global-search-trigger kbd {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .global-search-trigger {
    transition: none;
  }
}
</style>
