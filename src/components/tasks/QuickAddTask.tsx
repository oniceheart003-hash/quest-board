import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../ui/Button'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import { getXpReward, getGoldReward } from '../../lib/gamification'
import type { TaskDifficulty } from '../../types/database'

interface QuickAddTaskProps {
  onAdded: () => void
}

export function QuickAddTask({ onAdded }: QuickAddTaskProps) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('medium')
  const { user } = useAuthStore()

  const handleAdd = async () => {
    if (!title.trim() || !user) return
    setLoading(true)

    try {
      await api.createTask({
        user_id: user.id,
        title: title.trim(),
        difficulty,
        xp_reward: getXpReward(difficulty),
        gold_reward: getGoldReward(difficulty),
        status: 'pending',
      })
      setTitle('')
      onAdded()
    } catch (err) {
      console.error('Add task failed:', err)
    }
    setLoading(false)
  }

  const difficulties: { value: TaskDifficulty; label: string }[] = [
    { value: 'easy', label: '简单' },
    { value: 'medium', label: '普通' },
    { value: 'hard', label: '困难' },
    { value: 'epic', label: '史诗' },
  ]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="添加一个新任务..."
          className="quick-add-input flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <Button onClick={handleAdd} loading={loading} size="md" className="flex-shrink-0">
          <Plus size={18} />
        </Button>
      </div>
      <div className="flex gap-1.5">
        {difficulties.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setDifficulty(value)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
              difficulty === value
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-slate-800 text-slate-500 border border-transparent hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
