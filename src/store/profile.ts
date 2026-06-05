import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database'

interface ProfileState {
  profile: Profile | null
  loading: boolean
  fetchProfile: (userId: string) => Promise<void>
  updateProfile: (updates: Partial<Profile>) => void
  subscribeToProfile: (userId: string) => () => void
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: true,

  fetchProfile: async (userId: string) => {
    set({ loading: true })
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) set({ profile: data as Profile, loading: false })
    else set({ loading: false })
  },

  updateProfile: (updates) => {
    const current = get().profile
    if (current) {
      set({ profile: { ...current, ...updates } })
    }
  },

  subscribeToProfile: (userId: string) => {
    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          set({ profile: payload.new as Profile })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}))
