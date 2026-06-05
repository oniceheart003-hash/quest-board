import { Sword } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
        {icon || <Sword size={32} className="text-slate-500" />}
      </div>
      <h3 className="text-slate-300 font-medium text-lg mb-1">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
