import { useProfileStore } from '../../store/profile'
import { useAuthStore } from '../../store/auth'
import { LevelBadge } from '../gamification/LevelBadge'
import { Coins, Zap, LogOut } from 'lucide-react'
import { formatGold } from '../../lib/utils'
import { cn } from '../../lib/utils'
import { useState } from 'react'
import { Button } from '../ui/Button'

interface TopBarProps {
  title?: string
  showStats?: boolean
}

export function TopBar({ title, showStats = true }: TopBarProps) {
  const { profile } = useProfileStore()
  const { signOut } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!profile && !title) return null

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/50">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {title ? (
            <h1 className="text-lg font-bold text-white">{title}</h1>
          ) : (
            <>
              <LevelBadge level={profile?.level || 1} />
              <div>
                <p className="text-sm font-semibold text-white leading-tight">
                  {profile?.title || '冒险者'}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Lv.{profile?.level || 1}
                </p>
              </div>
            </>
          )}
        </div>

        {showStats && profile && (
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
              'bg-indigo-500/10 text-indigo-400'
            )}>
              <Zap size={14} />
              <span>{profile.xp} XP</span>
            </div>
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
              'bg-amber-500/10 text-amber-400'
            )}>
              <Coins size={14} />
              <span>{formatGold(profile.gold)}</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <span className="text-xs font-bold">
                  {profile.display_name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                    <button
                      onClick={() => { signOut(); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                    >
                      <LogOut size={14} />
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
