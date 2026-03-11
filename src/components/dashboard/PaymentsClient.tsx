'use client'

import { motion } from 'framer-motion'
import { CreditCard, CheckCircle2, AlertCircle, Clock, ExternalLink, Copy, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '@/utils'
import { useState } from 'react'
import type { Payment } from '@/types'

export default function PaymentsClient({ payments }: { payments: Payment[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const total = payments.filter(p => p.status === 'CONFIRMED').reduce((s, p) => s + Number(p.value), 0)
  const pending = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + Number(p.value), 0)

  function copy(id: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const summaries = [
    { label: 'Total Pago',     value: formatCurrency(total),    color: '#34C759', bg: 'rgba(52,199,89,0.1)',   icon: TrendingUp },
    { label: 'Pendente',       value: formatCurrency(pending),  color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)',  icon: Clock },
    { label: 'Cobranças',      value: String(payments.length),  color: '#0A84FF', bg: 'rgba(10,132,255,0.1)', icon: CreditCard },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#0A84FF' }}>Financeiro</p>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '0.05em', color: '#F5F7FA' }}>Meus Pagamentos</h2>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {summaries.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-5" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '26px', letterSpacing: '0.03em', color: s.color }}>{s.value}</div>
            <div className="text-xs tracking-wider uppercase mt-1" style={{ color: '#8A8A8E' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <CreditCard className="w-4 h-4" style={{ color: '#0A84FF' }} />
          <span className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>Histórico</span>
        </div>

        {payments.length === 0 && (
          <div className="p-12 text-center text-sm" style={{ color: '#8A8A8E' }}>Nenhum pagamento encontrado</div>
        )}

        {payments.map((payment, i) => (
          <motion.div key={payment.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="px-6 py-4 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: payment.status === 'CONFIRMED' ? 'rgba(52,199,89,0.1)' : payment.status === 'OVERDUE' ? 'rgba(255,69,58,0.1)' : 'rgba(255,159,10,0.1)' }}>
                {payment.status === 'CONFIRMED' ? <CheckCircle2 className="w-5 h-5" style={{ color: '#34C759' }} /> :
                 payment.status === 'OVERDUE'   ? <AlertCircle  className="w-5 h-5" style={{ color: '#FF453A' }} /> :
                                                  <Clock         className="w-5 h-5" style={{ color: '#FF9F0A' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-base font-bold" style={{ color: '#F5F7FA' }}>{formatCurrency(Number(payment.value))}</span>
                  <span className={`badge badge-${getStatusColor(payment.status)}`}>{getStatusLabel(payment.status)}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs" style={{ color: '#8A8A8E' }}>
                  <span>Vencimento: {formatDate(payment.due_date)}</span>
                  {payment.paid_at && <span>Pago: {formatDate(payment.paid_at)}</span>}
                  {payment.method && <span className="uppercase">{payment.method}</span>}
                </div>
                {payment.status === 'PENDING' && (
                  <div className="flex gap-2 mt-3">
                    {payment.pix_qr_code_payload && (
                      <button onClick={() => copy(payment.id, payment.pix_qr_code_payload!)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: 'rgba(10,132,255,0.1)', color: '#0A84FF', border: '1px solid rgba(10,132,255,0.2)' }}>
                        <Copy className="w-3 h-3" />
                        {copiedId === payment.id ? 'Copiado!' : 'Copiar PIX'}
                      </button>
                    )}
                    {payment.bank_slip_url && (
                      <a href={payment.bank_slip_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#F5F7FA', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <ExternalLink className="w-3 h-3" /> Boleto
                      </a>
                    )}
                    {payment.invoice_url && (
                      <a href={payment.invoice_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: '#0A84FF', color: '#fff' }}>
                        <ExternalLink className="w-3 h-3" /> Pagar Agora
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
