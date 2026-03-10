// ============================================
// SCAATO PLATFORM v2 — Tipos Globais
// ============================================

export type UserRole = 'ADMIN' | 'CUSTOMER' | 'AFFILIATE'
export type ParticipantStatus = 'ACTIVE' | 'CONTEMPLATED' | 'INACTIVE' | 'PENDING'
export type OrderStatus = 'PENDING' | 'PAYMENT_PENDING' | 'PAID' | 'CONTRACT_PENDING' | 'CONTRACT_SIGNED' | 'ACTIVE' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'
export type ContractStatus = 'PENDING' | 'SENT' | 'SIGNED' | 'CANCELLED'
export type PaymentMethod = 'PIX' | 'BOLETO' | 'CREDIT_CARD'
export type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID'

// ── Entidades do Banco ──────────────────────

export interface Brand {
  id: string
  name: string
  primary_color: string
  secondary_color: string
  logo_url?: string
  domain?: string
  created_at: string
}

export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  brand_id?: string
  avatar_url?: string
  cpf?: string
  rg?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  asaas_customer_id?: string
  referral_code?: string
  created_at: string
  updated_at: string
}

export interface Scooter {
  id: string
  model: string
  description?: string
  price: number
  image_url?: string
  available: boolean
  specs?: {
    maxSpeed?: string
    range?: string
    battery?: string
    weight?: string
    charging?: string
  }
  created_at: string
}

export interface Order {
  id: string
  profile_id: string
  scooter_id: string
  status: OrderStatus
  total_amount: number
  referral_code?: string
  notes?: string
  created_at: string
  updated_at: string
  // joins
  profile?: Profile
  scooter?: Scooter
  payments?: Payment[]
  contracts?: Contract[]
}

export interface Payment {
  id: string
  order_id: string
  profile_id: string
  asaas_payment_id?: string
  asaas_customer_id?: string
  method?: PaymentMethod
  value: number
  due_date: string
  status: PaymentStatus
  paid_at?: string
  description?: string
  invoice_url?: string
  bank_slip_url?: string
  pix_qr_code_image?: string
  pix_qr_code_payload?: string
  created_at: string
  updated_at: string
  // joins
  order?: Order
}

export interface Contract {
  id: string
  order_id: string
  profile_id: string
  title: string
  status: ContractStatus
  hash?: string
  document_url?: string
  signature_url?: string
  clicksign_document_key?: string
  clicksign_signer_key?: string
  signed_at?: string
  created_at: string
  updated_at: string
  // joins
  profile?: Profile
  order?: Order
}

export interface GroupConfig {
  id: string
  brandId: string
  minParticipants: number
  feeBeforeContemplation: number
  feeAfterContemplation: number
  scooterCost: number
  totalMonths: number
  reserveRate: number
  initialAccumulationMonths: number
  totalCommission: number
  commissionStages: {
    onSale: number
    onThirdPayment: number
    onContemplation: number
  }
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  referral_code: string
  status: 'PENDING' | 'ACTIVE' | 'CONVERTED'
  created_at: string
  // joins
  referred?: Profile
}

export interface AffiliateWallet {
  id: string
  user_id: string
  balance: number
  total_earned: number
  updated_at: string
}

export interface Commission {
  id: string
  referrer_id: string
  referred_id: string
  order_id: string
  amount: number
  stage: 'onSale' | 'onThirdPayment' | 'onContemplation'
  status: CommissionStatus
  paid_at?: string
  created_at: string
}

// ── Stats & Dashboard ───────────────────────

export interface AdminStats {
  totalCustomers: number
  newCustomersThisMonth: number
  totalOrders: number
  activeOrders: number
  totalRevenue: number
  revenueThisMonth: number
  pendingPayments: number
  overduePayments: number
  pendingContracts: number
  signedContracts: number
  scootersSold: number
  totalAffiliates: number
  totalCommissionsPaid: number
}

export interface CustomerStats {
  orders: number
  activeOrders: number
  totalPaid: number
  pendingPayments: number
  signedContracts: number
  referrals: number
  walletBalance: number
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  orders: number
  payments: number
}

// ── API Response ───────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ── Forms ──────────────────────────────────

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  cpf: string
  rg: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  referralCode?: string
  terms: boolean
}

export interface LoginFormData {
  email: string
  password: string
}

// ── Asaas ──────────────────────────────────

export interface AsaasCustomer {
  id: string
  name: string
  cpfCnpj: string
  email: string
  mobilePhone?: string
  address?: string
  province?: string
  postalCode?: string
}

export interface AsaasPayment {
  id: string
  customer: string
  billingType: string
  value: number
  dueDate: string
  status: string
  invoiceUrl?: string
  bankSlipUrl?: string
  nossoNumero?: string
}

export interface AsaasPixQrCode {
  encodedImage: string
  payload: string
  expirationDate: string
}

export interface AsaasWebhookEvent {
  event: 'PAYMENT_CREATED' | 'PAYMENT_AWAITING_RISK_ANALYSIS' | 'PAYMENT_APPROVED_BY_RISK_ANALYSIS' | 'PAYMENT_REPROVED_BY_RISK_ANALYSIS' | 'PAYMENT_AUTHORIZED' | 'PAYMENT_UPDATED' | 'PAYMENT_CONFIRMED' | 'PAYMENT_RECEIVED' | 'PAYMENT_ANTICIPATED' | 'PAYMENT_OVERDUE' | 'PAYMENT_DELETED' | 'PAYMENT_RESTORED' | 'PAYMENT_REFUNDED' | 'PAYMENT_REFUND_IN_PROGRESS' | 'PAYMENT_CHARGEBACK_REQUESTED' | 'PAYMENT_CHARGEBACK_DISPUTE' | 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL' | 'PAYMENT_DUNNING_RECEIVED' | 'PAYMENT_DUNNING_REQUESTED' | 'PAYMENT_BANK_SLIP_VIEWED' | 'PAYMENT_CHECKOUT_VIEWED'
  payment: AsaasPayment
}
