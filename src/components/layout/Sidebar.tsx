'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, ShoppingBag, CreditCard, FileText, Users, LogOut, Zap, ChevronRight } from 'lucide-react'

interface SidebarProps {
  role?: string
  userName?: string
  userEmail?: string
  profile?: { name?: string | null; email?: string | null; role?: string | null } | null
  isAdmin?: boolean
}

const CUSTOMER_LINKS = [
  { href: '/participant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/participant/buy', label: 'Adquirir Scooter', icon: ShoppingBag },
  { href: '/participant/payments', label: 'Pagamentos', icon: CreditCard },
  { href: '/participant/contracts', label: 'Contratos', icon: FileText },
  { href: '/participant/referrals', label: 'Indicações', icon: Users },
]
const ADMIN_LINKS = [
  { href: '/admin/dashboard', label: 'Painel Admin', icon: LayoutDashboard },
]

export default function Sidebar({ role, userName, userEmail, profile, isAdmin }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const resolvedRole = role || profile?.role
  const resolvedName = userName || profile?.name
  const resolvedEmail = userEmail || profile?.email
  const links = (resolvedRole === 'ADMIN' || isAdmin) ? ADMIN_LINKS : CUSTOMER_LINKS

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: 'rgba(10,10,10,0.95)', borderRight: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
      <div className="px-5 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0A84FF' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '0.1em', color: '#F5F7FA' }}>
            SCAATO
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {(resolvedRole === 'ADMIN' || isAdmin) && (
          <p className="px-3 mb-2 text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(138,138,142,0.5)' }}>Admin</p>
        )}
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{ color: active ? '#0A84FF' : '#8A8A8E', background: active ? 'rgba(10,132,255,0.08)' : 'transparent' }}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-40" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="rounded-xl p-3 mb-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-2"
            style={{ background: '#0A84FF', color: '#fff' }}>
            {resolvedName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <p className="text-xs font-semibold truncate" style={{ color: '#F5F7FA' }}>{resolvedName || 'Usuário'}</p>
          <p className="text-xs truncate" style={{ color: '#8A8A8E' }}>{resolvedEmail || ''}</p>
          {(resolvedRole === 'ADMIN' || isAdmin) && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-1.5"
              style={{ background: 'rgba(10,132,255,0.12)', color: '#0A84FF' }}>Admin</span>
          )}
        </div>
        <button onClick={signOut}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all"
          style={{ color: '#8A8A8E' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#F5F7FA')}
          onMouseLeave={e => (e.currentTarget.style.color = '#8A8A8E')}>
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}

// ── TOP BAR ──────────────────────────────────────────────────────────
interface TopBarProps {
  profile?: { name?: string | null; email?: string | null; role?: string | null } | null
  title?: string
  isAdmin?: boolean
}

export function TopBar({ profile, title, isAdmin }: TopBarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '0.05em', color: '#F5F7FA' }}>
          {title || 'Dashboard'}
        </h1>
        {isAdmin && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5"
            style={{ background: 'rgba(10,132,255,0.12)', color: '#0A84FF' }}>Admin</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold" style={{ color: '#F5F7FA' }}>{profile?.name || 'Usuário'}</p>
          <p className="text-xs" style={{ color: '#8A8A8E' }}>{profile?.email}</p>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: '#0A84FF', color: '#fff' }}>
          {profile?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </div>
  )
}
