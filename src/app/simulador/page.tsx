'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, ArrowLeft, Calculator, TrendingUp, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { formatCurrency } from '@/utils'

const SCOOTER_PRICE = 12800
const MONTHLY_INSTALLMENT = 467
const GROUP_SIZE = 100

export default function SimuladorPage() {
  const [months, setMonths] = useState(12)

  // Economia estimada
  const fuelSavingsPerMonth = 350
  const maintenanceSavings = 80
  const totalMonthlySavings = fuelSavingsPerMonth + maintenanceSavings

  const breakEvenMonths = Math.ceil(SCOOTER_PRICE / totalMonthlySavings)
  const totalSavings = months * totalMonthlySavings
  const roi = ((totalSavings / SCOOTER_PRICE) * 100).toFixed(0)

  const chartData = Array.from({ length: months }, (_, i) => ({
    mes: `M${i + 1}`,
    economia: (i + 1) * totalMonthlySavings,
  }))

  // Cronograma de entregas (sem coluna caixa acumulado)
  const scheduleData = [
    { mes: 1, entregas: 0, total: 0,  status: 'Formação' },
    { mes: 2, entregas: 7, total: 7,  status: 'Início' },
    { mes: 3, entregas: 7, total: 14, status: 'Ativo' },
    { mes: 4, entregas: 7, total: 21, status: 'Ativo' },
    { mes: 5, entregas: 7, total: 28, status: 'Ativo' },
    { mes: 6, entregas: 7, total: 35, status: 'Ativo' },
  ]

  const statusColor: Record<string, { bg: string; color: string }> = {
    'Formação': { bg: 'rgba(142,142,147,0.1)', color: '#8A8A8E' },
    'Início':   { bg: 'rgba(10,132,255,0.1)',  color: '#0A84FF' },
    'Ativo':    { bg: 'rgba(52,199,89,0.1)',   color: '#34C759' },
  }

  return (
    <div className="min-h-screen" style={{ background: '#050505', color: '#F5F7FA' }}>
      {/* Nav */}
      <nav className="px-6 h-14 flex items-center justify-between sticky top-0 z-40"
        style={{ background: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#0A84FF' }}>
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '16px', letterSpacing: '0.1em' }}>SCAATO</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-sm transition-colors" style={{ color: '#8A8A8E' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#F5F7FA')}
          onMouseLeave={e => (e.currentTarget.style.color = '#8A8A8E')}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4"
            style={{ background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.2)' }}>
            <Calculator className="w-4 h-4" style={{ color: '#0A84FF' }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#0A84FF' }}>Simulador</span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 6vw, 60px)', letterSpacing: '0.03em', lineHeight: 1 }}>
            Calcule Sua Economia
          </h1>
          <p className="text-sm mt-3 max-w-lg mx-auto" style={{ color: '#8A8A8E' }}>
            Veja quanto você economiza ao adquirir uma scooter elétrica no lugar de moto a combustível ou carro.
          </p>
        </div>

        {/* Slider */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>Período de análise</p>
              <p className="text-xs mt-0.5" style={{ color: '#8A8A8E' }}>Arraste para ajustar</p>
            </div>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '36px', color: '#0A84FF', letterSpacing: '0.03em' }}>
              {months} meses
            </span>
          </div>
          <input type="range" min="3" max="36" step="3" value={months}
            onChange={e => setMonths(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: '#0A84FF', background: `linear-gradient(to right, #0A84FF ${((months-3)/33)*100}%, rgba(255,255,255,0.1) ${((months-3)/33)*100}%)` }}
          />
          <div className="flex justify-between text-xs mt-2" style={{ color: '#8A8A8E' }}>
            <span>3 meses</span><span>36 meses</span>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Valor da Scooter', value: formatCurrency(SCOOTER_PRICE), color: '#F5F7FA', bg: 'rgba(255,255,255,0.06)', icon: Zap },
            { label: 'Parcela Mensal',   value: formatCurrency(MONTHLY_INSTALLMENT) + '/mês', color: '#0A84FF', bg: 'rgba(10,132,255,0.1)', icon: Calculator },
            { label: `Economia (${months}m)`, value: formatCurrency(totalSavings), color: '#34C759', bg: 'rgba(52,199,89,0.1)', icon: TrendingUp },
            { label: 'Payback',          value: `${breakEvenMonths} meses`, color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)', icon: Clock },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-5" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '0.03em', color: s.color }}>{s.value}</div>
              <div className="text-xs tracking-wider uppercase mt-1" style={{ color: '#8A8A8E' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-6" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#0A84FF' }}>Projeção</p>
          <h3 className="text-sm font-semibold mb-6" style={{ color: '#F5F7FA' }}>Economia Acumulada ao Longo do Tempo</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="economia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#34C759" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="mes" tick={{ fill: '#8A8A8E', fontSize: 10 }} axisLine={false} tickLine={false}
                  interval={Math.floor(months / 6)} />
                <YAxis tick={{ fill: '#8A8A8E', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: '#8A8A8E' }}
                  formatter={(v: number) => [formatCurrency(v), 'Economia acumulada']}
                />
                {breakEvenMonths <= months && (
                  <ReferenceLine x={`M${breakEvenMonths}`}
                    stroke="rgba(255,159,10,0.4)" strokeDasharray="4 4"
                    label={{ value: 'Payback', fill: '#FF9F0A', fontSize: 10, position: 'insideTopRight' }} />
                )}
                <Area type="monotone" dataKey="economia" stroke="#34C759" strokeWidth={2}
                  fill="url(#economia)" dot={false} activeDot={{ r: 4, fill: '#34C759', stroke: '#050505', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 rounded-xl p-3 text-sm text-center"
            style={{ background: 'rgba(52,199,89,0.05)', border: '1px solid rgba(52,199,89,0.15)' }}>
            <span style={{ color: '#8A8A8E' }}>Você se paga em apenas </span>
            <span className="font-bold" style={{ color: '#34C759' }}>{breakEvenMonths} meses</span>
            <span style={{ color: '#8A8A8E' }}> e depois economiza </span>
            <span className="font-bold" style={{ color: '#34C759' }}>{formatCurrency(totalMonthlySavings)}/mês</span>
          </div>
        </motion.div>

        {/* Cronograma de Entregas — sem "Caixa Acumulado" */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl overflow-hidden" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: '#0A84FF' }}>Urban 100</p>
            <h3 className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>Cronograma de Entregas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Scooters Entregues</th>
                  <th>Total Entregue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((row, i) => (
                  <motion.tr key={row.mes}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}>
                    <td>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', color: '#F5F7FA', letterSpacing: '0.03em' }}>
                        {row.mes}
                      </span>
                    </td>
                    <td className="font-semibold" style={{ color: row.entregas > 0 ? '#34C759' : '#8A8A8E' }}>
                      {row.entregas > 0 ? `+${row.entregas}` : '—'}
                    </td>
                    <td className="font-semibold" style={{ color: '#F5F7FA' }}>
                      {row.total > 0 ? row.total : '—'}
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: statusColor[row.status].bg, color: statusColor[row.status].color }}>
                        {row.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 text-xs" style={{ color: '#8A8A8E', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            ✓ Entrega por ordem de entrada · Sem sorteio · Contrato digital
          </div>
        </motion.div>

        {/* Comparação de custo */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl p-6" style={{ background: 'rgba(10,132,255,0.04)', border: '1px solid rgba(10,132,255,0.15)' }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#0A84FF' }}>Comparativo</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Moto a gasolina', monthly: 'R$ 430/mês', note: 'Combustível + manutenção', highlight: false },
              { label: 'SCAATO Urban 100', monthly: formatCurrency(MONTHLY_INSTALLMENT) + '/mês', note: 'Parcela no grupo · Zero combustível', highlight: true },
              { label: 'Carro popular', monthly: 'R$ 900/mês', note: 'Combustível + seguro + manutenção', highlight: false },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-4 text-center transition-all"
                style={{
                  background: item.highlight ? 'rgba(10,132,255,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${item.highlight ? 'rgba(10,132,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <p className="text-xs font-semibold mb-2" style={{ color: item.highlight ? '#0A84FF' : '#8A8A8E' }}>{item.label}</p>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '26px', color: item.highlight ? '#0A84FF' : '#F5F7FA', letterSpacing: '0.03em' }}>
                  {item.monthly}
                </p>
                <p className="text-xs mt-1" style={{ color: '#8A8A8E' }}>{item.note}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center pb-6">
          <Link href="/cadastro"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-sm transition-all"
            style={{ background: '#0A84FF', color: '#fff' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0071e3')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0A84FF')}>
            Garantir Minha Vaga no Urban 100
            <Zap className="w-4 h-4" />
          </Link>
          <p className="text-xs mt-3" style={{ color: '#8A8A8E' }}>
            R$ {formatCurrency(MONTHLY_INSTALLMENT).replace('R$', '').trim()}/mês · 100 participantes · Entrega garantida
          </p>
        </div>
      </div>
    </div>
  )
}
