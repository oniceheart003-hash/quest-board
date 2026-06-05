import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { useAuthStore } from '../../../store/auth'
import type { Task } from '../../../types/database'

export function useTasks(filter?: { status?: string; difficulty?: string }) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id, filter],
    queryFn: async () => {
      if (!user) return []
      return api.getTasks(user.id, filter)
    },
    enabled: !!user,
  })

  const todayTasksQuery = useQuery({
    queryKey: ['tasks', user?.id, 'today'],
    queryFn: async () => {
      if (!user) return []
      return api.getTodayTasks(user.id)
    },
    enabled: !!user,
  })

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return api.completeTask(taskId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await api.deleteTask(taskId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return {
    tasks: tasksQuery.data || [],
    todayTasks: todayTasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    completeTask: completeTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutate,
    isCompleting: completeTaskMutation.isPending,
  }
}
