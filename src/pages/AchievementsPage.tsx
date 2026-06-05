import { motion } from 'framer-motion'
import { Lock, Trophy } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { ProgressBar } from '../components/gamification/ProgressBar'
import { useAchievements } from '../features/achievements/hooks/useAchievements'
import { cn } from '../lib/utils'
import type { AchievementWithStatus } from '../types/database'
import * as LucideIcons from 'lucide-react'

function AchievementCard({ achievement }: { achievement: AchievementWithStatus }) {
  const { unlocked, name, description, icon, color, category } = achievement
  // Dynamic icon lookup (fallback to trophy)
  const IconComponent = (LucideIcons as Record<string, React.FC<{ size?: number }>>)[
    icon?.charAt(0).toUpperCase() + icon?.slice(1)
  ] || Trophy

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative p-4 rounded-2xl border transition-all',
        unlocked
          ? 'bg-slate-800/50 border-slate-700'
          : 'bg-slate-900 border-slate-800/50'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            unlocked
              ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20'
              : 'bg-slate-800'
          )}
          style={unlocked ? { color } : {}}
        >
          {unlocked ? (
            <IconComponent size={22} />
          ) : (
            <Lock size={18} className="text-slate-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'text-sm font-semibold',
                unlocked ? 'text-white' : 'text-slate-600'
              )}
            >
              {name}
            </h3>
            {category === 'secret' && !unlocked && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                隐藏
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
            {unlocked ? description : '???'}
          </p>
          {unlocked && achievement.xp_reward > 0 && (
            <p className="text-[10px] text-indigo-400 mt-1">
              +{achievement.xp_reward} XP
            </p>
          )}
        </div>
      </div>

      {unlocked && (
        <div className="absolute top-2 right-2">
          <Trophy size={14} className="text-amber-400" />
        </div>
      )}
    </motion.div>
  )
}

export function AchievementsPage() {
  const { achievements, unlockedCount, totalCount, isLoading } = useAchievements()

  const categories = [
    { key: 'milestone', label: '里程碑' },
    { key: 'streak', label: '连击' },
    { key: 'special', label: '特殊' },
    { key: 'secret', label: '秘密' },
  ]

  return (
    <div className="min-h-full pb-4">
      <TopBar title="成就" showStats={false} />

      <div className="px-4 pt-4 space-y-4">
        {/* Progress header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-400">成就进度</p>
              <p className="text-2xl font-black text-white">
                {unlockedCount}<span className="text-sm text-slate-500">/{totalCount}</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Trophy size={24} className="text-amber-400" />
            </div>
          </div>
          <ProgressBar
            value={totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}
            color="from-amber-400 to-orange-400"
          />
        </div>

        {/* Categories */}
        {categories.map(({ key, label }) => {
          const catAchievements = achievements.filter((a) => a.category === key)
          const catUnlocked = catAchievements.filter((a) => a.unlocked).length

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-300">{label}</h3>
                <span className="text-xs text-slate-500">
                  {catUnlocked}/{catAchievements.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {catAchievements.map((a) => (
                  <AchievementCard key={a.id} achievement={a} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
