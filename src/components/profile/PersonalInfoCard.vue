<template>
  <div>
    <div
      class="p-5 mb-6 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6"
    >
      <div
        class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between"
      >
        <div>
          <h4
            class="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6"
          >
            Personal Information
          </h4>

          <div
            class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32"
          >
            <div>
              <p
                class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400"
              >
                First Name
              </p>
              <p
                class="text-sm font-medium text-gray-800 dark:text-white/90"
              >
                {{ profile.firstName }}
              </p>
            </div>

            <div>
              <p
                class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400"
              >
                Last Name
              </p>
              <p
                class="text-sm font-medium text-gray-800 dark:text-white/90"
              >
                {{ profile.lastName }}
              </p>
            </div>

            <div>
              <p
                class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400"
              >
                Email address
              </p>
              <p
                class="text-sm font-medium text-gray-800 dark:text-white/90"
              >
                {{ profile.email }}
              </p>
            </div>

            <div>
              <p
                class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400"
              >
                Phone
              </p>
              <p
                class="text-sm font-medium text-gray-800 dark:text-white/90"
              >
                {{ profile.phone }}
              </p>
            </div>

            <div>
              <p
                class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400"
              >
                Bio
              </p>
              <p
                class="text-sm font-medium text-gray-800 dark:text-white/90"
              >
                {{ profile.bio }}
              </p>
            </div>
          </div>
        </div>

        <button class="edit-button" @click="isProfileInfoModal = true">
          ✏️ Edit
        </button>
      </div>
    </div>

    <!-- Modal -->
    <Modal v-if="isProfileInfoModal" @close="isProfileInfoModal = false">
      <template #body>
        <div
          class="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11"
        >
          <!-- close btn -->
          <button
            @click="isProfileInfoModal = false"
            class="absolute right-5 top-5 rounded-full bg-gray-200 px-3 py-1"
          >
            ×
          </button>

          <div class="px-2 pr-14">
            <h4
              class="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90"
            >
              Edit Personal Information
            </h4>
          </div>

          <form class="flex flex-col">
            <div class="custom-scrollbar h-[400px] overflow-y-auto p-2">
              <!-- Personal Info -->
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <label>First Name</label>
                  <input v-model="profile.firstName" type="text" />
                </div>

                <div>
                  <label>Last Name</label>
                  <input v-model="profile.lastName" type="text" />
                </div>

                <div>
                  <label>Email</label>
                  <input v-model="profile.email" type="text" />
                </div>

                <div>
                  <label>Phone</label>
                  <input v-model="profile.phone" type="text" />
                </div>

                <div class="col-span-2">
                  <label>Bio</label>
                  <input v-model="profile.bio" type="text" />
                </div>
              </div>

              <!-- Social Links -->
              <div class="mt-7">
                <h5 class="mb-5 text-lg font-medium">Social Links</h5>
                <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <input v-model="profile.social.facebook" type="text" placeholder="Facebook" />
                  <input v-model="profile.social.x" type="text" placeholder="X.com" />
                  <input v-model="profile.social.linkedin" type="text" placeholder="LinkedIn" />
                  <input v-model="profile.social.instagram" type="text" placeholder="Instagram" />
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 mt-6">
              <button
                type="button"
                @click="isProfileInfoModal = false"
                class="px-4 py-2 border rounded"
              >
                Close
              </button>
              <button
                type="button"
                @click="saveProfile"
                class="px-4 py-2 rounded bg-blue-500 text-white"
              >
                Save Changes
              </button>
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

// Vuex store
const store = useStore()
const profile = computed(() => store.getters['profile/getProfile'])

// Modal state
const isProfileInfoModal = ref(false)

// Save handler
const saveProfile = () => {
  store.dispatch('profile/saveProfile', profile.value)
  isProfileInfoModal.value = false
}
</script>
