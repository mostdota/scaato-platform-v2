'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Check, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import { formatCurrency } from '@/utils'
import type { Profile, Scooter } from '@/types'

interface Props { profile: Profile | null; scooters: Scooter[] }

const METHODS = [
  { id: 'PIX',    label: 'PIX',    desc: 'Aprovação imediata', icon: '⚡' },
  { id: 'BOLETO', label: 'Boleto', desc: 'Vencimento em 3 dias', icon: '🧾' },
  { id: 'CREDIT_CARD', label: 'Cartão', desc: 'Parcelado em até 12x', icon: '💳' },
]

export default function BuyClient({ profile, scooters }: Props) {
  const [selectedScooter, setSelectedScooter] = useState<Scooter | null>(scooters[0] || null)
  const [method, setMethod] = useState<'PIX' | 'BOLETO' | 'CREDIT_CARD'>('PIX')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ paymentUrl?: string; pixQrCode?: string; pixPayload?: string } | null>(null)
  const [error, setError] = useState('')

  async function handleBuy() {
    if (!selectedScooter) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scooterId: selectedScooter.id, paymentMethod: method }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar cobrança')
      setSuccess({ paymentUrl: data.invoiceUrl, pixQrCode: data.pixQrCode, pixPayload: data.pixPayload })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-10 text-center" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(52,199,89,0.2)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(52,199,89,0.1)' }}>
            <Check className="w-8 h-8" style={{ color: '#34C759' }} />
          </div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#34C759' }}>Pedido Criado</p>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.05em', color: '#F5F7FA' }}>
            Cobrança Gerada!
          </h3>
          <p className="text-sm my-4" style={{ color: '#8A8A8E' }}>
            Seu pedido foi criado com sucesso. Após o pagamento o contrato será gerado automaticamente.
          </p>
          {success.pixPayload && (
            <div className="rounded-xl p-4 mb-4 text-left" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs mb-2 font-semibold" style={{ color: '#8A8A8E' }}>Código PIX:</p>
              <p className="text-xs font-mono break-all" style={{ color: '#F5F7FA' }}>{success.pixPayload}</p>
              <button onClick={() => navigator.clipboard.writeText(success.pixPayload!)}
                className="mt-3 w-full py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background: '#0A84FF', color: '#fff' }}>Copiar Código PIX</button>
            </div>
          )}
          {success.paymentUrl && (
            <a href={success.paymentUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
              style={{ background: '#0A84FF', color: '#fff' }}>
              Abrir Link de Pagamento <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#0A84FF' }}>Urban 100</p>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '0.05em', color: '#F5F7FA' }}>Adquirir Scooter</h2>
        <p className="text-sm mt-1" style={{ color: '#8A8A8E' }}>Olá {profile?.name?.split(' ')[0]}, escolha seu modelo abaixo</p>
      </motion.div>

      {/* Scooter cards */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
        {scooters.length === 0 && (
          <div className="rounded-2xl p-8 text-center text-sm" style={{ color: '#8A8A8E', background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
            Nenhuma scooter disponível no momento.
          </div>
        )}
        {scooters.map(scooter => (
          <button key={scooter.id} onClick={() => setSelectedScooter(scooter)}
            className="w-full rounded-2xl p-5 text-left transition-all duration-200 flex items-center gap-5"
            style={{
              background: selectedScooter?.id === scooter.id ? 'rgba(10,132,255,0.08)' : 'rgba(28,28,30,0.7)',
              border: `1px solid ${selectedScooter?.id === scooter.id ? 'rgba(10,132,255,0.4)' : 'rgba(255,255,255,0.07)'}`,
            }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: selectedScooter?.id === scooter.id ? 'rgba(10,132,255,0.15)' : 'rgba(255,255,255,0.04)' }}>
              <Zap className="w-7 h-7" style={{ color: selectedScooter?.id === scooter.id ? '#0A84FF' : '#8A8A8E' }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: '#F5F7FA' }}>{scooter.model}</p>
              <p className="text-xs mt-0.5" style={{ color: '#8A8A8E' }}>Motor 2000W · 100km autonomia</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', color: '#F5F7FA' }}>
                {formatCurrency(Number(scooter.price))}
              </p>
              <p className="text-xs" style={{ color: '#8A8A8E' }}>Valor total</p>
            </div>
            {selectedScooter?.id === scooter.id && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#0A84FF' }}>
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </motion.div>

      {/* Payment method */}
      {selectedScooter && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#8A8A8E' }}>Forma de Pagamento</p>
          <div className="grid grid-cols-3 gap-3">
            {METHODS.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id as any)}
                className="rounded-xl p-4 text-center transition-all"
                style={{
                  background: method === m.id ? 'rgba(10,132,255,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${method === m.id ? 'rgba(10,132,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                <div className="text-2xl mb-2">{m.icon}</div>
                <p className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>{m.label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#8A8A8E' }}>{m.desc}</p>
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm" style={{ color: '#8A8A8E' }}>Modelo</span>
              <span className="text-sm font-medium" style={{ color: '#F5F7FA' }}>{selectedScooter.model}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm" style={{ color: '#8A8A8E' }}>Pagamento</span>
              <span className="text-sm font-medium" style={{ color: '#F5F7FA' }}>{METHODS.find(m => m.id === method)?.label}</span>
            </div>
            <div className="h-px my-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold" style={{ color: '#8A8A8E' }}>Total</span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', color: '#F5F7FA' }}>
                {formatCurrency(Number(selectedScooter.price))}
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', color: '#FF453A' }}>
              {error}
            </div>
          )}

          <button onClick={handleBuy} disabled={loading}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background: loading ? 'rgba(10,132,255,0.5)' : '#0A84FF', color: '#fff' }}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
              Confirmar Aquisição <ArrowRight className="w-4 h-4" />
            </>}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs" style={{ color: '#8A8A8E' }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pagamento seguro · Contrato digital automático</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
