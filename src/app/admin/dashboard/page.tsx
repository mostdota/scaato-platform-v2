import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/Sidebar'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'
import type { Profile } from '@/types'

export const metadata = { title: 'Admin — Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    profileRes,
    customersRes,
    ordersRes,
    paymentsRes,
    contractsRes,
    scootersRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('profiles').select('id, name, email, role, created_at, status').eq('role', 'CUSTOMER').order('created_at', { ascending: false }).limit(10),
    supabase.from('orders').select('id, status, total_amount, created_at, profile_id').order('created_at', { ascending: false }).limit(10),
    supabase.from('payments').select('id, status, value, due_date, paid_at, profile_id').order('created_at', { ascending: false }).limit(10),
    supabase.from('contracts').select('id, status, title, created_at, signed_at, profile_id').order('created_at', { ascending: false }).limit(10),
    supabase.from('scooters').select('id, model, price, available').limit(20),
  ])

  const customers  = customersRes.data  ?? []
  const orders     = ordersRes.data     ?? []
  const payments   = paymentsRes.data   ?? []
  const contracts  = contractsRes.data  ?? []
  const scooters   = scootersRes.data   ?? []

  // Compute stats
  const totalRevenue = payments
    .filter(p => p.status === 'CONFIRMED')
    .reduce((s, p) => s + Number(p.value), 0)

  const stats = {
    totalCustomers:     customers.length,
    totalOrders:        orders.length,
    totalRevenue,
    pendingPayments:    payments.filter(p => p.status === 'PENDING').length,
    overduePayments:    payments.filter(p => p.status === 'OVERDUE').length,
    pendingContracts:   contracts.filter(c => c.status === 'SENT').length,
    signedContracts:    contracts.filter(c => c.status === 'SIGNED').length,
    activeOrders:       orders.filter(o => ['ACTIVE', 'CONTRACT_SIGNED'].includes(o.status)).length,
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar profile={profileRes.data as Profile} title="Dashboard Admin" isAdmin />
      <div className="flex-1 p-6">
        <AdminDashboardClient
          stats={stats}
          customers={customers}
          orders={orders}
          payments={payments}
          contracts={contracts}
        />
      </div>
    </div>
  )
}
