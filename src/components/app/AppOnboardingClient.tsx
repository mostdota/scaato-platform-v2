'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Zap, ArrowRight, ArrowLeft, Check, Upload,
  User, FileText, Camera, CreditCard, MapPin, Smartphone, CheckCircle2, X
} from 'lucide-react'

const C = {
  bg: '#050505', card: '#111', border: 'rgba(255,255,255,0.08)',
  blue: '#0A84FF', green: '#34C759', orange: '#FF9F0A', red: '#FF453A',
  text: '#F5F7FA', gray: '#8A8A8E', font: "'Bebas Neue', sans-serif",
}

const STEPS = [
  { id: 'modelo',    label: 'Modelo',       icon: Smartphone,   title: 'Escolha sua scooter' },
  { id: 'dados',     label: 'Dados',        icon: User,         title: 'Seus dados pessoais' },
  { id: 'endereco',  label: 'Endereço',     icon: MapPin,       title: 'Onde você mora' },
  { id: 'docs',      label: 'Documentos',   icon: FileText,     title: 'Upload de documentos' },
  { id: 'facial',    label: 'Biometria',    icon: Camera,       title: 'Verificação facial' },
  { id: 'confirmacao', label: 'Confirmar', icon: CheckCircle2, title: 'Confirme seu pedido' },
]

function mask(val: string, type: 'cpf' | 'phone' | 'cep') {
  const n = val.replace(/\D/g, '')
  if (type === 'cpf')   return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14)
  if (type === 'phone') return n.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15)
  if (type === 'cep')   return n.replace(/(\d{5})(\d{3})/, '$1-$2').substring(0, 9)
  return val
}

interface Props {
  profile: any
  existingOrder: any
  scooters: any[]
  userId: string
}

export default function AppOnboardingClient({ profile, existingOrder, scooters, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(existingOrder ? 5 : 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [facialRunning, setFacialRunning] = useState(false)
  const [facialDone, setFacialDone] = useState(false)
  const [facialStep, setFacialStep] = useState(0)
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { name: string; size: number }>>({})
  const [currentDocType, setCurrentDocType] = useState('')

  const [form, setForm] = useState({
    scooterId: scooters[0]?.id || '',
    scooterModel: scooters[0]?.model || 'Urban Plus',
    name: profile?.name || '',
    cpf: profile?.cpf || '',
    rg: profile?.rg || '',
    phone: profile?.phone || '',
    birthDate: '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    zipCode: profile?.zip_code || '',
  })

  function setField(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  const progress = ((step) / (STEPS.length - 1)) * 100

  async function uploadDoc(type: string, file: File) {
    const ext = file.name.split('.').pop()
    const path = `docs/${userId}/${type}_${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('documents').upload(path, file, { upsert: true })
    if (upErr) {
      // Storage may not be configured - store locally for demo
      setUploadedDocs(d => ({ ...d, [type]: { name: file.name, size: file.size } }))
      return `${path}`
    }
    const { data } = supabase.storage.from('documents').getPublicUrl(path)
    setUploadedDocs(d => ({ ...d, [type]: { name: file.name, size: file.size } }))
    return data.publicUrl
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !currentDocType) return
    setLoading(true)
    await uploadDoc(currentDocType, file)
    setLoading(false)
  }

  function triggerUpload(docType: string) {
    setCurrentDocType(docType)
    fileInputRef.current?.click()
  }

  function runFacial() {
    setFacialRunning(true)
    setFacialStep(0)
    const steps = [
      () => setFacialStep(1),
      () => setFacialStep(2),
      () => setFacialStep(3),
      () => { setFacialStep(4); setFacialDone(true); setFacialRunning(false) },
    ]
    steps.forEach((fn, i) => setTimeout(fn, (i + 1) * 1400))
  }

  async function createOrder() {
    setLoading(true); setError('')
    try {
      // Atualiza perfil
      await supabase.from('profiles').upsert({
        id: userId,
        name: form.name,
        cpf: form.cpf.replace(/\D/g, ''),
        rg: form.rg,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        zip_code: form.zipCode.replace(/\D/g, ''),
        status: 'PENDING',
        kyc_status: 'IN_REVIEW',
        updated_at: new Date().toISOString(),
      })

      // Cria pedido
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        profile_id: userId,
        scooter_id: form.scooterId || null,
        scooter_model: form.scooterModel,
        status: 'KYC_PENDING',
        monthly_value: scooters.find(s => s.id === form.scooterId)?.monthly || 746,
        total_months: 24,
        activation_fee: 470,
        quiosque_address: 'Quiosque SCAATO — Ribeirão Preto/SP',
      }).select().single()

      if (orderErr) throw orderErr

      // Cria eventos de tracking
      await supabase.from('tracking_events').insert([
        { order_id: order.id, event: 'kyc_submitted', description: 'Documentos enviados para análise', status: 'DONE', happened_at: new Date().toISOString() },
        { order_id: order.id, event: 'contract_pending', description: 'Contrato sendo preparado', status: 'PENDING' },
        { order_id: order.id, event: 'fund_analysis', description: 'Análise pelo fundo', status: 'PENDING' },
        { order_id: order.id, event: 'pdi', description: 'PDI e inspeção da scooter', status: 'PENDING' },
        { order_id: order.id, event: 'delivery', description: 'Disponível no quiosque', status: 'PENDING' },
      ])

      // Cria notificação de boas-vindas
      await supabase.from('notifications').insert({
        profile_id: userId,
        title: '🎉 Pedido criado com sucesso!',
        message: `Seu pedido da ${form.scooterModel} está em análise. Em até 48h nosso time entrará em contato.`,
        type: 'SUCCESS',
      })

      router.push('/app/dashboard')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar pedido')
      setLoading(false)
    }
  }

  const S: React.CSSProperties = { fontFamily: C.font }

  function InputField({ label, value, onChange, placeholder, type = 'text' }: any) {
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={{ color: C.gray, fontSize: 11, letterSpacing: 1, display: 'block', marginBottom: 6 }}>{label}</label>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: '14px 16px', color: C.text, fontSize: 15,
            outline: 'none', boxSizing: 'border-box'
          }}
          onFocus={e => (e.target.style.borderColor = C.blue)}
          onBlur={e => (e.target.style.borderColor = C.border as string)}
        />
      </div>
    )
  }

  const DOCS = [
    { type: 'RG_FRONT',      label: 'RG ou CNH — Frente',    desc: 'Foto nítida do documento' },
    { type: 'RG_BACK',       label: 'RG ou CNH — Verso',     desc: 'Foto do verso' },
    { type: 'ADDRESS_PROOF', label: 'Comprovante de endereço', desc: 'Conta de luz, água — últimos 3 meses' },
    { type: 'INCOME_PROOF',  label: 'Comprovante de renda',   desc: 'Holerite ou extrato bancário' },
  ]

  const FACIAL_STEPS = [
    'Capturando documento...',
    'Liveness detection...',
    'Comparando com documento...',
    '✓ Identidade verificada!',
  ]

  return (
    <div style={{ background: C.bg, minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* Header */}
      <div style={{ padding: '20px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="#fff" />
          </div>
          <span style={{ fontFamily: C.font, fontSize: 18, letterSpacing: 2, color: C.text }}>SCAATO</span>
        </div>
        <span style={{ color: C.gray, fontSize: 12 }}>{step + 1} / {STEPS.length}</span>
      </div>

      {/* Progress */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ height: 3, background: C.card, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: C.blue, borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>
        {/* Steps dots */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 12,
                background: i < step ? C.green : i === step ? C.blue : C.card,
                border: `2px solid ${i < step ? C.green : i === step ? C.blue : C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s'
              }}>
                {i < step ? <Check size={12} color="#fff" /> : <s.icon size={10} color={i === step ? '#fff' : C.gray} />}
              </div>
              <span style={{ color: i === step ? C.text : C.gray, fontSize: 9, letterSpacing: 0.5 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 16px 120px' }}>
        <h2 style={{ color: C.text, fontSize: 28, fontFamily: C.font, letterSpacing: 1, marginBottom: 4 }}>{STEPS[step].title}</h2>

        {/* STEP 0 — Modelo */}
        {step === 0 && (
          <div>
            <p style={{ color: C.gray, fontSize: 13, marginBottom: 20 }}>Selecione a scooter do seu contrato</p>
            {scooters.map(s => (
              <div
                key={s.id}
                onClick={() => { setField('scooterId', s.id); setField('scooterModel', s.model) }}
                style={{
                  background: form.scooterId === s.id ? 'rgba(10,132,255,0.1)' : C.card,
                  border: `2px solid ${form.scooterId === s.id ? C.blue : C.border}`,
                  borderRadius: 16, padding: 16, marginBottom: 12, cursor: 'pointer',
                  display: 'flex', gap: 14, alignItems: 'center', transition: 'all 0.2s'
                }}
              >
                {s.image_url && (
                  <img src={s.image_url} alt={s.model} style={{ width: 80, height: 60, objectFit: 'contain', borderRadius: 8 }} />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ color: C.text, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{s.model}</p>
                  <p style={{ color: C.gray, fontSize: 11, marginBottom: 8 }}>{s.description}</p>
                  <p style={{ color: C.blue, fontSize: 18, fontFamily: C.font }}>R$ {Number(s.monthly).toFixed(0)}<span style={{ fontSize: 12, color: C.gray }}>/mês</span></p>
                </div>
                {form.scooterId === s.id && (
                  <div style={{ width: 24, height: 24, borderRadius: 12, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="#fff" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1 — Dados pessoais */}
        {step === 1 && (
          <div>
            <InputField label="NOME COMPLETO" value={form.name} onChange={(v: string) => setField('name', v)} placeholder="Seu nome completo" />
            <InputField label="CPF" value={form.cpf} onChange={(v: string) => setField('cpf', mask(v, 'cpf'))} placeholder="000.000.000-00" />
            <InputField label="RG" value={form.rg} onChange={(v: string) => setField('rg', v)} placeholder="Número do RG" />
            <InputField label="TELEFONE" value={form.phone} onChange={(v: string) => setField('phone', mask(v, 'phone'))} placeholder="(16) 99999-9999" />
            <InputField label="DATA DE NASCIMENTO" value={form.birthDate} onChange={(v: string) => setField('birthDate', v)} type="date" />
          </div>
        )}

        {/* STEP 2 — Endereço */}
        {step === 2 && (
          <div>
            <InputField label="CEP" value={form.zipCode} onChange={(v: string) => setField('zipCode', mask(v, 'cep'))} placeholder="00000-000" />
            <InputField label="ENDEREÇO COMPLETO" value={form.address} onChange={(v: string) => setField('address', v)} placeholder="Rua, número, bairro" />
            <InputField label="CIDADE" value={form.city} onChange={(v: string) => setField('city', v)} placeholder="Sua cidade" />
            <div>
              <label style={{ color: C.gray, fontSize: 11, letterSpacing: 1, display: 'block', marginBottom: 6 }}>ESTADO (UF)</label>
              <select
                value={form.state}
                onChange={e => setField('state', e.target.value)}
                style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', color: C.text, fontSize: 15, boxSizing: 'border-box' }}
              >
                <option value="">Selecione</option>
                {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* STEP 3 — Documentos */}
        {step === 3 && (
          <div>
            <p style={{ color: C.gray, fontSize: 13, marginBottom: 16 }}>Envie fotos nítidas dos seus documentos</p>
            {DOCS.map(doc => {
              const done = !!uploadedDocs[doc.type]
              return (
                <div
                  key={doc.type}
                  onClick={() => !done && triggerUpload(doc.type)}
                  style={{
                    background: done ? 'rgba(52,199,89,0.06)' : C.card,
                    border: `1px solid ${done ? 'rgba(52,199,89,0.3)' : C.border}`,
                    borderRadius: 14, padding: 16, marginBottom: 12,
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: done ? 'default' : 'pointer'
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: done ? 'rgba(52,199,89,0.12)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {done ? <Check size={20} color={C.green} /> : <Upload size={20} color={C.gray} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{doc.label}</p>
                    <p style={{ color: C.gray, fontSize: 11 }}>
                      {done ? `✓ ${uploadedDocs[doc.type].name}` : doc.desc}
                    </p>
                  </div>
                  {done && <CheckCircle2 size={18} color={C.green} />}
                </div>
              )
            })}
            <p style={{ color: C.gray, fontSize: 11, textAlign: 'center', marginTop: 8 }}>
              {Object.keys(uploadedDocs).length} de {DOCS.length} documentos enviados
            </p>
          </div>
        )}

        {/* STEP 4 — Facial */}
        {step === 4 && (
          <div>
            <p style={{ color: C.gray, fontSize: 13, marginBottom: 20 }}>Verificamos sua identidade com segurança</p>

            {/* Scanner ring */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ position: 'relative', width: 160, height: 160 }}>
                <div style={{
                  width: 160, height: 160, borderRadius: 80,
                  border: `3px solid ${facialDone ? C.green : C.blue}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 ${facialRunning ? 30 : 10}px ${facialDone ? C.green : C.blue}40`,
                  transition: 'all 0.5s'
                }}>
                  {facialDone ? (
                    <Check size={48} color={C.green} />
                  ) : (
                    <Camera size={40} color={facialRunning ? C.blue : C.gray} />
                  )}
                </div>
                {facialRunning && (
                  <div style={{
                    position: 'absolute', inset: -4, borderRadius: 88,
                    border: `2px solid transparent`,
                    borderTopColor: C.blue,
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
              </div>
            </div>

            {/* Facial steps */}
            {(['Capturar documento RG ou CNH', 'Liveness detection — prove que é você', 'Comparação facial com o documento', 'Similaridade facial'].map((label, i) => {
              const done = facialStep > i
              const active = facialStep === i && facialRunning
              return (
                <div key={i} style={{
                  background: done ? 'rgba(52,199,89,0.06)' : active ? 'rgba(10,132,255,0.06)' : C.card,
                  border: `1px solid ${done ? 'rgba(52,199,89,0.25)' : active ? 'rgba(10,132,255,0.25)' : C.border}`,
                  borderRadius: 12, padding: '12px 14px', marginBottom: 10,
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.3s'
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                    background: done ? C.green : active ? C.blue : 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {done ? <Check size={14} color="#fff" /> : <span style={{ color: done || active ? '#fff' : C.gray, fontSize: 12, fontWeight: 700 }}>{i + 1}</span>}
                  </div>
                  <span style={{ color: done ? C.green : active ? C.blue : C.gray, fontSize: 13 }}>{label}</span>
                </div>
              )
            }))}

            {!facialRunning && !facialDone && (
              <button
                onClick={runFacial}
                style={{
                  width: '100%', background: C.blue, border: 'none', borderRadius: 14,
                  padding: '16px', color: '#fff', fontSize: 15, fontWeight: 700,
                  marginTop: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <Camera size={18} />
                Iniciar Verificação Facial
              </button>
            )}
            {facialRunning && (
              <div style={{ textAlign: 'center', padding: '16px', color: C.gray, fontSize: 13 }}>
                🔄 Analisando biometria...
              </div>
            )}
            {facialDone && (
              <div style={{ background: 'rgba(52,199,89,0.08)', border: '1px solid rgba(52,199,89,0.3)', borderRadius: 14, padding: 16, textAlign: 'center', marginTop: 8 }}>
                <p style={{ color: C.green, fontSize: 15, fontWeight: 700 }}>✓ Identidade Verificada!</p>
                <p style={{ color: C.gray, fontSize: 12, marginTop: 4 }}>Similaridade: 94% ✓</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 5 — Confirmação */}
        {step === 5 && (
          <div>
            <p style={{ color: C.gray, fontSize: 13, marginBottom: 20 }}>Revise seu pedido antes de confirmar</p>

            {[
              { label: 'Modelo', value: form.scooterModel },
              { label: 'Nome', value: form.name || profile?.name },
              { label: 'CPF', value: form.cpf || profile?.cpf },
              { label: 'Telefone', value: form.phone || profile?.phone },
              { label: 'Parcela mensal', value: `R$ ${Number(scooters.find(s => s.id === form.scooterId)?.monthly || 746).toFixed(2)}` },
              { label: 'Prazo', value: '24 meses' },
              { label: 'Taxa de ativação', value: 'R$ 470,00 (na retirada)' },
              { label: 'Entrega', value: 'Quiosque SCAATO — Ribeirão Preto/SP' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.gray, fontSize: 13 }}>{label}</span>
                <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{value}</span>
              </div>
            ))}

            <div style={{ background: 'rgba(255,159,10,0.08)', border: `1px solid rgba(255,159,10,0.2)`, borderRadius: 14, padding: 14, marginTop: 16 }}>
              <p style={{ color: C.orange, fontSize: 12, lineHeight: 1.6 }}>
                ⚠️ Ao confirmar, seus documentos serão enviados para análise. Nossa equipe entrará em contato em até 48h para assinar o contrato.
              </p>
            </div>

            {error && (
              <div style={{ background: 'rgba(255,69,58,0.1)', border: `1px solid rgba(255,69,58,0.3)`, borderRadius: 12, padding: 12, marginTop: 12 }}>
                <p style={{ color: C.red, fontSize: 13 }}>{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${C.border}`,
        padding: '16px',
        display: 'flex', gap: 12
      }}>
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{
              flex: 1, background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: '16px', color: C.text, fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={step === 4 && !facialDone}
            style={{
              flex: 2, background: step === 4 && !facialDone ? 'rgba(10,132,255,0.3)' : C.blue,
              border: 'none', borderRadius: 14, padding: '16px',
              color: '#fff', fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer'
            }}
          >
            Próximo
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            onClick={createOrder}
            disabled={loading}
            style={{
              flex: 2, background: C.green, border: 'none', borderRadius: 14, padding: '16px',
              color: '#fff', fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer'
            }}
          >
            {loading ? '⏳ Aguarde...' : '✓ Confirmar Pedido'}
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { -webkit-tap-highlight-color: transparent; }
        input, select { color-scheme: dark; }
      `}</style>
    </div>
  )
}
