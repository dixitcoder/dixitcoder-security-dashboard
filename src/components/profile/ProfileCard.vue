<template>
  <div>
    <div class="p-5 mb-6 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div class="flex flex-col items-center w-full gap-6 xl:flex-row">
          <!-- Avatar -->
          <div class="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <img :src="profile.avatar" alt="user" />
          </div>

          <!-- Name, Role, Location -->
          <div class="order-3 xl:order-2">
            <h4 class="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {{ profile.firstName }} {{ profile.lastName }}
            </h4>
            <div class="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ profile.role }}</p>
              <div class="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ profile.location }}</p>
            </div>
          </div>

          <!-- Social -->
          <div class="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
            <a :href="profile.social.x" target="_blank" rel="noopener" class="social-button">
              <!-- X.com Icon -->
              <svg class="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15.1708 1.875H17.9274L11.9049 8.75833L18.9899 18.125H13.4424L9.09742 12.4442L4.12578 18.125H1.36745L7.80912 10.7625L1.01245 1.875H6.70078L10.6283 7.0675L15.1708 1.875ZM14.2033 16.475H15.7308L5.87078 3.43833H4.23162L14.2033 16.475Z"
                  fill=""
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- Edit Button -->
        <button @click="isProfileInfoModal = true" class="edit-button">Edit</button>
      </div>
    </div>

    <!-- Modal -->
    <Modal v-if="isProfileInfoModal" @close="isProfileInfoModal = false">
      <template #body>
        <div class="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <!-- Close Button -->
          <button @click="isProfileInfoModal = false">×</button>

          <div class="px-2 pr-14">
            <h4 class="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Edit Personal Information</h4>
            <p class="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>

          <!-- Form -->
          <form class="flex flex-col" @submit.prevent="saveProfile">
            <div class="h-[458px] overflow-y-auto p-2">
              <!-- Social Links -->
              <h5 class="mb-5 text-lg font-medium text-gray-800 dark:text-white/90">Social Links</h5>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <label>Facebook</label>
                  <input type="text" v-model="profile.social.facebook" />
                </div>
                <div>
                  <label>X.com</label>
                  <input type="text" v-model="profile.social.x" />
                </div>
                <div>
                  <label>LinkedIn</label>
                  <input type="text" v-model="profile.social.linkedin" />
                </div>
                <div>
                  <label>Instagram</label>
                  <input type="text" v-model="profile.social.instagram" />
                </div>
              </div>

              <!-- Personal Info -->
              <h5 class="mt-7 mb-5 text-lg font-medium text-gray-800 dark:text-white/90">Personal Information</h5>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div><label>First Name</label><input type="text" v-model="profile.firstName" /></div>
                <div><label>Last Name</label><input type="text" v-model="profile.lastName" /></div>
                <div><label>Email</label><input type="text" v-model="profile.email" /></div>
                <div><label>Phone</label><input type="text" v-model="profile.phone" /></div>
                <div class="col-span-2"><label>Bio</label><input type="text" v-model="profile.bio" /></div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <button type="button" @click="isProfileInfoModal = false">Close</button>
              <button type="submit">Save</button>
            </div>
          </form>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import Modal from './Modal.vue'

// Modal state
const isProfileInfoModal = ref(false)

// Vuex store
const store = useStore()
const profile = computed(() => store.getters['profile/getProfile'])

// Save handler
const saveProfile = () => {
  store.dispatch('profile/saveProfile', profile.value)
  isProfileInfoModal.value = false
}
</script>
