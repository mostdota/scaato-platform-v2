'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users, ShoppingCart, CreditCard, FileText, TrendingUp,
  AlertCircle, CheckCircle2, Clock, ChevronRight, BarChart3,
  DollarSign, Bike, Activity
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid
} from 'recharts'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '@/utils'

// Fake chart data (replace with real data from DB)
const revenueData = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][i],
  receita: Math.round(Math.random() * 40000 + 10000),
  pedidos: Math.round(Math.random() * 20 + 5),
}))

interface Stats {
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  pendingPayments: number
  overduePayments: number
  pendingContracts: number
  signedContracts: number
  activeOrders: number
}

interface Props {
  stats: Stats
  customers: any[]
  orders: any[]
  payments: any[]
  contracts: any[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs text-[#666] mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name === 'receita' ? formatCurrency(p.value) : p.value + ' pedidos'}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AdminDashboardClient({ stats, customers, orders, payments, contracts }: Props) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')

  const statCards = [
    { label: 'Clientes',        value: stats.totalCustomers,               icon: Users,       color: 'text-blue-400',    bg: 'bg-blue-400/10',    href: '/admin/customers' },
    { label: 'Receita Total',   value: formatCurrency(stats.totalRevenue), icon: DollarSign,  color: 'text-[#1DB954]',   bg: 'bg-[#1DB954]/10',   href: '/admin/financial' },
    { label: 'Pedidos',         value: stats.totalOrders,                  icon: ShoppingCart,color: 'text-purple-400',  bg: 'bg-purple-400/10',  href: '/admin/orders' },
    { label: 'Contratos Assin.',value: stats.signedContracts,              icon: FileText,    color: 'text-[#1DB954]',   bg: 'bg-[#1DB954]/10',   href: '/admin/contracts' },
    { label: 'Pag. Pendentes',  value: stats.pendingPayments,              icon: Clock,       color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  href: '/admin/payments' },
    { label: 'Pag. Vencidos',   value: stats.overduePayments,             icon: AlertCircle, color: 'text-red-400',     bg: 'bg-red-400/10',     href: '/admin/payments' },
    { label: 'Contr. Pendentes',value: stats.pendingContracts,             icon: FileText,    color: 'text-orange-400',  bg: 'bg-orange-400/10',  href: '/admin/contracts' },
    { label: 'Pedidos Ativos',  value: stats.activeOrders,                 icon: Activity,    color: 'text-cyan-400',    bg: 'bg-cyan-400/10',    href: '/admin/orders' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight">Visão Geral</h2>
        <p className="text-[#666] text-sm mt-1">Dados atualizados em tempo real</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={card.href} className="stat-card block hover:border-[#333] transition-colors group">
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-4.5 h-4.5 ${card.color}`} style={{ width: '1.1rem', height: '1.1rem' }} />
              </div>
              <div className={`text-2xl font-bold font-mono ${card.color} mt-1`}>{card.value}</div>
              <div className="text-xs text-[#555]">{card.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold">Receita Mensal</h3>
            <p className="text-xs text-[#555] mt-0.5">Últimos 12 meses</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('area')}
              className={`btn btn-sm ${chartType === 'area' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Área
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`btn btn-sm ${chartType === 'bar' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Barras
            </button>
          </div>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1DB954" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e1e1e" strokeDasharray="0" />
                <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="receita" stroke="#1DB954" strokeWidth={2}
                  fill="url(#colorReceita)" dot={false} activeDot={{ r: 5, fill: '#1DB954' }} />
              </AreaChart>
            ) : (
              <BarChart data={revenueData}>
                <CartesianGrid stroke="#1e1e1e" strokeDasharray="0" />
                <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="receita" fill="#1DB954" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
          <div className="flex items-center justify-between p-5 border-b border-[#1e1e1e]">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Clientes Recentes
            </h3>
            <Link href="/admin/customers" className="text-xs text-[#1DB954] hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {customers.length === 0 && (
              <div className="p-8 text-center text-[#555] text-sm">Nenhum cliente ainda</div>
            )}
            {customers.slice(0, 5).map(customer => (
              <div key={customer.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#141414] transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-400/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-400">
                    {customer.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{customer.name}</div>
                  <div className="text-xs text-[#555] truncate">{customer.email}</div>
                </div>
                <div className="text-xs text-[#555]">{formatDate(customer.created_at)}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <div className="flex items-center justify-between p-5 border-b border-[#1e1e1e]">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-purple-400" />
              Pedidos Recentes
            </h3>
            <Link href="/admin/orders" className="text-xs text-[#1DB954] hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {orders.length === 0 && (
              <div className="p-8 text-center text-[#555] text-sm">Nenhum pedido ainda</div>
            )}
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#141414] transition-colors">
                <div className="w-8 h-8 rounded-full bg-purple-400/10 flex items-center justify-center shrink-0">
                  <Bike className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-[#666] truncate">#{order.id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-sm font-medium">{formatCurrency(Number(order.total_amount))}</div>
                </div>
                <span className={`badge text-xs ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Payments */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card">
          <div className="flex items-center justify-between p-5 border-b border-[#1e1e1e]">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#1DB954]" />
              Últimos Pagamentos
            </h3>
            <Link href="/admin/payments" className="text-xs text-[#1DB954] hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {payments.slice(0, 5).map(payment => (
              <div key={payment.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#141414] transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  payment.status === 'CONFIRMED' ? 'bg-[#1DB954]/10' :
                  payment.status === 'OVERDUE'   ? 'bg-red-500/10' : 'bg-yellow-500/10'
                }`}>
                  {payment.status === 'CONFIRMED' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#1DB954]" />
                  ) : payment.status === 'OVERDUE' ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{formatCurrency(Number(payment.value))}</div>
                  <div className="text-xs text-[#555]">Venc: {formatDate(payment.due_date)}</div>
                </div>
                <span className={`badge text-xs ${getStatusColor(payment.status)}`}>
                  {getStatusLabel(payment.status)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contracts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
          <div className="flex items-center justify-between p-5 border-b border-[#1e1e1e]">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-400" />
              Contratos
            </h3>
            <Link href="/admin/contracts" className="text-xs text-[#1DB954] hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {contracts.length === 0 && (
              <div className="p-8 text-center text-[#555] text-sm">Nenhum contrato ainda</div>
            )}
            {contracts.slice(0, 5).map(contract => (
              <div key={contract.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#141414] transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  contract.status === 'SIGNED' ? 'bg-[#1DB954]/10' :
                  contract.status === 'SENT'   ? 'bg-blue-500/10' : 'bg-[#1a1a1a]'
                }`}>
                  <FileText className={`w-4 h-4 ${
                    contract.status === 'SIGNED' ? 'text-[#1DB954]' :
                    contract.status === 'SENT'   ? 'text-blue-400' : 'text-[#555]'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{contract.title}</div>
                  <div className="text-xs text-[#555]">{formatDate(contract.created_at)}</div>
                </div>
                <span className={`badge text-xs ${getStatusColor(contract.status)}`}>
                  {getStatusLabel(contract.status)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
