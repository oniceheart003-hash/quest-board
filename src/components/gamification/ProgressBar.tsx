import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface ProgressBarProps {
  value: number // 0-100
  className?: string
  color?: string
  showLabel?: boolean
  label?: string
}

export function ProgressBar({
  value,
  className,
  color = 'from-indigo-500 to-purple-500',
  showLabel,
  label,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs mb-1">
          {label && <span className="text-slate-400">{label}</span>}
          {showLabel && <span className="text-slate-500">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          className={cn('h-full rounded-full bg-gradient-to-r', color)}
        />
      </div>
    </div>
  )
}
