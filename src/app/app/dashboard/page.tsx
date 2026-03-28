import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppDashboardClient from '@/components/app/AppDashboardClient'

export const metadata = { title: 'SCAATO — Meu Painel' }

export default async function AppDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/app/dashboard')

  const [profileRes, ordersRes, paymentsRes, notifsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('orders').select('*').eq('profile_id', user.id).order('created_at', { ascending: false }).limit(1),
    supabase.from('payments').select('*').eq('profile_id', user.id).order('due_date', { ascending: false }).limit(24),
    supabase.from('notifications').select('*').eq('profile_id', user.id).eq('read', false).order('created_at', { ascending: false }).limit(5),
  ])

  const profile = profileRes.data
  const order = ordersRes.data?.[0] ?? null
  const payments = paymentsRes.data ?? []
  const notifications = notifsRes.data ?? []

  // Se não tem pedido, redireciona para onboarding
  if (!order) redirect('/app/onboarding')

  const totalPaid = payments.filter(p => p.status === 'CONFIRMED').reduce((s, p) => s + Number(p.value), 0)
  const nextPayment = payments.find(p => p.status === 'PENDING')
  const overdueCount = payments.filter(p => p.status === 'OVERDUE').length
  const paidCount = payments.filter(p => p.status === 'CONFIRMED').length

  return (
    <AppDashboardClient
      profile={profile}
      order={order}
      payments={payments}
      notifications={notifications}
      stats={{ totalPaid, nextPayment, overdueCount, paidCount }}
    />
  )
}
