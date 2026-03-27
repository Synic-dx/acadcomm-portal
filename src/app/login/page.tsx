'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.toLowerCase().endsWith('@iimidr.ac.in')) {
      setError('Only @iimidr.ac.in email addresses are allowed.')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (authError) {
      setError('Invalid email or password.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Branding */}
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            IIM Indore — IPM Programme
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            AcadComm Portal
          </h1>
          <p className="text-sm text-zinc-500">
            Sign in with your institute email to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@iimidr.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-10 rounded-lg border-zinc-200 bg-zinc-50 text-sm focus-visible:ring-zinc-900"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-10 rounded-lg border-zinc-200 bg-zinc-50 text-sm focus-visible:ring-zinc-900"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-xs text-zinc-400">
          Academic Committee · IPM 2025–30
        </p>
      </div>
    </div>
  )
}
