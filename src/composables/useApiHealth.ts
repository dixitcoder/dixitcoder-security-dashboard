import { ref, watch } from 'vue'
import { notifyApiUnavailable, useDashboardPreferences } from './useDashboardPreferences'
import { API_BASE_URL } from '@/services/api'

export type ApiHealthState = 'checking' | 'online' | 'offline'

const apiStatus = ref<ApiHealthState>('checking')
const apiError = ref('')
const apiLatencyMs = ref<number | null>(null)
const lastCheckedAt = ref<string | null>(null)
let monitorStarted = false
let intervalId: number | undefined
let wasOffline = false

export async function checkApiHealth(): Promise<void> {
  apiStatus.value = 'checking'
  apiError.value = ''
  const startedAt = performance.now()
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) throw new Error(`Health check returned HTTP ${response.status}`)
    const health: unknown = await response.json()
    if (!health || typeof health !== 'object' || !('status' in health) || health.status !== 'ok') {
      throw new Error('Health check returned an unexpected status')
    }
    apiLatencyMs.value = Math.round(performance.now() - startedAt)
    apiStatus.value = 'online'
    wasOffline = false
  } catch (error) {
    apiStatus.value = 'offline'
    apiError.value = error instanceof Error ? error.message : 'Unknown health-check error'
    apiLatencyMs.value = null
    if (!wasOffline) notifyApiUnavailable(apiError.value)
    wasOffline = true
  } finally {
    lastCheckedAt.value = new Date().toISOString()
  }
}

export function startApiHealthMonitor(): void {
  if (monitorStarted) return
  monitorStarted = true
  const { preferences } = useDashboardPreferences()
  const configure = (): void => {
    if (intervalId !== undefined) window.clearInterval(intervalId)
    intervalId = undefined
    if (preferences.value.autoRefresh) {
      intervalId = window.setInterval(
        () => void checkApiHealth(),
        Math.max(30, preferences.value.refreshSeconds) * 1000,
      )
    }
  }
  void checkApiHealth()
  configure()
  watch(
    () => [preferences.value.autoRefresh, preferences.value.refreshSeconds],
    configure,
  )
}

export function useApiHealth() {
  return { apiStatus, apiError, apiLatencyMs, lastCheckedAt, checkApiHealth }
}
