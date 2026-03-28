import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppOnboardingClient from '@/components/app/AppOnboardingClient'

export const metadata = { title: 'SCAATO — Bem-vindo' }

export default async function OnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/app/onboarding')

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Se já tem pedido ativo, vai para dashboard
  if (order && !['ONBOARDING'].includes(order.status)) {
    redirect('/app/dashboard')
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: scooters } = await supabase.from('scooters').select('*').eq('available', true)

  return (
    <AppOnboardingClient
      profile={profile}
      existingOrder={order}
      scooters={scooters ?? []}
      userId={user.id}
    />
  )
}
