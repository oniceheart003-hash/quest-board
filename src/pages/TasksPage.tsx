import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Search, Filter, Plus } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { TaskCard } from '../components/tasks/TaskCard'
import { TaskForm } from '../components/tasks/TaskForm'
import { XPOrb } from '../components/gamification/XPOrb'
import { LevelUpModal } from '../components/gamification/LevelUpModal'
import { AchievementToast } from '../components/gamification/AchievementToast'
import { EmptyState } from '../components/ui/EmptyState'
import { Badge } from '../components/ui/Badge'
import { useTasks } from '../features/tasks/hooks/useTasks'
import type { Task, TaskStatus, CompleteTaskResult } from '../types/database'

const filters: { label: string; value: TaskStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '待完成', value: 'pending' },
  { label: '已完成', value: 'completed' },
]

export function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('pending')
  const { tasks, completeTask, deleteTask } = useTasks(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  )
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  const [xpOrb, setXpOrb] = useState<{ xp: number; gold: number; critical: boolean } | null>(null)
  const [levelUp, setLevelUp] = useState<{ level: number; title: string } | null>(null)
  const [achievementQueue, setAchievementQueue] = useState<{ id: string; name: string }[]>([])

  const handleComplete = useCallback(async (task: Task) => {
    try {
      const result = await completeTask(task.id) as unknown as CompleteTaskResult
      setXpOrb({ xp: result.final_xp, gold: result.final_gold, critical: result.critical_hit })
      if (result.leveled_up) {
        setTimeout(() => setLevelUp({ level: result.new_level, title: result.new_title }), 500)
      }
      if (result.unlocked_achievements?.length) {
        result.unlocked_achievements.forEach((a, i) => {
          setTimeout(() => setAchievementQueue((prev) => [...prev, a]), 1500 + i * 500)
        })
      }
    } catch (err) {
      console.error('Complete task failed:', err)
    }
  }, [completeTask])

  return (
    <div className="min-h-full pb-4">
      <TopBar title="任务" showStats={false} />

      <div className="px-4 pt-4 space-y-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === value
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-slate-800 text-slate-400 border border-transparent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-2">
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onDelete={(t) => deleteTask(t.id)}
                onEdit={(t) => { setEditTask(t); setTaskFormOpen(true) }}
              />
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <EmptyState
              title={
                statusFilter === 'completed'
                  ? '还没有完成任何任务'
                  : '没有待办任务'
              }
              description={
                statusFilter === 'completed'
                  ? '完成任务后它们会出现在这里'
                  : '点击下方按钮添加新任务'
              }
              action={
                <button
                  onClick={() => { setEditTask(null); setTaskFormOpen(true) }}
                  className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium"
                >
                  创建任务
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditTask(null); setTaskFormOpen(true) }}
        className="fixed bottom-24 right-4 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      <TaskForm
        open={taskFormOpen}
        onClose={() => { setTaskFormOpen(false); setEditTask(null) }}
        onSaved={() => {}}
        task={editTask}
      />

      {xpOrb && (
        <XPOrb xp={xpOrb.xp} gold={xpOrb.gold} critical={xpOrb.critical} onComplete={() => setXpOrb(null)} />
      )}
      {levelUp && (
        <LevelUpModal open={!!levelUp} newLevel={levelUp.level} newTitle={levelUp.title} onClose={() => setLevelUp(null)} />
      )}
      {achievementQueue.map((a) => (
        <AchievementToast key={a.id} name={a.name} onComplete={() => setAchievementQueue((prev) => prev.filter((x) => x.id !== a.id))} />
      ))}
    </div>
  )
}
