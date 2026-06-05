// LocalStorage-based database for when Supabase is not configured
// Mimics the Supabase API surface so the app works without backend setup

import type { Task, Profile, Achievement, AchievementWithStatus, TaskCategory, DailyLog, CompleteTaskResult } from '../types/database'
import { getTitle, getStreakMultiplier, isCriticalHit } from './gamification'

const KEYS = {
  tasks: 'qb_tasks',
  profile: 'qb_profile',
  achievements: 'qb_achievements',
  userAchievements: 'qb_user_achievements',
  categories: 'qb_categories',
  dailyLogs: 'qb_daily_logs',
  guest: 'qb_guest_id',
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

function uid(): string {
  let id = localStorage.getItem(KEYS.guest)
  if (!id) {
    id = 'guest_' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem(KEYS.guest, id)
  }
  return id
}

// Default achievements (same as seed SQL)
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach_1', key: 'first_task', name: '初出茅庐', description: '完成你的第一个任务。英雄的旅程始于第一步。', category: 'milestone', icon: 'swords', color: '#f59e0b', xp_reward: 50, gold_reward: 10, requirement_type: 'total_tasks', requirement_value: 1, sort_order: 1, created_at: '' },
  { id: 'ach_2', key: 'task_slayer_10', name: '任务猎手', description: '完成 10 个任务。', category: 'milestone', icon: 'target', color: '#f59e0b', xp_reward: 100, gold_reward: 25, requirement_type: 'total_tasks', requirement_value: 10, sort_order: 2, created_at: '' },
  { id: 'ach_3', key: 'task_slayer_50', name: '资深冒险者', description: '完成 50 个任务。', category: 'milestone', icon: 'crosshair', color: '#f59e0b', xp_reward: 250, gold_reward: 50, requirement_type: 'total_tasks', requirement_value: 50, sort_order: 3, created_at: '' },
  { id: 'ach_4', key: 'task_slayer_100', name: '百战勇士', description: '完成 100 个任务。公会开始注意到你了。', category: 'milestone', icon: 'shield', color: '#f59e0b', xp_reward: 500, gold_reward: 100, requirement_type: 'total_tasks', requirement_value: 100, sort_order: 4, created_at: '' },
  { id: 'ach_5', key: 'task_slayer_500', name: '传说', description: '完成 500 个任务。', category: 'milestone', icon: 'crown', color: '#f59e0b', xp_reward: 2000, gold_reward: 500, requirement_type: 'total_tasks', requirement_value: 500, sort_order: 5, created_at: '' },
  { id: 'ach_6', key: 'streak_3', name: '三天之约', description: '连续 3 天完成任务。', category: 'streak', icon: 'flame', color: '#ef4444', xp_reward: 75, gold_reward: 15, requirement_type: 'streak', requirement_value: 3, sort_order: 6, created_at: '' },
  { id: 'ach_7', key: 'streak_7', name: '一周坚持', description: '连续 7 天完成任务。习惯的火焰被点燃。', category: 'streak', icon: 'flame', color: '#ef4444', xp_reward: 200, gold_reward: 40, requirement_type: 'streak', requirement_value: 7, sort_order: 7, created_at: '' },
  { id: 'ach_8', key: 'streak_14', name: '双周连击', description: '连续 14 天完成任务。', category: 'streak', icon: 'flame', color: '#ef4444', xp_reward: 400, gold_reward: 80, requirement_type: 'streak', requirement_value: 14, sort_order: 8, created_at: '' },
  { id: 'ach_9', key: 'streak_30', name: '不灭的意志', description: '连续 30 天完成任务。整整一个月！', category: 'streak', icon: 'flame-kindling', color: '#ef4444', xp_reward: 1000, gold_reward: 200, requirement_type: 'streak', requirement_value: 30, sort_order: 9, created_at: '' },
  { id: 'ach_10', key: 'streak_100', name: '传奇', description: '连续 100 天完成任务。你就是传奇。', category: 'streak', icon: 'flame', color: '#ef4444', xp_reward: 5000, gold_reward: 1000, requirement_type: 'streak', requirement_value: 100, sort_order: 10, created_at: '' },
  { id: 'ach_11', key: 'daily_combo_5', name: '高效达人', description: '一天内完成 5 个任务。', category: 'special', icon: 'zap', color: '#8b5cf6', xp_reward: 150, gold_reward: 30, requirement_type: 'daily_combo', requirement_value: 5, sort_order: 11, created_at: '' },
  { id: 'ach_12', key: 'daily_combo_10', name: '任务机器', description: '一天内完成 10 个任务。', category: 'special', icon: 'zap', color: '#8b5cf6', xp_reward: 300, gold_reward: 60, requirement_type: 'daily_combo', requirement_value: 10, sort_order: 12, created_at: '' },
  { id: 'ach_13', key: 'daily_combo_20', name: '超越极限', description: '一天内完成 20 个任务。', category: 'special', icon: 'zap', color: '#8b5cf6', xp_reward: 600, gold_reward: 120, requirement_type: 'daily_combo', requirement_value: 20, sort_order: 13, created_at: '' },
  { id: 'ach_14', key: 'epic_slayer_5', name: '史诗猎手', description: '完成 5 个史诗任务。', category: 'special', icon: 'skull', color: '#a855f7', xp_reward: 300, gold_reward: 60, requirement_type: 'difficulty_epic', requirement_value: 5, sort_order: 14, created_at: '' },
  { id: 'ach_15', key: 'epic_slayer_25', name: '史诗征服者', description: '完成 25 个史诗任务。传说由此诞生。', category: 'special', icon: 'skull', color: '#a855f7', xp_reward: 1000, gold_reward: 200, requirement_type: 'difficulty_epic', requirement_value: 25, sort_order: 15, created_at: '' },
  { id: 'ach_16', key: 'level_10', name: '见习骑士', description: '达到等级 10。', category: 'milestone', icon: 'sword', color: '#6366f1', xp_reward: 200, gold_reward: 50, requirement_type: 'level', requirement_value: 10, sort_order: 16, created_at: '' },
  { id: 'ach_17', key: 'level_25', name: '精英战士', description: '达到等级 25。', category: 'milestone', icon: 'sword', color: '#6366f1', xp_reward: 500, gold_reward: 100, requirement_type: 'level', requirement_value: 25, sort_order: 17, created_at: '' },
  { id: 'ach_18', key: 'level_50', name: '半神', description: '达到等级 50。凡人极限抛在身后。', category: 'milestone', icon: 'gem', color: '#6366f1', xp_reward: 1500, gold_reward: 300, requirement_type: 'level', requirement_value: 50, sort_order: 18, created_at: '' },
  { id: 'ach_19', key: 'level_100', name: '传奇勇士', description: '达到等级 100。', category: 'milestone', icon: 'trophy', color: '#6366f1', xp_reward: 5000, gold_reward: 1000, requirement_type: 'level', requirement_value: 100, sort_order: 19, created_at: '' },
]

// ============== Profile ==============
export const localProfile = {
  get(): Profile {
    const id = uid()
    return read<Profile>(KEYS.profile, {
      id,
      username: 'guest',
      display_name: '冒险者',
      avatar_url: null,
      xp: 0,
      gold: 0,
      level: 1,
      title: '新手冒险者',
      current_streak: 0,
      longest_streak: 0,
      last_completed_date: null,
      total_tasks_completed: 0,
      total_xp_earned: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  },

  update(updates: Partial<Profile>) {
    const current = this.get()
    write(KEYS.profile, { ...current, ...updates, updated_at: new Date().toISOString() })
  },

  subscribe(callback: (profile: Profile) => void) {
    // Poll for changes (simplified realtime)
    const interval = setInterval(() => callback(this.get()), 2000)
    return () => clearInterval(interval)
  },
}

// ============== Tasks ==============
export const localTasks = {
  getAll(userId: string, filter?: { status?: string }): Task[] {
    const tasks = read<Task[]>(KEYS.tasks, [])
    let result = tasks.filter(t => t.user_id === userId)
    if (filter?.status) result = result.filter(t => t.status === filter.status)
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  getToday(userId: string): Task[] {
    const today = new Date().toISOString().split('T')[0]
    return this.getAll(userId).filter(t =>
      !t.due_date || t.due_date === today
    )
  },

  add(task: Partial<Task>) {
    const tasks = read<Task[]>(KEYS.tasks, [])
    const newTask: Task = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      user_id: task.user_id || uid(),
      category_id: task.category_id || null,
      title: task.title || '',
      description: task.description || '',
      difficulty: task.difficulty || 'medium',
      status: task.status || 'pending',
      xp_reward: task.xp_reward || 50,
      gold_reward: task.gold_reward || 10,
      estimated_minutes: task.estimated_minutes || null,
      due_date: task.due_date || null,
      completed_at: task.completed_at || null,
      sort_order: task.sort_order || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    tasks.push(newTask)
    write(KEYS.tasks, tasks)
    return newTask
  },

  update(id: string, updates: Partial<Task>) {
    const tasks = read<Task[]>(KEYS.tasks, [])
    const idx = tasks.findIndex(t => t.id === id)
    if (idx >= 0) {
      tasks[idx] = { ...tasks[idx], ...updates, updated_at: new Date().toISOString() }
      write(KEYS.tasks, tasks)
    }
  },

  delete(id: string) {
    const tasks = read<Task[]>(KEYS.tasks, [])
    write(KEYS.tasks, tasks.filter(t => t.id !== id))
  },
}

// ============== Game Logic (equivalent to complete_task RPC) ==============
export function localCompleteTask(taskId: string): CompleteTaskResult {
  const tasks = read<Task[]>(KEYS.tasks, [])
  const task = tasks.find(t => t.id === taskId)
  if (!task || task.status === 'completed') throw new Error('Task not found or already completed')

  const profile = localProfile.get()
  const streakMultiplier = getStreakMultiplier(profile.current_streak)
  const critical = isCriticalHit()

  let finalXp = Math.round(task.xp_reward * streakMultiplier)
  let finalGold = Math.round(task.gold_reward * streakMultiplier)
  if (critical) {
    finalXp *= 2
    finalGold *= 2
  }

  // Update task status
  localTasks.update(taskId, { status: 'completed', completed_at: new Date().toISOString() })

  // Streak logic
  const today = new Date().toISOString().split('T')[0]
  let newStreak = profile.current_streak
  if (!profile.last_completed_date || profile.last_completed_date === yesterday()) {
    newStreak = profile.current_streak + 1
  } else if (profile.last_completed_date < yesterday()) {
    newStreak = 1
  }

  const oldLevel = profile.level
  const newXp = profile.xp + finalXp
  const newGold = profile.gold + finalGold
  const newLevel = calcLevel(newXp)
  const leveledUp = newLevel > oldLevel
  const newTitle = getTitle(newLevel)

  // Update profile
  localProfile.update({
    xp: newXp,
    gold: newGold,
    current_streak: newStreak,
    longest_streak: Math.max(profile.longest_streak, newStreak),
    last_completed_date: today,
    total_tasks_completed: profile.total_tasks_completed + 1,
    total_xp_earned: profile.total_xp_earned + finalXp,
    level: newLevel,
    title: newTitle,
  })

  // Update daily log
  const logs = read<DailyLog[]>(KEYS.dailyLogs, [])
  const todayLog = logs.find(l => l.user_id === profile.id && l.log_date === today)
  if (todayLog) {
    todayLog.tasks_completed += 1
    todayLog.xp_earned += finalXp
    todayLog.gold_earned += finalGold
  } else {
    logs.push({
      id: 'log_' + Date.now(),
      user_id: profile.id,
      log_date: today,
      tasks_completed: 1,
      xp_earned: finalXp,
      gold_earned: finalGold,
      perfect_day: false,
      note: '',
    })
  }
  write(KEYS.dailyLogs, logs)

  // Check achievements
  const updatedProfile = localProfile.get()
  const unlockedAchievements = checkAchievements(updatedProfile)

  return {
    final_xp: finalXp,
    final_gold: finalGold,
    leveled_up: leveledUp,
    new_level: newLevel,
    new_title: newTitle,
    streak: newStreak,
    critical_hit: critical,
    unlocked_achievements: unlockedAchievements.map(a => ({ id: a.id, name: a.name, icon: a.icon })),
  }
}

function calcLevel(xp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  return level
}

function xpForLevel(level: number): number {
  let total = 0
  for (let i = 1; i <= level; i++) total += Math.floor(100 * Math.pow(i, 1.5))
  return total
}

function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function checkAchievements(profile: Profile): Achievement[] {
  const unlocked = read<{ achievement_id: string; unlocked_at: string }[]>(KEYS.userAchievements, [])
  const unlockedIds = new Set(unlocked.map(u => u.achievement_id))
  const allAch = read<Achievement[]>(KEYS.achievements, DEFAULT_ACHIEVEMENTS)

  // Save defaults if not yet saved
  if (!localStorage.getItem(KEYS.achievements)) {
    write(KEYS.achievements, DEFAULT_ACHIEVEMENTS)
  }

  const today = new Date().toISOString().split('T')[0]
  const tasks = read<Task[]>(KEYS.tasks, [])
  const todayCompleted = tasks.filter(t =>
    t.user_id === profile.id &&
    t.status === 'completed' &&
    t.completed_at?.startsWith(today)
  ).length
  const epicDone = tasks.filter(t =>
    t.user_id === profile.id &&
    t.status === 'completed' &&
    t.difficulty === 'epic'
  ).length

  const newUnlocked: Achievement[] = []

  for (const ach of allAch) {
    if (unlockedIds.has(ach.id)) continue
    let met = false
    switch (ach.requirement_type) {
      case 'total_tasks': met = profile.total_tasks_completed >= ach.requirement_value; break
      case 'streak': met = profile.current_streak >= ach.requirement_value; break
      case 'daily_combo': met = todayCompleted >= ach.requirement_value; break
      case 'difficulty_epic': met = epicDone >= ach.requirement_value; break
      case 'level': met = profile.level >= ach.requirement_value; break
    }
    if (met) {
      unlocked.push({ achievement_id: ach.id, unlocked_at: new Date().toISOString() })
      // Grant XP/gold reward
      if (ach.xp_reward > 0 || ach.gold_reward > 0) {
        const p = localProfile.get()
        localProfile.update({ xp: p.xp + ach.xp_reward, gold: p.gold + ach.gold_reward })
      }
      newUnlocked.push(ach)
    }
  }

  if (unlocked.length > 0) {
    write(KEYS.userAchievements, [...read<{ achievement_id: string; unlocked_at: string }[]>(KEYS.userAchievements, []), ...unlocked])
  }

  return newUnlocked
}

// ============== Achievements ==============
export const localAchievements = {
  getAll(): AchievementWithStatus[] {
    const all = read<Achievement[]>(KEYS.achievements, DEFAULT_ACHIEVEMENTS)
    if (!localStorage.getItem(KEYS.achievements)) {
      write(KEYS.achievements, DEFAULT_ACHIEVEMENTS)
    }
    const unlocked = read<{ achievement_id: string; unlocked_at: string }[]>(KEYS.userAchievements, [])
    const unlockedIds = new Set(unlocked.map(u => u.achievement_id))
    const unlockedMap = new Map(unlocked.map(u => [u.achievement_id, u.unlocked_at]))

    return all.map(a => ({
      ...a,
      unlocked: unlockedIds.has(a.id),
      unlocked_at: unlockedMap.get(a.id) || null,
    }))
  },
}

// Export a unified interface
export const localDb = {
  profile: localProfile,
  tasks: localTasks,
  achievements: localAchievements,
  completeTask: localCompleteTask,
  getUserId: uid,
}

// Guest auth
export function getGuestUser() {
  return {
    id: uid(),
    email: 'guest@questboard.local',
    user_metadata: { display_name: '冒险者' },
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
    app_metadata: {},
    identities: [],
  }
}
