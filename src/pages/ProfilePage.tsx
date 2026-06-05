import { TopBar } from '../components/layout/TopBar'
import { LevelBadge } from '../components/gamification/LevelBadge'
import { LevelProgressBar } from '../components/gamification/LevelProgressBar'
import { StreakFlame } from '../components/gamification/StreakFlame'
import { useProfile } from '../features/profile/hooks/useProfile'
import { useAchievements } from '../features/achievements/hooks/useAchievements'
import { useAuthStore } from '../store/auth'
import { formatGold } from '../lib/utils'
import { xpForLevel, xpProgress } from '../lib/gamification'
import {
  Zap, Coins, Target, Flame, Trophy, Settings, LogOut
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function ProfilePage() {
  const { profile } = useProfile()
  const { unlockedCount, totalCount } = useAchievements()
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const progressData = profile ? xpProgress(profile.xp) : null

  return (
    <div className="min-h-full pb-4">
      <TopBar title="我的" showStats={false} />

      {profile && (
        <div className="px-4 pt-4 space-y-4">
          {/* Character card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 text-center">
            <div className="mx-auto mb-3">
              <LevelBadge level={profile.level} size="md" />
            </div>
            <h2 className="text-lg font-bold text-white">{profile.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.email}
            </p>
            <div className="mt-4">
              <LevelProgressBar totalXp={profile.xp} />
            </div>
            <div className="flex items-center justify-center mt-3">
              <StreakFlame streak={profile.current_streak} size="sm" />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Zap size={18} className="text-indigo-400" />}
              label="总经验"
              value={profile.xp.toString()}
              color="indigo"
            />
            <StatCard
              icon={<Coins size={18} className="text-amber-400" />}
              label="金币"
              value={formatGold(profile.gold)}
              color="amber"
            />
            <StatCard
              icon={<Target size={18} className="text-emerald-400" />}
              label="完成任务"
              value={profile.total_tasks_completed.toString()}
              color="emerald"
            />
            <StatCard
              icon={<Flame size={18} className="text-orange-400" />}
              label="最长连击"
              value={`${profile.longest_streak} 天`}
              color="orange"
            />
          </div>

          {/* Achievement preview */}
          <button
            onClick={() => navigate('/achievements')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Trophy size={20} className="text-amber-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white">成就</p>
              <p className="text-xs text-slate-500">
                {unlockedCount}/{totalCount} 已解锁
              </p>
            </div>
            <span className="text-slate-600">→</span>
          </button>

          {/* Settings + Logout */}
          <div className="space-y-1">
            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              <Settings size={18} className="text-slate-400" />
              <span className="text-sm text-slate-300">设置</span>
            </button>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={18} className="text-red-400" />
              <span className="text-sm text-red-400">退出登录</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className={`p-4 rounded-2xl bg-slate-800/50 border border-slate-700`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  )
}
