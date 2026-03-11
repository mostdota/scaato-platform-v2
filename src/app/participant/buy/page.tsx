import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BuyClient from './BuyClient'

export default async function BuyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/participant/buy')

  const [profileRes, scootersRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('scooters').select('*').eq('available', true),
  ])

  return <BuyClient profile={profileRes.data} scooters={scootersRes.data || []} />
}
