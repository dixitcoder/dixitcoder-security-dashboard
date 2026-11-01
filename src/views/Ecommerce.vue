<template>
  <AdminLayout>
    <section class="dashboard-widget-page">
      <header class="widget-toolbar">
        <div>
          <p class="widget-eyebrow">YOUR WORKSPACE</p>
          <h1 class="widget-page-title">Dashboard</h1>
          <p class="widget-page-description">
            Drag widgets to arrange your overview. Your layout is saved on this device.
          </p>
        </div>
        <button class="widget-reset-button" type="button" @click="resetWidgetOrder">
          Reset layout
        </button>
      </header>
      <section class="overview-summary" aria-label="Workspace overview">
        <article class="summary-card">
          <span class="summary-icon" aria-hidden="true">⌘</span>
          <div>
            <p>Available tools</p>
            <strong>{{ displayedToolCount }}</strong>
            <span>Tools and utilities in this workspace</span>
          </div>
        </article>
        <article class="summary-card summary-status">
          <span class="summary-icon" aria-hidden="true">◉</span>
          <div>
            <p>API service</p>
            <strong v-if="apiStatus === 'checking'" class="summary-loading" aria-label="Checking API status"></strong>
            <strong v-else class="summary-status-value" :class="apiStatus === 'online' ? 'status-online' : 'status-offline'">
              <span class="summary-status-dot" :class="{ 'is-online': apiStatus === 'online' }" aria-hidden="true"></span>
              {{ apiStatus === 'online' ? 'Operational' : 'Unavailable' }}
            </strong>
            <span v-if="apiStatus === 'online'">Health check succeeded</span>
            <span v-else-if="apiStatus === 'checking'">Checking backend health…</span>
            <span v-else class="status-error" role="alert">{{ apiError }}</span>
          </div>
          <button v-if="apiStatus === 'offline'" class="status-retry" type="button" @click="checkApiHealth">
            Retry
          </button>
        </article>
        <article class="summary-card summary-activity">
          <span class="summary-icon" aria-hidden="true">↻</span>
          <div>
            <p>Recent activity</p>
            <strong>{{ recentRouteVisits.length ? recentRouteVisits[0].title : 'No activity yet' }}</strong>
            <span>{{ recentRouteVisits.length ? 'Most recently visited page' : 'Your visited pages appear here' }}</span>
          </div>
        </article>
      </section>
      <AdminUserDirectory />
      <section class="activity-panel" aria-labelledby="activity-title">
        <div class="activity-heading">
          <div>
            <p class="widget-eyebrow">WORKSPACE</p>
            <h2 id="activity-title">Recently visited</h2>
          </div>
          <span>{{ recentRouteVisits.length }} this session</span>
        </div>
        <ul v-if="recentRouteVisits.length" class="activity-list">
          <li v-for="visit in recentRouteVisits.slice(0, 4)" :key="visit.path">
            <RouterLink :to="visit.path">
              <span class="activity-dot" aria-hidden="true"></span>
              <span>{{ visit.title }}</span>
              <small>{{ visit.path }}</small>
              <span class="activity-arrow" aria-hidden="true">↗</span>
            </RouterLink>
          </li>
        </ul>
        <p v-else class="overview-empty" role="status">Open a tool to start your activity list.</p>
      </section>
      <section class="activity-panel quick-launch-panel" aria-labelledby="quick-launch-title">
        <div class="activity-heading">
          <div>
            <p class="widget-eyebrow">PINNED</p>
            <h2 id="quick-launch-title">Favorites · Quick launch</h2>
          </div>
          <RouterLink to="/settings">Manage in Settings <span aria-hidden="true">↗</span></RouterLink>
        </div>
        <ul v-if="favoriteRoutes.length" class="quick-launch-list">
          <li v-for="item in favoriteRoutes" :key="item.path">
            <RouterLink :to="item.path">
              <span aria-hidden="true">★</span>
              <span>{{ item.title }}</span>
              <small>{{ item.path }}</small>
              <span aria-hidden="true">↗</span>
            </RouterLink>
          </li>
        </ul>
        <p v-else class="overview-empty">Pin a tool from global search to add it here.</p>
      </section>
      <section class="activity-panel" aria-labelledby="recent-scans-title">
        <div class="activity-heading">
          <div>
            <p class="widget-eyebrow">LOCAL HISTORY</p>
            <h2 id="recent-scans-title">Recent scans</h2>
          </div>
          <RouterLink to="/scan-reports">View reports <span aria-hidden="true">↗</span></RouterLink>
        </div>
        <ul v-if="scanRecords.length" class="activity-list">
          <li v-for="scan in scanRecords.slice(0, 4)" :key="scan.id">
            <RouterLink to="/scan-reports">
              <span class="activity-dot" aria-hidden="true"></span>
              <span>{{ scan.tool }}</span>
              <small>{{ scan.target }} · {{ scan.resultCount }} results</small>
              <time :datetime="scan.date">{{ formatScanDate(scan.date) }}</time>
            </RouterLink>
          </li>
        </ul>
        <p v-else class="overview-empty" role="status">Completed scans saved on this device will appear here.</p>
      </section>
      <section class="activity-panel" aria-labelledby="insights-title">
        <div class="activity-heading">
          <div>
            <p class="widget-eyebrow">LOCAL ANALYTICS</p>
            <h2 id="insights-title">Activity insights</h2>
          </div>
          <span>{{ displayedScanCount }} completed scans on this device</span>
        </div>
        <ul v-if="popularRoutes.length" class="activity-list">
          <li v-for="item in popularRoutes" :key="item.path">
            <RouterLink :to="item.path">
              <span class="activity-dot" aria-hidden="true"></span>
              <span>{{ routeTitle(item.path) }}</span>
              <small>{{ item.count }} opens</small>
              <span class="activity-arrow" aria-hidden="true">↗</span>
            </RouterLink>
          </li>
        </ul>
        <p v-else class="overview-empty">Tool usage insights will appear as you explore.</p>
      </section>
      <p class="sr-only" aria-live="polite">{{ layoutAnnouncement }}</p>

      <Draggable
        v-model="widgets"
        item-key="id"
        tag="div"
        class="dashboard-widgets-grid"
        handle=".widget-drag-handle"
        ghost-class="widget-drag-ghost"
        drag-class="widget-drag-active"
        :animation="220"
        @end="saveWidgetOrder"
      >
        <template #item="{ element, index }">
          <section class="dashboard-widget" :class="element.span" :aria-label="element.label">
            <div class="widget-controls">
              <button
                class="widget-drag-handle"
                type="button"
                :aria-label="`Drag to move ${element.label}`"
                title="Drag to move"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <circle cx="7" cy="5" r="1.25" />
                  <circle cx="13" cy="5" r="1.25" />
                  <circle cx="7" cy="10" r="1.25" />
                  <circle cx="13" cy="10" r="1.25" />
                  <circle cx="7" cy="15" r="1.25" />
                  <circle cx="13" cy="15" r="1.25" />
                </svg>
                <span>Drag to move</span>
              </button>
              <div class="widget-order-controls">
                <button
                  class="widget-order-button"
                  type="button"
                  :disabled="index === 0"
                  :aria-label="`Move ${element.label} up`"
                  title="Move up"
                  @click="moveWidget(index, -1)"
                >↑</button>
                <button
                  class="widget-order-button"
                  type="button"
                  :disabled="index === widgets.length - 1"
                  :aria-label="`Move ${element.label} down`"
                  title="Move down"
                  @click="moveWidget(index, 1)"
                >↓</button>
              </div>
            </div>
            <component :is="element.component" />
          </section>
        </template>
      </Draggable>
    </section>
  </AdminLayout>
</template>

<script setup lang="ts">
defineOptions({ name: 'DashboardHome' })

import { computed, markRaw, onMounted, onUnmounted, ref } from 'vue'
import type { Component } from 'vue'
import Draggable from 'vuedraggable'
import { useRouter } from 'vue-router'
import { recentRouteVisits } from '../router'
import { useDashboardPreferences } from '../composables/useDashboardPreferences'
import { useApiHealth } from '../composables/useApiHealth'
import AdminLayout from '../components/layout/AdminLayout.vue'
import AdminUserDirectory from '../components/dashboard/AdminUserDirectory.vue'
import EcommerceMetrics from '../components/ecommerce/EcommerceMetrics.vue'
import MonthlyTargetWidget from '../components/ecommerce/MonthlyTarget.vue'
import GithubProfileWidget from '../components/ecommerce/MonthlySale.vue'
import RecentProjectsWidget from '../components/ecommerce/RecentOrders.vue'

interface DashboardWidget {
  id: string
  label: string
  component: Component
  span: string
}

const router = useRouter()
const {
  popularRoutes,
  scanRecords,
  usageStats,
  isFavorite,
} = useDashboardPreferences()
const { apiStatus, apiError, checkApiHealth } = useApiHealth()
const favoriteRoutes = computed(() =>
  router.getRoutes()
    .filter((route) => route.name && isFavorite(route.path))
    .map((route) => ({ path: route.path, title: String(route.meta.title || route.name) })),
)
const routeTitle = (path: string): string =>
  String(router.getRoutes().find((route) => route.path === path)?.meta.title || path)
const toolCount = computed(() =>
  router.getRoutes().filter((route) =>
    /tool|network|security|diagnostic|utility|privacy|osint|scanner|checker/i.test(
      String(route.meta.title || ''),
    ),
  ).length,
)
const displayedToolCount = ref(0)
const displayedScanCount = ref(0)
const animationFrames: number[] = []

function animateCount(target: number, output: typeof displayedToolCount): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    output.value = target
    return
  }

  const start = performance.now()
  const duration = 650
  const frame = (now: number) => {
    const progress = Math.min((now - start) / duration, 1)
    output.value = Math.round(target * (1 - (1 - progress) ** 3))
    if (progress < 1) animationFrames.push(requestAnimationFrame(frame))
  }
  animationFrames.push(requestAnimationFrame(frame))
}

function formatScanDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Unknown date'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

onMounted(() => {
  void checkApiHealth()
  animateCount(toolCount.value, displayedToolCount)
  animateCount(usageStats.value.scans, displayedScanCount)
})
onUnmounted(() => animationFrames.forEach(cancelAnimationFrame))
const layoutStorageKey = 'dixitcoder-dashboard-widget-order'

function createDefaultWidgets(): DashboardWidget[] {
  return [
    {
      id: 'overview',
      label: 'Overview metrics',
      component: markRaw(EcommerceMetrics),
      span: 'col-span-12',
    },
    {
      id: 'monthly-target',
      label: 'Monthly target',
      component: markRaw(MonthlyTargetWidget),
      span: 'col-span-12 xl:col-span-6',
    },
    {
      id: 'github-profile',
      label: 'GitHub profile',
      component: markRaw(GithubProfileWidget),
      span: 'col-span-12 xl:col-span-6',
    },
    {
      id: 'recent-projects',
      label: 'Recent projects',
      component: markRaw(RecentProjectsWidget),
      span: 'col-span-12',
    },
  ]
}

function loadWidgetOrder(): DashboardWidget[] {
  const defaults = createDefaultWidgets()
  try {
    const savedIds: unknown = JSON.parse(window.localStorage.getItem(layoutStorageKey) || 'null')
    if (
      !Array.isArray(savedIds)
      || !savedIds.every((id): id is string => typeof id === 'string')
      || savedIds.length !== defaults.length
      || new Set(savedIds).size !== defaults.length
      || savedIds.some((id) => !defaults.some((widget) => widget.id === id))
    ) {
      return defaults
    }
    return savedIds.flatMap((id) => {
      const widget = defaults.find((item) => item.id === id)
      return widget ? [widget] : []
    })
  } catch {
    return defaults
  }
}

const widgets = ref<DashboardWidget[]>(loadWidgetOrder())
const layoutAnnouncement = ref('')

function saveWidgetOrder(): void {
  try {
    window.localStorage.setItem(
      layoutStorageKey,
      JSON.stringify(widgets.value.map((widget) => widget.id)),
    )
  } catch {
    layoutAnnouncement.value = 'Layout changed for this session; browser storage is unavailable.'
  }
}

function moveWidget(index: number, direction: number): void {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= widgets.value.length) return

  const [widget] = widgets.value.splice(index, 1)
  widgets.value.splice(targetIndex, 0, widget)
  saveWidgetOrder()
  layoutAnnouncement.value = `${widget.label} moved ${direction < 0 ? 'up' : 'down'}.`
}

function resetWidgetOrder(): void {
  widgets.value = createDefaultWidgets()
  try {
    window.localStorage.removeItem(layoutStorageKey)
    layoutAnnouncement.value = 'Dashboard layout reset to default.'
  } catch {
    layoutAnnouncement.value = 'Default layout restored for this session.'
  }
}
</script>

<style scoped>
.dashboard-widget-page {
  display: grid;
  gap: 20px;
}

.widget-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  border: 1px solid rgb(148 163 184 / 17%);
  border-radius: 18px;
  background: linear-gradient(115deg, rgb(255 255 255 / 92%), rgb(240 249 250 / 72%));
  box-shadow: 0 8px 26px rgb(15 23 42 / 3%);
}

.overview-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.summary-card {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 13px;
  padding: 19px;
  border: 1px solid rgb(148 163 184 / 17%);
  border-radius: 16px;
  background: linear-gradient(140deg, rgb(255 255 255 / 92%), rgb(248 250 252 / 88%));
  box-shadow: 0 8px 26px rgb(15 23 42 / 3%);
  transition: transform 180ms ease, border-color 180ms ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  border-color: rgb(8 145 178 / 38%);
}

:global(.dark) .summary-card,
:global(.dark) .activity-panel {
  border-color: rgb(148 163 184 / 14%);
  background: linear-gradient(140deg, rgb(17 27 45 / 92%), rgb(12 20 34 / 85%));
}

.summary-icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  border: 1px solid rgb(6 182 212 / 21%);
  border-radius: 11px;
  color: #0e7490;
  background: rgb(6 182 212 / 8%);
  font: 600 18px ui-monospace, monospace;
}

:global(.dark) .summary-icon {
  color: #67e8f9;
  background: rgb(6 182 212 / 10%);
}

.summary-card > div {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.summary-card p {
  margin: 0;
  color: #667085;
  font-size: 11px;
  font-weight: 600;
}

.summary-card strong {
  overflow: hidden;
  color: #101828;
  font-size: 19px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.dark) .summary-card p {
  color: #a6b3c5;
}

:global(.dark) .summary-card strong {
  color: #f8fafc;
}

.summary-card > div > span {
  overflow-wrap: anywhere;
  color: #667085;
  font-size: 11px;
  line-height: 1.45;
}

:global(.dark) .summary-card > div > span {
  color: #94a3b8;
}

.summary-card .status-online {
  color: #059669;
}

.summary-status-value {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.summary-status-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  background: #ef4444;
}

.summary-status-dot.is-online {
  background: #10b981;
  box-shadow: 0 0 0 3px rgb(16 185 129 / 12%);
  animation: status-dot-pulse 2s ease-in-out infinite;
}

.summary-card .status-offline,
.summary-card .status-error {
  color: #dc2626;
}

.summary-card .status-error {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.summary-loading {
  width: 94px;
  height: 19px;
  border-radius: 5px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 42%, #e2e8f0 63%);
  background-size: 300% 100%;
  animation: overview-shimmer 1.4s ease infinite;
}

:global(.dark) .summary-loading {
  background: linear-gradient(90deg, #1e293b 25%, #334155 42%, #1e293b 63%);
  background-size: 300% 100%;
}

.status-retry {
  flex: 0 0 auto;
  margin: auto 0 0 auto;
  padding: 5px 8px;
  border: 1px solid rgb(220 38 38 / 23%);
  border-radius: 7px;
  color: #b91c1c;
  background: transparent;
  font-size: 11px;
  font-weight: 600;
}

.activity-panel {
  overflow: hidden;
  border: 1px solid rgb(148 163 184 / 17%);
  border-radius: 18px;
  background: linear-gradient(115deg, rgb(255 255 255 / 92%), rgb(248 250 252 / 88%));
  box-shadow: 0 8px 26px rgb(15 23 42 / 3%);
}

.activity-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px 14px;
}

.activity-heading h2 {
  margin: 0;
  color: #101828;
  font-size: 17px;
  font-weight: 700;
}

:global(.dark) .activity-heading h2 {
  color: #f8fafc;
}

.activity-heading > span {
  color: #667085;
  font-size: 11px;
}

.activity-heading > a {
  flex: 0 0 auto;
  color: #0e7490;
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
}

.quick-launch-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0 12px 14px;
  list-style: none;
}

.quick-launch-list a {
  display: flex;
  min-width: 0;
  min-height: 48px;
  align-items: center;
  gap: 9px;
  padding: 9px 11px;
  border: 1px solid rgb(148 163 184 / 14%);
  border-radius: 10px;
  color: #344054;
  background: rgb(148 163 184 / 3%);
  font-size: 12px;
  text-decoration: none;
  transition: border-color 160ms ease, background-color 160ms ease;
}

.quick-launch-list a:hover {
  border-color: rgb(6 182 212 / 36%);
  background: rgb(6 182 212 / 6%);
}

.quick-launch-list a > span:first-child {
  color: #0891b2;
}

.quick-launch-list a > span:nth-child(2) {
  overflow: hidden;
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-launch-list small {
  color: #8492a6;
}

:global(.dark) .quick-launch-list a {
  color: #dbe5f1;
}

.activity-list {
  display: grid;
  margin: 0;
  padding: 0 10px 10px;
  list-style: none;
}

.activity-list a {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  padding: 11px 10px;
  border-top: 1px solid rgb(148 163 184 / 12%);
  color: #344054;
  font-size: 12px;
  text-decoration: none;
}

.activity-list a:hover {
  border-radius: 9px;
  color: #0e7490;
  background: rgb(6 182 212 / 5%);
}

:global(.dark) .activity-list a {
  color: #dbe5f1;
}

.activity-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  border-radius: 50%;
  background: #06b6d4;
  box-shadow: 0 0 0 3px rgb(6 182 212 / 10%);
}

.activity-list a > span:nth-child(2) {
  overflow: hidden;
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-list small {
  overflow: hidden;
  max-width: 36%;
  color: #8492a6;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-arrow {
  color: #94a3b8;
}

.overview-empty {
  margin: 0;
  padding: 4px 20px 20px;
  color: #667085;
  font-size: 12px;
}

@keyframes overview-shimmer {
  to {
    background-position: -120% 0;
  }
}

@keyframes status-dot-pulse {
  50% {
    box-shadow: 0 0 0 6px rgb(16 185 129 / 4%);
  }
}

:global(.dark) .widget-toolbar {
  border-color: rgb(148 163 184 / 13%);
  background: linear-gradient(115deg, rgb(17 27 45 / 92%), rgb(12 20 34 / 85%));
  box-shadow: 0 8px 26px rgb(0 0 0 / 10%);
}

.widget-eyebrow {
  margin: 0 0 5px;
  color: #0891b2;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

:global(.dark) .widget-eyebrow {
  color: #22d3ee;
}

.widget-page-title {
  margin: 0;
  color: #101828;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.035em;
}

:global(.dark) .widget-page-title {
  color: #f8fafc;
}

.widget-page-description {
  margin: 5px 0 0;
  color: #667085;
  font-size: 13px;
}

:global(.dark) .widget-page-description {
  color: #94a3b8;
}

.widget-reset-button {
  flex: 0 0 auto;
  padding: 9px 13px;
  border: 1px solid rgb(8 145 178 / 32%);
  border-radius: 10px;
  color: #0e7490;
  background: rgb(6 182 212 / 6%);
  font-size: 12px;
  font-weight: 700;
  transition: background-color 160ms ease, transform 160ms ease;
}

.widget-reset-button:hover {
  transform: translateY(-1px);
  background: rgb(6 182 212 / 13%);
}

:global(.dark) .widget-reset-button {
  border-color: rgb(34 211 238 / 28%);
  color: #67e8f9;
  background: rgb(6 182 212 / 9%);
}

.dashboard-widgets-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-items: start;
  gap: 20px;
}

.dashboard-widget {
  min-width: 0;
  padding: 9px;
  border: 1px solid transparent;
  border-radius: 20px;
  transition: border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}

.dashboard-widget:hover {
  border-color: rgb(6 182 212 / 20%);
  background: rgb(6 182 212 / 2%);
}

.widget-controls {
  display: flex;
  min-height: 30px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 3px 7px;
}

.widget-drag-handle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 7px;
  border: 1px solid transparent;
  border-radius: 7px;
  color: #98a2b3;
  background: transparent;
  cursor: grab;
  font-size: 10px;
  font-weight: 600;
  transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease;
}

.widget-drag-handle:hover {
  border-color: rgb(6 182 212 / 22%);
  color: #0e7490;
  background: rgb(6 182 212 / 6%);
}

.widget-drag-handle:active {
  cursor: grabbing;
}

.widget-drag-handle svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.widget-order-controls {
  display: flex;
  gap: 4px;
}

.widget-order-button {
  display: grid;
  width: 26px;
  height: 24px;
  place-items: center;
  border: 1px solid rgb(148 163 184 / 20%);
  border-radius: 7px;
  color: #64748b;
  background: rgb(255 255 255 / 55%);
  font-size: 14px;
  line-height: 1;
  transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease;
}

.widget-order-button:not(:disabled):hover {
  border-color: rgb(6 182 212 / 40%);
  color: #0e7490;
  background: rgb(6 182 212 / 8%);
}

.widget-order-button:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

:global(.dark) .widget-order-button {
  border-color: rgb(148 163 184 / 16%);
  color: #a6b3c5;
  background: rgb(15 23 42 / 45%);
}

:global(.dark) .widget-drag-handle:hover,
:global(.dark) .widget-order-button:not(:disabled):hover {
  color: #67e8f9;
}

.widget-drag-ghost {
  border-color: rgb(6 182 212 / 50%);
  background: rgb(6 182 212 / 7%);
  opacity: 0.45;
}

.widget-drag-active {
  z-index: 2;
  box-shadow: 0 18px 48px rgb(15 23 42 / 20%);
}

@media (max-width: 640px) {
  .dashboard-widget-page {
    gap: 13px;
  }

  .widget-toolbar {
    align-items: flex-start;
    padding: 17px;
    border-radius: 15px;
  }

  .widget-page-title {
    font-size: 21px;
  }

  .widget-page-description {
    max-width: 34ch;
    font-size: 12px;
    line-height: 1.5;
  }

  .widget-reset-button {
    padding: 8px 10px;
    font-size: 11px;
  }

  .dashboard-widgets-grid {
    gap: 12px;
  }

  .dashboard-widget {
    padding: 5px;
    border-radius: 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .summary-card,
  .summary-loading {
    animation: none;
    transition: none;
  }
}

@media (max-width: 760px) {
  .overview-summary {
    grid-template-columns: minmax(0, 1fr);
  }

  .summary-card {
    padding: 15px;
  }

  .quick-launch-list {
    grid-template-columns: minmax(0, 1fr);
  }

  .activity-list time {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dashboard-widget,
  .widget-reset-button,
  .widget-drag-handle,
  .widget-order-button,
  .summary-status-dot {
    transition: none;
    animation: none;
  }
}
</style>
