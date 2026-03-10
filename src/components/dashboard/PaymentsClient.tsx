'use client'

import { motion } from 'framer-motion'
import { CreditCard, CheckCircle2, AlertCircle, Clock, ExternalLink, Copy } from 'lucide-react'
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Pago',     value: formatCurrency(total),    color: 'text-[#1DB954]', bg: 'bg-[#1DB954]/10' },
          { label: 'A Pagar',        value: formatCurrency(pending),  color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Total Cobranças', value: String(payments.length), color: 'text-[#f0f0f0]',  bg: 'bg-[#1a1a1a]' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card">
            <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-[#555]">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* List */}
      <div className="card divide-y divide-[#1a1a1a]">
        <div className="px-6 py-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#1DB954]" />
          <h3 className="font-semibold">Histórico de Pagamentos</h3>
        </div>
        {payments.length === 0 && (
          <div className="p-12 text-center text-[#555] text-sm">Nenhum pagamento encontrado</div>
        )}
        {payments.map((payment, i) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="px-6 py-4 hover:bg-[#141414] transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                payment.status === 'CONFIRMED' ? 'bg-[#1DB954]/10' :
                payment.status === 'OVERDUE'   ? 'bg-red-500/10' : 'bg-yellow-500/10'
              }`}>
                {payment.status === 'CONFIRMED' ? <CheckCircle2 className="w-5 h-5 text-[#1DB954]" /> :
                 payment.status === 'OVERDUE'   ? <AlertCircle  className="w-5 h-5 text-red-400" /> :
                                                  <Clock         className="w-5 h-5 text-yellow-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-base font-bold font-mono">{formatCurrency(Number(payment.value))}</span>
                  <span className={`badge text-xs ${getStatusColor(payment.status)}`}>{getStatusLabel(payment.status)}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-[#555]">
                  <span>Vencimento: {formatDate(payment.due_date)}</span>
                  {payment.paid_at && <span>Pago em: {formatDate(payment.paid_at)}</span>}
                  {payment.method && <span className="uppercase">{payment.method}</span>}
                </div>

                {/* PIX or Boleto actions */}
                {payment.status === 'PENDING' && (
                  <div className="flex gap-2 mt-2">
                    {payment.pix_qr_code_payload && (
                      <button onClick={() => copy(payment.id, payment.pix_qr_code_payload!)}
                        className="btn btn-secondary btn-sm text-xs">
                        <Copy className="w-3 h-3" />
                        {copiedId === payment.id ? 'Copiado!' : 'Copiar PIX'}
                      </button>
                    )}
                    {payment.bank_slip_url && (
                      <a href={payment.bank_slip_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm text-xs">
                        <ExternalLink className="w-3 h-3" /> Boleto
                      </a>
                    )}
                    {payment.invoice_url && (
                      <a href={payment.invoice_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm text-xs">
                        <ExternalLink className="w-3 h-3" /> Pagar
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
