'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  ShoppingBag, CreditCard, FileText, TrendingUp, Clock,
  CheckCircle2, AlertCircle, ChevronRight, Zap, ExternalLink,
  Users, ArrowRight, Plus
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '@/utils'
import type { Profile, Order, Payment } from '@/types'

interface Props {
  profile: Profile | null
  orders: (Order & { scooter?: { model: string; image_url?: string } })[]
  payments: Payment[]
  stats: { totalPaid: number; pendingPayments: number; overduePayments: number; totalOrders: number }
}

function StatCard({ label, value, icon: Icon, color, bg, delay }: any) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-5 transition-all duration-300"
      style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color, fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.03em' }}>{value}</div>
      <div className="text-xs font-medium tracking-wider uppercase" style={{ color: '#8A8A8E' }}>{label}</div>
    </motion.div>
  )
}

export default function ParticipantDashboardClient({ profile, orders, payments, stats }: Props) {
  const firstName = profile?.name?.split(' ')[0] || 'Cliente'
  const statCards = [
    { label: 'Total Pago', value: formatCurrency(stats.totalPaid), icon: TrendingUp, color: '#34C759', bg: 'rgba(52,199,89,0.12)' },
    { label: 'Pedidos Ativos', value: String(stats.totalOrders), icon: Zap, color: '#0A84FF', bg: 'rgba(10,132,255,0.12)' },
    { label: 'Pendentes', value: String(stats.pendingPayments), icon: Clock, color: '#FF9F0A', bg: 'rgba(255,159,10,0.12)' },
    { label: 'Vencidos', value: String(stats.overduePayments), icon: AlertCircle, color: stats.overduePayments > 0 ? '#FF453A' : '#8A8A8E', bg: stats.overduePayments > 0 ? 'rgba(255,69,58,0.12)' : 'rgba(142,142,147,0.08)' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#0A84FF' }}>Urban 100</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '36px', letterSpacing: '0.05em', color: '#F5F7FA', lineHeight: 1 }}>
            Olá, {firstName}
          </h2>
          <p className="text-sm mt-1" style={{ color: '#8A8A8E' }}>Acompanhe seus pedidos e pagamentos</p>
        </div>
        <Link href="/participant/buy"
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ background: '#0A84FF', color: '#fff' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#0071e3')}
          onMouseLeave={e => (e.currentTarget.style.background = '#0A84FF')}>
          <Plus className="w-4 h-4" /> Adquirir Scooter
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => <StatCard key={c.label} {...c} delay={i * 0.07} />)}
      </div>

      {/* Empty state */}
      {orders.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(10,132,255,0.04)', border: '1px dashed rgba(10,132,255,0.2)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(10,132,255,0.1)' }}>
            <Zap className="w-8 h-8" style={{ color: '#0A84FF' }} />
          </div>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.05em', color: '#F5F7FA' }}>Pronto para começar?</h3>
          <p className="text-sm my-3 max-w-xs mx-auto" style={{ color: '#8A8A8E' }}>Adquira sua scooter elétrica com pagamento simplificado e contrato digital.</p>
          <Link href="/participant/buy" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
            style={{ background: '#0A84FF', color: '#fff' }}>
            Adquirir Minha Scooter <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders */}
        {orders.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl overflow-hidden" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>Meus Pedidos</span>
              <Link href="/participant/buy" className="flex items-center gap-1 text-xs" style={{ color: '#0A84FF' }}>
                Ver todos <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div>
              {orders.map(order => (
                <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(10,132,255,0.1)' }}>
                    <Zap className="w-4 h-4" style={{ color: '#0A84FF' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: '#F5F7FA' }}>
                      {(order as any).scooter?.model || 'Scooter SCAATO Urban 100'}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#8A8A8E' }}>{formatDate(order.created_at)}</div>
                  </div>
                  <span className={`badge badge-${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Payments */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl overflow-hidden" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>Últimos Pagamentos</span>
            <Link href="/participant/payments" className="flex items-center gap-1 text-xs" style={{ color: '#0A84FF' }}>
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {payments.length === 0 && (
              <div className="p-10 text-center text-sm" style={{ color: '#8A8A8E' }}>Nenhum pagamento ainda</div>
            )}
            {payments.slice(0, 5).map(payment => (
              <div key={payment.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: payment.status === 'CONFIRMED' ? 'rgba(52,199,89,0.1)' : payment.status === 'OVERDUE' ? 'rgba(255,69,58,0.1)' : 'rgba(255,159,10,0.1)' }}>
                  {payment.status === 'CONFIRMED' ? <CheckCircle2 className="w-4 h-4" style={{ color: '#34C759' }} /> :
                   payment.status === 'OVERDUE'   ? <AlertCircle  className="w-4 h-4" style={{ color: '#FF453A' }} /> :
                                                    <Clock         className="w-4 h-4" style={{ color: '#FF9F0A' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>{formatCurrency(Number(payment.value))}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#8A8A8E' }}>Venc. {formatDate(payment.due_date)}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`badge badge-${getStatusColor(payment.status)} text-xs`}>{getStatusLabel(payment.status)}</span>
                  {payment.invoice_url && payment.status === 'PENDING' && (
                    <a href={payment.invoice_url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs" style={{ color: '#0A84FF' }}>
                      Pagar <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Adquirir Scooter', icon: ShoppingBag, href: '/participant/buy',       color: '#0A84FF', bg: 'rgba(10,132,255,0.08)' },
          { label: 'Pagamentos',       icon: CreditCard,  href: '/participant/payments',  color: '#34C759', bg: 'rgba(52,199,89,0.08)' },
          { label: 'Contratos',        icon: FileText,    href: '/participant/contracts', color: '#BF5AF2', bg: 'rgba(191,90,242,0.08)' },
          { label: 'Indicações',       icon: Users,       href: '/participant/referrals', color: '#FF9F0A', bg: 'rgba(255,159,10,0.08)' },
        ].map(a => (
          <Link key={a.label} href={a.href}
            className="rounded-2xl p-5 flex flex-col items-center gap-3 text-center transition-all duration-200 group"
            style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.background = 'rgba(40,40,42,0.8)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(28,28,30,0.7)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all" style={{ background: a.bg }}>
              <a.icon className="w-5 h-5" style={{ color: a.color }} />
            </div>
            <span className="text-xs font-medium" style={{ color: '#8A8A8E' }}>{a.label}</span>
          </Link>
        ))}
      </motion.div>
    </div>
  )
}
