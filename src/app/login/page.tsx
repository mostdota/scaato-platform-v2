'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const C = {
  bg: '#050505', blue: '#0A84FF', red: '#FF453A',
  text: '#F5F7FA', gray: '#8A8A8E', font: "'Bebas Neue', sans-serif"
}

function inp(): React.CSSProperties {
  return {
    width: '100%', background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: '14px 16px', color: '#F5F7FA', fontSize: 16,
    outline: 'none', boxSizing: 'border-box', WebkitAppearance: 'none'
  }
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/app/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password) { setError('Preencha e-mail e senha'); return }
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
      if (authErr) throw authErr
      router.push(redirect)
      router.refresh()
    } catch {
      setError('E-mail ou senha incorretos')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>S</span>
          </div>
          <span style={{ fontFamily: C.font, fontSize: 26, letterSpacing: 3, color: C.text }}>SCAATO</span>
        </Link>
      </div>

      <h1 style={{ fontFamily: C.font, fontSize: 36, color: C.text, letterSpacing: 1, marginBottom: 8 }}>Entrar</h1>
      <p style={{ color: C.gray, fontSize: 14, marginBottom: 32 }}>Acesse seu painel SCAATO</p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ color: C.gray, fontSize: 11, letterSpacing: 1, display: 'block', marginBottom: 6 }}>E-MAIL</label>
        <input
          style={inp()} type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
          inputMode="email" autoCapitalize="none"
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ color: C.gray, fontSize: 11, letterSpacing: 1, display: 'block', marginBottom: 6 }}>SENHA</label>
        <input
          style={inp()} type="password" value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Sua senha"
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
      </div>

      {error && (
        <div style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
          <p style={{ color: C.red, fontSize: 13, margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{ background: loading ? 'rgba(10,132,255,0.4)' : C.blue, border: 'none', borderRadius: 14, padding: 18, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', width: '100%' }}
      >
        {loading ? '⏳ Entrando...' : 'Entrar →'}
      </button>

      <p style={{ textAlign: 'center', marginTop: 24, color: C.gray, fontSize: 14 }}>
        Não tem conta?{' '}
        <Link href="/cadastro" style={{ color: C.blue, textDecoration: 'none', fontWeight: 600 }}>Criar conta</Link>
      </p>

      <style>{`* { -webkit-tap-highlight-color: transparent; } input { color-scheme: dark; }`}</style>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense fallback={<div style={{ background: '#050505', minHeight: '100vh' }} />}><LoginForm /></Suspense>
}
