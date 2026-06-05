import { ProgressBar } from './ProgressBar'
import { xpForLevel, xpProgress } from '../../lib/gamification'
import { Zap } from 'lucide-react'

interface LevelProgressBarProps {
  totalXp: number
}

export function LevelProgressBar({ totalXp }: LevelProgressBarProps) {
  const { currentLevel, currentLevelXp, nextLevelXp, progress } = xpProgress(totalXp)
  const remaining = nextLevelXp - totalXp

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Zap size={14} className="text-indigo-400" />
          <span className="text-xs font-medium text-slate-300">
            Lv.{currentLevel} → Lv.{currentLevel + 1}
          </span>
        </div>
        <span className="text-[10px] text-slate-500">
          {remaining} XP to next level
        </span>
      </div>
      <ProgressBar value={progress} color="from-indigo-400 to-purple-400" />
    </div>
  )
}
