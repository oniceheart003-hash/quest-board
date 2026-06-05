import { Outlet } from 'react-router-dom'
import { BottomTabBar } from './BottomTabBar'
import { Toaster } from 'react-hot-toast'

export function AppLayout() {
  return (
    <div className="h-full flex flex-col bg-slate-950">
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-lg mx-auto">
          <Outlet />
        </div>
      </main>
      <BottomTabBar />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </div>
  )
}
