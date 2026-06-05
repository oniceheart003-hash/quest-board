import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { useAuthStore } from '../../../store/auth'
import type { AchievementWithStatus } from '../../../types/database'

export function useAchievements() {
  const { user } = useAuthStore()

  const achievementsQuery = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!user) return []
      return api.getAchievements(user.id)
    },
    enabled: !!user,
  })

  return {
    achievements: achievementsQuery.data || [],
    unlockedCount: (achievementsQuery.data || []).filter((a) => a.unlocked).length,
    totalCount: (achievementsQuery.data || []).length,
    isLoading: achievementsQuery.isLoading,
  }
}
