import axios from "axios"
import type { Module } from "vuex"

// Social links interface
export interface SocialLinks {
  facebook: string
  x: string
  linkedin: string
  instagram: string
}

// Profile interface
export interface Profile {
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  location: string
  role: string
  avatar: string
  social: SocialLinks
  country: string
  city: string
  postalCode: string
  taxId: string
  followers: number
  following: number
}

// State interface
export interface ProfileState {
  profile: Profile
  localServerIP: string
  machineIP: string
  routerIP: string
  repos: GitHubRepository[]
  githubLoading: boolean
  githubError: string
  githubFetched: boolean
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  updated_at: string
}

// Vuex module
const profileModule: Module<ProfileState, unknown> = {
  namespaced: true,

  state: (): ProfileState => ({
    profile: {
      firstName: "Dixit",
      lastName: "Patel",
      email: "dixitcoder@example.com",
      phone: "+91 7 244489901",
      bio: "Full Stack Developer | Open Source Contributor",
      location: "Ahmedabad, India",
      role: "Software Engineer",
      avatar: "https://avatars.githubusercontent.com/u/134264323",
      social: {
        facebook: "https://facebook.com/dixitcoder",
        x: "https://x.com/dixitcoder",
        linkedin: "https://linkedin.com/in/dixitcoder",
        instagram: "https://instagram.com/dixitcoder"
      },
      country: "India",
      city: "Surat, India",
      postalCode: "396060",
      taxId: "AS4568384",
      followers: 0,
      following: 0,
    },
    localServerIP: import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "",
    machineIP: "127.0.0.1",
    routerIP: "192.168.1.1",
    repos: [],
    githubLoading: false,
    githubError: '',
    githubFetched: false,
  }),

  getters: {
    getProfile: (state) => state.profile,
    getRepos: (state) => state.repos,
    getLocalServerIP: (state) => state.localServerIP,
    getMachineIP: (state) => state.machineIP,
    getRouterIP: (state) => state.routerIP,
    isLoading: (state) => state.githubLoading,
    getError: (state) => state.githubError,
  },

  mutations: {
    setProfile(state, payload: Partial<Profile>) {
      state.profile = { ...state.profile, ...payload }
    },
    setRepos(state, repos: GitHubRepository[]) {
      state.repos = repos
    },
    setGithubLoading(state, loading: boolean) {
      state.githubLoading = loading
    },
    setGithubError(state, error: string) {
      state.githubError = error
    },
    setGithubFetched(state, fetched: boolean) {
      state.githubFetched = fetched
    },
    setLocalServerIP(state, ip: string) {
      state.localServerIP = ip
    },
    setMachineIP(state, ip: string) {
      state.machineIP = ip
    },
    setRouterIP(state, ip: string) {
      state.routerIP = ip
    }
  },

  actions: {
    saveProfile({ commit }, payload: Partial<Profile>) {
      commit("setProfile", payload)
    },

    setServerIP({ commit }, ip: string) {
      commit("setLocalServerIP", ip)
    },

    async fetchGithubProfile({ commit, state }) {
      if (state.githubFetched || state.githubLoading) return
      commit('setGithubLoading', true)
      commit('setGithubError', '')
      try {
        const [res, repoRes] = await Promise.all([
          axios.get('https://api.github.com/users/dixitcoder'),
          axios.get('https://api.github.com/users/dixitcoder/repos', {
            params: { sort: 'updated', per_page: 5 },
          }),
        ])
        if (!Array.isArray(repoRes.data)) throw new Error('GitHub returned an invalid repositories response')
        const githubData: Partial<Profile> = {
          firstName: "Dixit",
          lastName: "Coder",
          bio: res.data.bio || "No bio available",
          location: res.data.location || "Unknown",
          avatar: res.data.avatar_url,
          followers: res.data.followers,
          following: res.data.following,
          social: {
            x: `https://x.com/${res.data.twitter_username || "dixitcoder"}`,
            linkedin: "https://linkedin.com/in/dixitcoder",
            facebook: "https://facebook.com/dixitcoder",
            instagram: "https://instagram.com/dixitcoder"
          }
        }
        commit("setProfile", githubData)
        commit("setRepos", repoRes.data)
        commit('setGithubFetched', true)
      } catch (error) {
        console.error("❌ Failed to fetch GitHub profile:", error)
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : error instanceof Error ? error.message : 'Unknown GitHub API error'
        commit('setGithubError', message)
      } finally {
        commit('setGithubLoading', false)
      }
    }
  }
}

export default profileModule
