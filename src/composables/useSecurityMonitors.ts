import { ref, watch } from 'vue'
import axios from 'axios'
import { useDashboardPreferences } from './useDashboardPreferences'

export type MonitorKind = 'uptime' | 'ssl'
export type MonitorStatus = 'unknown' | 'up' | 'down' | 'valid' | 'expiring' | 'error'

export interface SecurityMonitor {
  id: string
  kind: MonitorKind
  target: string
  intervalMinutes: number
  status: MonitorStatus
  lastCheckedAt: string
  lastMessage: string
  latencyMs: number | null
  daysRemaining: number | null
  nextCheckAt: string
}

const storageKey = 'dixitcoder-security-monitors-v1'

function loadMonitors(): SecurityMonitor[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('Saved monitor data is invalid.')
    return parsed.filter((item): item is SecurityMonitor =>
      Boolean(item && typeof item === 'object'
        && typeof item.id === 'string'
        && (item.kind === 'uptime' || item.kind === 'ssl')
        && typeof item.target === 'string'
        && typeof item.intervalMinutes === 'number'),
    )
  } catch (error) {
    console.error('Unable to load security monitors', error)
    return []
  }
}

export const securityMonitors = ref<SecurityMonitor[]>(
  typeof window === 'undefined' ? [] : loadMonitors(),
)
const activeChecks = new Set<string>()
let monitoringStarted = false

if (typeof window !== 'undefined') {
  watch(securityMonitors, (value) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value))
    } catch (error) {
      console.error('Unable to save security monitors', error)
    }
  }, { deep: true })
}

function notifyTransition(monitor: SecurityMonitor, previous: MonitorStatus): void {
  if (monitor.status === previous || monitor.status === 'unknown') return
  const isAlert = monitor.status === 'down'
    || monitor.status === 'error'
    || monitor.status === 'expiring'
  if (!isAlert && previous === 'unknown') return
  useDashboardPreferences().addNotification({
    kind: 'scan',
    title: monitor.kind === 'ssl' ? 'SSL certificate monitor' : 'Uptime monitor',
    message: `${monitor.target}: ${monitor.lastMessage}`,
  })
}

export async function checkSecurityMonitor(id: string, force = false): Promise<void> {
  const monitor = securityMonitors.value.find((item) => item.id === id)
  if (!monitor || activeChecks.has(id)) return
  const dueAt = Date.parse(monitor.nextCheckAt)
  if (!force && Number.isFinite(dueAt) && dueAt > Date.now()) return

  activeChecks.add(id)
  const previousStatus = monitor.status
  try {
    if (monitor.kind === 'uptime') {
      const { data } = await axios.post('/api/security-tools/uptime', { url: monitor.target }, { timeout: 15000 })
      monitor.status = data.up ? 'up' : 'down'
      monitor.latencyMs = typeof data.latencyMs === 'number' ? data.latencyMs : null
      monitor.lastMessage = `HTTP ${data.status} · ${monitor.latencyMs ?? '—'} ms`
    } else {
      const { data } = await axios.post('/api/security-tools/ssl-expiry', { host: monitor.target }, { timeout: 15000 })
      monitor.daysRemaining = Number(data.daysRemaining)
      monitor.status = data.valid && monitor.daysRemaining > 30 ? 'valid' : 'expiring'
      monitor.lastMessage = data.valid
        ? `${monitor.daysRemaining} days remaining · expires ${data.validTo}`
        : `Certificate invalid or expires in ${monitor.daysRemaining} days`
    }
  } catch (error) {
    monitor.status = 'error'
    monitor.lastMessage = axios.isAxiosError(error)
      ? error.response?.data?.error || error.message
      : error instanceof Error ? error.message : 'Monitor check failed.'
    if (previousStatus !== 'error') {
      console.error(`Security monitor check failed for ${monitor.target}`, error)
    }
  } finally {
    monitor.lastCheckedAt = new Date().toISOString()
    monitor.nextCheckAt = new Date(Date.now() + monitor.intervalMinutes * 60_000).toISOString()
    notifyTransition(monitor, previousStatus)
    activeChecks.delete(id)
  }
}

export function startSecurityMonitors(): void {
  if (monitoringStarted) return
  monitoringStarted = true
  const runDueChecks = (): void => {
    for (const monitor of securityMonitors.value) void checkSecurityMonitor(monitor.id)
  }
  runDueChecks()
  window.setInterval(runDueChecks, 30_000)
}

export function addSecurityMonitor(kind: MonitorKind, target: string, intervalMinutes: number): void {
  securityMonitors.value.unshift({
    id: crypto.randomUUID(),
    kind,
    target,
    intervalMinutes,
    status: 'unknown',
    lastCheckedAt: '',
    lastMessage: 'Waiting for first check.',
    latencyMs: null,
    daysRemaining: null,
    nextCheckAt: new Date().toISOString(),
  })
  void checkSecurityMonitor(securityMonitors.value[0].id, true)
}

export function removeSecurityMonitor(id: string): void {
  securityMonitors.value = securityMonitors.value.filter((monitor) => monitor.id !== id)
}
