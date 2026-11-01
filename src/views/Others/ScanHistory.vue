<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Scan History & Reports" />
    <section class="history-panel">
      <header class="history-heading">
        <div>
          <p class="history-kicker">LOCAL SCAN WORKSPACE</p>
          <h1>Scan history & reports</h1>
          <p>Recent targets and completed scan summaries are stored in this browser only.</p>
        </div>
        <div class="history-actions">
          <label class="redaction-toggle">
            <input v-model="preferences.redactSensitiveReports" type="checkbox" />
            <span>Redact sensitive data</span>
          </label>
          <button type="button" :disabled="!visibleScans.length" @click="exportCsv">Export CSV</button>
          <button type="button" :disabled="!visibleScans.length" @click="printReport">Print / Save PDF</button>
          <button type="button" :disabled="!visibleScans.length" @click="shareReport">Share</button>
        </div>
      </header>

      <section class="target-panel" aria-labelledby="targets-title">
        <div class="section-title-row">
          <div>
            <h2 id="targets-title">Recent targets</h2>
            <p>Choose a previous target to reuse it, or clear this device's target history.</p>
          </div>
          <button type="button" :disabled="!recentTargets.length" @click="clearRecentTargets">Clear targets</button>
        </div>
        <ul v-if="recentTargets.length" class="target-list">
          <li v-for="item in recentTargets" :key="`${item.tool}:${item.target}`">
            <span><strong>{{ item.target }}</strong><small>{{ item.tool }} · {{ formatDate(item.date) }}</small></span>
            <button type="button" :aria-label="`Reuse target ${item.target}`" @click="reuseTarget(item.target, item.tool)">Reuse</button>
          </li>
        </ul>
        <p v-else class="empty-state" role="status">No recent targets saved on this device.</p>
      </section>

      <section class="target-panel" aria-labelledby="scan-records-title">
        <div class="section-title-row">
          <div>
            <h2 id="scan-records-title">Completed scans</h2>
            <p>Select exactly two scans to compare their result counts and timestamps.</p>
          </div>
          <label class="history-filter">
            <span class="sr-only">Filter scans by target</span>
            <input v-model="filterText" type="search" placeholder="Filter by target or tool" />
          </label>
        </div>
        <p v-if="selectedScans.length === 2" class="compare-summary" role="status">
          <strong>Comparison:</strong>
          {{ selectedScans[0].tool }} · {{ selectedScans[0].resultCount }} results
          ({{ formatDate(selectedScans[0].date) }})
          <span aria-hidden="true">→</span>
          {{ selectedScans[1].tool }} · {{ selectedScans[1].resultCount }} results
          ({{ formatDate(selectedScans[1].date) }}).
          Difference: {{ selectedScans[1].resultCount - selectedScans[0].resultCount }} results.
          <template v-if="comparisonDiff">
            · {{ comparisonDiff.added }} added, {{ comparisonDiff.removed }} removed,
            {{ comparisonDiff.changed }} changed result(s).
          </template>
        </p>
        <p v-else-if="selectedIds.length" class="compare-summary" role="status">
          Select one more scan to compare.
        </p>
        <p v-if="loadError" class="error-state" role="alert">{{ loadError }}</p>
        <div v-if="loading" class="skeleton-block" role="status" aria-label="Loading server scan history"></div>
        <div v-if="visibleScans.length" class="scan-table-wrap" tabindex="0" role="region" aria-label="Completed scans; scroll horizontally on small screens">
          <table>
            <thead>
              <tr>
                <th scope="col">Compare</th>
                <th scope="col">Target</th>
                <th scope="col">Tool</th>
                <th scope="col">Date</th>
                <th scope="col">Results</th>
                <th scope="col">Data</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="scan in visibleScans" :key="scan.id">
                <td>
                  <input
                    type="checkbox"
                    :checked="selectedIds.includes(scan.id)"
                    :disabled="!selectedIds.includes(scan.id) && selectedIds.length >= 2"
                    :aria-label="`Select scan ${scan.tool} for comparison`"
                    @change="toggleComparison(scan.id)"
                  />
                </td>
                <td><strong>{{ redactValue(scan.target, 'target') }}</strong></td>
                <td>{{ scan.tool }}</td>
                <td><time :datetime="scan.date">{{ formatDate(scan.date) }}</time></td>
                <td>{{ scan.resultCount }}</td>
                <td><button class="row-action" type="button" @click="exportOne(scan)">JSON</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else-if="!loading" class="empty-state" role="status">
          {{ filterText ? 'No scan records match your filter.' : 'No completed scans have been saved yet. Scan records created in this app will appear here.' }}
        </p>
      </section>
      <p class="privacy-note">Scan records and targets are kept locally in this browser. CSV/PDF exports may contain sensitive target details; share them only with authorized recipients.</p>
    </section>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { useDashboardPreferences, type ScanRecord } from '@/composables/useDashboardPreferences'

defineOptions({ name: 'ScanHistoryReports' })

interface ServerScan {
  id?: string | number
  host?: string
  target?: string
  type?: string
  date?: string
  ports?: number[]
  results?: unknown[]
}

const {
  scanRecords,
  recentTargets,
  preferences,
  clearRecentTargets,
} = useDashboardPreferences()
const router = useRouter()
const filterText = ref('')
const selectedIds = ref<string[]>([])
const loading = ref(false)
const loadError = ref('')

const visibleScans = computed(() => {
  const needle = filterText.value.trim().toLowerCase()
  return scanRecords.value
    .filter((scan) => !needle || `${scan.target} ${scan.tool}`.toLowerCase().includes(needle))
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
})
const selectedScans = computed(() =>
  selectedIds.value.map((id) => scanRecords.value.find((scan) => scan.id === id))
    .filter((scan): scan is ScanRecord => Boolean(scan))
    .sort((a, b) => a.date.localeCompare(b.date)),
)
const comparisonDiff = computed(() => {
  if (selectedScans.value.length !== 2) return null
  const [before, after] = selectedScans.value
  const identity = (item: unknown, index: number): string => {
    if (!item || typeof item !== 'object') return `row-${index}`
    const result = item as Record<string, unknown>
    return String(result.port ?? result.hop ?? result.host ?? result.ip ?? result.id ?? `row-${index}`)
  }
  const older = new Map(before.results.map((item, index) => [identity(item, index), JSON.stringify(item)]))
  const newer = new Map(after.results.map((item, index) => [identity(item, index), JSON.stringify(item)]))
  let changed = 0
  for (const [key, value] of older) {
    if (newer.has(key) && newer.get(key) !== value) changed += 1
  }
  return {
    added: [...newer.keys()].filter((key) => !older.has(key)).length,
    removed: [...older.keys()].filter((key) => !newer.has(key)).length,
    changed,
  }
})

async function loadServerHistory(): Promise<void> {
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await axios.get<{ history?: ServerScan[] }>('/scan-history', { timeout: 8000 })
    const serverHistory = Array.isArray(data.history) ? data.history : []
    for (const scan of serverHistory) {
      if (!scan.target && !scan.host) continue
      const record: ScanRecord = {
        id: `server-${scan.id ?? `${scan.type}-${scan.date}-${scan.host}`}`,
        tool: scan.type || 'Server scan',
        target: scan.target || scan.host || 'Unknown target',
        date: scan.date || new Date().toISOString(),
        durationMs: 0,
        resultCount: Array.isArray(scan.results) ? scan.results.length : 0,
        results: Array.isArray(scan.results) ? scan.results : [],
      }
      if (!scanRecords.value.some((item) => item.id === record.id)) {
        scanRecords.value.push(record)
      }
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load server scan history.'
  } finally {
    loading.value = false
  }
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown date' : new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function toggleComparison(id: string): void {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
  } else if (selectedIds.value.length < 2) {
    selectedIds.value = [...selectedIds.value, id]
  }
}

async function reuseTarget(target: string, tool: string): Promise<void> {
  const routeByTool: Record<string, string> = {
    'advanced-scan': '/port-scanner',
    'port-scan': '/port-scanner',
    'web-scan': '/web-scan',
    'vuln-scanner': '/vuln-scanner',
    'network-mapper': '/network-mapper',
    'ping-sweep': '/ping-sweep',
    traceroute: '/traceroute',
  }
  const path = routeByTool[tool]
  if (path) {
    await router.push({ path, query: { target } })
    return
  }
  try {
    await navigator.clipboard.writeText(target)
    loadError.value = 'Target copied. Paste it into the relevant authorized tool.'
  } catch {
    loadError.value = 'Clipboard is unavailable; copy this target manually: ' + target
  }
}

function csvCell(value: unknown): string {
  let text = typeof value === 'string' ? value : JSON.stringify(value ?? '')
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

const sensitiveTokens = new Set([
  'target', 'host', 'hostname', 'domain', 'ip', 'ipv4', 'ipv6', 'address', 'url',
  'email', 'token', 'authorization', 'password', 'secret',
])
const privateTextPatterns = [
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\bhttps?:\/\/\S+/gi,
  /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi,
  /\b(?:token|api[_-]?key|password|secret)=\S+/gi,
]

function redactValue(value: unknown, key = ''): unknown {
  if (!preferences.value.redactSensitiveReports) return value
  const keyParts = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase().split(/[^a-z0-9]+/)
  const sensitiveKey = keyParts.some((part) => sensitiveTokens.has(part))
    || (keyParts.includes('api') && keyParts.includes('key'))
    || (keyParts.includes('private') && keyParts.includes('key'))
  if (sensitiveKey) return '[REDACTED]'
  if (Array.isArray(value)) return value.map((item) => redactValue(item))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([field, fieldValue]) => [field, redactValue(fieldValue, field)]),
    )
  }
  if (typeof value !== 'string') return value
  return privateTextPatterns.reduce((text, pattern) => text.replace(pattern, '[REDACTED]'), value)
}

function reportRecord(scan: ScanRecord): ScanRecord {
  return {
    ...scan,
    target: String(redactValue(scan.target, 'target')),
    results: scan.results.map((item) => redactValue(item)),
  }
}

function downloadFile(contents: string, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function exportCsv(): void {
  const rows = [
    ['Target', 'Tool', 'Date', 'Duration ms', 'Result count', 'Results'],
    ...visibleScans.value.map((scan) => [
      redactValue(scan.target, 'target'),
      scan.tool,
      scan.date,
      String(scan.durationMs),
      String(scan.resultCount),
      JSON.stringify(redactValue(scan.results)),
    ]),
  ]
  downloadFile(rows.map((row) => row.map(csvCell).join(',')).join('\r\n'), 'dixitcoder-scan-report.csv', 'text/csv;charset=utf-8')
}

function exportOne(scan: ScanRecord): void {
  downloadFile(JSON.stringify(reportRecord(scan), null, 2), `${safeFilename(scan.tool)}-scan.json`, 'application/json')
}

function safeFilename(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'scan'
}

function printReport(): void {
  window.print()
}

async function shareReport(): Promise<void> {
  const summary = visibleScans.value
    .map((scan) => `${scan.tool}: ${redactValue(scan.target, 'target')} · ${scan.resultCount} results · ${formatDate(scan.date)}`)
    .join('\n')
  if (navigator.share) {
    try {
      await navigator.share({ title: 'DixitCoder scan report', text: summary })
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        loadError.value = `Unable to share report: ${error.message}`
      }
    }
  } else {
    try {
      await navigator.clipboard.writeText(summary)
      loadError.value = 'Share is not supported here; report summary copied to clipboard.'
    } catch {
      loadError.value = 'Share and clipboard are unavailable in this browser.'
    }
  }
}

onMounted(loadServerHistory)
</script>

<style scoped>
.history-panel {
  display: grid;
  gap: 16px;
}

.history-heading,
.target-panel {
  min-width: 0;
  border: 1px solid var(--dashboard-border, rgb(148 163 184 / 20%));
  border-radius: 17px;
  background: var(--dashboard-surface, #fff);
  box-shadow: 0 8px 28px rgb(15 23 42 / 3%);
}

.history-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 22px;
}

.history-kicker {
  margin: 0 0 6px;
  color: #0e7490;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.history-heading h1 {
  margin: 0;
  color: #101828;
  font-size: 23px;
  font-weight: 700;
}

.history-heading p:last-child,
.section-title-row p {
  margin: 6px 0 0;
  color: #667085;
  font-size: 11px;
  line-height: 1.55;
}

.history-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.redaction-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 4px;
  color: #475467;
  font-size: 10px;
  font-weight: 600;
}

.redaction-toggle input {
  accent-color: #0891b2;
}

.history-actions button,
.section-title-row > button {
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid rgb(8 145 178 / 28%);
  border-radius: 8px;
  color: #0e7490;
  background: rgb(6 182 212 / 5%);
  font-size: 10px;
  font-weight: 700;
}

.history-actions button,
.redaction-toggle {
  min-height: 34px;
}

.history-actions button:disabled,
.section-title-row > button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.target-panel {
  overflow: hidden;
  padding: 18px;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.section-title-row h2 {
  margin: 0;
  color: #101828;
  font-size: 15px;
  font-weight: 700;
}

.history-filter input {
  width: min(100%, 260px);
  min-height: 36px;
  padding: 7px 10px;
  border: 1px solid rgb(148 163 184 / 28%);
  border-radius: 8px;
  color: #344054;
  background: #fff;
  font-size: 11px;
}

.target-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.target-list li {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px;
  border: 1px solid rgb(148 163 184 / 13%);
  border-radius: 10px;
}

.target-list li > span {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.target-list strong {
  overflow: hidden;
  color: #344054;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.target-list small {
  color: #8492a6;
  font-size: 9px;
}

.target-list button,
.row-action {
  padding: 5px 8px;
  border: 1px solid rgb(6 182 212 / 25%);
  border-radius: 7px;
  color: #0e7490;
  background: rgb(6 182 212 / 5%);
  font-size: 10px;
  font-weight: 600;
}

.compare-summary {
  margin: 0 0 12px;
  padding: 10px 12px;
  border: 1px solid rgb(6 182 212 / 21%);
  border-radius: 9px;
  color: #155e75;
  background: rgb(6 182 212 / 6%);
  font-size: 11px;
  line-height: 1.65;
}

.scan-table-wrap {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid rgb(148 163 184 / 14%);
  border-radius: 10px;
}

.scan-table-wrap:focus-visible {
  outline: 2px solid #06b6d4;
  outline-offset: 2px;
}

table {
  width: 100%;
  min-width: 680px;
  border-collapse: collapse;
  text-align: left;
}

th,
td {
  padding: 11px 12px;
  border-bottom: 1px solid rgb(148 163 184 / 13%);
  color: #475467;
  font-size: 10px;
  vertical-align: top;
}

th {
  color: #667085;
  background: rgb(148 163 184 / 5%);
  font-weight: 700;
}

td strong {
  overflow-wrap: anywhere;
  color: #344054;
  font-size: 11px;
}

.empty-state,
.error-state {
  margin: 0;
  padding: 13px;
  color: #667085;
  font-size: 11px;
}

.error-state {
  border: 1px solid rgb(220 38 38 / 20%);
  border-radius: 9px;
  color: #b42318;
  background: #fffbfa;
}

.skeleton-block {
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 42%, #e2e8f0 63%);
  background-size: 300% 100%;
  animation: history-shimmer 1.4s ease infinite;
}

.privacy-note {
  margin: 0;
  color: #667085;
  font-size: 10px;
  line-height: 1.6;
}

:global(.dark) .history-heading,
:global(.dark) .target-panel {
  background: rgb(15 23 42 / 76%);
}

:global(.dark) .history-heading h1,
:global(.dark) .section-title-row h2,
:global(.dark) .target-list strong,
:global(.dark) td strong {
  color: #f8fafc;
}

:global(.dark) .history-heading p:last-child,
:global(.dark) .section-title-row p,
:global(.dark) .privacy-note {
  color: #a6b3c5;
}

:global(.dark) .history-filter input {
  border-color: rgb(148 163 184 / 22%);
  color: #e2e8f0;
  background: #0b1321;
}

:global(.dark) .redaction-toggle {
  color: #cbd5e1;
}

:global(.dark) .target-list li,
:global(.dark) .scan-table-wrap {
  border-color: rgb(148 163 184 / 13%);
}

:global(.dark) th,
:global(.dark) td {
  color: #cbd5e1;
}

:global(.dark) th {
  background: rgb(255 255 255 / 3%);
}

@keyframes history-shimmer {
  to { background-position: -120% 0; }
}

@media (max-width: 760px) {
  .history-heading,
  .section-title-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .history-heading {
    padding: 17px;
  }

  .history-actions {
    width: 100%;
    align-items: center;
  }

  .target-list {
    grid-template-columns: minmax(0, 1fr);
  }

  .history-filter,
  .history-filter input {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-block {
    animation: none;
  }
}

@media print {
  :global(body *) {
    visibility: hidden !important;
  }

  .history-panel,
  .history-panel * {
    visibility: visible !important;
  }

  .history-panel {
    position: absolute;
    inset: 0;
    width: 100%;
  }

  .history-actions,
  .target-panel:first-of-type,
  .privacy-note,
  .row-action,
  .target-list button {
    display: none !important;
  }

  .history-heading,
  .target-panel {
    box-shadow: none;
  }
}
</style>
