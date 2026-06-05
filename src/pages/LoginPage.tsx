import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthForm } from '../features/auth/components/AuthForm'
import { isLocalMode } from '../lib/api'

export function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (isLocalMode) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  if (isLocalMode) return null

  return (
    <div className="h-full flex items-center justify-center bg-slate-950">
      <AuthForm />
    </div>
  )
}
