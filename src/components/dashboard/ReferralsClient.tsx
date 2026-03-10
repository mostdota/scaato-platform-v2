'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Copy, Check, Share2, Gift } from 'lucide-react'
import { formatDate, formatCurrency } from '@/utils'
import type { Profile } from '@/types'

interface Props {
  profile: Profile | null
  referrals: any[]
  wallet: any
}

export default function ReferralsClient({ profile, referrals, wallet }: Props) {
  const [copied, setCopied] = useState(false)
  const referralCode = profile?.referral_code || '—'
  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://scaato.com'}/cadastro?ref=${referralCode}`

  function copy() {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Programa de Indicações</h2>
        <p className="text-sm text-[#666] mt-1">Indique amigos e ganhe comissões</p>
      </div>

      {/* Wallet */}
      {wallet && (
        <div className="card p-6 bg-gradient-to-br from-[#1DB954]/10 to-transparent border-[#1DB954]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#666] mb-1">Saldo disponível</p>
              <div className="text-4xl font-bold font-mono text-[#1DB954]">
                {formatCurrency(Number(wallet.balance))}
              </div>
              <p className="text-xs text-[#555] mt-1">Total ganho: {formatCurrency(Number(wallet.total_earned))}</p>
            </div>
            <div className="w-14 h-14 bg-[#1DB954]/10 rounded-2xl flex items-center justify-center">
              <Gift className="w-7 h-7 text-[#1DB954]" />
            </div>
          </div>
        </div>
      )}

      {/* Referral code */}
      <div className="card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[#1DB954]" />
          Seu Link de Indicação
        </h3>
        <div className="flex gap-2">
          <div className="flex-1 input font-mono text-sm text-[#888] select-all cursor-text overflow-hidden">
            {shareLink}
          </div>
          <button onClick={copy} className={`btn shrink-0 ${copied ? 'btn-secondary' : 'btn-primary'}`}>
            {copied ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar</>}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Na venda',         value: '30%', color: 'text-[#1DB954]' },
            { label: '3º pagamento',     value: '40%', color: 'text-blue-400' },
            { label: 'Contemplação',     value: '30%', color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#141414] rounded-xl p-3">
              <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs text-[#555]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Referrals list */}
      <div className="card">
        <div className="p-5 border-b border-[#1e1e1e] flex items-center gap-2">
          <Users className="w-4 h-4 text-[#1DB954]" />
          <h3 className="font-semibold">Suas Indicações ({referrals.length})</h3>
        </div>
        {referrals.length === 0 && (
          <div className="p-12 text-center text-[#555] text-sm">
            Nenhuma indicação ainda. Compartilhe seu link!
          </div>
        )}
        <div className="divide-y divide-[#1a1a1a]">
          {referrals.map((ref, i) => (
            <motion.div key={ref.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-9 h-9 rounded-full bg-[#1DB954]/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#1DB954]">
                  {ref.referred?.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{ref.referred?.name || '—'}</div>
                <div className="text-xs text-[#555]">{ref.referred?.email}</div>
              </div>
              <div className="text-right">
                <span className={`badge text-xs ${ref.status === 'CONVERTED' ? 'text-[#1DB954] bg-[#1DB954]/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                  {ref.status === 'CONVERTED' ? 'Convertido' : ref.status === 'ACTIVE' ? 'Ativo' : 'Pendente'}
                </span>
                <div className="text-xs text-[#555] mt-1">{formatDate(ref.created_at)}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
