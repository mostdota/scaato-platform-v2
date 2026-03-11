import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar, { TopBar } from '@/components/layout/Sidebar'
import type { Profile } from '@/types'

export default async function ParticipantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.role === 'ADMIN') redirect('/admin/dashboard')

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar profile={profile as Profile} isAdmin={false} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
