'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, LayoutDashboard, ShoppingCart, CreditCard, FileText,
  Users, BarChart3, Settings, LogOut, Menu, X, ChevronRight,
  TrendingUp, Bike, Wallet, Bell
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/utils'
import type { Profile } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
}

const PARTICIPANT_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/participant/dashboard', icon: LayoutDashboard },
  { label: 'Adquirir Scooter', href: '/participant/buy', icon: ShoppingCart },
  { label: 'Meus Pedidos', href: '/participant/orders', icon: Bike },
  { label: 'Pagamentos', href: '/participant/payments', icon: CreditCard },
  { label: 'Contratos', href: '/participant/contracts', icon: FileText },
  { label: 'Indicações', href: '/participant/referrals', icon: Users },
  { label: 'Carteira', href: '/participant/wallet', icon: Wallet },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Clientes', href: '/admin/customers', icon: Users },
  { label: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Pagamentos', href: '/admin/payments', icon: CreditCard },
  { label: 'Contratos', href: '/admin/contracts', icon: FileText },
  { label: 'Scooters', href: '/admin/scooters', icon: Bike },
  { label: 'Financeiro', href: '/admin/financial', icon: BarChart3 },
  { label: 'Indicações', href: '/admin/referrals', icon: TrendingUp },
  { label: 'Configurações', href: '/admin/settings', icon: Settings },
]

interface SidebarProps {
  profile: Profile | null
  isAdmin?: boolean
}

export function Sidebar({ profile, isAdmin = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const nav = isAdmin ? ADMIN_NAV : PARTICIPANT_NAV

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-[#1e1e1e]",
        collapsed && "justify-center"
      )}>
        <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-black" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">SCAATO</span>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3">
          <span className={cn(
            "text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full",
            isAdmin ? "bg-purple-500/10 text-purple-400" : "bg-[#1DB954]/10 text-[#1DB954]"
          )}>
            {isAdmin ? 'Administrador' : 'Cliente'}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "nav-item",
                active && "nav-item-active",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" style={{ width: '1.1rem', height: '1.1rem' }} />
              {!collapsed && (
                <span className="flex-1">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="text-xs bg-[#1DB954]/20 text-[#1DB954] px-1.5 py-0.5 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
              {!collapsed && active && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-[#1e1e1e] p-3">
        {!collapsed && profile && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#1DB954]/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-[#1DB954]">
                {profile.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{profile.name}</div>
              <div className="text-xs text-[#555] truncate">{profile.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn("nav-item w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/5", collapsed && "justify-center")}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className={cn(
        "hidden lg:flex flex-col bg-[#0d0d0d] border-r border-[#1e1e1e] h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full flex items-center justify-center text-[#666] hover:text-[#f0f0f0] z-10"
        >
          <ChevronRight className={cn("w-3 h-3 transition-transform", collapsed ? "" : "rotate-180")} />
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-10 h-10 bg-[#111] border border-[#2a2a2a] rounded-xl flex items-center justify-center text-[#888]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-[#0d0d0d] border-r border-[#1e1e1e] z-50 overflow-y-auto"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export function TopBar({ profile, title, isAdmin }: { profile: Profile | null; title: string; isAdmin?: boolean }) {
  return (
    <header className="h-14 border-b border-[#1e1e1e] bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
      <h1 className="font-semibold text-[#f0f0f0] pl-10 lg:pl-0">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-lg hover:bg-[#1a1a1a] flex items-center justify-center text-[#555] hover:text-[#888] transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
          <span className="text-xs font-bold text-[#1DB954]">
            {profile?.name?.charAt(0).toUpperCase() || '?'}
          </span>
        </div>
      </div>
    </header>
  )
}
