import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'
import { useDashboardPreferences } from '@/composables/useDashboardPreferences'

export interface RecentRouteVisit {
  name: string
  path: string
  title: string
  visitedAt: number
}

export const recentRouteVisits = ref<RecentRouteVisit[]>([])

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [

    // ==================== IMAGES OSINT ====================
    {
      path: '/',
      name: 'Ecommerce',
      component: () => import('../views/Ecommerce.vue'),
      meta: {
        title: 'Ecommerce Dashboard',
      },
    },

    // ==================== IP & NETWORK TOOLS ====================
    {
      path: '/ip',
      name: 'IpInfo',
      component: () => import('../views/Others/IpInfo.vue'),
      meta: {
        title: 'IP Information - Network Tool'
      },
    },
    {
      path: '/port-scanner',
      name: 'PortScanner',
      component: () => import('../views/Others/PortScanner.vue'),
      meta: {
        title: 'Port Scanner - Network Tool'
      },
    },
    {
      path: '/ping-sweep',
      name: 'PingSweep',
      component: () => import('../views/Others/PingSweep.vue'),
      meta: {
        title: 'Ping Sweep - Network Diagnostic'
      },
    },
    {
      path: '/service-detector',
      name: 'ServiceDetector',
      component: () => import('../views/Others/ServiceDetector.vue'),
      meta: {
        title: 'Service Detector - Network Tool'
      },
    },

    // ==================== INTELLIGENCE & DEVELOPER TOOLS ====================
    {
      path: '/image-osint-analyzer',
      name: 'ImageOsintAnalyzer',
      component: () => import('../views/Intelligence-Developer-Tools/ImageOsintAnalyzer.vue'),
      meta: {
        title: 'Image OSINT Analyzer - Intelligence Tool'
      },
    },
    {
      path: '/api/call',
      name: 'DixitcoderApiCall',
      component: () => import("@/views/Intelligence-Developer-Tools/apicall.vue"),
      meta: {
        title: 'Hacking API Call - Developer Tool'
      }
    },

    // ==================== WEB & VULNERABILITY TOOLS ====================
    {
      path: '/web-scan',
      name: 'WebScan',
      component: () => import('../views/Others/WebScan.vue'),
      meta: {
        title: 'Web Server Scanner - Security Tool'
      },
    },
    {
      path: '/network-mapper',
      name: 'NetworkMapper',
      component: () => import('../views/Others/NetworkMapper.vue'),
      meta: {
        title: 'Network Mapper - Network Tool'
      },
    },
    {
      path: '/vuln-scanner',
      name: 'VulnScanner',
      component: () => import('../views/Others/VulnScanner.vue'),
      meta: {
        title: 'Vulnerability Scanner - Security Tool'
      },
    },
    {
      path: '/scan-reports',
      name: 'ScanHistory',
      component: () => import('../views/Others/ScanHistory.vue'),
      meta: {
        title: 'Scan History - Audit Log'
      },
    },
    {
      path: '/security-center',
      name: 'SecurityCenter',
      component: () => import('../views/SecurityCenter.vue'),
      meta: {
        title: 'Security Center - Defensive Workspace'
      },
    },
    {
      path: '/security-dashboard',
      name: 'SecurityDashboard',
      component: () => import('../views/SecurityDashboard.vue'),
      meta: {
        title: 'Security Dashboard - Defensive Overview'
      },
    },
    {
      path: '/api-diagnostics',
      name: 'ApiDiagnostics',
      component: () => import('../views/ApiDiagnostics.vue'),
      meta: {
        title: 'API Diagnostics - Backend Health',
      },
    },
    {
      path: '/router-info',
      name: 'RouterInfo',
      component: () => import('../views/Others/RouterInfo.vue'),
      meta: {
        title: 'Router Information - Network Tool'
      },
    },

    // ==================== SYSTEM INFO ====================
    {
      path: '/system-info',
      name: 'SystemInfo',
      component: () => import('../views/SystemInfo/SystemInfo.vue'),
      meta: {
        title: 'System Information - Diagnostic Tool'
      },
    },
    {
      path: '/cpu-monitor',
      name: 'CpuMonitor',
      component: () => import('../views/SystemInfo/CpuMonitor.vue'),
      meta: {
        title: 'CPU Monitor - System Diagnostic'
      },
    },
    {
      path: '/network-stats',
      name: 'NetworkStats',
      component: () => import('../views/SystemInfo/NetworkStats.vue'),
      meta: {
        title: 'Network Statistics - System Tool'
      },
    },
    {
      path: '/debug-tools',
      name: 'DebugTools',
      component: () => import('../views/SystemInfo/DebugTools.vue'),
      meta: {
        title: 'Debug Tools - System Utility'
      },
    },

    // ==================== SECURITY & PRIVACY TOOLS ====================
    {
      path: '/whois',
      name: 'WhoisLookup',
      component: () => import('../views/security-privacy-tools/WhoisLookup.vue'),
      meta: {
        title: 'WHOIS Lookup - Privacy Tool'
      },
    },
    {
      path: '/ssl-checker',
      name: 'SslChecker',
      component: () => import('../views/security-privacy-tools/ssl-checker.vue'),
      meta: {
        title: 'SSL/TLS Checker - Security Tool'
      },
    },
    {
      path: '/http-security-headers',
      name: 'HttpSecurityHeaders',
      component: () => import('../views/security-privacy-tools/HttpSecurityHeaders.vue'),
      meta: {
        title: 'HTTP Security Headers - Security Tool'
      },
    },
    {
      path: '/dns-records',
      name: 'DnsRecordsLookup',
      component: () => import('../views/security-privacy-tools/DnsRecordsLookup.vue'),
      meta: {
        title: 'DNS Records Lookup - Network Tool'
      },
    },
    {
      path: '/security-monitors',
      name: 'SecurityMonitors',
      component: () => import('../views/security-privacy-tools/SecurityMonitors.vue'),
      meta: {
        title: 'Website Monitors - Uptime and SSL Expiry'
      },
    },
    {
      path: '/firewall-test',
      name: 'FirewallTest',
      component: () => import('../views/security-privacy-tools/firewall-test.vue'),
      meta: {
        title: 'Firewall Tester - Security Tool'
      },
    },
    {
      path: '/dns-leak',
      name: 'DnsLeak',
      component: () => import('../views/security-privacy-tools/dns-leak.vue'),
      meta: {
        title: 'DNS Leak Test - Privacy Tool'
      },
    },

    // ==================== ANDROID HACKING ====================
    {
      path: '/android-payload',
      name: 'AndroidPayloadGenerator',
      component: () => import('../views/Others/AndroidHacking.vue'),
      meta: {
        title: 'Android Payload Generator - Security Tool'
      },
    },

    // ==================== DEVELOPER UTILITIES ====================
    {
      path: '/base64',
      name: 'Base64Tool',
      component: () => import('../views/DeveloperUtilities/Base64Tool.vue'),
      meta: {
        title: 'Base64 Encoder/Decoder - Developer Utility'
      },
    },
    {
      path: '/hash-generator',
      name: 'HashGenerator',
      component: () => import('../views/DeveloperUtilities/HashGenerator.vue'),
      meta: {
        title: 'Hash Generator - Developer Utility'
      },
    },
    {
      path: '/json-formatter',
      name: 'JsonFormatter',
      component: () => import('../views/DeveloperUtilities/json-formatter.vue'),
      meta: {
        title: 'JSON Formatter - Developer Utility'
      },
    },
    {
      path: '/regex-tester',
      name: 'RegexTester',
      component: () => import('../views/DeveloperUtilities/RegexTester.vue'),
      meta: {
        title: 'Regex Tester - Developer Tool'
      },
    },

    // ==================== ADVANCED NETWORK TOOLS ====================
    {
      path: '/traceroute',
      name: 'Traceroute',
      component: () => import('../views/AdvancedNetwork /traceroute.vue'),
      meta: {
        title: 'Traceroute - Network Diagnostic'
      },
    },
    {
      path: '/geoip',
      name: 'GeoIP',
      component: () => import('../views/AdvancedNetwork /GeoIP.vue'),
      meta: {
        title: 'GeoIP Locator - Network Tool'
      },
    },
    {
      path: '/packet-sniffer',
      name: 'PacketSniffer',
      component: () => import('../views/AdvancedNetwork /PacketSniffer.vue'),
      meta: {
        title: 'Packet Sniffer - Advanced Network Tool'
      },
    },
    {
      path: '/bandwidth-test',
      name: 'BandwidthTest',
      component: () => import('../views/AdvancedNetwork /BandwidthTest.vue'),
      meta: {
        title: 'Bandwidth Tester - Network Diagnostic'
      },
    },

    // ==================== SYSTEM ADMIN TOOLS ====================
    {
      path: '/arp-table',
      name: 'ArpTable',
      component: () => import('../views/SystemAdminTools/ArpTable.vue'),
      meta: {
        title: 'ARP Table Viewer - Admin Tool'
      },
    },
    {
      path: '/process-list',
      name: 'ProcessList',
      component: () => import('../views/SystemAdminTools/ProcessList.vue'),
      meta: {
        title: 'Active Processes - System Admin'
      },
    },
    {
      path: '/file-checker',
      name: 'FileChecker',
      component: () => import('../views/SystemAdminTools/FileChecker.vue'),
      meta: {
        title: 'File Integrity Checker - Security Tool'
      },
    },
    {
      path: '/port-forwarding',
      name: 'PortForwarding',
      component: () => import('../views/SystemAdminTools/PortForwarding.vue'),
      meta: {
        title: 'Port Forwarding Checker - Admin Tool'
      },
    },

    // ==================== OTHERS ====================
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar - Schedule Manager'
      },
    },
    {
      path: '/profile',
      name: 'UserProfile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: {
        title: 'User Profile - Account Settings'
      },
    },
    {
      path: '/links',
      name: 'DixitCoderLinks',
      component: () => import('../views/Links.vue'),
      meta: {
        title: 'Links - Web Developer & Security Researcher'
      },
    },
    {
      path: '/settings',
      name: 'DashboardSettings',
      component: () => import('../views/Settings.vue'),
      meta: {
        title: 'Settings - Workspace Preferences',
      },
    },
    {
      path: '/documentation',
      name: 'HelpLearningCenter',
      component: () => import('../views/Documentation.vue'),
      meta: {
        title: 'Help & Learning - User Guide',
      },
    },

    // ==================== FORMS ====================
    {
      path: '/form-elements',
      name: 'FormElements',
      component: () => import('../views/Forms/FormElements.vue'),
      meta: {
        title: 'Form Elements - UI Components'
      },
    },

    // ==================== TABLES ====================
    {
      path: '/basic-tables',
      name: 'BasicTables',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: {
        title: 'Basic Tables - Data Display'
      },
    },

    // ==================== CHARTS ====================
    {
      path: '/line-chart',
      name: 'LineChart',
      component: () => import('../views/Chart/LineChart/LineChart.vue'),
      meta: {
        title: 'Line Chart - Data Visualization'
      },
    },
    {
      path: '/bar-chart',
      name: 'BarChart',
      component: () => import('../views/Chart/BarChart/BarChart.vue'),
      meta: {
        title: 'Bar Chart - Data Visualization'
      },
    },

    // ==================== UI ELEMENTS ====================
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: {
        title: 'Alerts - UI Components'
      },
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: {
        title: 'Avatars - UI Components'
      },
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: {
        title: 'Badges - UI Components'
      },
    },
    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: {
        title: 'Buttons - UI Components'
      },
    },
    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: {
        title: 'Images - UI Components'
      },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: {
        title: 'Videos - UI Components'
      },
    },

    // ==================== PAGES ====================
    {
      path: '/blank',
      name: 'BlankPage',
      component: () => import('../views/Pages/BlankPage.vue'),
      meta: {
        title: 'Blank Page - Starter Template'
      },
    },
    {
      path: '/error-404',
      name: 'Error404',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error - Page Not Found'
      },
    },

    // ==================== AUTHENTICATION ====================
    {
      path: '/user-management',
      name: 'UserManagement',
      component: () => import('../views/UserManagement.vue'),
      meta: {
        title: 'User Management - Administration',
        admin: true,
      },
    },
    {
      path: '/signin',
      name: 'SignIn',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Sign In - Authentication',
        public: true,
      },
    },
    {
      path: '/signup',
      name: 'SignUp',
      component: () => import('../views/Auth/Signup.vue'),
      meta: {
        title: 'Sign Up - Authentication',
        public: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 - Page Not Found',
        public: true,
      },
    },
  ],
})

router.afterEach((to, _from, failure) => {
  if (failure || !to.name) return
  useDashboardPreferences().recordLaunch(to.path)
  const visit: RecentRouteVisit = {
    name: String(to.name),
    path: to.path,
    title: String(to.meta.title || to.name),
    visitedAt: Date.now(),
  }
  recentRouteVisits.value = [
    visit,
    ...recentRouteVisits.value.filter((item) => item.path !== visit.path),
  ].slice(0, 5)
})

export default router

// Update document title on route change
router.beforeEach(async (to) => {
  document.title = `DixitCoder - ${to.meta.title || 'Admin Dashboard'}`
  if (to.meta.public) return true

  try {
    const response = await fetch('/api/auth/me', { credentials: 'same-origin' })
    if (!response.ok) return { name: 'SignIn', query: { redirect: to.fullPath } }
    const { user } = await response.json()
    if (to.meta.admin && user?.role !== 'admin') return { name: 'Ecommerce' }
    return true
  } catch (error) {
    console.error('Unable to validate the sign-in session:', error)
  }

  return { name: 'SignIn', query: { redirect: to.fullPath } }
})
