import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'
import type { Profile } from '@/types'

export const metadata = { title: 'Admin — Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, customersRes, ordersRes, paymentsRes, contractsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('profiles').select('id').eq('role', 'CUSTOMER'),
    supabase.from('orders').select('id, status, total_amount, created_at, profile_id, profiles(name, email)').order('created_at', { ascending: false }).limit(10),
    supabase.from('payments').select('id, status, value, due_date, paid_at, profile_id, method, pix_qr_code_payload, bank_slip_url, invoice_url').order('created_at', { ascending: false }).limit(10),
    supabase.from('contracts').select('id, status').limit(100),
  ])

  const payments = paymentsRes.data ?? []
  const orders   = ordersRes.data   ?? []
  const profile  = profileRes.data  as Profile

  if (!profile || profile.role !== 'ADMIN') redirect('/participant/dashboard')

  const stats = {
    totalUsers:      customersRes.data?.length ?? 0,
    totalOrders:     orders.length,
    totalRevenue:    payments.filter(p => p.status === 'CONFIRMED').reduce((s, p) => s + Number(p.value), 0),
    pendingPayments: payments.filter(p => p.status === 'PENDING').length,
    overduePayments: payments.filter(p => p.status === 'OVERDUE').length,
    totalContracts:  contractsRes.data?.length ?? 0,
  }

  const recentOrders = orders.map(o => ({ ...o, profile: (o as any).profiles as { name: string; email: string } | undefined }))

  return <AdminDashboardClient profile={profile} stats={stats} recentOrders={recentOrders} recentPayments={payments as any} />
}
