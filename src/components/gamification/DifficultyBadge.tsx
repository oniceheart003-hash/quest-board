import { cn } from '../../lib/utils'
import type { TaskDifficulty } from '../../types/database'

interface DifficultyBadgeProps {
  difficulty: TaskDifficulty
}

const config: Record<TaskDifficulty, { label: string; className: string }> = {
  easy: { label: '简单', className: 'bg-emerald-500/20 text-emerald-400' },
  medium: { label: '普通', className: 'bg-amber-500/20 text-amber-400' },
  hard: { label: '困难', className: 'bg-orange-500/20 text-orange-400' },
  epic: { label: '史诗', className: 'bg-purple-500/20 text-purple-400' },
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const { label, className } = config[difficulty]
  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium', className)}>
      {label}
    </span>
  )
}
