'use client'

import { motion } from 'framer-motion'
import { FileText, CheckCircle2, Clock, ExternalLink, Download } from 'lucide-react'
import { formatDate, getStatusLabel, getStatusColor } from '@/utils'
import type { Contract } from '@/types'

export default function ContractsClient({ contracts }: { contracts: Contract[] }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#0A84FF' }}>Documentos</p>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '0.05em', color: '#F5F7FA' }}>Meus Contratos</h2>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden" style={{ background: 'rgba(28,28,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <FileText className="w-4 h-4" style={{ color: '#0A84FF' }} />
          <span className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>Contratos</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(10,132,255,0.1)', color: '#0A84FF' }}>{contracts.length}</span>
        </div>

        {contracts.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(10,132,255,0.08)' }}>
              <FileText className="w-6 h-6" style={{ color: '#0A84FF' }} />
            </div>
            <p className="text-sm" style={{ color: '#8A8A8E' }}>Nenhum contrato ainda.<br />Após a aquisição seu contrato aparecerá aqui.</p>
          </div>
        )}

        {contracts.map((contract, i) => (
          <motion.div key={contract.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="px-6 py-5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: contract.status === 'SIGNED' ? 'rgba(52,199,89,0.1)' : 'rgba(255,159,10,0.1)' }}>
                {contract.status === 'SIGNED'
                  ? <CheckCircle2 className="w-5 h-5" style={{ color: '#34C759' }} />
                  : <Clock className="w-5 h-5" style={{ color: '#FF9F0A' }} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>
                    Contrato #{contract.id.slice(-8).toUpperCase()}
                  </span>
                  <span className={`badge badge-${getStatusColor(contract.status)}`}>{getStatusLabel(contract.status)}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 mt-1 text-xs" style={{ color: '#8A8A8E' }}>
                  <span>Criado: {formatDate(contract.created_at)}</span>
                  {contract.signed_at && <span>Assinado: {formatDate(contract.signed_at)}</span>}
                </div>
                <div className="flex gap-2 mt-3">
                  {(contract as any).clicksign_url || contract.signature_url && (
                    <a href={(contract as any).clicksign_url || contract.signature_url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: '#0A84FF', color: '#fff' }}>
                      <ExternalLink className="w-3 h-3" />
                      {contract.status === 'SIGNED' ? 'Ver Contrato' : 'Assinar Agora'}
                    </a>
                  )}
                  {(contract as any).pdf_url || contract.document_url && (
                    <a href={(contract as any).pdf_url || contract.document_url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#F5F7FA', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Download className="w-3 h-3" /> Download PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
