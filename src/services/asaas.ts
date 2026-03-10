import axios from 'axios'
import type { AsaasCustomer, AsaasPayment, AsaasPixQrCode } from '@/types'

const api = axios.create({
  baseURL: process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3',
  headers: {
    'access_token': process.env.ASAAS_API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ── Clientes ────────────────────────────────

export async function createCustomer(data: {
  name: string
  cpfCnpj: string
  email: string
  mobilePhone?: string
  address?: string
  addressNumber?: string
  province?: string
  postalCode?: string
}): Promise<AsaasCustomer> {
  const res = await api.post('/customers', {
    name: data.name,
    cpfCnpj: data.cpfCnpj.replace(/\D/g, ''),
    email: data.email,
    mobilePhone: data.mobilePhone?.replace(/\D/g, ''),
    address: data.address,
    province: data.province,
    postalCode: data.postalCode?.replace(/\D/g, ''),
    notificationDisabled: false,
  })
  return res.data
}

export async function findCustomerByCpf(cpfCnpj: string): Promise<AsaasCustomer | null> {
  const res = await api.get('/customers', {
    params: { cpfCnpj: cpfCnpj.replace(/\D/g, ''), limit: 1 },
  })
  return res.data.data?.[0] ?? null
}

export async function getOrCreateCustomer(profile: {
  name: string
  cpf: string
  email: string
  phone?: string
  address?: string
  city?: string
  zipCode?: string
}): Promise<AsaasCustomer> {
  const existing = await findCustomerByCpf(profile.cpf)
  if (existing) return existing
  return createCustomer({
    name: profile.name,
    cpfCnpj: profile.cpf,
    email: profile.email,
    mobilePhone: profile.phone,
    address: profile.address,
    province: profile.city,
    postalCode: profile.zip_code,
  })
}

// ── Pagamentos ──────────────────────────────

export interface CreatePaymentInput {
  customerId: string
  value: number
  dueDate: string
  description: string
  billingType?: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'UNDEFINED'
  externalReference?: string
  installmentCount?: number
  installmentValue?: number
}

export async function createPayment(input: CreatePaymentInput): Promise<AsaasPayment> {
  const res = await api.post('/payments', {
    customer: input.customerId,
    billingType: input.billingType ?? 'UNDEFINED',
    value: input.value,
    dueDate: input.dueDate,
    description: input.description,
    externalReference: input.externalReference,
    installmentCount: input.installmentCount,
    installmentValue: input.installmentValue,
  })
  return res.data
}

export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  const res = await api.get(`/payments/${paymentId}`)
  return res.data
}

export async function getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
  const res = await api.get(`/payments/${paymentId}/pixQrCode`)
  return res.data
}

export async function deletePayment(paymentId: string): Promise<void> {
  await api.delete(`/payments/${paymentId}`)
}

// ── Assinaturas Recorrentes ──────────────────

export async function createSubscription(data: {
  customerId: string
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD'
  value: number
  nextDueDate: string
  cycle: 'MONTHLY'
  description: string
  externalReference?: string
  endDate?: string
}) {
  const res = await api.post('/subscriptions', {
    customer: data.customerId,
    billingType: data.billingType,
    value: data.value,
    nextDueDate: data.nextDueDate,
    cycle: data.cycle,
    description: data.description,
    externalReference: data.externalReference,
    endDate: data.endDate,
  })
  return res.data
}

// ── Mapeamento de Status ─────────────────────

export function mapStatus(asaasStatus: string): 'PENDING' | 'CONFIRMED' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED' {
  const map: Record<string, 'PENDING' | 'CONFIRMED' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'> = {
    PENDING: 'PENDING',
    RECEIVED: 'CONFIRMED',
    CONFIRMED: 'CONFIRMED',
    OVERDUE: 'OVERDUE',
    REFUNDED: 'REFUNDED',
    REFUND_REQUESTED: 'REFUNDED',
    CHARGEBACK_REQUESTED: 'CANCELLED',
    CHARGEBACK_DISPUTE: 'CANCELLED',
    DUNNING_RECEIVED: 'CONFIRMED',
    AWAITING_RISK_ANALYSIS: 'PENDING',
  }
  return map[asaasStatus] ?? 'PENDING'
}
