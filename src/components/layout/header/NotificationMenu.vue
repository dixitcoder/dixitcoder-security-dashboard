<template>
  <div ref="dropdownRef" class="relative" @keydown.esc.stop.prevent="closeDropdown(true)">
    <button
      ref="triggerRef"
      type="button"
      aria-label="Notifications"
      aria-controls="notification-menu"
      :aria-expanded="dropdownOpen"
      class="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      @click="toggleDropdown"
    >
      <span aria-hidden="true">♢</span>
      <span
        v-if="unreadCount"
        class="absolute -right-1 -top-1 min-w-5 rounded-full bg-cyan-600 px-1 text-[10px] font-bold leading-5 text-white"
        aria-hidden="true"
      >{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
      <span class="sr-only">{{ unreadCount }} unread notifications</span>
    </button>

    <Transition name="notification-panel">
      <section
        v-if="dropdownOpen"
        id="notification-menu"
        aria-label="Notification center"
        class="absolute -right-24 z-50 mt-3 flex max-h-[min(70vh,520px)] w-[min(350px,calc(100vw-24px))] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:right-0"
      >
      <header class="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
        <div>
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">Notifications</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ unreadCount }} unread</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="unreadCount"
            type="button"
            class="text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
            @click="markNotificationsRead"
          >Mark all read</button>
          <button
            type="button"
            aria-label="Close notifications"
            class="rounded px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            @click="closeDropdown(true)"
          >×</button>
        </div>
      </header>

      <TransitionGroup
        tag="ul"
        name="notification-item"
        class="flex min-h-0 flex-col gap-1 overflow-y-auto"
      >
        <li v-for="notification in dashboardNotifications" :key="notification.id">
          <button
            type="button"
            class="flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-gray-50 dark:hover:bg-white/5"
            :class="{ 'bg-cyan-50/70 dark:bg-cyan-950/20': !notification.read }"
            :aria-label="`${notification.read ? '' : 'Unread: '}${notification.title}. ${notification.message}`"
            @click="markNotificationRead(notification.id)"
          >
            <span
              class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              :class="notification.kind === 'api' ? 'bg-amber-500' : 'bg-cyan-500'"
              aria-hidden="true"
            />
            <span class="grid min-w-0 gap-1">
              <strong class="text-sm text-gray-900 dark:text-gray-100">{{ notification.title }}</strong>
              <span class="break-words text-xs text-gray-600 dark:text-gray-300">{{ notification.message }}</span>
              <time class="text-[11px] text-gray-400" :datetime="notification.date">{{ formatDate(notification.date) }}</time>
            </span>
          </button>
        </li>
      </TransitionGroup>
      <p v-if="!dashboardNotifications.length" class="py-8 text-center text-sm text-gray-500 dark:text-gray-400" role="status">
        You're all caught up. Scan completions and API outages will appear here.
      </p>

      <footer class="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
        <RouterLink
          to="/api-diagnostics"
          class="text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
          @click="closeDropdown()"
        >API diagnostics</RouterLink>
        <button
          type="button"
          class="text-xs font-semibold text-gray-500 hover:text-red-600 disabled:opacity-40"
          :disabled="!dashboardNotifications.length"
          @click="clearNotifications"
        >Clear all</button>
      </footer>
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useDashboardPreferences } from '@/composables/useDashboardPreferences'

const {
  dashboardNotifications,
  markNotificationsRead,
  markNotificationRead,
  clearNotifications,
} = useDashboardPreferences()
const unreadCount = computed(() => dashboardNotifications.value.filter((item) => !item.read).length)
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)

function toggleDropdown(): void {
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown(restoreFocus = false): void {
  dropdownOpen.value = false
  if (restoreFocus) nextTick(() => triggerRef.value?.focus())
}

function handleClickOutside(event: MouseEvent): void {
  if (event.target instanceof Node && dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Unknown time'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
