<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="translate('Help & Learning', 'મદદ અને માર્ગદર્શન')" />

    <div class="mx-auto max-w-6xl space-y-6">
      <header class="overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-brand-950 to-cyan-950 p-6 text-white shadow-theme-lg sm:p-9">
        <div class="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div class="max-w-3xl">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
              DIXITCODER · LEARNING CENTER
            </p>
            <h1 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {{ translate('Learn your workspace, step by step', 'તમારા workspaceને પગલું-દર-પગલું શીખો') }}
            </h1>
            <p class="mt-4 max-w-2xl text-sm leading-6 text-gray-200 sm:text-base">
              {{ translate(
                'A practical guide to choosing tools, running checks, understanding results, and keeping your work organized.',
                'યોગ્ય tool પસંદ કરવા, check ચલાવવા, પરિણામ સમજવા અને તમારું કામ ગોઠવવા માટેની સરળ માર્ગદર્શિકા.',
              ) }}
            </p>
          </div>
          <RouterLink
            to="/"
            class="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-gray-900 transition hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
          >
            {{ translate('Open dashboard', 'ડેશબોર્ડ ખોલો') }} <span class="ml-2" aria-hidden="true">→</span>
          </RouterLink>
        </div>
        <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <a href="#whats-new" class="rounded-xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/10">
            <span class="text-xs font-semibold text-cyan-200">00 · NEW</span>
            <span class="mt-1 block text-sm font-semibold">{{ translate("What's new", 'નવું શું છે') }}</span>
          </a>
          <a href="#getting-started" class="rounded-xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/10">
            <span class="text-xs font-semibold text-cyan-200">01 · START</span>
            <span class="mt-1 block text-sm font-semibold">{{ translate('First steps', 'શરૂઆતના પગલાં') }}</span>
          </a>
          <a href="#tool-library" class="rounded-xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/10">
            <span class="text-xs font-semibold text-cyan-200">02 · EXPLORE</span>
            <span class="mt-1 block text-sm font-semibold">{{ translate('Find the right tool', 'યોગ્ય tool શોધો') }}</span>
          </a>
          <a href="#good-practices" class="rounded-xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/10">
            <span class="text-xs font-semibold text-cyan-200">03 · STAY SAFE</span>
            <span class="mt-1 block text-sm font-semibold">{{ translate('Responsible use', 'જવાબદાર ઉપયોગ') }}</span>
          </a>
        </div>
      </header>

      <section id="whats-new" class="scroll-mt-6">
        <div class="mb-4">
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">NEW & USEFUL</p>
          <h2 class="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            {{ translate("What's new in your workspace", 'તમારા workspaceમાં નવું શું છે') }}
          </h2>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {{ translate('Start with these features to get more from DixitCoder.', 'DixitCoderનો વધુ ઉપયોગ કરવા આ featuresથી શરૂઆત કરો.') }}
          </p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <RouterLink
            v-for="feature in featuredFeatures"
            :key="feature.path"
            :to="feature.path"
            class="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-theme-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
          >
            <div class="flex items-start justify-between gap-3">
              <span class="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl dark:bg-brand-500/15" aria-hidden="true">{{ feature.icon }}</span>
              <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Explore</span>
            </div>
            <h3 class="mt-4 font-bold text-gray-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">{{ translate(feature.name, feature.nameGu) }}</h3>
            <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{{ translate(feature.description, feature.descriptionGu) }}</p>
            <span class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300">
              {{ translate('Open feature', 'Feature ખોલો') }} <span class="transition group-hover:translate-x-1" aria-hidden="true">→</span>
            </span>
          </RouterLink>
        </div>
      </section>

      <section id="getting-started" class="scroll-mt-6">
        <div class="mb-4">
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-300">GETTING STARTED</p>
          <h2 class="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            {{ translate('Your first five minutes', 'પ્રથમ પાંચ મિનિટ') }}
          </h2>
        </div>
        <ol class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <li v-for="step in startSteps" :key="step.number" class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{{ step.number }}</span>
            <h3 class="mt-4 font-semibold text-gray-900 dark:text-white">{{ translate(step.title, step.titleGu) }}</h3>
            <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{{ translate(step.description, step.descriptionGu) }}</p>
          </li>
        </ol>
      </section>

      <section id="tool-library" class="scroll-mt-6">
        <div class="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-300">TOOL LIBRARY</p>
            <h2 class="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              {{ translate('What do you want to do?', 'તમારે શું કરવું છે?') }}
            </h2>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {{ translate('Search by tool name or goal. Open any guide to start using it.', 'Tool કે કામના નામથી શોધો. માર્ગદર્શિકા ખોલીને tool શરૂ કરો.') }}
            </p>
          </div>
          <label class="relative block w-full sm:max-w-xs">
            <span class="sr-only">{{ translate('Search guides', 'માર્ગદર્શિકા શોધો') }}</span>
            <input
              v-model="searchQuery"
              type="search"
              class="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-4 pr-10 text-sm text-gray-900 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              :placeholder="translate('Search tools…', 'Tools શોધો…')"
            />
            <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">⌕</span>
          </label>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <article
            v-for="group in filteredGroups"
            :key="group.title"
            class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6"
          >
            <div class="mb-4 flex items-start gap-3">
              <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-50 text-lg dark:bg-cyan-400/10" aria-hidden="true">{{ group.icon }}</span>
              <div>
                <h3 class="font-bold text-gray-900 dark:text-white">{{ translate(group.title, group.titleGu) }}</h3>
                <p class="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{{ translate(group.description, group.descriptionGu) }}</p>
              </div>
            </div>
            <div class="space-y-2">
              <RouterLink
                v-for="guide in group.guides"
                :key="guide.path"
                :to="guide.path"
                class="group flex items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-800 dark:hover:border-brand-800 dark:hover:bg-brand-500/5"
              >
                <span class="min-w-0">
                  <span class="block text-sm font-semibold text-gray-800 group-hover:text-brand-700 dark:text-gray-100 dark:group-hover:text-brand-300">{{ guide.name }}</span>
                  <span class="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">{{ translate(guide.description, guide.descriptionGu) }}</span>
                </span>
                <span class="shrink-0 text-brand-600 transition group-hover:translate-x-1 dark:text-brand-300" aria-hidden="true">→</span>
              </RouterLink>
            </div>
          </article>
        </div>
        <p v-if="!filteredGroups.length" class="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300" role="status">
          {{ translate('No guides match your search. Try a different tool name or keyword.', 'આ શોધ માટે માર્ગદર્શિકા મળી નથી. બીજું નામ કે શબ્દ અજમાવો.') }}
        </p>
      </section>

      <section id="good-practices" class="scroll-mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article class="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/70 dark:bg-amber-950/20 sm:p-6">
          <div class="flex items-start gap-3">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-xl dark:bg-amber-500/15" aria-hidden="true">🛡️</span>
            <div>
              <h2 class="font-bold text-amber-950 dark:text-amber-100">{{ translate('Use tools responsibly', 'સાધનો જવાબદારીથી વાપરો') }}</h2>
              <p class="mt-1 text-sm leading-6 text-amber-900/80 dark:text-amber-200/80">
                {{ translate('Only test systems that you own or have explicit permission to assess. A tool result is a signal to investigate, not proof by itself.', 'તમારી માલિકીના અથવા સ્પષ્ટ પરવાનગીવાળા systems જ તપાસો. Toolનું પરિણામ વધુ તપાસ માટેનો સંકેત છે, પોતે અંતિમ પુરાવો નથી.') }}
              </p>
            </div>
          </div>
          <ul class="mt-5 space-y-3 text-sm leading-6 text-amber-950 dark:text-amber-100">
            <li class="flex gap-2"><span aria-hidden="true">✓</span><span>{{ translate('Confirm target ownership and scope before running a network or web scan.', 'Network કે web scan પહેલાં targetની માલિકી અને scope ખાતરી કરો.') }}</span></li>
            <li class="flex gap-2"><span aria-hidden="true">✓</span><span>{{ translate('Start with a single authorized host; avoid broad ranges unless approved.', 'એક પરવાનગીવાળા hostથી શરૂ કરો; મંજૂરી વગર વિશાળ ranges ન તપાસો.') }}</span></li>
            <li class="flex gap-2"><span aria-hidden="true">✓</span><span>{{ translate('Treat exported reports as sensitive; review and redact before sharing.', 'Export કરેલા reportsને સંવેદનશીલ માનો; share કરતાં પહેલાં તપાસો અને જરૂરી માહિતી છુપાવો.') }}</span></li>
          </ul>
        </article>

        <article class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-300">WORKSPACE TIPS</p>
          <h2 class="mt-1 font-bold text-gray-900 dark:text-white">{{ translate('Keep your work organized', 'તમારું કામ ગોઠવી રાખો') }}</h2>
          <ul class="mt-4 space-y-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
            <li><RouterLink class="font-semibold text-brand-700 hover:underline dark:text-brand-300" to="/scan-reports">Scan History</RouterLink> — {{ translate('reuse recent targets, compare runs, and export reports.', 'જૂના targets ફરી વાપરો, scans સરખાવો અને reports export કરો.') }}</li>
            <li><RouterLink class="font-semibold text-brand-700 hover:underline dark:text-brand-300" to="/settings">Settings</RouterLink> — {{ translate('choose theme, language, refresh behavior, and history preferences.', 'theme, language, refresh અને history પસંદગીઓ ગોઠવો.') }}</li>
            <li><RouterLink class="font-semibold text-brand-700 hover:underline dark:text-brand-300" to="/api-diagnostics">API Diagnostics</RouterLink> — {{ translate('check backend availability if a tool cannot connect.', 'કોઈ tool connect ન થાય તો backend ઉપલબ્ધતા તપાસો.') }}</li>
          </ul>
        </article>
      </section>

      <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6" aria-labelledby="faq-title">
        <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-300">QUICK ANSWERS</p>
        <h2 id="faq-title" class="mt-1 text-xl font-bold text-gray-900 dark:text-white">{{ translate('Frequently asked questions', 'વારંવાર પૂછાતા પ્રશ્નો') }}</h2>
        <div class="mt-4 divide-y divide-gray-200 dark:divide-gray-800">
          <details v-for="item in faqs" :key="item.question" class="group py-4">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-gray-800 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-gray-100">
              {{ translate(item.question, item.questionGu) }}
              <span class="text-brand-600 transition group-open:rotate-45 dark:text-brand-300" aria-hidden="true">+</span>
            </summary>
            <p class="mt-3 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-300">{{ translate(item.answer, item.answerGu) }}</p>
          </details>
        </div>
      </section>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { translate } from '@/composables/useDashboardPreferences'

defineOptions({ name: 'HelpLearningCenter' })

const searchQuery = ref('')

const featuredFeatures = [
  {
    path: '/security-center',
    icon: '🛡️',
    name: 'Security Center',
    nameGu: 'સિક્યુરિટી સેન્ટર',
    description: 'Keep authorized assets, findings, notes, and follow-up work together.',
    descriptionGu: 'પરવાનગીવાળા assets, findings, નોંધો અને આગળનાં કામ એક જગ્યાએ રાખો.',
  },
  {
    path: '/security-monitors',
    icon: '⏱️',
    name: 'Website Monitors',
    nameGu: 'વેબસાઇટ મોનિટર',
    description: 'Track uptime and keep an eye on SSL certificate expiry.',
    descriptionGu: 'Uptime track કરો અને SSL certificate expiry પર નજર રાખો.',
  },
  {
    path: '/scan-reports',
    icon: '📋',
    name: 'Scan Reports',
    nameGu: 'સ્કેન રિપોર્ટ્સ',
    description: 'Review previous runs, compare results, and export reports.',
    descriptionGu: 'જૂના runs જુઓ, પરિણામો સરખાવો અને reports export કરો.',
  },
  {
    path: '/api-diagnostics',
    icon: '🔌',
    name: 'API Diagnostics',
    nameGu: 'API ડાયગ્નોસ્ટિક્સ',
    description: 'Check backend health if a dashboard tool is unavailable.',
    descriptionGu: 'Dashboardનું tool ન ચાલે ત્યારે backend health તપાસો.',
  },
]

const startSteps = [
  {
    number: '01',
    title: 'Choose a tool',
    titleGu: 'Tool પસંદ કરો',
    description: 'Use the library below or the sidebar to find a tool for your task.',
    descriptionGu: 'નીચેની યાદી અથવા sidebarમાંથી તમારા કામ માટેનું tool પસંદ કરો.',
  },
  {
    number: '02',
    title: 'Enter an authorized target',
    titleGu: 'પરવાનગીવાળું target દાખલ કરો',
    description: 'Use a domain, IP, file, or text value that the selected tool asks for.',
    descriptionGu: 'પસંદ કરેલા tool મુજબ domain, IP, file અથવા text દાખલ કરો.',
  },
  {
    number: '03',
    title: 'Run and review',
    titleGu: 'ચલાવો અને તપાસો',
    description: 'Start the check, wait for it to finish, then review warnings and details.',
    descriptionGu: 'ચેક શરૂ કરો, પૂર્ણ થાય ત્યાં સુધી રાહ જુઓ અને warnings તથા વિગતો વાંચો.',
  },
  {
    number: '04',
    title: 'Save what matters',
    titleGu: 'જરૂરી પરિણામ સાચવો',
    description: 'Use Scan History or the tool’s export options to keep a useful record.',
    descriptionGu: 'જરૂરી record રાખવા Scan History અથવા toolના export વિકલ્પો વાપરો.',
  },
]

interface ToolGuide {
  name: string
  path: string
  description: string
  descriptionGu: string
}

interface GuideGroup {
  title: string
  titleGu: string
  icon: string
  description: string
  descriptionGu: string
  guides: ToolGuide[]
}

const guideGroups: GuideGroup[] = [
  {
    title: 'Network & discovery',
    titleGu: 'નેટવર્ક અને શોધ',
    icon: '🌐',
    description: 'Understand network details and check authorized hosts.',
    descriptionGu: 'નેટવર્કની માહિતી સમજો અને પરવાનગીવાળા hosts તપાસો.',
    guides: [
      { name: 'IP Information', path: '/ip', description: 'Look up IP and network details.', descriptionGu: 'IP અને નેટવર્કની વિગતો જુઓ.' },
      { name: 'Port Scanner', path: '/port-scanner', description: 'Check selected ports on an authorized host.', descriptionGu: 'પરવાનગીવાળા hostના પસંદ કરેલા ports તપાસો.' },
      { name: 'Ping Sweep', path: '/ping-sweep', description: 'Check reachability for a small, approved host list.', descriptionGu: 'નાની અને મંજૂર host યાદીની ઉપલબ્ધતા તપાસો.' },
      { name: 'Service Detector', path: '/service-detector', description: 'Identify services exposed by an authorized host.', descriptionGu: 'પરવાનગીવાળા host પર ઉપલબ્ધ services ઓળખો.' },
      { name: 'Network Mapper', path: '/network-mapper', description: 'Build a view of an approved network scope.', descriptionGu: 'મંજૂર નેટવર્ક scopeનો નકશો જુઓ.' },
      { name: 'Traceroute', path: '/traceroute', description: 'View the network route toward a host.', descriptionGu: 'Host સુધીનો network માર્ગ જુઓ.' },
      { name: 'GeoIP', path: '/geoip', description: 'Find approximate location details for an IP.', descriptionGu: 'IPનું અંદાજિત સ્થાન જાણો.' },
    ],
  },
  {
    title: 'Website security',
    titleGu: 'વેબસાઇટ સુરક્ષા',
    icon: '🛡️',
    description: 'Review configuration and monitor assets you are allowed to assess.',
    descriptionGu: 'તમે તપાસી શકો તેવી websitesની configuration અને સ્થિતિ જુઓ.',
    guides: [
      { name: 'Web Scanner', path: '/web-scan', description: 'Review a website for common configuration signals.', descriptionGu: 'વેબસાઇટના સામાન્ય configuration સંકેતો તપાસો.' },
      { name: 'Vulnerability Scanner', path: '/vuln-scanner', description: 'Run a scoped security check on an authorized target.', descriptionGu: 'પરવાનગીવાળા target પર મર્યાદિત security check કરો.' },
      { name: 'Security Center', path: '/security-center', description: 'Organize assets, findings, notes, and follow-ups.', descriptionGu: 'Assets, findings, નોંધો અને આગળનાં કામ ગોઠવો.' },
      { name: 'Security Dashboard', path: '/security-dashboard', description: 'Review security workspace status at a glance.', descriptionGu: 'Security workspaceની સ્થિતિ એક નજરે જુઓ.' },
      { name: 'SSL/TLS Checker', path: '/ssl-checker', description: 'Inspect certificate and TLS information for a domain.', descriptionGu: 'Domainનું certificate અને TLS માહિતી તપાસો.' },
      { name: 'HTTP Security Headers', path: '/http-security-headers', description: 'Review browser security headers on a website.', descriptionGu: 'વેબસાઇટના browser security headers તપાસો.' },
      { name: 'DNS Records', path: '/dns-records', description: 'Look up common DNS records for a domain.', descriptionGu: 'Domainના સામાન્ય DNS records જુઓ.' },
      { name: 'Uptime & SSL Monitors', path: '/security-monitors', description: 'Track website availability and certificate expiry.', descriptionGu: 'વેબસાઇટ ઉપલબ્ધતા અને certificate expiry જુઓ.' },
      { name: 'WHOIS Lookup', path: '/whois', description: 'Review public domain registration information.', descriptionGu: 'Domainની જાહેર registration માહિતી જુઓ.' },
    ],
  },
  {
    title: 'Scan results & workspace',
    titleGu: 'Scan પરિણામો અને workspace',
    icon: '📋',
    description: 'Keep useful records and understand the service behind the tools.',
    descriptionGu: 'જરૂરી records સાચવો અને toolsને ચલાવતી service તપાસો.',
    guides: [
      { name: 'Scan History & Reports', path: '/scan-reports', description: 'Filter, compare, reuse targets, and export local scan records.', descriptionGu: 'સ્થાનિક scan records filter, compare, reuse અને export કરો.' },
      { name: 'API Diagnostics', path: '/api-diagnostics', description: 'Check whether the dashboard backend is reachable.', descriptionGu: 'Dashboard backend જોડાઈ શકે છે કે નહીં તે તપાસો.' },
      { name: 'Settings', path: '/settings', description: 'Set your preferred theme, language, and history behavior.', descriptionGu: 'તમારી પસંદનું theme, language અને history ગોઠવો.' },
      { name: 'User Profile', path: '/profile', description: 'Review your profile and workspace details.', descriptionGu: 'તમારી profile અને workspace વિગતો જુઓ.' },
    ],
  },
  {
    title: 'Developer & system utilities',
    titleGu: 'Developer અને system utilities',
    icon: '🧰',
    description: 'Format data, inspect local diagnostics, and use small developer helpers.',
    descriptionGu: 'Data format કરો, diagnostics જુઓ અને નાનાં developer helpers વાપરો.',
    guides: [
      { name: 'Base64 Tool', path: '/base64', description: 'Encode or decode Base64 text.', descriptionGu: 'Base64 text encode અથવા decode કરો.' },
      { name: 'Hash Generator', path: '/hash-generator', description: 'Generate a digest for text or supported input.', descriptionGu: 'Text અથવા supported inputનો hash બનાવો.' },
      { name: 'JSON Formatter', path: '/json-formatter', description: 'Format and validate JSON data.', descriptionGu: 'JSON data ગોઠવો અને validate કરો.' },
      { name: 'Regex Tester', path: '/regex-tester', description: 'Try a regular expression against sample text.', descriptionGu: 'Sample text સામે regular expression અજમાવો.' },
      { name: 'System Information', path: '/system-info', description: 'Review system details available to the backend.', descriptionGu: 'Backendને મળતી system વિગતો જુઓ.' },
      { name: 'Network Statistics', path: '/network-stats', description: 'Review available network interface statistics.', descriptionGu: 'ઉપલબ્ધ network interfaceના આંકડા જુઓ.' },
      { name: 'File Checker', path: '/file-checker', description: 'Check file integrity where the backend has permitted access.', descriptionGu: 'Backendને પરવાનગી હોય ત્યાં file integrity તપાસો.' },
    ],
  },
]

const filteredGroups = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase()
  return guideGroups
    .map((group) => ({
      ...group,
      guides: group.guides.filter((guide) =>
        !query || `${guide.name} ${guide.description} ${guide.descriptionGu}`.toLocaleLowerCase().includes(query),
      ),
    }))
    .filter((group) =>
      group.guides.length > 0
      || (query && `${group.title} ${group.titleGu}`.toLocaleLowerCase().includes(query)),
    )
})

const faqs = [
  {
    question: 'Where do I begin if I am new?',
    questionGu: 'જો હું નવો હોઉં તો ક્યાંથી શરૂ કરું?',
    answer: 'Start with the dashboard, choose a tool from the library, and try it only with a target you own or have permission to test.',
    answerGu: 'ડેશબોર્ડથી શરૂ કરો, યાદીમાંથી tool પસંદ કરો અને તમારી માલિકીના અથવા મંજૂર target પર જ અજમાવો.',
  },
  {
    question: 'Why can a tool fail to connect?',
    questionGu: 'કોઈ tool connect ન થાય તો કેમ?',
    answer: 'The backend may be offline, the target may not be reachable, or a firewall/CORS configuration may block the request. Open API Diagnostics for the backend health check.',
    answerGu: 'Backend બંધ હોઈ શકે, target પહોંચી શકાય તેમ ન હોય અથવા firewall/CORS request રોકે. Backend health check માટે API Diagnostics ખોલો.',
  },
  {
    question: 'Where are scan results stored?',
    questionGu: 'Scan પરિણામો ક્યાં સાચવાય છે?',
    answer: 'Scan History explains what this app stores locally and provides available export options. Review the privacy note before sharing a report.',
    answerGu: 'Scan Historyમાં આ app સ્થાનિક રીતે શું સાચવે છે અને કયા export વિકલ્પો છે તે જુઓ. Report share કરતાં પહેલાં privacy note વાંચો.',
  },
  {
    question: 'Can I create my own account from Sign Up?',
    questionGu: 'શું Sign Up પરથી પોતાનું account બનાવી શકું?',
    answer: 'No. Self-service registration is disabled for this workspace. Ask an administrator to create or manage your account.',
    answerGu: 'ના. આ workspaceમાં self-service registration બંધ છે. Account બનાવવા અથવા સંચાલિત કરવા administratorનો સંપર્ક કરો.',
  },
]
</script>
