import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface StreakFlameProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
}

export function StreakFlame({ streak, size = 'md' }: StreakFlameProps) {
  const isOnFire = streak >= 7

  return (
    <motion.div
      animate={isOnFire ? { scale: [1, 1.1, 1] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
      className={cn(
        'flex items-center gap-1.5 rounded-full font-bold',
        {
          'text-slate-500': streak === 0,
          'text-orange-400': streak > 0 && streak < 7,
          'text-orange-500': isOnFire && streak < 30,
          'text-red-400': streak >= 30,
        },
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
          'px-4 py-1.5 text-base': size === 'lg',
        },
        streak > 0 && 'bg-orange-500/10'
      )}
    >
      <Flame
        size={size === 'sm' ? 14 : size === 'md' ? 18 : 22}
        className={cn(
          isOnFire && 'drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]'
        )}
        fill={streak > 0 ? 'currentColor' : 'none'}
      />
      <span>{streak} 天</span>
    </motion.div>
  )
}
