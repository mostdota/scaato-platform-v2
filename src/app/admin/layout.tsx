import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import type { Profile } from '@/types'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'ADMIN') redirect('/participant/dashboard')

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050505' }}>
      <Sidebar profile={profile as Profile} isAdmin={true} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: '#080808' }}>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
