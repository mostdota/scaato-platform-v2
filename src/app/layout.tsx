import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SCAATO — Urban 100 | Mobilidade Elétrica Premium',
  description: 'Scooter elétrica com motor 1000W e plano facilitado. Grupo SCAATO: parcelas mensais, sem sorteio.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'SCAATO' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SCAATO" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body style={{ background: '#050505' }}>{children}</body>
    </html>
  )
}
