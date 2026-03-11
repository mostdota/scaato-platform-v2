import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SCAATO — Urban 100 | Mobilidade Elétrica Premium',
  description: 'Scooter elétrica com motor 2000W e 100km de autonomia. Grupo Urban 100: 100 participantes, entregas a partir do 2º mês, sem sorteio.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: '#050505' }}>{children}</body>
    </html>
  )
}
