<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="t('Settings', 'સેટિંગ્સ')" />
    <header class="settings-heading">
      <div>
        <p class="settings-kicker">DIXITCODER WORKSPACE</p>
        <h1>{{ t('Settings', 'સેટિંગ્સ') }}</h1>
        <p>{{ t('Personalize your dashboard, privacy, and language preferences.', 'તમારા ડેશબોર્ડ, ગોપનીયતા અને ભાષાની પસંદગીઓ ગોઠવો.') }}</p>
      </div>
    </header>

    <div class="settings-grid">
      <section class="settings-card" aria-labelledby="appearance-title">
        <p class="settings-kicker">01 · DISPLAY</p>
        <h2 id="appearance-title">{{ t('Appearance & language', 'દેખાવ અને ભાષા') }}</h2>
        <label class="settings-field">
          <span>{{ t('Color theme', 'થીમ') }}</span>
          <select v-model="preferences.theme" aria-label="Color theme">
            <option value="light">{{ t('Light', 'લાઇટ') }}</option>
            <option value="dark">{{ t('Dark', 'ડાર્ક') }}</option>
          </select>
        </label>
        <label class="settings-field">
          <span>{{ t('Dashboard language', 'ડેશબોર્ડ ભાષા') }}</span>
          <select v-model="preferences.language" aria-label="Dashboard language">
            <option value="en">English</option>
            <option value="gu">ગુજરાતી</option>
          </select>
        </label>
        <p class="settings-note">{{ t('Language preference applies to translated dashboard controls; tool output remains in its original language.', 'ભાષાની પસંદગી અનુવાદિત ડેશબોર્ડ કંટ્રોલ્સ પર લાગુ પડે છે; ટૂલનું પરિણામ મૂળ ભાષામાં રહેશે.') }}</p>
      </section>

      <section class="settings-card" aria-labelledby="refresh-title">
        <p class="settings-kicker">02 · STATUS</p>
        <h2 id="refresh-title">{{ t('API status refresh', 'API સ્થિતિ રિફ્રેશ') }}</h2>
        <label class="settings-toggle">
          <input v-model="preferences.autoRefresh" type="checkbox" />
          <span>{{ t('Automatically check API health', 'API સ્થિતિ આપમેળે તપાસો') }}</span>
        </label>
        <label class="settings-field" :class="{ 'is-disabled': !preferences.autoRefresh }">
          <span>{{ t('Check interval', 'તપાસનો સમય') }}</span>
          <select v-model.number="preferences.refreshSeconds" :disabled="!preferences.autoRefresh">
            <option :value="30">30 seconds</option>
            <option :value="60">1 minute</option>
            <option :value="300">5 minutes</option>
          </select>
        </label>
        <p class="settings-note">{{ t('Only the local dashboard API health endpoint is checked. No scan is started.', 'ફક્ત સ્થાનિક ડેશબોર્ડ API તપાસાય છે; કોઈ સ્કેન શરૂ થતું નથી.') }}</p>
      </section>

      <RouterLink class="settings-diagnostics-link" to="/api-diagnostics">
        {{ t('Open API diagnostics and troubleshooting', 'API નિદાન અને ઉકેલ જુઓ') }} ↗
      </RouterLink>

      <section class="settings-card" aria-labelledby="notifications-title">
        <p class="settings-kicker">03 · ALERTS</p>
        <h2 id="notifications-title">{{ t('Browser notifications', 'બ્રાઉઝર સૂચનાઓ') }}</h2>
        <p class="settings-note">{{ t('Opt in to scan-complete and API-outage notifications. Permission is requested only when you press the button.', 'સ્કેન પૂર્ણ અને API બંધ થવાની સૂચનાઓ મેળવવા ચાલુ કરો. પરવાનગી બટન દબાવ્યા પછી જ માગવામાં આવશે.') }}</p>
        <button class="settings-action" type="button" @click="enableNotifications">
          {{ preferences.notifications ? t('Notifications enabled', 'સૂચનાઓ ચાલુ છે') : t('Enable notifications', 'સૂચનાઓ ચાલુ કરો') }}
        </button>
        <p v-if="notificationMessage" class="settings-note" role="status">{{ notificationMessage }}</p>
      </section>

      <section class="settings-card" aria-labelledby="install-title">
        <p class="settings-kicker">04 · APP</p>
        <h2 id="install-title">{{ t('Installable dashboard', 'ડેશબોર્ડ ઇન્સ્ટોલ કરો') }}</h2>
        <p class="settings-note">{{ t('Install the dashboard as an app when your browser supports it. The offline shell never caches API or scan data.', 'બ્રાઉઝર સપોર્ટ કરે ત્યારે ડેશબોર્ડને એપ તરીકે ઇન્સ્ટોલ કરો. ઑફલાઇન કૅશમાં API કે સ્કેન ડેટા સંગ્રહાતો નથી.') }}</p>
        <button class="settings-action" type="button" :disabled="!canInstall" @click="install">
          {{ canInstall ? t('Install DixitCoder', 'DixitCoder ઇન્સ્ટોલ કરો') : t('Install option appears when supported', 'સપોર્ટેડ બ્રાઉઝરમાં ઇન્સ્ટોલ વિકલ્પ દેખાશે') }}
        </button>
        <p v-if="installMessage" class="settings-note" role="status">{{ installMessage }}</p>
      </section>

      <section class="settings-card" aria-labelledby="retention-title">
        <p class="settings-kicker">05 · DATA</p>
        <h2 id="retention-title">{{ t('Scan history retention', 'સ્કેન ઇતિહાસ રાખવાનો સમય') }}</h2>
        <label class="settings-field">
          <span>{{ t('Keep local scan records', 'સ્થાનિક સ્કેન રેકોર્ડ રાખો') }}</span>
          <select v-model.number="preferences.historyRetentionDays" aria-label="Scan history retention">
            <option :value="0">{{ t('Keep until I delete them', 'હું દૂર કરું ત્યાં સુધી રાખો') }}</option>
            <option :value="7">{{ t('7 days', '7 દિવસ') }}</option>
            <option :value="30">{{ t('30 days', '30 દિવસ') }}</option>
            <option :value="90">{{ t('90 days', '90 દિવસ') }}</option>
          </select>
        </label>
        <p class="settings-note">{{ t('Expired records are removed from this browser automatically. This does not delete server-side data.', 'સમય પૂરો થયેલા રેકોર્ડ આ બ્રાઉઝરમાંથી આપમેળે દૂર થાય છે. Server પરનો ડેટા દૂર થતો નથી.') }}</p>
      </section>

      <section class="settings-card" aria-labelledby="report-privacy-title">
        <p class="settings-kicker">06 · PRIVACY</p>
        <h2 id="report-privacy-title">{{ t('Report privacy', 'રિપોર્ટ ગોપનીયતા') }}</h2>
        <label class="settings-toggle">
          <input v-model="preferences.redactSensitiveReports" type="checkbox" />
          <span>{{ t('Redact targets, IPs, and sensitive values in exports and print views', 'Export અને print માં target, IP અને સંવેદનશીલ વિગતો છુપાવો') }}</span>
        </label>
        <p class="settings-note">{{ t('Redaction is enabled by default. It applies to CSV, JSON, sharing, and print/PDF output.', 'Redaction મૂળભૂત રીતે ચાલુ છે. તે CSV, JSON, sharing અને print/PDF પર લાગુ પડે છે.') }}</p>
      </section>

      <section class="settings-card" aria-labelledby="layout-title">
        <p class="settings-kicker">07 · WORKSPACE</p>
        <h2 id="layout-title">{{ t('Dashboard layout', 'ડેશબોર્ડ ગોઠવણી') }}</h2>
        <p class="settings-note">{{ t('Restore the original dashboard widget order. Your favorites and activity are not removed.', 'ડેશબોર્ડના મૂળ widget ક્રમ પર પાછા જાઓ. Favorites અને activity દૂર નહીં થાય.') }}</p>
        <button class="settings-action" type="button" @click="resetLayout">{{ t('Reset widget layout', 'Widget ગોઠવણી reset કરો') }}</button>
      </section>

      <section class="settings-card settings-insights" aria-labelledby="insights-title">
        <p class="settings-kicker">08 · LOCAL ANALYTICS</p>
        <h2 id="insights-title">{{ t('Activity insights', 'Activity માહિતી') }}</h2>
        <div class="insight-metrics">
          <p><strong>{{ usageStats.scans }}</strong><span>{{ t('Completed scans on this device', 'આ ઉપકરણ પર પૂર્ણ થયેલા સ્કેન') }}</span></p>
          <p><strong>{{ Object.keys(usageStats.launches).length }}</strong><span>{{ t('Tools opened on this device', 'આ ઉપકરણ પર ખોલેલા ટૂલ્સ') }}</span></p>
        </div>
        <p class="settings-note">{{ t('Usage and scan summaries stay in this browser. Clearing browser storage deletes them.', 'વપરાશ અને સ્કેન સારાંશ આ બ્રાઉઝરમાં જ રહે છે. Browser storage સાફ કરવાથી તે દૂર થાય છે.') }}</p>
      </section>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '../components/layout/AdminLayout.vue'
import PageBreadcrumb from '../components/common/PageBreadcrumb.vue'
import { RouterLink } from 'vue-router'
import {
  useDashboardPreferences,
  translate,
} from '../composables/useDashboardPreferences'

defineOptions({ name: 'DashboardSettings' })

const {
  preferences,
  usageStats,
  canInstall,
  requestNotifications,
  installApp,
} = useDashboardPreferences()
const notificationMessage = ref('')
const installMessage = ref('')
const t = translate

async function enableNotifications(): Promise<void> {
  const enabled = await requestNotifications()
  notificationMessage.value = enabled
    ? t('Notifications are enabled in this browser.', 'આ બ્રાઉઝરમાં સૂચનાઓ ચાલુ થઈ ગઈ છે.')
    : t('Notifications are unavailable or permission was not granted.', 'સૂચનાઓ ઉપલબ્ધ નથી અથવા પરવાનગી આપવામાં આવી નથી.')
}

async function install(): Promise<void> {
  const accepted = await installApp()
  installMessage.value = accepted
    ? t('Install request accepted.', 'ઇન્સ્ટોલ વિનંતી સ્વીકારાઈ.')
    : t('Installation was dismissed.', 'ઇન્સ્ટોલેશન બંધ કરવામાં આવ્યું.')
}

function resetLayout(): void {
  try {
    localStorage.removeItem('dixitcoder-dashboard-widget-order')
    window.location.reload()
  } catch (error) {
    console.error('Failed to reset dashboard layout', error)
  }
}
</script>

<style scoped>
.settings-heading,
.settings-card {
  border: 1px solid var(--dashboard-border, rgb(148 163 184 / 20%));
  border-radius: 17px;
  background: var(--dashboard-surface, #fff);
}

.settings-heading {
  margin-bottom: 18px;
  padding: 22px 24px;
}

.settings-heading h1 {
  margin: 0;
  color: #101828;
  font-size: 25px;
  font-weight: 700;
}

.settings-heading > div > p:last-child {
  margin: 6px 0 0;
  color: #667085;
  font-size: 13px;
}

.settings-kicker {
  margin: 0 0 6px;
  color: #0e7490;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.15em;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.settings-card {
  min-width: 0;
  padding: 20px;
}

.settings-diagnostics-link {
  align-self: center;
  color: #0e7490;
  font-size: 12px;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.settings-card h2 {
  margin: 0 0 16px;
  color: #101828;
  font-size: 16px;
  font-weight: 700;
}

.settings-field {
  display: grid;
  gap: 7px;
  margin-top: 14px;
  color: #475467;
  font-size: 12px;
  font-weight: 600;
}

.settings-field select {
  width: 100%;
  min-height: 40px;
  padding: 7px 10px;
  border: 1px solid rgb(148 163 184 / 28%);
  border-radius: 9px;
  color: #344054;
  background: #fff;
}

.settings-field.is-disabled {
  opacity: 0.55;
}

.settings-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #475467;
  font-size: 12px;
}

.settings-toggle input {
  accent-color: #0891b2;
}

.settings-note {
  margin: 12px 0 0;
  color: #667085;
  font-size: 11px;
  line-height: 1.6;
}

.settings-action {
  min-height: 38px;
  margin-top: 14px;
  padding: 0 13px;
  border: 1px solid rgb(8 145 178 / 32%);
  border-radius: 9px;
  color: #0e7490;
  background: rgb(6 182 212 / 6%);
  font-size: 11px;
  font-weight: 700;
}

.settings-action:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.settings-insights {
  grid-column: 1 / -1;
}

.insight-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.insight-metrics p {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 13px;
  border: 1px solid rgb(148 163 184 / 13%);
  border-radius: 11px;
}

.insight-metrics strong {
  color: #0e7490;
  font-size: 20px;
}

.insight-metrics span {
  color: #667085;
  font-size: 10px;
}

:global(.dark) .settings-heading,
:global(.dark) .settings-card {
  background: rgb(15 23 42 / 76%);
}

:global(.dark) .settings-heading h1,
:global(.dark) .settings-card h2 {
  color: #f8fafc;
}

:global(.dark) .settings-heading > div > p:last-child,
:global(.dark) .settings-field,
:global(.dark) .settings-toggle,
:global(.dark) .settings-note,
:global(.dark) .insight-metrics span {
  color: #a6b3c5;
}

:global(.dark) .settings-field select {
  border-color: rgb(148 163 184 / 20%);
  color: #e2e8f0;
  background: #0f172a;
}

@media (max-width: 720px) {
  .settings-grid,
  .insight-metrics {
    grid-template-columns: minmax(0, 1fr);
  }

  .settings-insights {
    grid-column: auto;
  }

  .settings-heading,
  .settings-card {
    padding: 17px;
  }
}
</style>
