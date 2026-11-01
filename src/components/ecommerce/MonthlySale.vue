<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
        GitHub Profile Info
      </h3>
    </div>

    <!-- GitHub Profile -->
    <div v-if="profile" class="mt-4 flex items-center gap-4">
      <img
        :src="profile.avatar_url"
        alt="Avatar"
        class="h-16 w-16 rounded-full border"
      />
      <div>
        <h4 class="text-xl font-bold text-gray-800 dark:text-white/90">
          {{ profile.name || profile.login }}
        </h4>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ profile.bio || 'No bio available' }}
        </p>
        <p class="text-xs text-gray-500">
          📍 {{ profile.location || 'Unknown' }}
        </p>
        <p class="text-xs text-gray-500">
          ⭐ {{ profile.public_repos }} Repos · 👥 {{ profile.followers }} Followers
        </p>
      </div>
    </div>

    <!-- Repos List -->
    <div v-if="repos.length" class="mt-6">
      <h4 class="text-md font-semibold mb-2 text-gray-800 dark:text-white/90">Latest Repositories</h4>
      <ul class="space-y-2">
        <li
          v-for="repo in repos.slice(0, 5)"
          :key="repo.id"
          class="border-b pb-2"
        >
          <a
            :href="repo.html_url"
            target="_blank"
            class="text-blue-600 dark:text-blue-400 font-medium"
          >
            {{ repo.name }}
          </a>
          <p class="text-xs text-gray-500">{{ repo.description }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import axios from "axios"

const profile = ref<any>(null)
const repos = ref<any[]>([])

onMounted(async () => {
  try {
    // Fetch GitHub Profile
    const { data: user } = await axios.get("https://api.github.com/users/dixitcoder")
    profile.value = user

    // Fetch Repositories
    const { data: userRepos } = await axios.get("https://api.github.com/users/dixitcoder/repos")
    repos.value = userRepos
  } catch (error) {
    console.error("❌ Error fetching GitHub data:", error)
  }
})
</script>
