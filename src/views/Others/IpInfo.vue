<template>
  <admin-layout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="rounded-2xl border p-5">
      <h3 class="mb-5 text-lg font-semibold">🌐 IP Deep Info</h3>

      <div v-if="loading">⏳ Loading...</div>
      <div v-else>
        <!-- IP Info Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(value, key) in ipInfo"
            :key="key"
            class="p-3 border rounded-lg bg-gray-50 relative"
          >
            <p class="text-xs font-medium text-gray-500 uppercase">{{ key }}</p>
            <p class="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <!-- Country flag for country_code -->
              <span v-if="key === 'country' && ipInfo.country_code">
                {{ getFlagEmoji(ipInfo.country_code) }}
              </span>
              {{ value }}
            </p>
            <!-- Copy Button -->
            <button
              @click="copyToClipboard(value)"
              class="absolute top-2 right-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
            >
              📋 Copy
            </button>
          </div>
        </div>

        <!-- Show Live Time -->
        <div v-if="localTime" class="mt-5 p-3 bg-green-50 rounded-lg text-sm font-medium">
          🕒 Local Time ({{ ipInfo.timezone }}): <strong>{{ localTime }}</strong>
        </div>
      </div>

      <!-- Custom IP Input -->
      <div class="mt-5 flex">
        <input
          v-model="customIP"
          placeholder="Enter Public IP"
          class="flex-1 border p-2 rounded"
        />
        <button
          @click="getIPInfo(customIP)"
          class="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Get Info
        </button>
      </div>

      <!-- Recent Searches -->
      <div v-if="history.length" class="mt-6">
        <h4 class="text-md font-semibold mb-2">Recent Searches</h4>
        <ul class="space-y-1">
          <li
            v-for="(item, index) in history"
            :key="index"
            class="text-sm flex justify-between items-center bg-gray-50 p-2 rounded"
          >
            <span>{{ item }}</span>
            <button
              @click="getIPInfo(item)"
              class="text-blue-500 hover:underline text-xs"
            >
              View
            </button>
          </li>
        </ul>
      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import AdminLayout from '../../components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'

const currentPageTitle = ref('IP Info')
const ipInfo = ref({})
const loading = ref(true)
const customIP = ref('')
const localTime = ref('')
const history = ref([])

// 🇮🇳 Convert country code to flag emoji
const getFlagEmoji = (countryCode) => {
  if (!countryCode) return ''
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt())
    )
}

// 📋 Copy to clipboard
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  alert(`Copied: ${text}`)
}

// 🕒 Update local time
const updateLocalTime = (timezone) => {
  if (!timezone) return
  try {
    const now = new Date().toLocaleString('en-US', { timeZone: timezone })
    localTime.value = now
  } catch (err) {
    localTime.value = 'N/A'
  }
}

// 🌍 Fetch IP Info
const getIPInfo = async (ip = '') => {
  loading.value = true
  try {
    let url = ip ? `https://ipapi.co/${ip}/json/` : `https://ipapi.co/json/`
    const { data } = await axios.get(url, { timeout: 5000 })

    ipInfo.value = {
      ip: data.ip,
      version: data.version,
      city: data.city,
      region: data.region,
      region_code: data.region_code,
      country: data.country_name,
      country_code: data.country_code,
      continent: data.continent_code,
      latitude: data.latitude,
      longitude: data.longitude,
      postal: data.postal,
      timezone: data.timezone,
      utc_offset: data.utc_offset,
      org: data.org,
      asn: data.asn,
      network: data.network,
      currency: data.currency,
      currency_name: data.currency_name,
      capital: data.country_capital,
      calling_code: data.country_calling_code,
      tld: data.country_tld,
      population: data.country_population,
      languages: data.languages
    }

    // Update live time
    updateLocalTime(data.timezone)

    // Save to history
    if (ip && !history.value.includes(ip)) {
      history.value.unshift(ip)
      if (history.value.length > 5) history.value.pop()
      localStorage.setItem('ipHistory', JSON.stringify(history.value))
    }
  } catch (e) {
    console.error(e)
    ipInfo.value = { error: 'Failed to fetch IP data' }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Load history from localStorage
  history.value = JSON.parse(localStorage.getItem('ipHistory') || '[]')
  getIPInfo()
})
</script>
