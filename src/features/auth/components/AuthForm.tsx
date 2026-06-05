import { useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Sword, Sparkles } from 'lucide-react'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }, [email])

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center px-4">
        <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6">
          <Sparkles size={36} className="text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">魔法链接已发送！</h1>
        <p className="text-slate-400 mb-6 max-w-xs">
          一封带有登录链接的邮件已发送至 <span className="text-indigo-400 font-medium">{email}</span>
        </p>
        <p className="text-slate-500 text-sm">
          请检查收件箱（以及垃圾邮件箱），点击链接即可登录
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 text-indigo-400 text-sm hover:underline"
        >
          更换邮箱
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center px-4 w-full max-w-sm">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/25">
        <Sword size={36} className="text-white" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-1">Quest Board</h1>
      <p className="text-slate-400 text-sm mb-8">开启你的冒险之旅</p>

      <form onSubmit={handleLogin} className="w-full space-y-4">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="邮箱地址"
          error={error}
        />
        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
        >
          发送魔法链接
        </Button>
      </form>

      <p className="text-slate-600 text-xs mt-6 text-center">
        无需密码，输入邮箱即可登录
        <br />
        新用户将自动创建冒险者档案
      </p>
    </div>
  )
}
