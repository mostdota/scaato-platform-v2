'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Zap, Home, CreditCard, FileText, Bell, User, LogOut,
  ChevronRight, CheckCircle2, Clock, AlertCircle, XCircle,
  Package, MapPin, Phone, Mail, Calendar, TrendingUp,
  ArrowUpRight, Copy, Check, Menu, X
} from 'lucide-react'

const C = {
  bg: '#050505', card: '#111', border: 'rgba(255,255,255,0.08)',
  blue: '#0A84FF', green: '#34C759', orange: '#FF9F0A', red: '#FF453A',
  text: '#F5F7FA', gray: '#8A8A8E', font: "'Bebas Neue', sans-serif",
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

const STATUS_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  ONBOARDING:       { label: 'Cadastro',       color: C.gray,   desc: 'Completando o cadastro' },
  KYC_PENDING:      { label: 'Análise KYC',    color: C.orange, desc: 'Documentos em análise' },
  KYC_APPROVED:     { label: 'KYC Aprovado',   color: C.green,  desc: 'Documentos aprovados' },
  CONTRACT_PENDING: { label: 'Contrato',        color: C.orange, desc: 'Aguardando assinatura' },
  CONTRACT_SIGNED:  { label: 'Contrato Assinado', color: C.green, desc: 'Enviado ao fundo' },
  FUND_ANALYSIS:    { label: 'Fundo',           color: C.orange, desc: 'Análise do fundo' },
  FUND_APPROVED:    { label: 'Aprovado!',       color: C.green,  desc: 'Liberado para entrega' },
  ACTIVE:           { label: 'Ativo',           color: C.blue,   desc: 'Contrato ativo' },
  DELIVERED:        { label: 'Entregue',        color: C.green,  desc: 'Scooter entregue' },
  CANCELLED:        { label: 'Cancelado',       color: C.red,    desc: 'Pedido cancelado' },
}

const TRACKING_STEPS = [
  { key: 'contrato',   label: 'Contrato Assinado',   icon: FileText  },
  { key: 'fundo',      label: 'Aprovado pelo Fundo',  icon: CheckCircle2 },
  { key: 'pdi',        label: 'PDI e Inspeção',       icon: Package   },
  { key: 'disponivel', label: 'Disponível no Quiosque', icon: MapPin  },
  { key: 'retirada',   label: 'Retirada + Laudo',     icon: CheckCircle2 },
]

function getTrackingStep(status: string) {
  const map: Record<string, number> = {
    CONTRACT_SIGNED: 0, FUND_ANALYSIS: 0, FUND_APPROVED: 1,
    ACTIVE: 2, DELIVERED: 4,
  }
  return map[status] ?? -1
}

interface Props {
  profile: any
  order: any
  payments: any[]
  notifications: any[]
  stats: { totalPaid: number; nextPayment: any; overdueCount: number; paidCount: number }
}

export default function AppDashboardClient({ profile, order, payments, notifications, stats }: Props) {
  const [tab, setTab] = useState<'home' | 'parcelas' | 'contrato' | 'perfil'>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const statusInfo = STATUS_LABELS[order?.status] ?? STATUS_LABELS.ONBOARDING
  const trackingStep = getTrackingStep(order?.status ?? '')
  const firstName = profile?.name?.split(' ')[0] || 'Cliente'

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function copyRef() {
    navigator.clipboard.writeText(profile?.referral_code || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const S: React.CSSProperties = { fontFamily: C.font }

  // ── HOME TAB ──────────────────────────────────────────────
  function HomeTab() {
    return (
      <div style={{ padding: '0 16px 100px' }}>
        {/* Hero card */}
        <div style={{
          background: `linear-gradient(135deg, #001A40 0%, #002D70 100%)`,
          border: `1px solid rgba(10,132,255,0.3)`,
          borderRadius: 20, padding: '20px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: C.gray, fontSize: 11, letterSpacing: 2, marginBottom: 4 }}>OLÁ, {firstName.toUpperCase()}</p>
              <p style={{ color: C.text, fontSize: 22, fontFamily: C.font, letterSpacing: 1 }}>{order?.scooter_model || 'Urban Plus'}</p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: `${statusInfo.color}22`, border: `1px solid ${statusInfo.color}44`,
                borderRadius: 20, padding: '4px 12px', marginTop: 8
              }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: statusInfo.color, boxShadow: `0 0 8px ${statusInfo.color}` }} />
                <span style={{ color: statusInfo.color, fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>{statusInfo.label}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: C.gray, fontSize: 11 }}>Parcela</p>
              <p style={{ color: C.blue, fontSize: 26, fontFamily: C.font, letterSpacing: 1 }}>
                {formatCurrency(order?.monthly_value || 746)}
              </p>
              <p style={{ color: C.gray, fontSize: 10 }}>por mês</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Pagas', value: stats.paidCount, color: C.green },
            { label: 'Pendentes', value: payments.filter(p => p.status === 'PENDING').length, color: C.orange },
            { label: 'Vencidas', value: stats.overdueCount, color: stats.overdueCount > 0 ? C.red : C.gray },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
              <p style={{ color, fontSize: 24, fontFamily: C.font }}>{value}</p>
              <p style={{ color: C.gray, fontSize: 10, letterSpacing: 1 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Next payment */}
        {stats.nextPayment && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,159,10,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={18} color={C.orange} />
                </div>
                <div>
                  <p style={{ color: C.gray, fontSize: 10, letterSpacing: 1 }}>PRÓXIMA PARCELA</p>
                  <p style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>{formatCurrency(Number(stats.nextPayment.value))}</p>
                  <p style={{ color: C.gray, fontSize: 11 }}>Vence {formatDate(stats.nextPayment.due_date)}</p>
                </div>
              </div>
              <button
                onClick={() => setTab('parcelas')}
                style={{ background: C.blue, border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Pagar
              </button>
            </div>
          </div>
        )}

        {/* Tracking */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <p style={{ color: C.gray, fontSize: 11, letterSpacing: 2, marginBottom: 14 }}>TRACKING DO PEDIDO</p>
          {TRACKING_STEPS.map((step, i) => {
            const done = i <= trackingStep
            const active = i === trackingStep + 1
            return (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < TRACKING_STEPS.length - 1 ? 12 : 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 16, flexShrink: 0,
                  background: done ? C.green : active ? 'rgba(10,132,255,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${done ? C.green : active ? C.blue : C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {done ? <Check size={14} color="#fff" /> : <step.icon size={14} color={active ? C.blue : C.gray} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: done ? C.text : active ? C.blue : C.gray, fontSize: 13, fontWeight: done ? 600 : 400 }}>{step.label}</p>
                </div>
                {done && <CheckCircle2 size={14} color={C.green} />}
              </div>
            )
          })}
        </div>

        {/* Total paid */}
        <div style={{ background: `linear-gradient(135deg, #001A00 0%, #002A00 100%)`, border: `1px solid rgba(52,199,89,0.2)`, borderRadius: 16, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: C.gray, fontSize: 11, letterSpacing: 1 }}>TOTAL PAGO</p>
            <p style={{ color: C.green, fontSize: 28, fontFamily: C.font }}>{formatCurrency(stats.totalPaid)}</p>
          </div>
          <TrendingUp size={32} color={C.green} style={{ opacity: 0.5 }} />
        </div>
      </div>
    )
  }

  // ── PARCELAS TAB ─────────────────────────────────────────
  function ParcelasTab() {
    return (
      <div style={{ padding: '0 16px 100px' }}>
        <p style={{ color: C.gray, fontSize: 11, letterSpacing: 2, marginBottom: 16 }}>HISTÓRICO DE PARCELAS</p>
        {payments.length === 0 ? (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <CreditCard size={32} color={C.gray} style={{ marginBottom: 8 }} />
            <p style={{ color: C.gray }}>Nenhuma parcela ainda</p>
          </div>
        ) : (
          payments.map((p, i) => {
            const statusColor = p.status === 'CONFIRMED' ? C.green : p.status === 'OVERDUE' ? C.red : C.orange
            const statusLabel = p.status === 'CONFIRMED' ? 'Paga' : p.status === 'OVERDUE' ? 'Vencida' : 'Pendente'
            return (
              <div key={p.id} style={{
                background: C.card, border: `1px solid ${p.status === 'OVERDUE' ? 'rgba(255,69,58,0.3)' : C.border}`,
                borderRadius: 14, padding: '14px 16px', marginBottom: 10,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${statusColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.status === 'CONFIRMED' ? <CheckCircle2 size={16} color={statusColor} /> :
                     p.status === 'OVERDUE' ? <AlertCircle size={16} color={statusColor} /> :
                     <Clock size={16} color={statusColor} />}
                  </div>
                  <div>
                    <p style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>Parcela {p.installment_number || i + 1}</p>
                    <p style={{ color: C.gray, fontSize: 11 }}>Venc. {formatDate(p.due_date)}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>{formatCurrency(Number(p.value))}</p>
                  <p style={{ color: statusColor, fontSize: 11 }}>{statusLabel}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    )
  }

  // ── CONTRATO TAB ────────────────────────────────────────
  function ContratoTab() {
    return (
      <div style={{ padding: '0 16px 100px' }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <p style={{ color: C.gray, fontSize: 11, letterSpacing: 2, marginBottom: 16 }}>DETALHES DO CONTRATO</p>
          {[
            { label: 'Modelo', value: order?.scooter_model || 'Urban Plus' },
            { label: 'Parcela mensal', value: formatCurrency(Number(order?.monthly_value || 746)) },
            { label: 'Prazo', value: `${order?.total_months || 24} meses` },
            { label: 'Taxa de ativação', value: formatCurrency(Number(order?.activation_fee || 470)) },
            { label: 'Entrega', value: order?.quiosque_address || 'Quiosque SCAATO — Ribeirão Preto/SP' },
            { label: 'Status', value: statusInfo.label },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.gray, fontSize: 13 }}>{label}</span>
              <span style={{ color: C.text, fontSize: 13, fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{value}</span>
            </div>
          ))}
        </div>

        {order?.contract_url ? (
          <a
            href={order.contract_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: C.blue, borderRadius: 14, padding: '16px', width: '100%',
              color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700
            }}
          >
            <FileText size={18} />
            Ver Contrato Digital
          </a>
        ) : (
          <div style={{ background: 'rgba(255,159,10,0.08)', border: `1px solid rgba(255,159,10,0.2)`, borderRadius: 14, padding: 16, textAlign: 'center' }}>
            <Clock size={24} color={C.orange} style={{ marginBottom: 8 }} />
            <p style={{ color: C.orange, fontWeight: 600 }}>Contrato em preparação</p>
            <p style={{ color: C.gray, fontSize: 12, marginTop: 4 }}>Você receberá um e-mail para assinar</p>
          </div>
        )}

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginTop: 16 }}>
          <p style={{ color: C.gray, fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>REGRAS IMPORTANTES</p>
          {[
            'Parcelas contam da data de assinatura do contrato',
            'Entrega realizada no quiosque — não em domicílio',
            'Taxa de ativação de R$470 paga no ato da retirada',
            'Laudo fotográfico obrigatório na retirada',
            'Moto permanece alienada ao fundo por 24 meses',
          ].map((rule, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: C.blue, marginTop: 6, flexShrink: 0 }} />
              <p style={{ color: C.gray, fontSize: 12, lineHeight: 1.5 }}>{rule}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── PERFIL TAB ───────────────────────────────────────────
  function PerfilTab() {
    return (
      <div style={{ padding: '0 16px 100px' }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{profile?.name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div>
              <p style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>{profile?.name}</p>
              <p style={{ color: C.gray, fontSize: 12 }}>{profile?.email}</p>
            </div>
          </div>

          {[
            { icon: Phone, label: 'Telefone', value: profile?.phone || 'Não informado' },
            { icon: Mail, label: 'E-mail', value: profile?.email },
            { icon: MapPin, label: 'Cidade', value: profile?.city ? `${profile.city} - ${profile.state}` : 'Não informado' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
              <Icon size={16} color={C.gray} />
              <div>
                <p style={{ color: C.gray, fontSize: 10 }}>{label}</p>
                <p style={{ color: C.text, fontSize: 13 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Referral */}
        <div style={{ background: `linear-gradient(135deg, #001A40 0%, #002D70 100%)`, border: `1px solid rgba(10,132,255,0.3)`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <p style={{ color: C.gray, fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>CÓDIGO DE INDICAÇÃO</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: C.blue, fontSize: 24, fontFamily: C.font, letterSpacing: 3 }}>{profile?.referral_code || '——'}</p>
            <button
              onClick={copyRef}
              style={{ background: 'rgba(10,132,255,0.2)', border: `1px solid rgba(10,132,255,0.4)`, borderRadius: 10, padding: '8px 14px', color: C.blue, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <p style={{ color: C.gray, fontSize: 11, marginTop: 8 }}>Indique amigos e ganhe benefícios</p>
        </div>

        <button
          onClick={signOut}
          style={{ width: '100%', background: 'rgba(255,69,58,0.1)', border: `1px solid rgba(255,69,58,0.3)`, borderRadius: 14, padding: '16px', color: C.red, fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
        >
          <LogOut size={18} />
          Sair da Conta
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="#fff" />
          </div>
          <span style={{ fontFamily: C.font, fontSize: 18, letterSpacing: 2, color: C.text }}>SCAATO</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {notifications.length > 0 && (
            <div style={{ position: 'relative' }}>
              <Bell size={20} color={C.gray} />
              <div style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: 7, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: 8, fontWeight: 700 }}>{notifications.length}</span>
              </div>
            </div>
          )}
          <div style={{ width: 32, height: 32, borderRadius: 16, background: 'rgba(10,132,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: C.blue, fontSize: 13, fontWeight: 700 }}>{profile?.name?.[0]?.toUpperCase() || 'U'}</span>
          </div>
        </div>
      </div>

      {/* Page title */}
      <div style={{ padding: '20px 16px 12px' }}>
        <h1 style={{ color: C.text, fontSize: 26, fontFamily: C.font, letterSpacing: 1 }}>
          {tab === 'home' ? 'Meu Painel' : tab === 'parcelas' ? 'Parcelas' : tab === 'contrato' ? 'Contrato' : 'Perfil'}
        </h1>
        <p style={{ color: C.gray, fontSize: 12 }}>{statusInfo.desc}</p>
      </div>

      {/* Content */}
      {tab === 'home' && <HomeTab />}
      {tab === 'parcelas' && <ParcelasTab />}
      {tab === 'contrato' && <ContratoTab />}
      {tab === 'perfil' && <PerfilTab />}

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${C.border}`,
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '8px 0 16px', zIndex: 100
      }}>
        {[
          { key: 'home',     label: 'Início',    icon: Home },
          { key: 'parcelas', label: 'Parcelas',  icon: CreditCard },
          { key: 'contrato', label: 'Contrato',  icon: FileText },
          { key: 'perfil',   label: 'Perfil',    icon: User },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            style={{
              background: 'none', border: 'none', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 0'
            }}
          >
            <Icon size={20} color={tab === key ? C.blue : C.gray} />
            <span style={{ color: tab === key ? C.blue : C.gray, fontSize: 10, fontWeight: tab === key ? 600 : 400 }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
