'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, ArrowLeft, Calculator, Bike, TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatCurrency } from '@/utils'

export default function SimuladorPage() {
  const [months, setMonths] = useState(12)
  const scooterPrice = 4500

  // Economia estimada com combustível
  const fuelSavingsPerMonth = 350 // R$ por mês
  const maintenanceSavings = 80   // R$ por mês
  const totalMonthlySavings = fuelSavingsPerMonth + maintenanceSavings

  const chartData = Array.from({ length: months }, (_, i) => ({
    mes: `Mês ${i + 1}`,
    economiaAcumulada: (i + 1) * totalMonthlySavings,
  }))

  const totalSavings = months * totalMonthlySavings
  const roi = ((totalSavings / scooterPrice) * 100).toFixed(0)
  const breakEvenMonths = Math.ceil(scooterPrice / totalMonthlySavings)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0]">
      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1DB954] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="font-bold">SCAATO</span>
        </Link>
        <Link href="/" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-full px-4 py-1.5 mb-4">
            <Calculator className="w-4 h-4 text-[#1DB954]" />
            <span className="text-xs font-semibold text-[#1DB954] uppercase tracking-widest">Simulador</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Calcule sua economia
          </h1>
          <p className="text-[#666] max-w-xl mx-auto">
            Veja quanto você economiza ao usar uma scooter elétrica no lugar de moto ou carro.
          </p>
        </div>

        {/* Slider */}
        <div className="card p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Período de análise</h3>
            <span className="text-2xl font-bold font-mono text-[#1DB954]">{months} meses</span>
          </div>
          <input
            type="range" min="3" max="36" step="3"
            value={months}
            onChange={e => setMonths(Number(e.target.value))}
            className="w-full accent-[#1DB954] h-2 bg-[#1a1a1a] rounded-full"
          />
          <div className="flex justify-between text-xs text-[#555] mt-2">
            <span>3 meses</span><span>36 meses</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Investimento',    value: formatCurrency(scooterPrice),      color: 'text-[#f0f0f0]', icon: Bike },
            { label: 'Economia Mensal', value: formatCurrency(totalMonthlySavings), color: 'text-[#1DB954]', icon: TrendingUp },
            { label: `Economia em ${months} meses`, value: formatCurrency(totalSavings), color: 'text-[#1DB954]', icon: TrendingUp },
            { label: 'Payback',         value: `${breakEvenMonths} meses`,        color: 'text-blue-400',  icon: Calculator },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="stat-card"
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs text-[#555]">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <div className="card p-6">
          <h3 className="font-semibold mb-6">Economia Acumulada ao Longo do Tempo</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="economia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1DB954" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1a1a1a" />
                <XAxis dataKey="mes" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false}
                  interval={Math.floor(months / 6)} />
                <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12 }}
                  labelStyle={{ color: '#888', fontSize: 11 }}
                  formatter={(v: number) => [formatCurrency(v), 'Economia']}
                />
                <Area type="monotone" dataKey="economiaAcumulada" stroke="#1DB954" strokeWidth={2}
                  fill="url(#economia)" dot={false} activeDot={{ r: 5, fill: '#1DB954' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Break-even indicator */}
          <div className="mt-4 p-3 bg-[#1DB954]/5 border border-[#1DB954]/15 rounded-xl text-sm text-center">
            <span className="text-[#666]">Você se paga em apenas </span>
            <span className="font-bold text-[#1DB954]">{breakEvenMonths} meses</span>
            <span className="text-[#666]"> e depois lucra </span>
            <span className="font-bold text-[#1DB954]">{formatCurrency(totalMonthlySavings)}/mês</span>
          </div>
        </div>

        <div className="text-center">
          <Link href="/cadastro" className="btn btn-primary btn-lg mx-auto">
            Adquirir Minha Scooter <Zap className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
