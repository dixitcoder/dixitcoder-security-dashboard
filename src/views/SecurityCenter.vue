<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Security Center" />
    <section class="security-center">
      <header class="center-hero">
        <div class="hero-copy">
          <span class="eyebrow">DIXITCODER · DEFENSIVE WORKSPACE</span>
          <h1>Security Center</h1>
          <p>Keep authorized assets, findings, checks, and audit notes together. Workspace data stays in this browser.</p>
        </div>
        <div class="hero-actions">
          <button class="button button-secondary" type="button" @click="openReport">Print report</button>
          <RouterLink class="button button-primary" to="/scan-reports">Scan history <span aria-hidden="true">↗</span></RouterLink>
        </div>
      </header>

      <section class="overview-grid" aria-label="Security overview">
        <article class="metric-card score-card">
          <span class="metric-icon">◈</span>
          <div><span class="metric-label">Posture score</span><strong>{{ postureScore }}<small>/100</small></strong><span class="metric-hint">Based on open findings</span></div>
          <div class="score-ring" :style="{ '--score': `${postureScore}%` }"><span>{{ postureScore }}</span></div>
        </article>
        <article class="metric-card"><span class="metric-icon">⌘</span><div><span class="metric-label">Tracked assets</span><strong>{{ workspace.assets.length }}</strong><span class="metric-hint">Authorized inventory</span></div></article>
        <article class="metric-card"><span class="metric-icon">⚑</span><div><span class="metric-label">Open findings</span><strong>{{ openFindings.length }}</strong><span class="metric-hint">{{ criticalFindings }} critical / high</span></div></article>
        <article class="metric-card"><span class="metric-icon">◷</span><div><span class="metric-label">Upcoming checks</span><strong>{{ upcomingChecks.length }}</strong><span class="metric-hint">Reminders on this device</span></div></article>
      </section>

      <nav class="workspace-tabs" aria-label="Security Center sections">
        <button v-for="tab in tabs" :key="tab.id" type="button" :class="{ active: activeTab === tab.id }" :aria-current="activeTab === tab.id ? 'page' : undefined" @click="activeTab = tab.id">
          <span aria-hidden="true">{{ tab.icon }}</span>{{ tab.label }}<small v-if="tab.count !== undefined">{{ tab.count }}</small>
        </button>
      </nav>

      <p v-if="storageError" class="message error-message" role="alert">{{ storageError }}</p>
      <p v-if="actionMessage" class="message success-message" role="status">{{ actionMessage }}</p>

      <section v-if="activeTab === 'assets'" class="panel-grid">
        <article class="panel asset-form-panel">
          <div class="panel-heading"><div><span class="eyebrow">SCOPE</span><h2>{{ editingAssetId ? 'Edit asset' : 'Add an asset' }}</h2></div></div>
          <form class="stack-form" @submit.prevent="saveAsset">
            <label>Asset name<input v-model.trim="assetForm.name" required maxlength="80" placeholder="e.g. Main website" /></label>
            <label>Domain or IP<input v-model.trim="assetForm.host" required maxlength="253" placeholder="example.com" /></label>
            <div class="form-row">
              <label>Group<input v-model.trim="assetForm.group" maxlength="50" placeholder="Production" /></label>
              <label>Related to<select v-model="assetForm.parentId"><option value="">No parent</option><option v-for="asset in parentOptions" :key="asset.id" :value="asset.id">{{ asset.name }}</option></select></label>
            </div>
            <label>Notes<textarea v-model.trim="assetForm.notes" rows="2" maxlength="300" placeholder="Ownership or scope notes"></textarea></label>
            <p class="form-hint">Only add systems you own or have explicit permission to assess.</p>
            <div class="form-actions"><button class="button button-primary" type="submit">{{ editingAssetId ? 'Save changes' : 'Add asset' }}</button><button v-if="editingAssetId" class="button button-secondary" type="button" @click="resetAssetForm">Cancel</button></div>
          </form>
        </article>
        <article class="panel">
          <div class="panel-heading"><div><span class="eyebrow">INVENTORY</span><h2>Your assets <span class="count-pill">{{ workspace.assets.length }}</span></h2></div><input v-model="assetFilter" class="search-input" type="search" placeholder="Filter assets" aria-label="Filter assets" /></div>
          <div v-if="filteredAssets.length" class="asset-list">
            <article v-for="asset in filteredAssets" :key="asset.id" class="asset-row">
              <span class="asset-mark">⌘</span><div class="asset-copy"><strong>{{ asset.name }}</strong><span>{{ asset.host }}</span><small>{{ asset.group || 'Ungrouped' }} · Added {{ formatDate(asset.createdAt) }}</small><small v-if="asset.notes">{{ asset.notes }}</small></div>
              <span class="asset-status" :class="assetCheckClass(asset)">{{ asset.lastCheckedAt ? 'Checked' : 'Not checked' }}</span>
              <div class="row-actions"><button type="button" @click="checkAsset(asset)">Check</button><button type="button" @click="editAsset(asset)">Edit</button><button class="danger-action" type="button" @click="removeAsset(asset)">Remove</button></div>
            </article>
          </div>
          <p v-else class="empty-state">{{ workspace.assets.length ? 'No assets match this filter.' : 'Add an authorized asset to start your inventory.' }}</p>
        </article>
      </section>

      <section v-else-if="activeTab === 'findings'" class="panel-grid">
        <article class="panel">
          <div class="panel-heading"><div><span class="eyebrow">REMEDIATION</span><h2>Track a finding</h2></div></div>
          <form class="stack-form" @submit.prevent="saveFinding">
            <label>Finding title<input v-model.trim="findingForm.title" required maxlength="120" placeholder="e.g. Missing Content-Security-Policy" /></label>
            <label>Asset<select v-model="findingForm.assetId"><option value="">General / unassigned</option><option v-for="asset in workspace.assets" :key="asset.id" :value="asset.id">{{ asset.name }} · {{ asset.host }}</option></select></label>
            <div class="form-row"><label>Severity<select v-model="findingForm.severity"><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label><label>Status<select v-model="findingForm.status"><option value="open">Open</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option></select></label></div>
            <label>Remediation notes<textarea v-model.trim="findingForm.notes" rows="3" maxlength="600" placeholder="What should be fixed and how?"></textarea></label>
            <button class="button button-primary" type="submit">Save finding</button>
          </form>
        </article>
        <article class="panel findings-panel">
          <div class="panel-heading"><div><span class="eyebrow">ISSUES</span><h2>Findings <span class="count-pill">{{ workspace.findings.length }}</span></h2></div><select v-model="findingFilter" class="search-input" aria-label="Filter findings by status"><option value="all">All statuses</option><option value="open">Open</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option></select></div>
          <div v-if="filteredFindings.length" class="finding-list">
            <article v-for="finding in filteredFindings" :key="finding.id" class="finding-row" :class="`severity-${finding.severity}`">
              <span class="severity-marker" aria-hidden="true"></span><div class="finding-copy"><div class="finding-title"><strong>{{ finding.title }}</strong><span class="severity-pill" :class="`pill-${finding.severity}`">{{ finding.severity }}</span></div><span>{{ assetName(finding.assetId) }} · {{ formatDate(finding.createdAt) }}</span><small v-if="finding.notes">{{ finding.notes }}</small></div>
              <select :value="finding.status" :aria-label="`Status for ${finding.title}`" @change="updateFindingStatus(finding.id, $event)"><option value="open">Open</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option></select>
              <button class="icon-action danger-action" type="button" :aria-label="`Delete ${finding.title}`" @click="deleteFinding(finding)">×</button>
            </article>
          </div>
          <p v-else class="empty-state">No findings here yet. Add one above or record remediation notes after a scan.</p>
        </article>
      </section>

      <section v-else-if="activeTab === 'schedule'" class="panel-grid">
        <article class="panel">
          <div class="panel-heading"><div><span class="eyebrow">RECURRING REMINDERS</span><h2>Schedule a check</h2></div></div>
          <form class="stack-form" @submit.prevent="saveSchedule">
            <label>Authorized asset<select v-model="scheduleForm.assetId" required><option disabled value="">Select an inventory asset</option><option v-for="asset in workspace.assets" :key="asset.id" :value="asset.id">{{ asset.name }} · {{ asset.host }}</option></select></label>
            <label>Reminder frequency<select v-model="scheduleForm.interval"><option value="daily">Every day</option><option value="weekly">Every week</option><option value="monthly">Every month</option></select></label>
            <label>Reminder label<input v-model.trim="scheduleForm.label" maxlength="80" placeholder="Monthly security review" /></label>
            <button class="button button-primary" type="submit" :disabled="!workspace.assets.length">Save reminder</button>
          </form>
          <p class="form-hint">Reminders run in this browser only. Due reminders never launch scans automatically; use “Run authorized check” to confirm and start the check.</p>
        </article>
        <article class="panel">
          <div class="panel-heading"><div><span class="eyebrow">YOUR DEVICE</span><h2>Scheduled reminders <span class="count-pill">{{ workspace.schedules.length }}</span></h2></div></div>
          <div v-if="workspace.schedules.length" class="reminder-list">
            <article v-for="schedule in sortedSchedules" :key="schedule.id" class="reminder-row">
              <span class="reminder-icon" aria-hidden="true">◷</span><div class="reminder-copy"><strong>{{ schedule.label || 'Security check' }}</strong><span>{{ assetName(schedule.assetId) }} · {{ schedule.interval }}</span><small>Next reminder {{ formatDate(schedule.nextAt) }}</small></div><div class="row-actions"><button type="button" @click="runScheduledCheck(schedule)">Run authorized check</button><button class="danger-action" type="button" @click="removeSchedule(schedule.id)">Remove</button></div>
            </article>
          </div>
          <p v-else class="empty-state">Add a recurring reminder. It will notify you while this workspace is open.</p>
        </article>
      </section>

      <section v-else-if="activeTab === 'reports'" class="panel report-panel">
        <div class="panel-heading"><div><span class="eyebrow">EXPORT</span><h2>Security report builder</h2><p>Select sections for a print-ready report. Choose “Save as PDF” in your browser’s print dialog.</p></div></div>
        <div class="report-options">
          <label><input v-model="reportOptions" type="checkbox" value="assets" /> Asset inventory <small>{{ workspace.assets.length }} asset(s)</small></label>
          <label><input v-model="reportOptions" type="checkbox" value="findings" /> Findings <small>{{ workspace.findings.length }} finding(s)</small></label>
          <label><input v-model="reportOptions" type="checkbox" value="checks" /> Recent checks <small>{{ workspace.checks.length }} check(s)</small></label>
          <label><input v-model="reportOptions" type="checkbox" value="notes" /> Audit notes & checklist</label>
        </div>
        <div class="report-preview"><span class="eyebrow">PREVIEW</span><h3>DixitCoder Security Review</h3><p>Generated {{ formatDate(new Date().toISOString()) }} · Posture score {{ postureScore }}/100</p>
          <section v-for="section in reportOptions" :key="section" class="report-detail">
            <h4>{{ sectionTitle(section) }} <small>{{ reportSectionCount(section) }}</small></h4>
            <ul v-if="section === 'assets'"><li v-for="asset in workspace.assets" :key="asset.id">{{ asset.name }} — {{ asset.host }} · {{ asset.group || 'Ungrouped' }}<span v-if="asset.notes"> — {{ asset.notes }}</span></li><li v-if="!workspace.assets.length">No assets recorded.</li></ul>
            <ul v-else-if="section === 'findings'"><li v-for="finding in workspace.findings" :key="finding.id">[{{ finding.severity.toUpperCase() }} · {{ finding.status }}] {{ finding.title }} — {{ assetName(finding.assetId) }}<span v-if="finding.notes"> · {{ finding.notes }}</span></li><li v-if="!workspace.findings.length">No findings recorded.</li></ul>
            <ul v-else-if="section === 'checks'"><li v-for="check in workspace.checks" :key="check.id">{{ check.host }} — {{ check.score }}/100 · {{ formatDate(check.checkedAt) }} · {{ check.summary }}</li><li v-if="!workspace.checks.length">No configuration checks recorded.</li></ul>
            <div v-else><p class="report-notes">{{ workspace.notes || 'No audit notes.' }}</p><ul><li v-for="item in workspace.checklist" :key="item.id">{{ item.done ? '[x]' : '[ ]' }} {{ item.label }}</li></ul></div>
          </section>
        </div>
        <button class="button button-primary" type="button" :disabled="!reportOptions.length" @click="openReport">Print / Save as PDF</button>
      </section>

      <section v-else-if="activeTab === 'map'" class="panel">
        <div class="panel-heading"><div><span class="eyebrow">ASSET RELATIONSHIPS</span><h2>Network map</h2><p>Connect assets using the “Related to” field in your inventory. This map is a visual inventory, not a live network discovery.</p></div><RouterLink class="button button-secondary" to="/network-mapper">Open network tools <span aria-hidden="true">↗</span></RouterLink></div>
        <div v-if="workspace.assets.length" class="map-canvas" role="img" aria-label="Relationship diagram of tracked assets" :style="{ height: `${Math.max(360, Math.ceil(workspace.assets.length / 3) * 118 + 100)}px` }">
          <svg class="map-lines" viewBox="0 0 800 360" preserveAspectRatio="none" aria-hidden="true"><line v-for="edge in mapEdges" :key="edge.id" :x1="edge.x1" :y1="edge.y1" :x2="edge.x2" :y2="edge.y2" /></svg>
          <article v-for="(asset, index) in workspace.assets" :key="asset.id" class="map-node" :style="nodeStyle(index)"><span class="asset-mark">⌘</span><div><strong>{{ asset.name }}</strong><small>{{ asset.host }}</small><em>{{ asset.group || 'Ungrouped' }}</em></div></article>
        </div>
        <p v-else class="empty-state">Add assets and relationships to build your inventory map.</p>
      </section>

      <section v-else-if="activeTab === 'notes'" class="panel-grid">
        <article class="panel notes-panel">
          <div class="panel-heading"><div><span class="eyebrow">LOCAL & OFFLINE-FRIENDLY</span><h2>Audit notes</h2><p>Notes and checklist progress are saved in this browser and do not leave this device.</p></div></div>
          <label class="notes-label">Private audit notes<textarea v-model="workspace.notes" rows="10" maxlength="10000" placeholder="Write findings, decisions, owners, and follow-up actions…"></textarea></label>
          <p class="form-hint">{{ workspace.notes.length }} / 10,000 characters · Local browser storage</p>
          <div class="checklist">
            <h3>Security review checklist</h3>
            <label v-for="item in workspace.checklist" :key="item.id" class="checklist-item"><input v-model="item.done" type="checkbox" /><span :class="{ completed: item.done }">{{ item.label }}</span></label>
          </div>
        </article>
        <aside class="panel privacy-panel"><span class="privacy-icon">◉</span><h2>Private by design</h2><p>Inventory, findings, reminders, notes, and checklist data are stored in local browser storage. Use the export tab for a report. Clearing browser data removes this workspace.</p><button class="button button-secondary" type="button" @click="exportWorkspace">Export workspace JSON</button></aside>
      </section>

      <section v-else class="panel-grid">
        <article class="panel checker-panel">
          <div class="panel-heading"><div><span class="eyebrow">DEFENSIVE CONFIGURATION REVIEW</span><h2>Website security headers & TLS</h2><p>Review HTTPS response headers and certificate information for an authorized website.</p></div></div>
          <form class="stack-form checker-form" @submit.prevent="runConfigurationCheck">
            <label>Authorized website<select v-model="checkerAssetId" required><option disabled value="">Select an inventory asset</option><option v-for="asset in workspace.assets" :key="asset.id" :value="asset.id">{{ asset.name }} · {{ asset.host }}</option></select></label>
            <label class="permission-check"><input v-model="checkerAuthorized" type="checkbox" /><span>I own this site or have explicit authorization to check it.</span></label>
            <button class="button button-primary" type="submit" :disabled="checking || !checkerAuthorized || !checkerAssetId">{{ checking ? 'Checking configuration…' : 'Run configuration check' }}</button>
          </form>
          <p v-if="checkerError" class="message error-message" role="alert">{{ checkerError }}</p>
          <div v-if="checkerResult" class="check-result">
            <div class="result-heading"><div><span class="eyebrow">CHECK RESULT</span><h3>{{ checkerResult.host }}</h3></div><span class="status-chip" :class="checkerResult.score >= 75 ? 'good' : checkerResult.score >= 45 ? 'warn' : 'bad'">{{ checkerResult.score }} / 100</span></div>
            <p>{{ checkerResult.summary }}</p>
            <ul class="header-results"><li v-for="item in checkerResult.items" :key="item.name" :class="item.ok ? 'header-ok' : 'header-missing'"><span>{{ item.ok ? '✓' : '!' }}</span><div><strong>{{ item.name }}</strong><small>{{ item.detail }}</small></div><em>{{ item.ok ? 'Present' : 'Review' }}</em></li></ul>
            <small class="timestamp-note">Checked {{ formatDate(checkerResult.checkedAt) }}. This is a basic configuration review, not a penetration test.</small>
          </div>
        </article>
        <aside class="panel guidance-panel"><span class="guidance-icon">i</span><h2>What is checked?</h2><ul><li>HTTPS connection and server response</li><li>Content-Security-Policy</li><li>Strict-Transport-Security</li><li>X-Content-Type-Options and frame protections</li><li>Referrer-Policy and Permissions-Policy</li><li>TLS certificate details when available</li></ul><p>Findings are informational and should be reviewed in context. Server access is required; this does not run offline.</p></aside>
      </section>

      <footer class="center-footer"><span>Only assess systems you own or are explicitly authorized to test.</span><span>Local workspace · No paid services required</span></footer>
    </section>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import axios from 'axios'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { useDashboardPreferences } from '@/composables/useDashboardPreferences'

type Severity = 'critical' | 'high' | 'medium' | 'low'
type FindingStatus = 'open' | 'in-progress' | 'resolved'
type Interval = 'daily' | 'weekly' | 'monthly'
type TabId = 'assets' | 'findings' | 'schedule' | 'reports' | 'map' | 'notes' | 'config'

interface Asset {
  id: string
  name: string
  host: string
  group: string
  parentId: string
  notes: string
  createdAt: string
  lastCheckedAt: string
}
interface Finding {
  id: string
  title: string
  assetId: string
  severity: Severity
  status: FindingStatus
  notes: string
  createdAt: string
}
interface Schedule {
  id: string
  assetId: string
  interval: Interval
  label: string
  nextAt: string
}
interface CheckResult {
  id: string
  assetId: string
  host: string
  score: number
  summary: string
  checkedAt: string
}
interface ChecklistItem { id: string; label: string; done: boolean }
interface Workspace {
  assets: Asset[]
  findings: Finding[]
  schedules: Schedule[]
  checks: CheckResult[]
  notes: string
  checklist: ChecklistItem[]
}
interface HeaderItem { name: string; ok: boolean; detail: string }
interface ConfigurationResult extends CheckResult { items: HeaderItem[] }
interface WebScanResponse {
  status: number | null
  headers?: Record<string, string>
  ssl?: { protocol?: string; valid_to?: string; expired?: boolean } | null
  error?: string
}

const storageKey = 'dixitcoder-security-center-v1'
const emptyWorkspace = (): Workspace => ({
  assets: [], findings: [], schedules: [], checks: [], notes: '',
  checklist: [
    { id: 'scope', label: 'Confirm asset ownership and assessment scope', done: false },
    { id: 'https', label: 'Review HTTPS and TLS certificate expiry', done: false },
    { id: 'headers', label: 'Review security response headers', done: false },
    { id: 'findings', label: 'Assign an owner and priority to each finding', done: false },
    { id: 'remediation', label: 'Verify fixes and close resolved findings', done: false },
    { id: 'report', label: 'Export and securely share the review report', done: false },
  ],
})

function loadWorkspace(): Workspace {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return emptyWorkspace()
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') throw new Error('Saved workspace data is invalid.')
    const value = parsed as Partial<Workspace>
    return {
      ...emptyWorkspace(),
      ...value,
      assets: Array.isArray(value.assets) ? value.assets : [],
      findings: Array.isArray(value.findings) ? value.findings : [],
      schedules: Array.isArray(value.schedules) ? value.schedules : [],
      checks: Array.isArray(value.checks) ? value.checks : [],
      checklist: Array.isArray(value.checklist) ? value.checklist : emptyWorkspace().checklist,
      notes: typeof value.notes === 'string' ? value.notes : '',
    }
  } catch (error) {
    console.error('Unable to load Security Center workspace', error)
    storageError.value = 'Could not load saved workspace data. Check browser storage permissions.'
    return emptyWorkspace()
  }
}

const storageError = ref('')
const actionMessage = ref('')
const workspace = reactive<Workspace>(loadWorkspace())
const activeTab = ref<TabId>('assets')
const assetFilter = ref('')
const findingFilter = ref<'all' | FindingStatus>('all')
const editingAssetId = ref('')
const assetForm = reactive({ name: '', host: '', group: '', parentId: '', notes: '' })
const findingForm = reactive<{ title: string; assetId: string; severity: Severity; status: FindingStatus; notes: string }>({
  title: '', assetId: '', severity: 'medium', status: 'open', notes: '',
})
const scheduleForm = reactive<{ assetId: string; interval: Interval; label: string }>({ assetId: '', interval: 'weekly', label: '' })
const reportOptions = ref(['assets', 'findings', 'checks', 'notes'])
const checkerAssetId = ref('')
const checkerAuthorized = ref(false)
const checking = ref(false)
const checkerError = ref('')
const checkerResult = ref<ConfigurationResult | null>(null)
const { addNotification } = useDashboardPreferences()
let reminderTimer = 0
let messageTimer = 0

const openFindings = computed(() => workspace.findings.filter((finding) => finding.status !== 'resolved'))
const criticalFindings = computed(() => openFindings.value.filter((finding) => finding.severity === 'critical' || finding.severity === 'high').length)
const severityWeight: Record<Severity, number> = { critical: 28, high: 17, medium: 9, low: 4 }
const postureScore = computed(() => Math.max(0, 100 - openFindings.value.reduce((score, item) => score + severityWeight[item.severity], 0)))
const upcomingChecks = computed(() => workspace.schedules.filter((item) => Date.parse(item.nextAt) >= Date.now()).sort((a, b) => Date.parse(a.nextAt) - Date.parse(b.nextAt)))
const tabs = computed(() => [
  { id: 'assets' as const, label: 'Assets', icon: '⌘', count: workspace.assets.length },
  { id: 'findings' as const, label: 'Findings', icon: '⚑', count: openFindings.value.length },
  { id: 'schedule' as const, label: 'Schedule', icon: '◷', count: workspace.schedules.length },
  { id: 'reports' as const, label: 'Reports', icon: '▤' },
  { id: 'map' as const, label: 'Network map', icon: '⌘' },
  { id: 'notes' as const, label: 'Notes & checklist', icon: '☑' },
  { id: 'config' as const, label: 'Config check', icon: '⌁' },
])
const filteredAssets = computed(() => workspace.assets.filter((asset) => `${asset.name} ${asset.host} ${asset.group}`.toLowerCase().includes(assetFilter.value.toLowerCase())))
const filteredFindings = computed(() => workspace.findings.filter((finding) => findingFilter.value === 'all' || finding.status === findingFilter.value))
const parentOptions = computed(() => workspace.assets.filter((asset) => asset.id !== editingAssetId.value))
const sortedSchedules = computed(() => [...workspace.schedules].sort((a, b) => Date.parse(a.nextAt) - Date.parse(b.nextAt)))

interface MapEdge { id: string; x1: number; y1: number; x2: number; y2: number }
const mapEdges = computed<MapEdge[]>(() => workspace.assets.flatMap((asset) => {
  const parentIndex = workspace.assets.findIndex((candidate) => candidate.id === asset.parentId)
  const childIndex = workspace.assets.findIndex((candidate) => candidate.id === asset.id)
  if (parentIndex < 0 || childIndex < 0) return []
  const point = (index: number) => ({ x: 100 + (index % 3) * 300, y: 78 + Math.floor(index / 3) * 118 })
  const parent = point(parentIndex)
  const child = point(childIndex)
  return [{ id: asset.id, x1: parent.x + 75, y1: parent.y + 38, x2: child.x + 75, y2: child.y + 38 }]
}))

watch(workspace, (value) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value))
    storageError.value = ''
  } catch (error) {
    console.error('Unable to save Security Center workspace', error)
    storageError.value = 'Unable to save changes. Browser storage may be full; export your workspace JSON.'
  }
}, { deep: true })

function makeId(): string {
  return crypto.randomUUID()
}

function showMessage(message: string): void {
  actionMessage.value = message
  window.clearTimeout(messageTimer)
  messageTimer = window.setTimeout(() => { actionMessage.value = '' }, 3200)
}

function normalizeHost(host: string): string | null {
  const clean = host.trim().replace(/^https?:\/\//i, '').split(/[/?#]/)[0].replace(/:\d+$/, '')
  if (clean.length > 253 || !clean || /[\s@]/.test(clean)) return null
  const domain = /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?:\.(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?))*$/.test(clean)
  const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(clean) && clean.split('.').every((part) => Number(part) <= 255)
  return domain || ipv4 ? clean : null
}

function resetAssetForm(): void {
  editingAssetId.value = ''
  Object.assign(assetForm, { name: '', host: '', group: '', parentId: '', notes: '' })
}

function saveAsset(): void {
  const host = normalizeHost(assetForm.host)
  if (!host) {
    storageError.value = 'Enter a valid domain or IPv4 address.'
    return
  }
  if (workspace.assets.some((asset) => asset.host.toLowerCase() === host.toLowerCase() && asset.id !== editingAssetId.value)) {
    storageError.value = 'This host is already in your inventory.'
    return
  }
  const previous = workspace.assets.find((asset) => asset.id === editingAssetId.value)
  const asset: Asset = {
    id: previous?.id || makeId(), name: assetForm.name, host, group: assetForm.group,
    parentId: assetForm.parentId, notes: assetForm.notes,
    createdAt: previous?.createdAt || new Date().toISOString(), lastCheckedAt: previous?.lastCheckedAt || '',
  }
  if (previous) Object.assign(previous, asset)
  else workspace.assets.unshift(asset)
  resetAssetForm()
  showMessage(previous ? 'Asset updated.' : 'Asset added to your local inventory.')
}

function editAsset(asset: Asset): void {
  editingAssetId.value = asset.id
  Object.assign(assetForm, { name: asset.name, host: asset.host, group: asset.group, parentId: asset.parentId, notes: asset.notes })
  activeTab.value = 'assets'
}

function removeAsset(asset: Asset): void {
  if (!window.confirm(`Remove ${asset.name} and its related findings/reminders?`)) return
  workspace.assets = workspace.assets.filter((item) => item.id !== asset.id)
  workspace.assets.forEach((item) => { if (item.parentId === asset.id) item.parentId = '' })
  workspace.findings = workspace.findings.filter((item) => item.assetId !== asset.id)
  workspace.schedules = workspace.schedules.filter((item) => item.assetId !== asset.id)
  workspace.checks = workspace.checks.filter((item) => item.assetId !== asset.id)
  showMessage('Asset and related records removed.')
}

function assetName(id: string): string {
  return workspace.assets.find((asset) => asset.id === id)?.name || 'General'
}

function assetCheckClass(asset: Asset): string {
  const latest = workspace.checks.find((item) => item.assetId === asset.id)
  return latest && latest.score >= 75 ? 'is-good' : latest ? 'is-warn' : ''
}

function saveFinding(): void {
  workspace.findings.unshift({
    id: makeId(), title: findingForm.title, assetId: findingForm.assetId,
    severity: findingForm.severity, status: findingForm.status,
    notes: findingForm.notes, createdAt: new Date().toISOString(),
  })
  Object.assign(findingForm, { title: '', assetId: '', severity: 'medium' as Severity, status: 'open' as FindingStatus, notes: '' })
  showMessage('Finding saved.')
}

function updateFindingStatus(id: string, event: Event): void {
  const finding = workspace.findings.find((item) => item.id === id)
  const status = (event.target as HTMLSelectElement).value as FindingStatus
  if (finding && ['open', 'in-progress', 'resolved'].includes(status)) finding.status = status
}

function deleteFinding(finding: Finding): void {
  if (!window.confirm(`Delete finding “${finding.title}”?`)) return
  workspace.findings = workspace.findings.filter((item) => item.id !== finding.id)
}

function addInterval(date: Date, interval: Interval): Date {
  const next = new Date(date)
  if (interval === 'daily') next.setDate(next.getDate() + 1)
  else if (interval === 'weekly') next.setDate(next.getDate() + 7)
  else next.setMonth(next.getMonth() + 1)
  return next
}

function saveSchedule(): void {
  if (!workspace.assets.some((asset) => asset.id === scheduleForm.assetId)) return
  const nextAt = addInterval(new Date(), scheduleForm.interval).toISOString()
  workspace.schedules.push({
    id: makeId(), assetId: scheduleForm.assetId, interval: scheduleForm.interval,
    label: scheduleForm.label || `Review ${assetName(scheduleForm.assetId)}`, nextAt,
  })
  Object.assign(scheduleForm, { assetId: '', interval: 'weekly' as Interval, label: '' })
  showMessage('Reminder saved on this device.')
}

function removeSchedule(id: string): void {
  workspace.schedules = workspace.schedules.filter((item) => item.id !== id)
}

function checkDueReminders(): void {
  const now = Date.now()
  for (const schedule of workspace.schedules) {
    const due = Date.parse(schedule.nextAt)
    if (Number.isNaN(due) || due > now) continue
    const nextAt = addInterval(new Date(now), schedule.interval).toISOString()
    schedule.nextAt = nextAt
    const message = `${schedule.label}: ${assetName(schedule.assetId)} is ready for a review.`
    addNotification({ kind: 'scan', title: 'Security review reminder', message })
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Security review reminder', { body: message, icon: '/images/pwa-icon.svg' })
    }
    showMessage(`Reminder due: ${schedule.label}. Run the check when ready.`)
  }
}

async function runScheduledCheck(schedule: Schedule): Promise<void> {
  const asset = workspace.assets.find((item) => item.id === schedule.assetId)
  if (!asset) return
  checkerAssetId.value = asset.id
  checkerAuthorized.value = true
  activeTab.value = 'config'
  await runConfigurationCheck()
}

function headerValue(headers: Record<string, string>, key: string): string | undefined {
  return Object.entries(headers).find(([name]) => name.toLowerCase() === key.toLowerCase())?.[1]
}

async function runConfigurationCheck(): Promise<void> {
  const asset = workspace.assets.find((item) => item.id === checkerAssetId.value)
  if (!asset || !checkerAuthorized.value) return
  checking.value = true
  checkerError.value = ''
  checkerResult.value = null
  const checkedAt = new Date().toISOString()
  try {
    const { data } = await axios.post<WebScanResponse>('/web-scan', {
      host: asset.host, port: 443, path: '/',
      options: { grabHeaders: true, sslInfo: true, followRedirects: false },
    }, { timeout: 15000 })
    if (data.error || data.status === null) throw new Error(data.error || 'The site did not return a valid HTTPS response.')
    const headers = data.headers || {}
    const csp = headerValue(headers, 'content-security-policy')
    const hsts = headerValue(headers, 'strict-transport-security')
    const nosniff = headerValue(headers, 'x-content-type-options')
    const frame = headerValue(headers, 'x-frame-options') || (csp?.toLowerCase().includes('frame-ancestors') ? 'CSP frame-ancestors' : undefined)
    const referrer = headerValue(headers, 'referrer-policy')
    const permissions = headerValue(headers, 'permissions-policy')
    const ssl = data.ssl
    const items: HeaderItem[] = [
      { name: 'HTTPS response', ok: data.status >= 200 && data.status < 500, detail: `HTTP ${data.status}` },
      { name: 'Content-Security-Policy', ok: Boolean(csp), detail: csp || 'Consider setting a policy suitable for the site.' },
      { name: 'Strict-Transport-Security', ok: Boolean(hsts), detail: hsts || 'Consider enabling HSTS after confirming HTTPS is fully configured.' },
      { name: 'X-Content-Type-Options', ok: nosniff?.toLowerCase().includes('nosniff') || false, detail: nosniff || 'Recommended value: nosniff.' },
      { name: 'Frame protection', ok: Boolean(frame), detail: frame || 'Set CSP frame-ancestors or X-Frame-Options to reduce clickjacking risk.' },
      { name: 'Referrer-Policy', ok: Boolean(referrer), detail: referrer || 'Choose a referrer policy that limits information leakage.' },
      { name: 'Permissions-Policy', ok: Boolean(permissions), detail: permissions || 'Review and restrict browser features not needed by the site.' },
      { name: 'TLS certificate', ok: Boolean(ssl && !ssl.expired), detail: ssl ? `${ssl.protocol || 'TLS'}${ssl.valid_to ? ` · expires ${ssl.valid_to}` : ''}${ssl.expired ? ' · expired' : ''}` : 'Certificate details were unavailable.' },
    ]
    const score = Math.round((items.filter((item) => item.ok).length / items.length) * 100)
    const result: ConfigurationResult = {
      id: makeId(), assetId: asset.id, host: asset.host, score,
      summary: `${items.filter((item) => item.ok).length} of ${items.length} basic checks passed. Review each item in your deployment context.`,
      checkedAt, items,
    }
    checkerResult.value = result
    workspace.checks.unshift({
      id: result.id, assetId: result.assetId, host: result.host,
      score: result.score, summary: result.summary, checkedAt,
    })
    workspace.checks = workspace.checks.slice(0, 50)
    asset.lastCheckedAt = checkedAt
    showMessage('Configuration check completed and saved locally.')
  } catch (error) {
    if (axios.isCancel(error)) {
      checkerError.value = 'Check cancelled. Confirm authorization and try again when ready.'
    } else {
      console.error('Website security configuration check failed', error)
      checkerError.value = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : error instanceof Error ? error.message : 'Configuration check failed.'
    }
  } finally {
    checking.value = false
  }
}

function checkAsset(asset: Asset): void {
  checkerAssetId.value = asset.id
  checkerAuthorized.value = false
  checkerResult.value = null
  activeTab.value = 'config'
}

function nodeStyle(index: number): Record<string, string> {
  const column = index % 3
  const row = Math.floor(index / 3)
  return { left: `${6 + column * 34}%`, top: `${7 + row * 34}%` }
}

function sectionTitle(section: string): string {
  return ({ assets: 'Asset inventory', findings: 'Findings', checks: 'Recent checks', notes: 'Audit notes & checklist' } as Record<string, string>)[section] || section
}

function reportSectionCount(section: string): string {
  if (section === 'assets') return `${workspace.assets.length} assets`
  if (section === 'findings') return `${workspace.findings.length} findings`
  if (section === 'checks') return `${workspace.checks.length} checks`
  return `${workspace.checklist.filter((item) => item.done).length}/${workspace.checklist.length} checklist items completed`
}

function formatDate(date: string): string {
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? 'Unknown date' : parsed.toLocaleString()
}

function openReport(): void {
  if (!reportOptions.value.length) return
  window.print()
}

function exportWorkspace(): void {
  try {
    const file = new Blob([JSON.stringify(workspace, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = `dixitcoder-security-workspace-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Unable to export Security Center workspace', error)
    storageError.value = 'Could not export the workspace. Check browser download permissions.'
  }
}

onMounted(() => {
  reminderTimer = window.setInterval(checkDueReminders, 60_000)
  checkDueReminders()
})

onBeforeUnmount(() => {
  window.clearInterval(reminderTimer)
  window.clearTimeout(messageTimer)
})
</script>

<style scoped>
.security-center{--sc-cyan:#06b6d4;--sc-violet:#8b5cf6;--sc-border:rgba(148,163,184,.2);--sc-muted:#64748b;color:#0f172a;display:grid;gap:22px;animation:sc-enter .55s cubic-bezier(.2,.75,.25,1) both}
.dark .security-center{color:#e2e8f0}
.center-hero{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:clamp(22px,4vw,36px);border:1px solid rgba(6,182,212,.2);border-radius:22px;background:radial-gradient(ellipse at 88% 10%,rgba(6,182,212,.16),transparent 42%),radial-gradient(ellipse at 70% 105%,rgba(139,92,246,.12),transparent 42%),linear-gradient(130deg,#fff,#f8fbff);box-shadow:0 18px 55px rgba(15,23,42,.06)}
.dark .center-hero{background:radial-gradient(ellipse at 88% 10%,rgba(6,182,212,.18),transparent 42%),radial-gradient(ellipse at 70% 105%,rgba(139,92,246,.15),transparent 42%),linear-gradient(130deg,#0b1321,#0d1728);border-color:rgba(34,211,238,.18)}
.hero-copy{max-width:680px}.eyebrow{display:inline-block;color:#0891b2;font-size:10px;font-weight:800;letter-spacing:.16em}.dark .eyebrow{color:#22d3ee}
.center-hero h1{margin:8px 0 6px;font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-.045em}.center-hero p,.panel-heading p{margin:0;color:var(--sc-muted);font-size:14px;line-height:1.65}.dark .center-hero p,.dark .panel-heading p{color:#94a3b8}
.hero-actions{display:flex;flex-wrap:wrap;gap:9px}
.button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;padding:9px 14px;border:1px solid transparent;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;transition:transform .2s ease,box-shadow .2s ease,background .2s ease}.button:hover{transform:translateY(-2px)}.button:disabled{cursor:not-allowed;opacity:.55;transform:none}
.button-primary{color:#fff;background:linear-gradient(110deg,#7c3aed,#0891b2);box-shadow:0 8px 20px rgba(8,145,178,.22)}.button-secondary{color:#334155;background:#fff;border-color:var(--sc-border)}.dark .button-secondary{color:#dbeafe;background:#111c2e}
.overview-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.metric-card{position:relative;display:flex;align-items:flex-start;gap:14px;min-height:128px;padding:20px;border:1px solid var(--sc-border);border-radius:16px;background:rgba(255,255,255,.87);box-shadow:0 8px 28px rgba(15,23,42,.035);animation:sc-card-enter .6s both}.metric-card:nth-child(2){animation-delay:70ms}.metric-card:nth-child(3){animation-delay:130ms}.metric-card:nth-child(4){animation-delay:190ms}.dark .metric-card,.dark .panel{background:rgba(12,22,37,.88);border-color:rgba(148,163,184,.14)}
.metric-icon{display:grid;width:36px;height:36px;flex:0 0 36px;place-items:center;border:1px solid rgba(6,182,212,.18);border-radius:11px;color:#0891b2;background:rgba(6,182,212,.08);font-size:19px}.dark .metric-icon{color:#22d3ee;background:rgba(6,182,212,.1)}
.metric-card>div:not(.score-ring){display:grid;gap:4px}.metric-label,.metric-hint{color:var(--sc-muted);font-size:12px}.dark .metric-label,.dark .metric-hint{color:#94a3b8}.metric-card strong{font-size:27px;line-height:1.15;letter-spacing:-.04em}.metric-card strong small{margin-left:3px;color:#94a3b8;font-size:13px;font-weight:600}
.score-card{align-items:center}.score-ring{display:grid;width:58px;height:58px;flex:0 0 58px;place-items:center;margin-left:auto;border-radius:50%;background:conic-gradient(#06b6d4 var(--score),rgba(148,163,184,.18) 0);position:relative}.score-ring:before{position:absolute;inset:5px;border-radius:inherit;background:#fff;content:''}.dark .score-ring:before{background:#0c1625}.score-ring span{z-index:1;font-size:14px;font-weight:800}
.workspace-tabs{display:flex;gap:5px;overflow-x:auto;padding:6px;border:1px solid var(--sc-border);border-radius:14px;background:rgba(255,255,255,.7);scrollbar-width:thin}.dark .workspace-tabs{background:rgba(12,22,37,.75)}.workspace-tabs button{display:flex;align-items:center;gap:7px;flex:0 0 auto;padding:10px 12px;border:0;border-radius:9px;color:#64748b;background:transparent;font-size:12px;font-weight:700;transition:color .18s,background .18s,transform .18s}.workspace-tabs button:hover{transform:translateY(-1px);color:#0891b2}.workspace-tabs button.active{color:#fff;background:linear-gradient(110deg,#7c3aed,#0891b2);box-shadow:0 5px 14px rgba(8,145,178,.2)}.workspace-tabs small{display:grid;min-width:18px;height:18px;place-items:center;border-radius:12px;background:rgba(148,163,184,.15);font-size:10px}.workspace-tabs .active small{background:rgba(255,255,255,.2)}
.panel-grid{display:grid;grid-template-columns:minmax(270px,.75fr) minmax(0,1.5fr);gap:16px;align-items:start}.panel{min-width:0;padding:22px;border:1px solid var(--sc-border);border-radius:17px;background:rgba(255,255,255,.9);box-shadow:0 10px 32px rgba(15,23,42,.035);animation:sc-panel-enter .4s both}.panel-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}.panel-heading h2,.privacy-panel h2,.guidance-panel h2{display:flex;align-items:center;gap:9px;margin:4px 0 0;font-size:19px;font-weight:750;letter-spacing:-.025em}.panel-heading p{margin-top:6px}
.count-pill{display:inline-grid;min-width:24px;height:24px;place-items:center;padding:0 7px;border-radius:20px;color:#0e7490;background:rgba(6,182,212,.1);font-size:11px}
.stack-form{display:grid;gap:13px}.stack-form label,.notes-label{display:grid;gap:6px;color:#475569;font-size:12px;font-weight:700}.dark .stack-form label,.dark .notes-label{color:#cbd5e1}.stack-form input,.stack-form select,.stack-form textarea,.search-input,.finding-row select,.notes-label textarea{box-sizing:border-box;width:100%;min-width:0;padding:10px 11px;border:1px solid var(--sc-border);border-radius:9px;outline:0;color:#0f172a;background:#fff;font:inherit;font-size:13px;transition:border-color .2s,box-shadow .2s}.dark .stack-form input,.dark .stack-form select,.dark .stack-form textarea,.dark .search-input,.dark .finding-row select,.dark .notes-label textarea{color:#e2e8f0;background:#0a1220}.stack-form :is(input,select,textarea):focus,.search-input:focus,.notes-label textarea:focus{border-color:#06b6d4;box-shadow:0 0 0 3px rgba(6,182,212,.12)}.stack-form textarea,.notes-label textarea{resize:vertical}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.form-hint,.privacy-panel p,.guidance-panel p{margin:0;color:var(--sc-muted);font-size:11px;line-height:1.6}.dark .form-hint,.dark .privacy-panel p,.dark .guidance-panel p{color:#94a3b8}.form-actions{display:flex;gap:8px}.asset-form-panel .button{justify-self:start}
.search-input{max-width:190px}.asset-list,.finding-list,.reminder-list{display:grid}.asset-row,.finding-row,.reminder-row{display:flex;align-items:center;gap:12px;padding:14px 0;border-top:1px solid var(--sc-border);animation:sc-card-enter .38s both}.asset-mark{display:grid;width:38px;height:38px;flex:0 0 38px;place-items:center;border-radius:12px;color:#0891b2;background:rgba(6,182,212,.1);font-size:18px}.asset-copy,.finding-copy,.reminder-copy{display:grid;min-width:0;flex:1;gap:4px}.asset-copy strong,.finding-copy strong,.reminder-copy strong{overflow:hidden;text-overflow:ellipsis;font-size:13px}.asset-copy span,.finding-copy>span,.reminder-copy span{overflow:hidden;color:#64748b;font-size:11px;text-overflow:ellipsis;white-space:nowrap}.asset-copy small,.finding-copy small,.reminder-copy small{overflow-wrap:anywhere;color:#94a3b8;font-size:10px}.asset-status,.status-chip{flex:0 0 auto;padding:5px 8px;border-radius:20px;color:#64748b;background:rgba(148,163,184,.12);font-size:10px;font-weight:700}.asset-status.is-good,.status-chip.good{color:#047857;background:rgba(16,185,129,.12)}.asset-status.is-warn,.status-chip.warn{color:#b45309;background:rgba(245,158,11,.14)}.status-chip.bad{color:#b91c1c;background:rgba(239,68,68,.12)}
.row-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:5px}.row-actions button,.icon-action{padding:6px 8px;border:1px solid var(--sc-border);border-radius:7px;color:#475569;background:transparent;font-size:10px;font-weight:700}.dark .row-actions button,.dark .icon-action{color:#cbd5e1}.row-actions button:hover{border-color:#06b6d4;color:#0891b2}.row-actions .danger-action,.danger-action{color:#be123c}.empty-state{padding:28px 12px;color:#94a3b8;text-align:center;font-size:13px}
.finding-row{align-items:flex-start}.severity-marker{width:4px;align-self:stretch;min-height:42px;border-radius:5px;background:#94a3b8}.severity-critical .severity-marker{background:#dc2626}.severity-high .severity-marker{background:#ea580c}.severity-medium .severity-marker{background:#d97706}.severity-low .severity-marker{background:#0891b2}.finding-title{display:flex;align-items:center;flex-wrap:wrap;gap:8px}.severity-pill{padding:3px 7px;border-radius:10px;background:rgba(148,163,184,.14);font-size:9px;text-transform:uppercase}.pill-critical{color:#b91c1c;background:#fee2e2}.pill-high{color:#c2410c;background:#ffedd5}.pill-medium{color:#a16207;background:#fef3c7}.pill-low{color:#0e7490;background:#cffafe}.finding-row select{width:auto;max-width:122px;padding:7px;font-size:10px}.icon-action{width:28px;height:28px;padding:0;font-size:18px}
.reminder-icon{display:grid;width:34px;height:34px;flex:0 0 34px;place-items:center;border-radius:10px;color:#7c3aed;background:rgba(139,92,246,.1);font-size:19px}
.report-panel{display:grid;gap:18px}.report-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.report-options label{display:grid;grid-template-columns:18px 1fr;align-items:center;gap:9px;padding:14px;border:1px solid var(--sc-border);border-radius:11px;font-size:13px;font-weight:700}.report-options input,.permission-check input,.checklist-item input{accent-color:#0891b2}.report-options small{grid-column:2;color:#64748b;font-size:10px;font-weight:500}.report-preview{padding:20px;border:1px dashed rgba(8,145,178,.32);border-radius:12px;background:rgba(6,182,212,.035)}.report-preview h3{margin:8px 0 5px;font-size:19px}.report-preview p{margin:0;color:#64748b;font-size:12px}.report-preview ul{display:flex;flex-wrap:wrap;gap:8px 22px;margin:14px 0 0;padding-left:18px;color:#475569;font-size:12px}
.map-canvas{position:relative;min-height:340px;overflow:hidden;border:1px solid var(--sc-border);border-radius:14px;background-image:radial-gradient(rgba(8,145,178,.16) 1px,transparent 1px);background-size:19px 19px}.map-lines{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.map-lines line{stroke:#06b6d4;stroke-width:2;stroke-dasharray:5 5;animation:map-dash 16s linear infinite}.map-node{position:absolute;display:flex;align-items:center;gap:9px;width:min(28%,200px);min-height:72px;padding:10px;border:1px solid rgba(6,182,212,.28);border-radius:12px;background:#fff;box-shadow:0 9px 24px rgba(15,23,42,.1);animation:sc-card-enter .5s both}.dark .map-node{background:#111c2e}.map-node>div{display:grid;min-width:0;gap:4px}.map-node strong,.map-node small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.map-node strong{font-size:11px}.map-node small{color:#64748b;font-size:9px}.map-node em{color:#0891b2;font-size:9px;font-style:normal}
.notes-panel{display:grid;gap:16px}.notes-label textarea{min-height:180px}.checklist{display:grid;gap:10px}.checklist h3{margin:0 0 3px;font-size:15px}.checklist-item{display:flex;align-items:flex-start;gap:9px;color:#475569;font-size:12px}.dark .checklist-item{color:#cbd5e1}.checklist-item input{margin-top:2px}.checklist-item .completed{color:#94a3b8;text-decoration:line-through}.privacy-panel,.guidance-panel{align-self:start}.privacy-icon,.guidance-icon{display:grid;width:38px;height:38px;place-items:center;margin-bottom:10px;border-radius:12px;color:#0891b2;background:rgba(6,182,212,.1);font-size:18px}.privacy-panel p,.guidance-panel p{margin:10px 0 16px}.guidance-panel ul{display:grid;gap:9px;margin:15px 0;padding-left:18px;color:#475569;font-size:12px}.dark .guidance-panel ul{color:#cbd5e1}
.checker-panel{display:grid;gap:14px}.checker-form .button{justify-self:start}.permission-check{display:flex!important;align-items:flex-start;gap:9px!important;padding:10px;border:1px solid var(--sc-border);border-radius:9px}.permission-check input{margin-top:2px}.permission-check span{line-height:1.5}.check-result{display:grid;gap:12px;padding:16px;border:1px solid var(--sc-border);border-radius:13px;background:rgba(6,182,212,.025)}.result-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}.result-heading h3{margin:5px 0 0;font-size:18px}.check-result>p{margin:0;color:#64748b;font-size:12px}.header-results{display:grid;gap:7px;margin:0;padding:0;list-style:none}.header-results li{display:flex;align-items:center;gap:9px;padding:9px;border:1px solid var(--sc-border);border-radius:9px}.header-results li>span{display:grid;width:22px;height:22px;flex:0 0 22px;place-items:center;border-radius:50%;font-size:12px;font-weight:800}.header-ok>span{color:#047857;background:rgba(16,185,129,.12)}.header-missing>span{color:#b45309;background:rgba(245,158,11,.14)}.header-results li div{display:grid;min-width:0;flex:1;gap:3px}.header-results li strong{font-size:11px}.header-results li small{overflow-wrap:anywhere;color:#64748b;font-size:10px}.header-results li em{color:#64748b;font-size:9px;font-style:normal}.timestamp-note{color:#94a3b8;font-size:10px}
.message{padding:11px 13px;border-radius:9px;font-size:12px}.error-message{color:#b91c1c;background:#fef2f2}.success-message{color:#047857;background:#ecfdf5}.center-footer{display:flex;justify-content:space-between;gap:12px;color:#94a3b8;font-size:10px}
@keyframes sc-enter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes sc-panel-enter{from{opacity:0;transform:translateY(10px) scale(.995)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes sc-card-enter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes map-dash{to{stroke-dashoffset:-80}}
@media(max-width:1050px){.overview-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.panel-grid{grid-template-columns:minmax(0,1fr)}.panel-grid>.panel:first-child{max-width:none}}
@media(max-width:700px){.security-center{gap:15px}.center-hero{align-items:flex-start;flex-direction:column;padding:21px;border-radius:16px}.hero-actions{width:100%}.hero-actions .button{flex:1}.overview-grid{gap:9px}.metric-card{min-height:104px;padding:13px;gap:9px}.metric-icon{width:30px;height:30px;flex-basis:30px}.metric-card strong{font-size:22px}.score-ring{width:45px;height:45px;flex-basis:45px}.score-card{flex-wrap:wrap}.score-card .score-ring{margin-left:0}.workspace-tabs{margin-inline:-4px}.workspace-tabs button{padding:9px;font-size:11px}.panel{padding:16px;border-radius:14px}.panel-heading{align-items:flex-start;flex-direction:column}.panel-heading>.search-input{max-width:none}.asset-row,.reminder-row{align-items:flex-start;flex-wrap:wrap}.asset-status{margin-left:48px}.row-actions{width:100%;justify-content:flex-start;padding-left:48px}.finding-row{flex-wrap:wrap}.finding-row .finding-copy{flex-basis:calc(100% - 40px)}.finding-row select{margin-left:16px}.report-options{grid-template-columns:1fr}.map-canvas{display:grid;grid-template-columns:1fr;gap:10px;height:auto!important;min-height:0;padding:12px}.map-node{position:relative;top:auto!important;left:auto!important;width:100%;max-width:none}.map-lines{display:none}.center-footer{flex-direction:column}.form-row{grid-template-columns:1fr}.search-input{width:100%}}
@media(max-width:390px){.overview-grid{grid-template-columns:1fr}.metric-card{min-height:80px}.score-ring{margin-left:auto!important}.hero-actions{flex-direction:column}.hero-actions .button{width:100%}.row-actions button{font-size:9px}}
@media print{.security-center{display:block;color:#111}.center-hero,.overview-grid,.workspace-tabs,.asset-form-panel,.hero-actions,.center-footer,.button,.skip-to-content,.dashboard-sidebar,.dashboard-header,.dashboard-content>nav{display:none!important}.panel{display:none!important;border:0;box-shadow:none}.report-panel{display:block!important;padding:0}.report-options{display:none}.report-preview{border:0}.report-preview ul{display:block;padding-left:18px}.report-preview li{margin:5px 0}.report-detail{break-inside:avoid}.report-detail h4{margin:20px 0 6px;border-bottom:1px solid #ddd}.report-detail h4 small{color:#666;font-weight:400}.report-notes{white-space:pre-wrap}.dashboard-content{min-height:0;padding:0!important}.dashboard-layout{background:#fff!important}}
@media(prefers-reduced-motion:reduce){.security-center,.security-center *,.map-lines line{animation:none!important;scroll-behavior:auto!important;transition:none!important}}
</style>
