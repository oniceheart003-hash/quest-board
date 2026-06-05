import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { useAuthStore } from '../../../store/auth'
import { useProfileStore } from '../../../store/profile'
import type { Profile } from '../../../types/database'

export function useProfile() {
  const { user } = useAuthStore()
  const { profile } = useProfileStore()

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      return api.getProfile(user.id)
    },
    enabled: !!user,
  })

  // Sync query data to store
  useEffect(() => {
    if (profileQuery.data) {
      useProfileStore.setState({ profile: profileQuery.data, loading: false })
    }
  }, [profileQuery.data])

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return
    const unsubscribe = api.subscribeProfile(user.id, (p: Profile) => {
      useProfileStore.setState({ profile: p })
    })
    return () => { if (typeof unsubscribe === 'function') unsubscribe() }
  }, [user])

  return {
    profile: profile || profileQuery.data || null,
    isLoading: profileQuery.isLoading,
    refetch: profileQuery.refetch,
  }
}
