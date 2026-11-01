import { createStore } from 'vuex'
import profile from './modules/profile'
import type { ProfileState } from './modules/profile'


export interface RootState {
  profile: ProfileState
}

const store = createStore<RootState>({
  modules: {
    profile
  }
})

export default store
