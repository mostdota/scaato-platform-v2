import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/Sidebar'
import PaymentsClient from '@/components/dashboard/PaymentsClient'
import type { Profile } from '@/types'

export const metadata = { title: 'Meus Pagamentos' }

export default async function PaymentsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, paymentsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('payments').select('*').eq('profile_id', user.id).order('due_date', { ascending: false }),
  ])

  return (
    <div className="flex flex-col min-h-full">
      <TopBar profile={profileRes.data as Profile} title="Meus Pagamentos" />
      <div className="flex-1 p-6">
        <PaymentsClient payments={paymentsRes.data ?? []} />
      </div>
    </div>
  )
}
