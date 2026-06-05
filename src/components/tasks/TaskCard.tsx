import { motion } from 'framer-motion'
import { Check, Trash2, Edit3, Clock, Coins, Zap } from 'lucide-react'
import { cn } from '../../lib/utils'
import { DifficultyBadge } from '../gamification/DifficultyBadge'
import type { Task } from '../../types/database'

interface TaskCardProps {
  task: Task
  onComplete: (task: Task) => void
  onDelete: (task: Task) => void
  onEdit: (task: Task) => void
}

export function TaskCard({ task, onComplete, onDelete, onEdit }: TaskCardProps) {
  const isCompleted = task.status === 'completed'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        'group relative bg-slate-900 border border-slate-800 rounded-2xl p-4 transition-all duration-200',
        'active:scale-[0.98]',
        isCompleted && 'opacity-50 border-slate-800/50'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Complete button */}
        <button
          onClick={() => !isCompleted && onComplete(task)}
          className={cn(
            'w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
            isCompleted
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-slate-600 hover:border-emerald-400 hover:bg-emerald-500/10'
          )}
        >
          {isCompleted && <Check size={14} className="text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <DifficultyBadge difficulty={task.difficulty} />
            {task.due_date && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Clock size={10} />
                {new Date(task.due_date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          <p className={cn(
            'text-sm font-medium',
            isCompleted ? 'text-slate-500 line-through' : 'text-white'
          )}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-[10px] text-indigo-400">
              <Zap size={10} />+{task.xp_reward} XP
            </span>
            <span className="flex items-center gap-1 text-[10px] text-amber-400">
              <Coins size={10} />+{task.gold_reward} G
            </span>
          </div>
        </div>

        {/* Actions */}
        {!isCompleted && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(task)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
