import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/Sidebar'
import ContractsClient from '@/components/dashboard/ContractsClient'
import type { Profile } from '@/types'

export const metadata = { title: 'Meus Contratos' }

export default async function ContractsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, contractsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('contracts').select('*').eq('profile_id', user.id).order('created_at', { ascending: false }),
  ])

  return (
    <div className="flex flex-col min-h-full">
      <TopBar profile={profileRes.data as Profile} title="Meus Contratos" />
      <div className="flex-1 p-6">
        <ContractsClient contracts={contractsRes.data ?? []} />
      </div>
    </div>
  )
}
