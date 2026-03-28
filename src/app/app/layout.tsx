import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'SCAATO App',
  description: 'Sua scooter elétrica com plano facilitado',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SCAATO',
  },
}

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
