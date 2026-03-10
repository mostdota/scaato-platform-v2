'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ShoppingCart, CreditCard, FileText, TrendingUp, Clock,
  CheckCircle2, AlertCircle, ChevronRight, Bike, ExternalLink,
  Wallet, Users, ArrowRight, Plus
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '@/utils'
import type { Profile, Order, Payment } from '@/types'

interface Props {
  profile: Profile | null
  orders: (Order & { scooter?: { model: string; image_url?: string } })[]
  payments: Payment[]
  stats: {
    totalPaid: number
    pendingPayments: number
    overduePayments: number
    totalOrders: number
  }
}

export default function ParticipantDashboardClient({ profile, orders, payments, stats }: Props) {
  const firstName = profile?.name?.split(' ')[0] || 'Cliente'

  const statCards = [
    {
      label: 'Total Pago',
      value: formatCurrency(stats.totalPaid),
      icon: TrendingUp,
      color: 'text-[#1DB954]',
      bg: 'bg-[#1DB954]/10',
    },
    {
      label: 'Pedidos Ativos',
      value: String(stats.totalOrders),
      icon: Bike,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Pagamentos Pendentes',
      value: String(stats.pendingPayments),
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
    {
      label: 'Pagamentos Vencidos',
      value: String(stats.overduePayments),
      icon: AlertCircle,
      color: stats.overduePayments > 0 ? 'text-red-400' : 'text-[#555]',
      bg: stats.overduePayments > 0 ? 'bg-red-400/10' : 'bg-[#1a1a1a]',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Olá, {firstName}! 👋
          </h2>
          <p className="text-[#666] text-sm mt-1">
            Acompanhe seus pedidos e pagamentos
          </p>
        </div>
        <Link href="/participant/buy" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Adquirir Scooter
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="stat-card"
          >
            <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-4.5 h-4.5 ${card.color}`} style={{ width: '1.1rem', height: '1.1rem' }} />
            </div>
            <div className={`text-2xl font-bold font-mono ${card.color}`}>{card.value}</div>
            <div className="text-xs text-[#555]">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* CTA principal - se não tem pedidos */}
      {orders.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-8 text-center border-dashed border-[#1DB954]/20 bg-[#1DB954]/3"
        >
          <div className="w-16 h-16 bg-[#1DB954]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bike className="w-8 h-8 text-[#1DB954]" />
          </div>
          <h3 className="text-xl font-bold mb-2">Pronto para começar?</h3>
          <p className="text-[#666] text-sm mb-6 max-w-sm mx-auto">
            Adquira sua primeira scooter elétrica com pagamento simplificado e contrato digital.
          </p>
          <Link href="/participant/buy" className="btn btn-primary btn-lg mx-auto">
            Adquirir Minha Scooter
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between p-5 border-b border-[#1e1e1e]">
              <h3 className="font-semibold flex items-center gap-2">
                <Bike className="w-4 h-4 text-[#1DB954]" />
                Meus Pedidos
              </h3>
              <Link href="/participant/orders" className="text-xs text-[#1DB954] hover:underline flex items-center gap-1">
                Ver todos <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-[#1a1a1a]">
              {orders.map(order => (
                <div key={order.id} className="flex items-center gap-4 p-4 hover:bg-[#141414] transition-colors">
                  <div className="w-10 h-10 bg-[#1a1a1a] rounded-xl flex items-center justify-center shrink-0">
                    <Bike className="w-5 h-5 text-[#1DB954]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {(order as any).scooter?.model || 'Scooter SCAATO'}
                    </div>
                    <div className="text-xs text-[#555]">{formatDate(order.created_at)}</div>
                  </div>
                  <span className={`badge text-xs ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Payments */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card"
        >
          <div className="flex items-center justify-between p-5 border-b border-[#1e1e1e]">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#1DB954]" />
              Últimos Pagamentos
            </h3>
            <Link href="/participant/payments" className="text-xs text-[#1DB954] hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {payments.length === 0 && (
              <div className="p-8 text-center text-[#555] text-sm">Nenhum pagamento ainda</div>
            )}
            {payments.slice(0, 5).map(payment => (
              <div key={payment.id} className="flex items-center gap-4 p-4 hover:bg-[#141414] transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  payment.status === 'CONFIRMED' ? 'bg-[#1DB954]/10' :
                  payment.status === 'OVERDUE'   ? 'bg-red-500/10' : 'bg-yellow-500/10'
                }`}>
                  {payment.status === 'CONFIRMED' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#1DB954]" />
                  ) : payment.status === 'OVERDUE' ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{formatCurrency(Number(payment.value))}</div>
                  <div className="text-xs text-[#555]">Venc: {formatDate(payment.due_date)}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`badge text-xs ${getStatusColor(payment.status)}`}>
                    {getStatusLabel(payment.status)}
                  </span>
                  {payment.pix_qr_code_payload && payment.status === 'PENDING' && (
                    <Link href={`/participant/payments/${payment.id}`}
                      className="text-xs text-[#1DB954] hover:underline flex items-center gap-1">
                      Pagar <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Adquirir Scooter', icon: ShoppingCart, href: '/participant/buy',       color: '#1DB954' },
          { label: 'Pagamentos',       icon: CreditCard,    href: '/participant/payments',  color: '#3b82f6' },
          { label: 'Contratos',        icon: FileText,       href: '/participant/contracts', color: '#8b5cf6' },
          { label: 'Indicações',       icon: Users,          href: '/participant/referrals', color: '#f59e0b' },
        ].map(action => (
          <Link key={action.label} href={action.href}
            className="card-hover p-5 flex flex-col items-center gap-3 text-center group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: `${action.color}15` }}>
              <action.icon className="w-5 h-5 transition-colors" style={{ color: action.color }} />
            </div>
            <span className="text-xs font-medium text-[#888] group-hover:text-[#f0f0f0] transition-colors">
              {action.label}
            </span>
          </Link>
        ))}
      </motion.div>
    </div>
  )
}
