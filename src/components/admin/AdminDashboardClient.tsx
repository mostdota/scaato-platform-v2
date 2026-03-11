'use client'

import { motion } from 'framer-motion'
import { Users, ShoppingBag, CreditCard, FileText, TrendingUp, DollarSign, Activity, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '@/utils'
import type { Profile } from '@/types'

interface Stats { totalUsers: number; totalOrders: number; totalRevenue: number; pendingPayments: number; overduePayments: number; totalContracts: number }
interface Props { profile: Profile; stats: Stats; recentOrders: any[]; recentPayments: any[] }

function StatCard({ label, value, icon: Icon, color, bg, delay }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}
      className="rounded-2xl p-5 transition-all duration-300"
      style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '0.03em', color }}>{value}</div>
      <div className="text-xs font-medium tracking-wider uppercase mt-1" style={{ color: '#8A8A8E' }}>{label}</div>
    </motion.div>
  )
}

export default function AdminDashboardClient({ profile, stats, recentOrders, recentPayments }: Props) {
  const cards = [
    { label: 'Usuários',        value: String(stats.totalUsers),             icon: Users,      color: '#0A84FF', bg: 'rgba(10,132,255,0.12)' },
    { label: 'Pedidos',         value: String(stats.totalOrders),            icon: ShoppingBag,color: '#34C759', bg: 'rgba(52,199,89,0.12)' },
    { label: 'Receita Total',   value: formatCurrency(stats.totalRevenue),   icon: DollarSign, color: '#FF9F0A', bg: 'rgba(255,159,10,0.12)' },
    { label: 'Contratos',       value: String(stats.totalContracts),         icon: FileText,   color: '#BF5AF2', bg: 'rgba(191,90,242,0.12)' },
    { label: 'Pendentes',       value: String(stats.pendingPayments),        icon: CreditCard, color: '#FF9F0A', bg: 'rgba(255,159,10,0.12)' },
    { label: 'Vencidos',        value: String(stats.overduePayments),        icon: AlertCircle,color: stats.overduePayments > 0 ? '#FF453A' : '#8A8A8E', bg: stats.overduePayments > 0 ? 'rgba(255,69,58,0.12)' : 'rgba(142,142,147,0.08)' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#FF9F0A' }}>Painel Administrativo</p>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '36px', letterSpacing: '0.05em', color: '#F5F7FA', lineHeight: 1 }}>
          Visão Geral
        </h2>
        <p className="text-sm mt-1" style={{ color: '#8A8A8E' }}>Bem-vindo, {profile.name?.split(' ')[0]}</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => <StatCard key={c.label} {...c} delay={i * 0.05} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl overflow-hidden" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Activity className="w-4 h-4" style={{ color: '#34C759' }} />
            <span className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>Pedidos Recentes</span>
          </div>
          {recentOrders.length === 0 && (
            <div className="p-10 text-center text-sm" style={{ color: '#8A8A8E' }}>Nenhum pedido ainda</div>
          )}
          {recentOrders.map((order, i) => (
            <div key={order.id} className="px-6 py-4 flex items-center gap-4 transition-colors"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: 'rgba(52,199,89,0.1)', color: '#34C759' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#F5F7FA' }}>
                  {order.profile?.name || 'Cliente'}
                </p>
                <p className="text-xs" style={{ color: '#8A8A8E' }}>{formatDate(order.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>{formatCurrency(Number(order.total_amount))}</p>
                <span className={`badge badge-${getStatusColor(order.status)} text-xs`}>{getStatusLabel(order.status)}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Recent Payments */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl overflow-hidden" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <TrendingUp className="w-4 h-4" style={{ color: '#0A84FF' }} />
            <span className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>Pagamentos Recentes</span>
          </div>
          {recentPayments.length === 0 && (
            <div className="p-10 text-center text-sm" style={{ color: '#8A8A8E' }}>Nenhum pagamento ainda</div>
          )}
          {recentPayments.map((payment, i) => (
            <div key={payment.id} className="px-6 py-4 flex items-center gap-4 transition-colors"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: payment.status === 'CONFIRMED' ? 'rgba(52,199,89,0.1)' : payment.status === 'OVERDUE' ? 'rgba(255,69,58,0.1)' : 'rgba(255,159,10,0.1)' }}>
                <CreditCard className="w-4 h-4" style={{ color: payment.status === 'CONFIRMED' ? '#34C759' : payment.status === 'OVERDUE' ? '#FF453A' : '#FF9F0A' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>{formatCurrency(Number(payment.value))}</p>
                <p className="text-xs" style={{ color: '#8A8A8E' }}>{formatDate(payment.due_date)}</p>
              </div>
              <span className={`badge badge-${getStatusColor(payment.status)} text-xs`}>{getStatusLabel(payment.status)}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
