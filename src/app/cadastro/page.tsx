'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ArrowLeft, ArrowRight, Loader2, Eye, EyeOff, Check, User, MapPin, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { maskCPF, maskPhone, maskCEP } from '@/utils'

const schema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  cpf: z.string().min(14, 'CPF inválido'),
  rg: z.string().min(5, 'RG inválido'),
  phone: z.string().min(14, 'Telefone inválido'),
  address: z.string().min(5, 'Endereço inválido'),
  city: z.string().min(2, 'Cidade inválida'),
  state: z.string().length(2, 'UF inválida'),
  zipCode: z.string().min(9, 'CEP inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
  terms: z.boolean().refine(v => v === true, 'Aceite os termos'),
}).refine(d => d.password === d.confirmPassword, { message: 'Senhas não coincidem', path: ['confirmPassword'] })

type FormData = z.infer<typeof schema>

const STEPS = [
  { id: 'personal', label: 'Dados Pessoais', icon: User },
  { id: 'address',  label: 'Endereço',       icon: MapPin },
  { id: 'security', label: 'Segurança',       icon: Lock },
]

function InputField({ label, error, ...props }: any) {
  return (
    <div>
      <label className="label">{label}</label>
      <input {...props} className="input" />
      {error && <p className="text-xs mt-1" style={{ color: '#FF453A' }}>{error}</p>}
    </div>
  )
}

function CadastroForm() {
  const [step, setStep] = useState(0)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  const { register, handleSubmit, trigger, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { referralCode: params.get('ref') || '' },
  })

  async function nextStep() {
    const fields: (keyof FormData)[][] = [
      ['name', 'email', 'cpf', 'rg', 'phone'],
      ['address', 'city', 'state', 'zipCode'],
      ['password', 'confirmPassword', 'terms'],
    ]
    const valid = await trigger(fields[step])
    if (valid) setStep(s => s + 1)
  }

  async function onSubmit(data: FormData) {
    setServerError('')
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name, cpf: data.cpf.replace(/\D/g, ''), rg: data.rg,
          phone: data.phone.replace(/\D/g, ''), address: data.address,
          city: data.city, state: data.state.toUpperCase(),
          zip_code: data.zipCode.replace(/\D/g, ''), referral_code: data.referralCode || '',
        }
      }
    })
    if (error) { setServerError(error.message); return }
    router.push('/participant/dashboard')
  }

  const C = 'var(--blue, #0A84FF)'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#050505' }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(10,132,255,0.06) 0%, transparent 70%)' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0A84FF' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '0.1em', color: '#F5F7FA' }}>SCAATO</span>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{ background: i < step ? '#34C759' : i === step ? '#0A84FF' : 'rgba(255,255,255,0.06)', color: i <= step ? '#fff' : '#8A8A8E' }}>
                    {i < step ? <Check className="w-3.5 h-3.5" /> : String(i + 1)}
                  </div>
                  <span className="text-xs font-medium hidden sm:block" style={{ color: i === step ? '#F5F7FA' : '#8A8A8E' }}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px" style={{ background: i < step ? '#34C759' : 'rgba(255,255,255,0.08)' }} />
                )}
              </div>
            ))}
          </div>

          <h1 className="mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '26px', letterSpacing: '0.05em', color: '#F5F7FA' }}>
            {STEPS[step].label}
          </h1>
          <p className="text-sm mb-6" style={{ color: '#8A8A8E' }}>
            {step === 0 ? 'Seus dados de identificação' : step === 1 ? 'Para entrega da scooter' : 'Crie sua senha segura'}
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <InputField label="Nome Completo" placeholder="Seu nome completo" error={errors.name?.message} {...register('name')} />
                  <InputField label="E-mail" type="email" placeholder="seu@email.com" error={errors.email?.message} {...register('email')} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="CPF" placeholder="000.000.000-00" error={errors.cpf?.message}
                      {...register('cpf', { onChange: e => setValue('cpf', maskCPF(e.target.value)) })} />
                    <InputField label="RG" placeholder="0000000" error={errors.rg?.message} {...register('rg')} />
                  </div>
                  <InputField label="Telefone / WhatsApp" placeholder="(11) 99999-9999" error={errors.phone?.message}
                    {...register('phone', { onChange: e => setValue('phone', maskPhone(e.target.value)) })} />
                </motion.div>
              )}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <InputField label="Endereço Completo" placeholder="Rua, número, complemento" error={errors.address?.message} {...register('address')} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Cidade" placeholder="São Paulo" error={errors.city?.message} {...register('city')} />
                    <InputField label="UF" placeholder="SP" maxLength={2} error={errors.state?.message}
                      {...register('state', { onChange: e => setValue('state', e.target.value.toUpperCase()) })} />
                  </div>
                  <InputField label="CEP" placeholder="00000-000" error={errors.zipCode?.message}
                    {...register('zipCode', { onChange: e => setValue('zipCode', maskCEP(e.target.value)) })} />
                  <InputField label="Código de Indicação (opcional)" placeholder="CODIGO123" error={errors.referralCode?.message} {...register('referralCode')} />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <label className="label">Senha</label>
                    <div className="relative">
                      <input {...register('password')} type={showPass ? 'text' : 'password'} className="input pr-12" placeholder="Mínimo 8 caracteres" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#8A8A8E' }}>
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs mt-1" style={{ color: '#FF453A' }}>{errors.password.message}</p>}
                  </div>
                  <div>
                    <label className="label">Confirmar Senha</label>
                    <div className="relative">
                      <input {...register('confirmPassword')} type={showConfirm ? 'text' : 'password'} className="input pr-12" placeholder="Repita a senha" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#8A8A8E' }}>
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: '#FF453A' }}>{errors.confirmPassword.message}</p>}
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input type="checkbox" {...register('terms')} className="sr-only" />
                      <div className="w-4 h-4 rounded flex items-center justify-center transition-all"
                        style={{ background: watch('terms') ? '#0A84FF' : 'transparent', border: `1px solid ${watch('terms') ? '#0A84FF' : 'rgba(255,255,255,0.2)'}` }}>
                        {watch('terms') && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </div>
                    <span className="text-xs leading-relaxed" style={{ color: '#8A8A8E' }}>
                      Aceito os <span style={{ color: '#0A84FF' }}>Termos de Uso</span> e a <span style={{ color: '#0A84FF' }}>Política de Privacidade</span> da SCAATO
                    </span>
                  </label>
                  {errors.terms && <p className="text-xs" style={{ color: '#FF453A' }}>{errors.terms.message}</p>}
                  {serverError && (
                    <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', color: '#FF453A' }}>
                      {serverError}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#F5F7FA', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={nextStep}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: '#0A84FF', color: '#fff' }}>
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: isSubmitting ? 'rgba(10,132,255,0.5)' : '#0A84FF', color: '#fff' }}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Criar Conta <ArrowRight className="w-4 h-4" /></>}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mt-6 text-center text-sm" style={{ color: '#8A8A8E' }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: '#0A84FF' }} className="font-semibold">Entrar</Link>
        </div>
        <Link href="/" className="flex items-center gap-2 justify-center mt-4 text-sm transition-colors" style={{ color: '#8A8A8E' }}>
          <ArrowLeft className="w-4 h-4" /> Voltar ao início
        </Link>
      </motion.div>
    </div>
  )
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: '#050505' }} />}>
      <CadastroForm />
    </Suspense>
  )
}
