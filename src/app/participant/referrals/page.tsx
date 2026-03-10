import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/Sidebar'
import ReferralsClient from '@/components/dashboard/ReferralsClient'
import type { Profile } from '@/types'

export const metadata = { title: 'Indicações' }

export default async function ReferralsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, referralsRes, walletRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('referrals').select('*, referred:profiles!referrals_referred_id_fkey(name, email, created_at)').eq('referrer_id', user.id).order('created_at', { ascending: false }),
    supabase.from('affiliate_wallets').select('*').eq('user_id', user.id).single(),
  ])

  return (
    <div className="flex flex-col min-h-full">
      <TopBar profile={profileRes.data as Profile} title="Indicações" />
      <div className="flex-1 p-6">
        <ReferralsClient
          profile={profileRes.data as Profile}
          referrals={referralsRes.data ?? []}
          wallet={walletRes.data}
        />
      </div>
    </div>
  )
}
