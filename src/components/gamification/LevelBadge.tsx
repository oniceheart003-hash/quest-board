import { cn } from '../../lib/utils'

interface LevelBadgeProps {
  level: number
  size?: 'sm' | 'md'
}

export function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-lg shadow-indigo-500/25',
        size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-10 h-10 text-xs'
      )}
    >
      <span className="relative z-10">{level}</span>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
    </div>
  )
}
