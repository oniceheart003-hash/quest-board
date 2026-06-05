import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import { getXpReward, getGoldReward } from '../../lib/gamification'
import type { Task, TaskDifficulty } from '../../types/database'

interface TaskFormProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  task?: Task | null
}

export function TaskForm({ open, onClose, onSaved, task }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(task?.difficulty || 'medium')
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const isEdit = !!task

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !user) return
    setLoading(true)

    const payload = {
      title: title.trim(),
      description: description.trim(),
      difficulty,
      xp_reward: getXpReward(difficulty),
      gold_reward: getGoldReward(difficulty),
      due_date: dueDate || null,
    }

    try {
      if (isEdit) {
        await api.updateTask(task.id, payload)
      } else {
        await api.createTask({ ...payload, user_id: user.id, status: 'pending' })
      }
      onSaved()
      onClose()
    } catch (err) {
      console.error('Save task failed:', err)
    }
    setLoading(false)
  }

  const difficulties: { value: TaskDifficulty; label: string; xp: number; gold: number }[] = [
    { value: 'easy', label: '简单', xp: getXpReward('easy'), gold: getGoldReward('easy') },
    { value: 'medium', label: '普通', xp: getXpReward('medium'), gold: getGoldReward('medium') },
    { value: 'hard', label: '困难', xp: getXpReward('hard'), gold: getGoldReward('hard') },
    { value: 'epic', label: '史诗', xp: getXpReward('epic'), gold: getGoldReward('epic') },
  ]

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? '编辑任务' : '新任务'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="任务名称"
          placeholder="要做什么？"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">描述（可选）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="添加一些备注..."
            rows={2}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">难度</label>
          <div className="grid grid-cols-4 gap-2">
            {difficulties.map(({ value, label, xp, gold }) => (
              <button
                key={value}
                type="button"
                onClick={() => setDifficulty(value)}
                className={`flex flex-col items-center gap-0.5 p-2.5 rounded-xl border transition-all text-center ${
                  difficulty === value
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className="text-xs font-medium">{label}</span>
                <span className="text-[9px] opacity-70">{xp}XP / {gold}G</span>
              </button>
            ))}
          </div>
        </div>
        <Input
          label="截止日期（可选）"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          {isEdit ? '保存修改' : '创建任务'}
        </Button>
      </form>
    </Modal>
  )
}
