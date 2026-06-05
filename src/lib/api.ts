// API abstraction layer: auto-detects Supabase vs localStorage mode

import { supabase } from './supabase'
import { localDb, getGuestUser } from './localDb'
import type { Task, Profile, AchievementWithStatus, CompleteTaskResult, TaskDifficulty } from '../types/database'

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

export const isLocalMode = !isSupabaseConfigured()

// ============== Auth ==============
export const api = {
  isLocal: isLocalMode,

  // Auth
  getSession: async () => {
    if (isLocalMode) {
      const guest = getGuestUser()
      return { session: { user: guest } }
    }
    const { data } = await supabase.auth.getSession()
    return data
  },

  onAuthChange: (callback: (user: unknown) => void) => {
    if (isLocalMode) {
      callback(getGuestUser())
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
    return supabase.auth.onAuthStateChange((_e, session) => {
      callback(session?.user || null)
    })
  },

  signOut: async () => {
    if (isLocalMode) return
    await supabase.auth.signInWithOtp
    await supabase.auth.signOut()
  },

  // Profile
  getProfile: async (userId: string) => {
    if (isLocalMode) return localDb.profile.get()
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    return data as Profile | null
  },

  subscribeProfile: (userId: string, callback: (p: Profile) => void) => {
    if (isLocalMode) return localDb.profile.subscribe(callback)
    return supabase
      .channel(`profile:${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => callback(payload.new as Profile)
      )
      .subscribe()
  },

  // Tasks
  getTasks: async (userId: string, filter?: { status?: string; difficulty?: string }) => {
    if (isLocalMode) {
      return localDb.tasks.getAll(userId, filter)
    }
    let q = supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (filter?.status) q = q.eq('status', filter.status)
    if (filter?.difficulty) q = q.eq('difficulty', filter.difficulty)
    const { data } = await q
    return (data || []) as Task[]
  },

  getTodayTasks: async (userId: string) => {
    if (isLocalMode) return localDb.tasks.getToday(userId)
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .or(`due_date.eq.${today},due_date.is.null`)
      .order('created_at', { ascending: false })
    return (data || []) as Task[]
  },

  createTask: async (task: Partial<Task>) => {
    if (isLocalMode) return localDb.tasks.add(task)
    const { data, error } = await supabase.from('tasks').insert(task).select().single()
    if (error) throw error
    return data as Task
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    if (isLocalMode) { localDb.tasks.update(id, updates); return }
    await supabase.from('tasks').update(updates).eq('id', id)
  },

  deleteTask: async (id: string) => {
    if (isLocalMode) { localDb.tasks.delete(id); return }
    await supabase.from('tasks').delete().eq('id', id)
  },

  // Complete task (the big one)
  completeTask: async (taskId: string): Promise<CompleteTaskResult> => {
    if (isLocalMode) return localDb.completeTask(taskId)
    const { data, error } = await supabase.rpc('complete_task', { p_task_id: taskId })
    if (error) throw error
    return data as unknown as CompleteTaskResult
  },

  // Achievements
  getAchievements: async (userId: string): Promise<AchievementWithStatus[]> => {
    if (isLocalMode) return localDb.achievements.getAll()
    const [allRes, userRes] = await Promise.all([
      supabase.from('achievements').select('*').order('sort_order'),
      supabase.from('user_achievements').select('*').eq('user_id', userId),
    ])
    const all = allRes.data || []
    const unlocked = new Set((userRes.data || []).map(ua => ua.achievement_id))
    const unlockedMap = new Map((userRes.data || []).map(ua => [ua.achievement_id, ua.unlocked_at]))
    return all.map(a => ({
      ...a,
      unlocked: unlocked.has(a.id),
      unlocked_at: unlockedMap.get(a.id) || null,
    })) as AchievementWithStatus[]
  },
}
