'use client'

import { motion } from 'framer-motion'
import { FileText, ExternalLink, CheckCircle2, Clock, Send } from 'lucide-react'
import { formatDate, getStatusLabel, getStatusColor } from '@/utils'
import type { Contract } from '@/types'

export default function ContractsClient({ contracts }: { contracts: Contract[] }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Meus Contratos</h2>
        <p className="text-sm text-[#666] mt-1">Gerados automaticamente após confirmação do pagamento</p>
      </div>

      {contracts.length === 0 && (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-[#444]" />
          </div>
          <h3 className="font-semibold text-[#888] mb-2">Nenhum contrato ainda</h3>
          <p className="text-sm text-[#555]">Seus contratos serão gerados automaticamente após o pagamento.</p>
        </div>
      )}

      <div className="space-y-4">
        {contracts.map((contract, i) => (
          <motion.div
            key={contract.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-6"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                contract.status === 'SIGNED' ? 'bg-[#1DB954]/10' :
                contract.status === 'SENT'   ? 'bg-blue-500/10' : 'bg-[#1a1a1a]'
              }`}>
                {contract.status === 'SIGNED' ? <CheckCircle2 className="w-6 h-6 text-[#1DB954]" /> :
                 contract.status === 'SENT'   ? <Send className="w-6 h-6 text-blue-400" /> :
                                                <Clock className="w-6 h-6 text-[#555]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h3 className="font-semibold text-[#f0f0f0]">{contract.title}</h3>
                  <span className={`badge text-xs ${getStatusColor(contract.status)}`}>
                    {getStatusLabel(contract.status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-[#555]">
                  <span>Criado em: {formatDate(contract.created_at)}</span>
                  {contract.signed_at && <span>Assinado em: {formatDate(contract.signed_at)}</span>}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {contract.status === 'SENT' && contract.signature_url && (
                    <a href={contract.signature_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                      <ExternalLink className="w-3.5 h-3.5" /> Assinar Agora
                    </a>
                  )}
                  {contract.document_url && (
                    <a href={contract.document_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                      <ExternalLink className="w-3.5 h-3.5" /> Ver PDF
                    </a>
                  )}
                </div>

                {contract.status === 'SENT' && (
                  <div className="mt-3 bg-blue-500/5 border border-blue-500/15 rounded-lg px-3 py-2 text-xs text-blue-400">
                    Um e-mail foi enviado para você com o link de assinatura.
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
