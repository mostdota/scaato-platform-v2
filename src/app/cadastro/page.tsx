'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const C = {
  bg: '#050505', card: '#111', border: 'rgba(255,255,255,0.1)',
  blue: '#0A84FF', green: '#34C759', red: '#FF453A',
  text: '#F5F7FA', gray: '#8A8A8E', font: "'Bebas Neue', sans-serif"
}

function inp(extra = {}): React.CSSProperties {
  return {
    width: '100%', background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: '14px 16px', color: '#F5F7FA', fontSize: 16,
    outline: 'none', boxSizing: 'border-box', WebkitAppearance: 'none', ...extra
  }
}

function CadastroForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', cpf: '', phone: '',
    address: '', city: '', state: 'SP', zipCode: '',
    password: '', confirmPassword: '',
    referralCode: params.get('ref') || ''
  })

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function maskCPF(v: string) {
    return v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14)
  }
  function maskPhone(v: string) {
    return v.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15)
  }
  function maskCEP(v: string) {
    return v.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2').substring(0, 9)
  }

  async function handleSubmit() {
    if (form.password !== form.confirmPassword) { setError('Senhas não coincidem'); return }
    if (form.password.length < 8) { setError('Senha deve ter ao menos 8 caracteres'); return }
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            cpf: form.cpf.replace(/\D/g, ''),
            phone: form.phone,
            address: form.address,
            city: form.city,
            state: form.state,
            zip_code: form.zipCode.replace(/\D/g, ''),
            referral_code: form.referralCode,
          }
        }
      })
      if (authErr) throw authErr
      router.push('/app/onboarding')
    } catch (e: any) {
      setError(e.message?.includes('already registered') ? 'E-mail já cadastrado' : (e.message || 'Erro ao criar conta'))
    } finally { setLoading(false) }
  }

  const steps = [
    {
      title: 'Dados Pessoais', fields: (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: C.gray, fontSize: 11, letterSpacing: 1, display: 'block', marginBottom: 6 }}>NOME COMPLETO *</label>
            <input style={inp()} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Seu nome completo" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: C.gray, fontSize: 11, letterSpacing: 1, display: 'block', marginBottom: 6 }}>CPF *</label>
            <input style={inp()} value={form.cpf} onChange={e => set('cpf', maskCPF(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: C.gray, fontSize: 11, letterSpacing: 1, display: 'block', marginBottom: 6 }}>TELEFONE *</label>
            <input style={inp()} value={form.phone} onChange={e => set('phone', maskPhone(e.target.value))} placeholder="(16) 99999-9999" inputMode="tel" />
          </div>
        </>
      ),
      valid: () => form.name.length >= 3 && form.cpf.length >= 14 && form.phone.length >= 14
    },
    {
      title: 'Endereço', fields: (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: C.gray, fontSize: 11, letterSpacing: 1, display: 'block', marginBottom: 6 }}>CEP *</label>
            <input style={inp()} value={form.zipCode} onChange={e => set('zipCode', maskCEP(e.target.value))} placeholder="00000-000" inputMode="numeric" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: C.gray, fontSize: 11, letterSpacing: 1, display: 'block', marginBottom: 6 }}>ENDEREÇO *</label>
            <input style={inp()} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Rua, número, bairro" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10 }}>
            <div>
              <label style={{ color: C.gray, fontSize: 11, letterSpacing: 1, display: 'block', marginBottom: 6 }}>CIDADE *</label>
              <input style={inp()} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Sua cidade" />
            </div>
            <div>
              <label style={{ color: C.gray, fontSize: 11, letterSpacing: 1, display: 'block', marginBottom: 6 }}>UF</label>
              <select style={{ ...inp(), padding: '14px 8px' }} value={form.state} onChange={e => set('state', e.target.value)}>
                {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
        </>
      ),
      valid: () => form.zipCode.length >= 9 && form.address.length >= 5 && form.city.length >= 2
    },
    {
      title: 'Acesso', fields: (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: C.gray, fontSize: 11, letterSpacing: 1, display: 'block', marginBottom: 6 }}>E-MAIL *</label>
            <input style={inp()} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com" inputMode="email" autoCapitalize="none" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: C.gray, fontSize: 11, letterSpacing: 1, display: 'block', marginBottom: 6 }}>SENHA * (mín. 8 caracteres)</label>
            <input style={inp()} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Sua senha" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: C.gray, fontSize: 11, letterSpacing: 1, display: 'block', marginBottom: 6 }}>CONFIRMAR SENHA *</label>
            <input style={inp()} type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repita a senha" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: C.gray, fontSize: 11, letterSpacing: 1, display: 'block', marginBottom: 6 }}>CÓDIGO DE INDICAÇÃO (opcional)</label>
            <input style={inp()} value={form.referralCode} onChange={e => set('referralCode', e.target.value.toUpperCase())} placeholder="XXXXXXXX" autoCapitalize="characters" />
          </div>
        </>
      ),
      valid: () => form.email.includes('@') && form.password.length >= 8 && form.password === form.confirmPassword
    }
  ]

  const currentStep = steps[step]
  const progress = ((step + 1) / steps.length) * 100

  return (
    <div style={{ background: C.bg, minHeight: '100vh', maxWidth: 480, margin: '0 auto', padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>S</span>
          </div>
          <span style={{ fontFamily: C.font, fontSize: 20, letterSpacing: 2, color: C.text }}>SCAATO</span>
        </Link>
        <span style={{ color: C.gray, fontSize: 12 }}>{step + 1}/{steps.length}</span>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ height: 3, background: '#1C1C1E', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: C.blue, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 20px' }}>
        <h1 style={{ fontFamily: C.font, fontSize: 32, color: C.text, letterSpacing: 1, marginBottom: 6 }}>
          {currentStep.title}
        </h1>
        <p style={{ color: C.gray, fontSize: 13, marginBottom: 24 }}>
          {step === 0 && 'Precisamos dos seus dados para o contrato'}
          {step === 1 && 'Para calcular o quiosque mais próximo'}
          {step === 2 && 'Seu login no app SCAATO'}
        </p>

        {currentStep.fields}

        {error && (
          <div style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: 12, padding: '12px 16px', marginTop: 12 }}>
            <p style={{ color: C.red, fontSize: 13, margin: 0 }}>⚠️ {error}</p>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          {step > 0 && (
            <button
              onClick={() => { setStep(s => s - 1); setError('') }}
              style={{ flex: 1, background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 16, color: C.text, fontSize: 15, cursor: 'pointer' }}
            >
              ← Voltar
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => {
                if (!currentStep.valid()) { setError('Preencha todos os campos obrigatórios'); return }
                setError(''); setStep(s => s + 1)
              }}
              style={{ flex: 2, background: C.blue, border: 'none', borderRadius: 14, padding: 16, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              Próximo →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !currentStep.valid()}
              style={{ flex: 2, background: loading ? 'rgba(52,199,89,0.4)' : C.green, border: 'none', borderRadius: 14, padding: 16, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              {loading ? '⏳ Criando conta...' : '✓ Criar Conta'}
            </button>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: C.gray, fontSize: 13 }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: C.blue, textDecoration: 'none', fontWeight: 600 }}>Entrar</Link>
        </p>
      </div>
      <style>{`* { -webkit-tap-highlight-color: transparent; } input, select { color-scheme: dark; }`}</style>
    </div>
  )
}

export default function CadastroPage() {
  return <Suspense fallback={<div style={{ background: '#050505', minHeight: '100vh' }} />}><CadastroForm /></Suspense>
}
