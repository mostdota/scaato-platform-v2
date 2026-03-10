'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bike, CreditCard, Zap, FileText, Check, Loader2,
  Copy, ExternalLink, AlertCircle, ChevronRight, ArrowLeft
} from 'lucide-react'
import { formatCurrency } from '@/utils'

type Method = 'PIX' | 'BOLETO' | 'CREDIT_CARD'
type Step = 'choose' | 'payment' | 'contract' | 'done'

interface PaymentData {
  paymentId: string
  method: Method
  value: number
  dueDate: string
  pixQrCodeImage?: string
  pixQrCodePayload?: string
  bankSlipUrl?: string
  invoiceUrl?: string
}

const SCOOTER = {
  model: 'SCAATO Urban 100',
  price: 4500,
  specs: { maxSpeed: '65 km/h', range: '100 km', motor: '2000W', charging: '4-6h' },
  description: 'Scooter elétrica urbana de alta performance com motor de 2000W e autonomia de até 100km.',
}

export default function BuyPage() {
  const [step, setStep]         = useState<Step>('choose')
  const [method, setMethod]     = useState<Method>('PIX')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [payment, setPayment]   = useState<PaymentData | null>(null)
  const [copied, setCopied]     = useState(false)
  const router = useRouter()

  async function createPayment() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, scooterId: 'default' }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Erro ao criar cobrança')
      setPayment(data.data)
      setStep('payment')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function copyPix() {
    if (!payment?.pix_qr_code_payload) return
    navigator.clipboard.writeText(payment.pix_qr_code_payload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-full bg-[#0a0a0a] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Adquirir Scooter</h1>
            <p className="text-sm text-[#666]">Processo 100% digital e seguro</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {(['choose', 'payment', 'contract', 'done'] as Step[]).map((s, i) => {
            const labels = ['Escolha', 'Pagamento', 'Contrato', 'Concluído']
            const current = ['choose', 'payment', 'contract', 'done'].indexOf(step)
            const active = i === current
            const done = i < current
            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-1.5 ${done || active ? 'text-[#1DB954]' : 'text-[#444]'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    done   ? 'bg-[#1DB954] border-[#1DB954] text-black' :
                    active ? 'border-[#1DB954] text-[#1DB954]' :
                             'border-[#2a2a2a] text-[#444]'
                  }`}>
                    {done ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="hidden sm:block text-xs font-medium">{labels[i]}</span>
                </div>
                {i < 3 && <div className={`flex-1 h-px mx-2 ${done ? 'bg-[#1DB954]' : 'bg-[#1e1e1e]'}`} />}
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP: CHOOSE */}
          {step === 'choose' && (
            <motion.div key="choose" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
              {/* Scooter card */}
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-[#1DB954]/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Bike className="w-8 h-8 text-[#1DB954]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{SCOOTER.model}</h2>
                    <p className="text-[#666] text-sm mt-1 mb-4">{SCOOTER.description}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.entries(SCOOTER.specs).map(([k, v]) => (
                        <div key={k} className="bg-[#1a1a1a] rounded-lg p-2.5 text-center">
                          <div className="text-sm font-bold font-mono text-[#f0f0f0]">{v}</div>
                          <div className="text-xs text-[#555] capitalize">{k === 'maxSpeed' ? 'Vel. Max' : k === 'range' ? 'Autonomia' : k === 'motor' ? 'Motor' : 'Carga'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#1e1e1e] flex items-center justify-between">
                  <span className="text-[#666] text-sm">Valor total</span>
                  <span className="text-3xl font-bold text-[#1DB954] font-mono">{formatCurrency(SCOOTER.price)}</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Forma de Pagamento</h3>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { id: 'PIX',         label: 'PIX',          icon: Zap,        desc: 'Aprovação imediata' },
                    { id: 'BOLETO',      label: 'Boleto',       icon: FileText,   desc: 'Vence em 3 dias' },
                    { id: 'CREDIT_CARD', label: 'Cartão',       icon: CreditCard, desc: 'Aprovação rápida' },
                  ] as const).map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id as Method)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        method === m.id
                          ? 'border-[#1DB954] bg-[#1DB954]/5'
                          : 'border-[#2a2a2a] bg-[#141414] hover:border-[#333]'
                      }`}
                    >
                      <m.icon className={`w-5 h-5 mb-2 ${method === m.id ? 'text-[#1DB954]' : 'text-[#555]'}`} />
                      <div className="text-sm font-semibold">{m.label}</div>
                      <div className="text-xs text-[#555] mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button onClick={createPayment} disabled={loading} className="btn btn-primary w-full btn-lg">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
                  Gerar Cobrança <ChevronRight className="w-5 h-5" />
                </>}
              </button>
            </motion.div>
          )}

          {/* STEP: PAYMENT */}
          {step === 'payment' && payment && (
            <motion.div key="payment" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
              <div className="card p-6 text-center">
                <div className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <Clock className="w-4 h-4" />
                  Aguardando pagamento
                </div>
                <div className="text-4xl font-bold font-mono mb-1">{formatCurrency(payment.value)}</div>
                <div className="text-[#555] text-sm mb-6">Vencimento: {new Date(payment.due_date).toLocaleDateString('pt-BR')}</div>

                {/* PIX */}
                {payment.method === 'PIX' && payment.pix_qr_code_image && (
                  <div className="space-y-4">
                    <img src={`data:image/png;base64,${payment.pix_qr_code_image}`} alt="QR Code PIX" className="w-52 h-52 mx-auto rounded-xl" />
                    {payment.pix_qr_code_payload && (
                      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
                        <div className="text-xs text-[#555] mb-2">Copia e Cola</div>
                        <div className="text-xs font-mono text-[#888] break-all line-clamp-2 mb-3">{payment.pix_qr_code_payload}</div>
                        <button onClick={copyPix} className={`btn w-full ${copied ? 'btn-secondary' : 'btn-primary'} btn-sm`}>
                          {copied ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar código</>}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Boleto */}
                {payment.method === 'BOLETO' && payment.bank_slip_url && (
                  <a href={payment.bank_slip_url} target="_blank" rel="noreferrer" className="btn btn-primary w-full">
                    <ExternalLink className="w-4 h-4" /> Abrir Boleto
                  </a>
                )}

                {/* Cartão */}
                {payment.method === 'CREDIT_CARD' && payment.invoice_url && (
                  <a href={payment.invoice_url} target="_blank" rel="noreferrer" className="btn btn-primary w-full">
                    <ExternalLink className="w-4 h-4" /> Pagar com Cartão
                  </a>
                )}
              </div>

              <div className="card p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1DB954]/20 flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-3 h-3 text-[#1DB954]" />
                  </div>
                  <p className="text-sm text-[#666]">Após o pagamento ser confirmado, seu contrato será gerado automaticamente.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1DB954]/20 flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-3 h-3 text-[#1DB954]" />
                  </div>
                  <p className="text-sm text-[#666]">Você receberá um e-mail para assinar o contrato digitalmente.</p>
                </div>
              </div>

              <button onClick={() => router.push('/participant/dashboard')} className="btn btn-secondary w-full">
                Voltar ao painel
              </button>
            </motion.div>
          )}

          {/* STEP: DONE */}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-10 text-center">
              <div className="w-16 h-16 bg-[#1DB954]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Check className="w-8 h-8 text-[#1DB954]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Pedido realizado!</h2>
              <p className="text-[#666] mb-6">Seu pedido foi registrado com sucesso. Acompanhe o status no painel.</p>
              <button onClick={() => router.push('/participant/dashboard')} className="btn btn-primary mx-auto">
                Ir ao painel <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Missing import fix
function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}
