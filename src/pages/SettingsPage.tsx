import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Moon, Sun, Palette } from 'lucide-react'
import { cn } from '../lib/utils'

export function SettingsPage() {
  const navigate = useNavigate()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  return (
    <div className="min-h-full pb-4">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/50">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-white">设置</h1>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* Theme */}
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-xs text-slate-500 font-medium">外观</p>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 p-4 hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Moon size={18} className="text-indigo-400" />
            ) : (
              <Sun size={18} className="text-amber-400" />
            )}
            <span className="text-sm text-slate-300 flex-1 text-left">主题</span>
            <span className="text-xs text-slate-500">
              {theme === 'dark' ? '深色' : '浅色'}
            </span>
          </button>
        </div>

        {/* About */}
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-xs text-slate-500 font-medium">关于</p>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Palette size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Quest Board</p>
                <p className="text-xs text-slate-500">v1.0.0 · 游戏化任务管理</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
              完成任务，获得经验，升级你的冒险者！<br />
              连击不断，解锁成就，成为传奇勇士！
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
