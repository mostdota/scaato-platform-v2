import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'
import type { Profile } from '@/types'

export const metadata = { title: 'Admin — Dashboard SCAATO' }

export default async function AdminDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, customersRes, ordersRes, paymentsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('profiles').select('id').neq('role', 'ADMIN').neq('role', 'SUPER_ADMIN'),
    supabase.from('orders').select('id, status, monthly_value, created_at, profile_id, scooter_model').order('created_at', { ascending: false }).limit(20),
    supabase.from('payments').select('id, status, due_date, paid_at').order('created_at', { ascending: false }).limit(50),
  ])

  const payments = paymentsRes.data ?? []
  const orders   = ordersRes.data   ?? []
  const profile  = profileRes.data  as Profile

  if (!profile || !['ADMIN','SUPER_ADMIN'].includes(profile.role)) redirect('/app-v3')

  const stats = {
    totalUsers:      customersRes.data?.length ?? 0,
    totalOrders:     orders.length,
    totalRevenue:    payments.filter(p => p.status === 'CONFIRMED').length * 746,
    pendingPayments: payments.filter(p => p.status === 'PENDING').length,
    overduePayments: payments.filter(p => p.status === 'OVERDUE').length,
    totalContracts:  orders.filter(o => o.status === 'CONTRACT_SIGNED' || o.status === 'ACTIVE').length,
  }

  return <AdminDashboardClient profile={profile} stats={stats} recentOrders={orders as any} recentPayments={payments as any} />
}
