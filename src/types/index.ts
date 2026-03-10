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
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
  domain?: string
  createdAt: string
}

export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  brandId?: string
  avatarUrl?: string
  cpf?: string
  rg?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  asaasCustomerId?: string
  referralCode?: string
  createdAt: string
  updatedAt: string
}

export interface Scooter {
  id: string
  model: string
  description?: string
  price: number
  imageUrl?: string
  available: boolean
  specs?: {
    maxSpeed?: string
    range?: string
    battery?: string
    weight?: string
    charging?: string
  }
  createdAt: string
}

export interface Order {
  id: string
  profileId: string
  scooterId: string
  status: OrderStatus
  totalAmount: number
  referralCode?: string
  notes?: string
  createdAt: string
  updatedAt: string
  // joins
  profile?: Profile
  scooter?: Scooter
  payments?: Payment[]
  contracts?: Contract[]
}

export interface Payment {
  id: string
  orderId: string
  profileId: string
  asaasPaymentId?: string
  asaasCustomerId?: string
  method?: PaymentMethod
  value: number
  dueDate: string
  status: PaymentStatus
  paidAt?: string
  description?: string
  invoiceUrl?: string
  bankSlipUrl?: string
  pixQrCodeImage?: string
  pixQrCodePayload?: string
  createdAt: string
  updatedAt: string
  // joins
  order?: Order
}

export interface Contract {
  id: string
  orderId: string
  profileId: string
  title: string
  status: ContractStatus
  hash?: string
  documentUrl?: string
  signatureUrl?: string
  clicksignDocumentKey?: string
  clicksignSignerKey?: string
  signedAt?: string
  createdAt: string
  updatedAt: string
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
  referrerId: string
  referredId: string
  referralCode: string
  status: 'PENDING' | 'ACTIVE' | 'CONVERTED'
  createdAt: string
}

export interface AffiliateWallet {
  id: string
  userId: string
  balance: number
  totalEarned: number
  updatedAt: string
}

export interface Commission {
  id: string
  referrerId: string
  referredId: string
  orderId: string
  amount: number
  stage: 'onSale' | 'onThirdPayment' | 'onContemplation'
  status: CommissionStatus
  paidAt?: string
  createdAt: string
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
