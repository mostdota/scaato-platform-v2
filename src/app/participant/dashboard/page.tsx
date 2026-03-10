import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/Sidebar'
import ParticipantDashboardClient from '@/components/dashboard/ParticipantDashboardClient'
import type { Profile } from '@/types'

export const metadata = { title: 'Meu Painel' }

export default async function ParticipantDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, ordersRes, paymentsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('orders')
      .select('*, scooter:scooters(*)')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('payments')
      .select('*')
      .eq('profile_id', user.id)
      .order('due_date', { ascending: false })
      .limit(10),
  ])

  const profile = profileRes.data as Profile | null
  const orders = ordersRes.data ?? []
  const payments = paymentsRes.data ?? []

  const totalPaid = payments
    .filter(p => p.status === 'CONFIRMED')
    .reduce((sum, p) => sum + Number(p.value), 0)

  const pendingPayments = payments.filter(p => p.status === 'PENDING').length
  const overduePayments = payments.filter(p => p.status === 'OVERDUE').length

  return (
    <div className="flex flex-col min-h-full">
      <TopBar profile={profile} title="Meu Painel" />
      <div className="flex-1 p-6">
        <ParticipantDashboardClient
          profile={profile}
          orders={orders}
          payments={payments}
          stats={{ totalPaid, pendingPayments, overduePayments, totalOrders: orders.length }}
        />
      </div>
    </div>
  )
}
