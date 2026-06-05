export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile>
        Update: Partial<Profile>
      }
      tasks: {
        Row: Task
        Insert: Partial<Task>
        Update: Partial<Task>
      }
      task_categories: {
        Row: TaskCategory
        Insert: Partial<TaskCategory>
        Update: Partial<TaskCategory>
      }
      daily_logs: {
        Row: DailyLog
        Insert: Partial<DailyLog>
        Update: Partial<DailyLog>
      }
      achievements: {
        Row: Achievement
        Insert: Partial<Achievement>
        Update: Partial<Achievement>
      }
      user_achievements: {
        Row: UserAchievement
        Insert: Partial<UserAchievement>
        Update: Partial<UserAchievement>
      }
    }
  }
}

export interface Profile {
  id: string
  username: string | null
  display_name: string
  avatar_url: string | null
  xp: number
  gold: number
  level: number
  title: string
  current_streak: number
  longest_streak: number
  last_completed_date: string | null
  total_tasks_completed: number
  total_xp_earned: number
  created_at: string
  updated_at: string
}

export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'epic'
export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export interface Task {
  id: string
  user_id: string
  category_id: string | null
  title: string
  description: string
  difficulty: TaskDifficulty
  status: TaskStatus
  xp_reward: number
  gold_reward: number
  estimated_minutes: number | null
  due_date: string | null
  completed_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface TaskCategory {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  sort_order: number
  created_at: string
}

export interface DailyLog {
  id: string
  user_id: string
  log_date: string
  tasks_completed: number
  xp_earned: number
  gold_earned: number
  perfect_day: boolean
  note: string
}

export interface Achievement {
  id: string
  key: string
  name: string
  description: string
  category: 'milestone' | 'streak' | 'special' | 'secret'
  icon: string
  color: string
  xp_reward: number
  gold_reward: number
  requirement_type: string
  requirement_value: number
  sort_order: number
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
}

// Extended types for UI
export interface AchievementWithStatus extends Achievement {
  unlocked: boolean
  unlocked_at: string | null
}

export interface TaskWithCategory extends Task {
  category: TaskCategory | null
}

export interface CompleteTaskResult {
  final_xp: number
  final_gold: number
  leveled_up: boolean
  new_level: number
  new_title: string
  streak: number
  critical_hit: boolean
  unlocked_achievements: { id: string; name: string; icon: string }[]
}
