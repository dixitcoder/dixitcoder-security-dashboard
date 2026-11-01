<template>
  <div class="relative" ref="dropdownRef" @keydown.esc.stop.prevent="closeDropdown(true)">
    <button
      ref="triggerRef"
      type="button"
      :aria-label="`User menu for ${profile.firstName}`"
      aria-controls="user-menu"
      :aria-expanded="dropdownOpen"
      class="flex items-center text-gray-700 dark:text-gray-400"
      @click.prevent="toggleDropdown"
    >
      <span class="mr-3 overflow-hidden rounded-full h-11 w-11">
        <img :src="profile.avatar" alt="User" />
      </span>

      <span class="block mr-1 font-medium text-theme-sm">
        {{ profile.firstName }}
      </span>

      <ChevronDownIcon :class="{ 'rotate-180': dropdownOpen }" />
    </button>

    <!-- Dropdown Start -->
    <div
      v-show="dropdownOpen"
      id="user-menu"
      aria-label="User menu"
      role="region"
      class="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
    >
      <div>
        <span class="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
          {{ profile.firstName }} {{ profile.lastName }}
        </span>
        <span class="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
          {{ profile.email }}
        </span>
      </div>

      <ul class="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
        <li v-for="item in menuItems" :key="item.href">
          <router-link
            :to="item.href"
            class="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            <component
              :is="item.icon"
              class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
            />
            {{ item.text }}
          </router-link>
        </li>
      </ul>

      <p
        v-if="signOutError"
        class="mt-3 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-xs text-error-700 dark:border-error-900 dark:bg-error-950/40 dark:text-error-300"
        role="alert"
      >
        {{ signOutError }}
      </p>

      <button
        type="button"
        @click="signOut"
        :disabled="isSigningOut"
        class="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
      >
        <LogoutIcon
          class="text-gray-500 group-hover:text-graymenu-700 dark:group-hover:text-gray-300"
        />
        {{ isSigningOut ? 'Signing out…' : 'Sign out' }}
      </button>
    </div>
    <!-- Dropdown End -->
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { UserCircleIcon, ChevronDownIcon, LogoutIcon, SettingsIcon } from '@/icons'
import { RouterLink, useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useStore } from 'vuex'

const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const isSigningOut = ref(false)
const signOutError = ref('')

const store = useStore()
const router = useRouter()
const profile = computed(() => store.getters['profile/getProfile'])

const menuItems = [
  { href: '/profile', icon: UserCircleIcon, text: 'Edit profile' },
  { href: '/settings', icon: SettingsIcon, text: 'Account settings' },
]

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = (restoreFocus = false) => {
  dropdownOpen.value = false
  if (restoreFocus) nextTick(() => triggerRef.value?.focus())
}

const signOut = async () => {
  if (isSigningOut.value) return
  isSigningOut.value = true
  signOutError.value = ''
  try {
    await axios.post('/api/auth/logout')
    closeDropdown()
    await router.replace('/signin')
  } catch (error) {
    console.error('Could not sign out:', error)
    signOutError.value = 'Could not sign out. Please try again.'
  } finally {
    isSigningOut.value = false
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (event.target instanceof Node && dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
