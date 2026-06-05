import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListTodo, Trophy, User } from 'lucide-react'
import { cn } from '../../lib/utils'

const tabs = [
  { to: '/', icon: LayoutDashboard, label: '主页' },
  { to: '/tasks', icon: ListTodo, label: '任务' },
  { to: '/achievements', icon: Trophy, label: '成就' },
  { to: '/profile', icon: User, label: '我的' },
]

export function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] rounded-xl transition-all duration-200',
                isActive
                  ? 'text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'relative p-1 rounded-lg transition-all duration-200',
                  isActive && 'bg-indigo-500/10'
                )}>
                  <Icon size={22} />
                  {isActive && (
                    <span className="absolute -top-0.5 right-0 w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                  )}
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
