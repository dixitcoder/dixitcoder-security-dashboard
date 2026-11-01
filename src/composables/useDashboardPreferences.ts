import { computed, ref, watch } from 'vue'

export type DashboardLanguage = 'en' | 'gu'
export type DashboardTheme = 'light' | 'dark'
export interface DashboardPreferences {
  favorites: string[]
  autoRefresh: boolean
  refreshSeconds: number
  notifications: boolean
  language: DashboardLanguage
  theme: DashboardTheme
  historyRetentionDays: 0 | 7 | 30 | 90
  redactSensitiveReports: boolean
}

export interface DashboardNotification {
  id: string
  title: string
  message: string
  date: string
  read: boolean
  kind: 'scan' | 'api'
}

export interface ScanRecord {
  id: string
  tool: string
  target: string
  date: string
  durationMs: number
  resultCount: number
  results: unknown[]
}

interface UsageStats {
  launches: Record<string, number>
  scans: number
}

const preferencesKey = 'dixitcoder-dashboard-preferences'
const targetsKey = 'dixitcoder-recent-targets'
const scansKey = 'dixitcoder-local-scan-records'
const usageKey = 'dixitcoder-dashboard-usage'
const defaults: DashboardPreferences = {
  favorites: ['/port-scanner', '/web-scan', '/scan-reports'],
  autoRefresh: true,
  refreshSeconds: 60,
  notifications: false,
  language: 'en',
  theme: 'light',
  historyRetentionDays: 0,
  redactSensitiveReports: true,
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const saved: unknown = JSON.parse(raw)
    if (Array.isArray(fallback)) return Array.isArray(saved) ? saved as T : fallback
    return saved && typeof saved === 'object' && !Array.isArray(saved)
      ? { ...fallback, ...saved } as T
      : fallback
  } catch (error) {
    console.error(`Unable to load ${key} from browser storage`, error)
    return fallback
  }
}

const savedPreferences = readJson(preferencesKey, defaults)
export const preferences = ref<DashboardPreferences>({
  favorites: Array.isArray(savedPreferences.favorites)
    ? savedPreferences.favorites
      .filter((path): path is string => typeof path === 'string')
      .map((path) => path === '/scan-history' ? '/scan-reports' : path)
    : defaults.favorites,
  autoRefresh: typeof savedPreferences.autoRefresh === 'boolean'
    ? savedPreferences.autoRefresh
    : defaults.autoRefresh,
  refreshSeconds: [30, 60, 300].includes(savedPreferences.refreshSeconds)
    ? savedPreferences.refreshSeconds
    : defaults.refreshSeconds,
  notifications: typeof savedPreferences.notifications === 'boolean'
    ? savedPreferences.notifications
    : defaults.notifications,
  language: savedPreferences.language === 'gu' ? 'gu' : 'en',
  theme: savedPreferences.theme === 'dark' ? 'dark' : 'light',
  historyRetentionDays: [0, 7, 30, 90].includes(savedPreferences.historyRetentionDays)
    ? savedPreferences.historyRetentionDays
    : defaults.historyRetentionDays,
  redactSensitiveReports: typeof savedPreferences.redactSensitiveReports === 'boolean'
    ? savedPreferences.redactSensitiveReports
    : defaults.redactSensitiveReports,
})
const recentTargets = ref<Array<{ tool: string; target: string; date: string }>>(
  readJson<unknown[]>(targetsKey, []).filter((item): item is { tool: string; target: string; date: string } =>
    Boolean(item && typeof item === 'object'
      && 'tool' in item && typeof item.tool === 'string'
      && 'target' in item && typeof item.target === 'string'
      && 'date' in item && typeof item.date === 'string'),
  ),
)
const scanRecords = ref<ScanRecord[]>(
  readJson<unknown[]>(scansKey, []).filter((item): item is ScanRecord =>
    Boolean(item && typeof item === 'object'
      && 'id' in item && typeof item.id === 'string'
      && 'tool' in item && typeof item.tool === 'string'
      && 'target' in item && typeof item.target === 'string'
      && 'date' in item && typeof item.date === 'string'
      && 'resultCount' in item && typeof item.resultCount === 'number'
      && 'results' in item && Array.isArray(item.results)),
  ),
)
const notificationKey = 'dixitcoder-dashboard-notifications'
const dashboardNotifications = ref<DashboardNotification[]>(
  readJson<unknown[]>(notificationKey, []).filter((item): item is DashboardNotification =>
    Boolean(item && typeof item === 'object'
      && 'id' in item && typeof item.id === 'string'
      && 'title' in item && typeof item.title === 'string'
      && 'message' in item && typeof item.message === 'string'
      && 'date' in item && typeof item.date === 'string'
      && 'read' in item && typeof item.read === 'boolean'
      && 'kind' in item && (item.kind === 'scan' || item.kind === 'api')),
  ),
)

function pruneExpiredScans(): void {
  const days = preferences.value.historyRetentionDays
  if (!days) return
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  scanRecords.value = scanRecords.value.filter((record) => {
    const timestamp = Date.parse(record.date)
    return Number.isNaN(timestamp) || timestamp >= cutoff
  })
}

pruneExpiredScans()
const savedUsage = readJson(usageKey, { launches: {}, scans: 0 })
const usageStats = ref<UsageStats>({
  launches: savedUsage.launches && typeof savedUsage.launches === 'object'
    ? Object.fromEntries(Object.entries(savedUsage.launches)
      .filter(([path, count]) => typeof path === 'string' && typeof count === 'number'))
    : {},
  scans: typeof savedUsage.scans === 'number' ? savedUsage.scans : 0,
})
const canInstall = ref(false)
let installPrompt: BeforeInstallPromptEvent | null = null
let initialized = false

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function persist<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Unable to save ${key} in browser storage`, error)
  }
}

if (typeof window !== 'undefined' && !initialized) {
  initialized = true
  watch(preferences, (value) => persist(preferencesKey, value), { deep: true })
  watch(() => preferences.value.language, (language) => {
    document.documentElement.lang = language === 'gu' ? 'gu' : 'en'
  })
  watch(recentTargets, (value) => persist(targetsKey, value), { deep: true })
  watch(scanRecords, (value) => persist(scansKey, value), { deep: true })
  watch(dashboardNotifications, (value) => persist(notificationKey, value), { deep: true })
  watch(() => preferences.value.historyRetentionDays, pruneExpiredScans)
  watch(scanRecords, pruneExpiredScans, { deep: true })
  watch(usageStats, (value) => persist(usageKey, value), { deep: true })
  persist(scansKey, scanRecords.value)
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    installPrompt = event as BeforeInstallPromptEvent
    canInstall.value = true
  })
  window.addEventListener('appinstalled', () => {
    installPrompt = null
    canInstall.value = false
  })
  try {
    const legacyTheme = localStorage.getItem('theme')
    if (legacyTheme === 'dark' || legacyTheme === 'light') preferences.value.theme = legacyTheme
  } catch (error) {
    console.error('Unable to read the saved color theme', error)
  }
  document.documentElement.lang = preferences.value.language === 'gu' ? 'gu' : 'en'
  document.documentElement.classList.toggle('dark', preferences.value.theme === 'dark')
}

export function useDashboardPreferences() {
  const isFavorite = (path: string) => preferences.value.favorites.includes(path)

  function toggleFavorite(path: string): void {
    const favorites = new Set(preferences.value.favorites)
    if (favorites.has(path)) favorites.delete(path)
    else favorites.add(path)
    preferences.value.favorites = [...favorites]
  }

  function recordLaunch(path: string): void {
    usageStats.value.launches[path] = (usageStats.value.launches[path] || 0) + 1
  }

  function rememberTarget(tool: string, target: string): void {
    const cleanTarget = target.trim()
    if (!cleanTarget) return
    recentTargets.value = [
      { tool, target: cleanTarget, date: new Date().toISOString() },
      ...recentTargets.value.filter((item) => item.target !== cleanTarget || item.tool !== tool),
    ].slice(0, 20)
  }

  function clearRecentTargets(): void {
    recentTargets.value = []
  }

  function addNotification(input: Omit<DashboardNotification, 'id' | 'date' | 'read'>): void {
    const notification: DashboardNotification = {
      ...input,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      read: false,
    }
    dashboardNotifications.value = [notification, ...dashboardNotifications.value].slice(0, 50)
  }

  function markNotificationsRead(): void {
    dashboardNotifications.value = dashboardNotifications.value.map((item) => ({ ...item, read: true }))
  }

  function markNotificationRead(id: string): void {
    dashboardNotifications.value = dashboardNotifications.value.map((item) =>
      item.id === id ? { ...item, read: true } : item,
    )
  }

  function clearNotifications(): void {
    dashboardNotifications.value = []
  }

  function recordScan(input: Omit<ScanRecord, 'id' | 'date'>): void {
    const record: ScanRecord = { ...input, id: crypto.randomUUID(), date: new Date().toISOString() }
    scanRecords.value = [record, ...scanRecords.value].slice(0, 30)
    usageStats.value.scans += 1
    rememberTarget(input.tool, input.target)
    addNotification({
      kind: 'scan',
      title: `${input.tool} completed`,
      message: `${input.resultCount} result${input.resultCount === 1 ? '' : 's'} recorded in local scan history.`,
    })
    if (
      input.durationMs >= 10_000
      && preferences.value.notifications
      && typeof Notification !== 'undefined'
      && Notification.permission === 'granted'
    ) {
      new Notification(`${input.tool} complete`, {
        body: `${input.resultCount} result${input.resultCount === 1 ? '' : 's'} recorded on this device.`,
        icon: '/images/pwa-icon.svg',
      })
    }
  }

  async function requestNotifications(): Promise<boolean> {
    if (!('Notification' in window)) return false
    const permission = Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission
    preferences.value.notifications = permission === 'granted'
    return preferences.value.notifications
  }

  async function installApp(): Promise<boolean> {
    if (!installPrompt) return false
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    installPrompt = null
    canInstall.value = false
    return choice.outcome === 'accepted'
  }

  const popularRoutes = computed(() =>
    Object.entries(usageStats.value.launches)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, count]) => ({ path, count })),
  )

  return {
    preferences,
    recentTargets,
    scanRecords,
    dashboardNotifications,
    usageStats,
    popularRoutes,
    canInstall,
    isFavorite,
    toggleFavorite,
    recordLaunch,
    rememberTarget,
    clearRecentTargets,
    addNotification,
    markNotificationsRead,
    markNotificationRead,
    clearNotifications,
    recordScan,
    requestNotifications,
    installApp,
  }
}

export function translate(english: string, gujarati: string): string {
  return preferences.value.language === 'gu' ? gujarati : english
}

const gujaratiLabels: Record<string, string> = {
  'MENU': 'મેનુ',
  'NETWORK TOOLS': 'નેટવર્ક સાધનો',
  'INTELLIGENCE': 'ઇન્ટેલિજન્સ',
  'ROUTER & DIAGNOSTICS': 'રાઉટર અને નિદાન',
  'SECURITY': 'સુરક્ષા',
  'DEVELOPER': 'ડેવલપર',
  'SYSTEM ADMIN': 'સિસ્ટમ એડમિન',
  'APPLICATIONS': 'એપ્લિકેશન્સ',
  'UI ELEMENTS': 'UI ઘટકો',
  'OTHERS': 'અન્ય',
  'Dashboard': 'ડેશબોર્ડ',
  'IP & Network Tools': 'IP અને નેટવર્ક સાધનો',
  'Web & Vulnerability': 'વેબ અને નબળાઈ તપાસ',
  'Intelligence Tools': 'ઇન્ટેલિજન્સ સાધનો',
  'Router Tools': 'રાઉટર સાધનો',
  'Diagnostics': 'નિદાન',
  'Security Tools': 'સુરક્ષા સાધનો',
  'Dev Utilities': 'ડેવલપર ઉપયોગિતાઓ',
  'Advanced Network': 'એડવાન્સ્ડ નેટવર્ક',
  'Admin Tools': 'એડમિન સાધનો',
  'Calendar': 'કેલેન્ડર',
  'User Profile': 'વપરાશકર્તા પ્રોફાઇલ',
  'Charts': 'ચાર્ટ્સ',
  'Settings': 'સેટિંગ્સ',
  'Help & Learning': 'મદદ અને માર્ગદર્શન',
  'IP Info': 'IP માહિતી',
  'Port Scanner': 'પોર્ટ સ્કેનર',
  'Ping Sweep': 'પિંગ સ્વીપ',
  'Service Detector': 'સેવા શોધક',
  'Web Scanner': 'વેબ સ્કેનર',
  'Network Mapper': 'નેટવર્ક મેપર',
  'Vuln Scanner': 'નબળાઈ સ્કેનર',
  'Scan History': 'સ્કેન ઇતિહાસ',
  'API Diagnostics': 'API નિદાન',
  'Image OSINT': 'ઇમેજ OSINT',
  'API Call': 'API કૉલ',
  'Router Info': 'રાઉટર માહિતી',
  'System Info': 'સિસ્ટમ માહિતી',
  'CPU Monitor': 'CPU મોનિટર',
  'Network Stats': 'નેટવર્ક આંકડા',
  'Debug Tools': 'ડિબગ સાધનો',
  'Whois Lookup': 'WHOIS તપાસ',
  'SSL Checker': 'SSL તપાસ',
  'Firewall Test': 'ફાયરવોલ ટેસ્ટ',
  'DNS Leak': 'DNS લીક',
  'Base64': 'Base64',
  'Hash Generator': 'હૅશ જનરેટર',
  'JSON Formatter': 'JSON ફોર્મેટર',
  'Regex Tester': 'Regex ટેસ્ટર',
  'Traceroute': 'ટ્રેસરાઉટ',
  'GeoIP': 'GeoIP',
  'Packet Sniffer': 'પેકેટ સ્નિફર',
  'Bandwidth Test': 'બૅન્ડવિડ્થ ટેસ્ટ',
  'ARP Table': 'ARP ટેબલ',
  'Process List': 'પ્રોસેસ યાદી',
  'File Checker': 'ફાઇલ તપાસક',
  'Port Forwarding': 'પોર્ટ ફોરવર્ડિંગ',
}

export function translateLabel(label: string): string {
  const match = label.match(/^(\p{Extended_Pictographic}\s*)?(.*)$/u)
  if (!match) return label
  const translated = gujaratiLabels[match[2]] || match[2]
  return preferences.value.language === 'gu' ? `${match[1] || ''}${translated}` : label
}

export function notifyApiUnavailable(message: string): void {
  useDashboardPreferences().addNotification({
    kind: 'api',
    title: 'API unavailable',
    message,
  })
  if (
    preferences.value.notifications
    && typeof Notification !== 'undefined'
    && Notification.permission === 'granted'
  ) {
    new Notification('DixitCoder API unavailable', {
      body: message,
      icon: '/images/pwa-icon.svg',
      tag: 'dixitcoder-api-unavailable',
    })
  }
}
