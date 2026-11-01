<template>
  <FullScreenLayout>
    <div class="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div class="relative flex flex-col justify-center w-full min-h-screen lg:flex-row dark:bg-gray-900">
        <div class="flex min-h-screen flex-col flex-1 w-full lg:w-1/2 lg:bg-gradient-to-br lg:from-gray-50 lg:via-white lg:to-brand-50/60 dark:lg:from-gray-950 dark:lg:via-gray-900 dark:lg:to-gray-900">
          <div class="w-full max-w-lg pt-10 mx-auto lg:px-8">
            <router-link
              to="/"
              class="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg
                class="stroke-current"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M12.7083 5L7.5 10.2083L12.7083 15.4167"
                  stroke=""
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Back to dashboard
            </router-link>
          </div>

          <div class="flex w-full max-w-lg flex-col justify-center mx-auto py-8 lg:my-auto lg:rounded-3xl lg:border lg:border-gray-200 lg:bg-white lg:px-8 lg:py-9 lg:shadow-theme-lg dark:lg:border-gray-800 dark:lg:bg-gray-900">
            <div>
              <div class="mb-5 sm:mb-8">
                <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase text-brand-700 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-300">
                  Fast access portal
                </div>
                <h1 class="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  Sign In
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Enter your username and password to sign in and continue to your workspace.
                </p>
              </div>

              <div>
                <form @submit.prevent="handleSubmit" @keydown.ctrl.enter.prevent="handleSubmit" @keydown.meta.enter.prevent="handleSubmit">
                  <div class="space-y-5">
                    <div>
                      <label for="username" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Username<span class="text-error-500">*</span>
                      </label>
                      <input
                        v-model="username"
                        type="text"
                        id="username"
                        name="username"
                        autocomplete="username"
                        required
                        placeholder="Enter your username"
                        class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      />
                    </div>

                    <div>
                      <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Password<span class="text-error-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          v-model="password"
                          :type="showPassword ? 'text' : 'password'"
                          id="password"
                          autocomplete="current-password"
                          required
                          placeholder="Enter your password"
                          class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                        />
                        <button
                          type="button"
                          :aria-label="showPassword ? 'Hide password' : 'Show password'"
                          :aria-pressed="showPassword"
                          @click="togglePasswordVisibility"
                          class="absolute z-30 flex -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-gray-500 right-4 top-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-gray-400"
                        >
                          <svg
                            v-if="!showPassword"
                            class="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297ZM9.99151 7.84413C8.96527 7.84413 8.13333 8.67606 8.13333 9.70231C8.13333 10.7286 8.96527 11.5605 9.99151 11.5605H10.0064C11.0326 11.5605 11.8646 10.7286 11.8646 9.70231C11.8646 8.67606 11.0326 7.84413 10.0064 7.84413H9.99151Z" fill="#98A2B3" />
                          </svg>
                          <svg
                            v-else
                            class="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.63803 3.57709C4.34513 3.2842 3.87026 3.2842 3.57737 3.57709C3.28447 3.86999 3.28447 4.34486 3.57737 4.63775L4.85323 5.91362C3.74609 6.84199 2.89363 8.06395 2.4155 9.45936C2.3615 9.61694 2.3615 9.78801 2.41549 9.94558C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C11.255 15.3619 12.4422 15.0737 13.4994 14.5598L15.3625 16.4229C15.6554 16.7158 16.1302 16.7158 16.4231 16.4229C16.716 16.13 16.716 15.6551 16.4231 15.3622L4.63803 3.57709ZM12.3608 13.4212L10.4475 11.5079C10.3061 11.5423 10.1584 11.5606 10.0064 11.5606H9.99151C8.96527 11.5606 8.13333 10.7286 8.13333 9.70237C8.13333 9.5461 8.15262 9.39434 8.18895 9.24933L5.91885 6.97923C5.03505 7.69015 4.34057 8.62704 3.92328 9.70247C4.86803 12.1373 7.23361 13.8619 10.0002 13.8619C10.8326 13.8619 11.6287 13.7058 12.3608 13.4212ZM16.0771 9.70249C15.7843 10.4569 15.3552 11.1432 14.8199 11.7311L15.8813 12.7925C16.6329 11.9813 17.2187 11.0143 17.5849 9.94561C17.6389 9.78803 17.6389 9.61696 17.5849 9.45938C16.5055 6.30925 13.5184 4.04303 10.0002 4.04303C9.13525 4.04303 8.30244 4.17999 7.52218 4.43338L8.75139 5.66259C9.1556 5.58413 9.57311 5.54303 10.0002 5.54303C12.7667 5.54303 15.1323 7.26768 16.0771 9.70249Z" fill="#98A2B3" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div>
                        <label for="keepLoggedIn" class="flex items-center text-sm font-normal text-gray-700 cursor-pointer select-none dark:text-gray-400">
                          <div class="relative">
                            <input v-model="keepLoggedIn" type="checkbox" id="keepLoggedIn" class="sr-only" />
                            <div :class="keepLoggedIn ? 'border-brand-500 bg-brand-500' : 'bg-transparent border-gray-300 dark:border-gray-700'" class="mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px]">
                              <span :class="keepLoggedIn ? '' : 'opacity-0'">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" stroke-width="1.94437" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                              </span>
                            </div>
                          </div>
                          Keep me logged in
                        </label>
                      </div>
                      <span class="text-xs text-gray-500 dark:text-gray-400">Session duration: {{ keepLoggedIn ? '30 days' : '8 hours' }}</span>
                    </div>

                    <div>
                      <p v-if="errorMessage" class="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-900 dark:bg-error-950/30 dark:text-error-300" role="alert">
                        {{ errorMessage }}
                      </p>
                      <button type="submit" :disabled="isSubmitting" class="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20">
                        <span>{{ isSubmitting ? 'Signing in…' : 'Sign In' }}</span>
                        <!-- <ShortcutBadge keys="Enter" tone="brand" /> -->
                      </button>
                      <button
                        type="button"
                        :disabled="isSubmitting"
                        class="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-brand-200 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-brand-800 dark:hover:bg-brand-500/10"
                        @click="handleAdminSubmit"
                      >
                        <svg class="h-4 w-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3 4.5 6v5.5c0 4.3 3.2 8.1 7.5 9.5 4.3-1.4 7.5-5.2 7.5-9.5V6L12 3Z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="m9 12 2 2 4-4" />
                        </svg>
                        {{ isSubmitting ? 'Signing in…' : 'Admin login' }}
                      </button>
                      <p class="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                        Sign in with your administrator account credentials.
                      </p>
                    </div>
                  </div>
                </form>

                <div class="mt-5">
                  <p class="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                    Don't have an account?
                    <router-link to="/signup" class="text-brand-500 hover:text-brand-600 dark:text-brand-400">Sign Up</router-link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="relative hidden min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-gray-950 dark:bg-gray-950 lg:flex lg:w-1/2">
          <div class="absolute inset-0 opacity-40">
            <CommonGridShape />
          </div>
          <div class="relative z-10 flex max-w-xl flex-col items-center px-10 text-center">
            <router-link to="/" class="mb-6 block">
              <img width="260" height="52" src="/images/logo/dixitcoder-auth-logo.svg?v=2" alt="DixitCoder" />
            </router-link>

            <div class="w-full rounded-3xl border border-white/10 bg-white/5 p-8 text-left shadow-2xl backdrop-blur-sm">
              <p class="text-xs font-semibold tracking-[0.18em] text-brand-200 uppercase">Dixitcoder workspace</p>
              <h2 class="mt-4 text-3xl font-semibold leading-tight text-white xl:text-4xl">Everything you need, in one place.</h2>
              <p class="mt-4 max-w-md text-base leading-7 text-gray-300">
                Sign in to continue to your dashboards, developer utilities, and security workspace.
              </p>
              <div class="mt-6 grid grid-cols-2 gap-3">
                <div class="rounded-xl border border-white/10 bg-black/10 p-4">
                  <span class="block text-lg font-semibold text-white">01</span>
                  <span class="mt-1 block text-xs text-gray-300">Explore tools</span>
                </div>
                <div class="rounded-xl border border-white/10 bg-black/10 p-4">
                  <span class="block text-lg font-semibold text-white">02</span>
                  <span class="mt-1 block text-xs text-gray-300">Manage workspace</span>
                </div>
              </div>
            </div>

            <p class="mt-6 text-center text-gray-400 dark:text-white/60">
              Free and Open-Source Tailwind CSS Admin Dashboard Template
            </p>
          </div>
        </div>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
defineOptions({ name: 'SignInView' })

import { ref } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import CommonGridShape from '@/components/common/CommonGridShape.vue'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const keepLoggedIn = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const router = useRouter()
const route = useRoute()

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  await signIn(false)
}

const handleAdminSubmit = async () => {
  await signIn(true)
}

const signIn = async (adminLogin: boolean) => {
  if (isSubmitting.value) return

  isSubmitting.value = true
  errorMessage.value = ''
  try {
    await axios.post('/api/auth/login', {
      username: username.value.trim(),
      password: password.value,
      keepLoggedIn: keepLoggedIn.value,
    })
    password.value = ''
    const requestedRedirect = route.query.redirect
    const redirect = adminLogin
      ? '/user-management'
      : typeof requestedRedirect === 'string'
        && requestedRedirect.startsWith('/')
        && !requestedRedirect.startsWith('//')
        ? requestedRedirect
        : '/'
    await router.replace(redirect)
  } catch (error: unknown) {
    if (axios.isAxiosError<{ error?: string }>(error)) {
      errorMessage.value = error.response?.data?.error || 'Could not reach the sign-in service. Please try again.'
    } else {
      errorMessage.value = 'Sign in failed unexpectedly. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
