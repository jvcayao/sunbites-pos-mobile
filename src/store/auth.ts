import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import type { AuthUser, Branch } from '@/types/auth'

export const TOKEN_KEY = 'sunbites_token'

interface AuthState {
  token: string | null
  user: AuthUser | null
  activeBranch: Branch | null
  login: (token: string, user: AuthUser) => Promise<void>
  logout: () => Promise<void>
  setActiveBranch: (branch: Branch) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  activeBranch: null,

  login: async (token, user) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token)
    set({ token, user })
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    set({ token: null, user: null, activeBranch: null })
  },

  setActiveBranch: (branch) => set({ activeBranch: branch }),
}))
