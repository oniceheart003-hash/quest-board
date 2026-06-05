import { create } from 'zustand'
import { api } from '../lib/api'

interface AuthUser {
  id: string
  email?: string
  user_metadata?: { display_name?: string }
}

interface AuthState {
  user: AuthUser | null
  session: unknown
  loading: boolean
  setSession: (session: unknown) => void
  setUser: (user: AuthUser | null) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),

  signOut: async () => {
    await api.signOut()
    set({ user: null, session: null })
  },

  initialize: async () => {
    try {
      const { session } = await api.getSession()
      const user = (session as { user?: AuthUser })?.user || null
      set({ session, user, loading: false })

      api.onAuthChange((newUser) => {
        set({ user: newUser as AuthUser | null })
      })
    } catch {
      set({ loading: false })
    }
  },
}))
