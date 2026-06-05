import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus, Sword } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { QuickAddTask } from '../components/tasks/QuickAddTask'
import { TaskCard } from '../components/tasks/TaskCard'
import { TaskForm } from '../components/tasks/TaskForm'
import { LevelProgressBar } from '../components/gamification/LevelProgressBar'
import { StreakFlame } from '../components/gamification/StreakFlame'
import { XPOrb } from '../components/gamification/XPOrb'
import { LevelUpModal } from '../components/gamification/LevelUpModal'
import { AchievementToast } from '../components/gamification/AchievementToast'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { useTasks } from '../features/tasks/hooks/useTasks'
import { useProfile } from '../features/profile/hooks/useProfile'
import type { Task, CompleteTaskResult } from '../types/database'

export function DashboardPage() {
  const { todayTasks, completeTask, deleteTask, isLoading } = useTasks()
  const { profile } = useProfile()
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  // Completion animation state
  const [xpOrb, setXpOrb] = useState<{ xp: number; gold: number; critical: boolean } | null>(null)
  const [levelUp, setLevelUp] = useState<{ level: number; title: string } | null>(null)
  const [achievementQueue, setAchievementQueue] = useState<{ id: string; name: string }[]>([])

  const pendingTasks = todayTasks.filter((t) => t.status === 'pending')
  const completedToday = todayTasks.filter((t) => t.status === 'completed')

  const handleComplete = useCallback(async (task: Task) => {
    try {
      const result = await completeTask(task.id) as unknown as CompleteTaskResult
      // Show XP orb
      setXpOrb({ xp: result.final_xp, gold: result.final_gold, critical: result.critical_hit })

      // Show level up
      if (result.leveled_up) {
        setTimeout(() => {
          setLevelUp({ level: result.new_level, title: result.new_title })
        }, 500)
      }

      // Show achievements
      if (result.unlocked_achievements?.length) {
        result.unlocked_achievements.forEach((a, i) => {
          setTimeout(() => {
            setAchievementQueue((prev) => [...prev, a])
          }, 1500 + i * 500)
        })
      }
    } catch (err) {
      console.error('Complete task failed:', err)
    }
  }, [completeTask])

  const handleDelete = useCallback((task: Task) => {
    deleteTask(task.id)
  }, [deleteTask])

  const handleEdit = useCallback((task: Task) => {
    setEditTask(task)
    setTaskFormOpen(true)
  }, [])

  return (
    <div className="min-h-full pb-4">
      <TopBar />

      <div className="px-4 pt-4 space-y-4">
        {/* Quick stats */}
        {profile && (
          <div className="flex items-center justify-between">
            <LevelProgressBar totalXp={profile.xp} />
            <StreakFlame streak={profile.current_streak} size="sm" />
          </div>
        )}

        {/* Quick add */}
        <QuickAddTask onAdded={() => {}} />

        {/* Today stats */}
        {profile && (
          <div className="flex items-center justify-between text-sm">
            <h2 className="text-slate-200 font-semibold flex items-center gap-2">
              <Sword size={16} className="text-indigo-400" />
              今日任务
            </h2>
            <span className="text-slate-500 text-xs">
              {completedToday.length}/{todayTasks.length} 完成
            </span>
          </div>
        )}

        {/* Pending tasks */}
        <div className="space-y-2">
          <AnimatePresence>
            {pendingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </AnimatePresence>

          {!isLoading && pendingTasks.length === 0 && completedToday.length === 0 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <span className="text-4xl">🗡️</span>
              </div>
              <h2 className="text-white font-bold text-lg mb-1">准备好冒险了吗？</h2>
              <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                在下方输入你的第一个任务，开启勇士之旅！<br />
                每完成一个任务都会获得经验和金币
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['🏃 跑步 30 分钟', '📖 读书 20 页', '💧 喝 8 杯水', '🧹 整理房间'].map((tip) => (
                  <button
                    key={tip}
                    onClick={() => {
                      const input = document.querySelector<HTMLInputElement>('.quick-add-input')
                      if (input) {
                        input.value = tip
                        input.focus()
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs hover:border-indigo-500/50 hover:text-indigo-400 transition-all"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isLoading && pendingTasks.length === 0 && completedToday.length > 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-2xl">🎉</span>
              </div>
              <p className="text-emerald-400 font-medium">全部完成！干得漂亮！</p>
              <p className="text-slate-500 text-sm mt-1">今天的任务都搞定了</p>
            </div>
          )}
        </div>

        {/* Completed tasks (collapsed) */}
        {completedToday.length > 0 && pendingTasks.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <h3 className="text-xs text-slate-500 font-medium mb-2">
              已完成 ({completedToday.length})
            </h3>
            <div className="space-y-1 opacity-60">
              {completedToday.slice(0, 3).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => {}}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAB for adding tasks */}
      <button
        onClick={() => { setEditTask(null); setTaskFormOpen(true) }}
        className="fixed bottom-24 right-4 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {/* Modals */}
      <TaskForm
        open={taskFormOpen}
        onClose={() => { setTaskFormOpen(false); setEditTask(null) }}
        onSaved={() => {}}
        task={editTask}
      />

      {xpOrb && (
        <XPOrb
          xp={xpOrb.xp}
          gold={xpOrb.gold}
          critical={xpOrb.critical}
          onComplete={() => setXpOrb(null)}
        />
      )}

      {levelUp && (
        <LevelUpModal
          open={!!levelUp}
          newLevel={levelUp.level}
          newTitle={levelUp.title}
          onClose={() => setLevelUp(null)}
        />
      )}

      {achievementQueue.map((a, i) => (
        <AchievementToast
          key={a.id}
          name={a.name}
          onComplete={() => setAchievementQueue((prev) => prev.filter((x) => x.id !== a.id))}
        />
      ))}
    </div>
  )
}
