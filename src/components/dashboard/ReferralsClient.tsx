'use client'

import { motion } from 'framer-motion'
import { Users, Copy, CheckCircle2, Gift, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils'
import { useState } from 'react'
import type { Referral, Profile } from '@/types'

interface Props { referrals: Referral[]; profile: Profile | null; walletBalance?: number; wallet?: any }

export default function ReferralsClient({ referrals, profile, walletBalance, wallet }: Props) {
  const [copied, setCopied] = useState(false)
  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/cadastro?ref=${profile?.referral_code}`

  function copy() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resolvedBalance = walletBalance ?? wallet?.balance ?? 0
  const confirmed = referrals.filter(r => r.status === 'ACTIVE').length
  const summaries = [
    { label: 'Total Indicações', value: String(referrals.length), color: '#0A84FF', bg: 'rgba(10,132,255,0.1)', icon: Users },
    { label: 'Confirmadas',      value: String(confirmed),        color: '#34C759', bg: 'rgba(52,199,89,0.1)',   icon: CheckCircle2 },
    { label: 'Saldo Wallet',     value: formatCurrency(resolvedBalance), color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)', icon: TrendingUp },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#0A84FF' }}>Programa</p>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '0.05em', color: '#F5F7FA' }}>Minhas Indicações</h2>
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

      {/* Referral link */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl p-6" style={{ background: 'rgba(10,132,255,0.04)', border: '1px solid rgba(10,132,255,0.15)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(10,132,255,0.1)' }}>
            <Gift className="w-4 h-4" style={{ color: '#0A84FF' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>Seu link de indicação</p>
            <p className="text-xs" style={{ color: '#8A8A8E' }}>Compartilhe e ganhe comissões</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl px-4 py-3 text-sm font-mono truncate"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F7FA' }}>
            {profile?.referral_code ? `...?ref=${profile.referral_code}` : 'Código não disponível'}
          </div>
          <button onClick={copy}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all flex-shrink-0"
            style={{ background: copied ? 'rgba(52,199,89,0.12)' : '#0A84FF', color: copied ? '#34C759' : '#fff' }}>
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </motion.div>

      {/* List */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>Histórico de Indicações</span>
        </div>
        {referrals.length === 0 && (
          <div className="p-12 text-center text-sm" style={{ color: '#8A8A8E' }}>
            Compartilhe seu link para começar a indicar!
          </div>
        )}
        {referrals.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="px-6 py-4 flex items-center gap-4 transition-colors"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: 'rgba(10,132,255,0.1)', color: '#0A84FF' }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: '#F5F7FA' }}>Indicação #{r.id.slice(-6).toUpperCase()}</p>
              <p className="text-xs mt-0.5" style={{ color: '#8A8A8E' }}>{formatDate(r.created_at)}</p>
            </div>
            <span className={`badge badge-${r.status === 'ACTIVE' ? 'green' : r.status === 'PENDING' ? 'yellow' : 'gray'}`}>
              {r.status === 'ACTIVE' ? 'Confirmada' : r.status === 'PENDING' ? 'Pendente' : r.status}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
