'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
}).refine(d => d.password === d.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

const STEPS = [
  { id: 'personal', label: 'Pessoal', icon: User },
  { id: 'address',  label: 'Endereço', icon: MapPin },
  { id: 'security', label: 'Segurança', icon: Lock },
]

export default function CadastroPage() {
  const [step, setStep] = useState(0)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, trigger, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { terms: false },
  })

  const nextStep = async () => {
    const fieldsPerStep: (keyof FormData)[][] = [
      ['name', 'email', 'cpf', 'rg', 'phone'],
      ['address', 'city', 'state', 'zipCode'],
      ['password', 'confirmPassword', 'terms'],
    ]
    const valid = await trigger(fieldsPerStep[step])
    if (valid) setStep(s => s + 1)
  }

  async function onSubmit(data: FormData) {
    setServerError('')
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, role: 'CUSTOMER' },
      },
    })
    if (error) { setServerError(error.message); return }

    if (authData.user) {
      await supabase.from('profiles').update({
        name: data.name,
        cpf: data.cpf.replace(/\D/g, ''),
        rg: data.rg,
        phone: data.phone.replace(/\D/g, ''),
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode.replace(/\D/g, ''),
      }).eq('id', authData.user.id)
    }

    router.push('/participant/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#1DB954]/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-lg">SCAATO</span>
          </Link>
          <Link href="/login" className="text-sm text-[#555] hover:text-[#888] transition-colors">
            Já tenho conta
          </Link>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Criar conta</h1>
          <p className="text-sm text-[#666] mb-8">Adquira sua scooter elétrica hoje</p>

          {/* Steps indicator */}
          <div className="flex items-center mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-2 ${i <= step ? 'text-[#1DB954]' : 'text-[#444]'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    i < step  ? 'bg-[#1DB954] border-[#1DB954] text-black' :
                    i === step ? 'border-[#1DB954] text-[#1DB954]' :
                                 'border-[#2a2a2a] text-[#444]'
                  }`}>
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className="hidden sm:block text-xs font-medium">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-[#1DB954]' : 'bg-[#2a2a2a]'}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* STEP 0 — Dados pessoais */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <label className="label">Nome completo</label>
                    <input {...register('name')} className="input" placeholder="João da Silva" />
                    {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">E-mail</label>
                    <input {...register('email')} type="email" className="input" placeholder="joao@email.com" />
                    {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">CPF</label>
                      <input {...register('cpf')} className="input" placeholder="000.000.000-00"
                        onChange={e => setValue('cpf', maskCPF(e.target.value))} maxLength={14} />
                      {errors.cpf && <p className="text-xs text-red-400 mt-1">{errors.cpf.message}</p>}
                    </div>
                    <div>
                      <label className="label">RG</label>
                      <input {...register('rg')} className="input" placeholder="0000000-0" />
                      {errors.rg && <p className="text-xs text-red-400 mt-1">{errors.rg.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="label">Telefone</label>
                    <input {...register('phone')} className="input" placeholder="(11) 99999-9999"
                      onChange={e => setValue('phone', maskPhone(e.target.value))} maxLength={15} />
                    {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
                  </div>
                </motion.div>
              )}

              {/* STEP 1 — Endereço */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <label className="label">Endereço completo</label>
                    <input {...register('address')} className="input" placeholder="Rua das Flores, 123, Apto 4" />
                    {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address.message}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="label">Cidade</label>
                      <input {...register('city')} className="input" placeholder="São Paulo" />
                      {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="label">UF</label>
                      <input {...register('state')} className="input" placeholder="SP" maxLength={2}
                        onChange={e => setValue('state', e.target.value.toUpperCase())} />
                      {errors.state && <p className="text-xs text-red-400 mt-1">{errors.state.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="label">CEP</label>
                    <input {...register('zipCode')} className="input" placeholder="00000-000"
                      onChange={e => setValue('zipCode', maskCEP(e.target.value))} maxLength={9} />
                    {errors.zipCode && <p className="text-xs text-red-400 mt-1">{errors.zipCode.message}</p>}
                  </div>
                  <div>
                    <label className="label">Código de indicação (opcional)</label>
                    <input {...register('referralCode')} className="input" placeholder="XXYYZZ00"
                      onChange={e => setValue('referralCode', e.target.value.toUpperCase())} />
                  </div>
                </motion.div>
              )}

              {/* STEP 2 — Segurança */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <label className="label">Senha</label>
                    <div className="relative">
                      <input {...register('password')} type={showPass ? 'text' : 'password'} className="input pr-12" placeholder="Mínimo 8 caracteres" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555]">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
                  </div>
                  <div>
                    <label className="label">Confirmar senha</label>
                    <div className="relative">
                      <input {...register('confirmPassword')} type={showConfirm ? 'text' : 'password'} className="input pr-12" placeholder="Repita a senha" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555]">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer mt-2">
                    <input type="checkbox" {...register('terms')} className="mt-0.5 accent-[#1DB954]" />
                    <span className="text-xs text-[#666]">
                      Concordo com os{' '}
                      <Link href="/legal" className="text-[#1DB954] hover:underline">Termos de Uso</Link>
                      {' '}e a{' '}
                      <Link href="/legal" className="text-[#1DB954] hover:underline">Política de Privacidade</Link>
                    </span>
                  </label>
                  {errors.terms && <p className="text-xs text-red-400">{errors.terms.message}</p>}
                  {serverError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                      {serverError}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button type="button" onClick={() => setStep(s => s - 1)} className="btn btn-secondary flex-1">
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={nextStep} className="btn btn-primary flex-1">
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Criar conta <Check className="w-4 h-4" /></>}
                </button>
              )}
            </div>
          </form>
        </div>

        <Link href="/" className="flex items-center gap-2 justify-center mt-6 text-sm text-[#555] hover:text-[#888] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao início
        </Link>
      </motion.div>
    </div>
  )
}
