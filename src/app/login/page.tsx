'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, ArrowRight, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/participant/dashboard'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('E-mail ou senha incorretos'); setLoading(false); return }
    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#050505' }}>
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(10,132,255,0.05) 0%, transparent 70%)' }} />
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#0A84FF' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '0.12em', color: '#F5F7FA' }}>
            SCAATO
          </span>
        </Link>

        <div className="rounded-2xl p-8" style={{ background: 'rgba(28,28,30,0.8)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#0A84FF' }}>Urban 100</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '0.05em', color: '#F5F7FA', lineHeight: 1 }}>
              Bem-vindo de Volta
            </h1>
            <p className="text-sm mt-2" style={{ color: '#8A8A8E' }}>
              Acesse sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-12"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#8A8A8E' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#F5F7FA')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#8A8A8E')}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', color: '#FF453A' }}>
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all mt-2"
              style={{ background: loading ? 'rgba(10,132,255,0.5)' : '#0A84FF', color: '#fff' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0071e3' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0A84FF' }}>
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <> Entrar <ArrowRight className="w-4 h-4" /> </>}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-xs" style={{ color: '#8A8A8E' }}>ou</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <Link href="/cadastro"
            className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#F5F7FA', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
            Criar conta no Urban 100
          </Link>
        </div>

        <Link href="/" className="flex items-center gap-2 justify-center mt-6 text-sm transition-colors"
          style={{ color: '#8A8A8E' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#F5F7FA')}
          onMouseLeave={e => (e.currentTarget.style.color = '#8A8A8E')}>
          <ArrowLeft className="w-4 h-4" /> Voltar ao início
        </Link>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: '#050505' }} />}>
      <LoginForm />
    </Suspense>
  )
}
