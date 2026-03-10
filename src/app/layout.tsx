import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'SCAATO — Sua Scooter Elétrica', template: '%s | SCAATO' },
  description: 'Adquira sua scooter elétrica com pagamento simplificado. Mobilidade urbana sustentável com zero burocracia.',
  keywords: ['scooter elétrica', 'mobilidade urbana', 'scaato', 'veículo elétrico', 'sustentabilidade'],
  authors: [{ name: 'SCAATO' }],
  openGraph: {
    title: 'SCAATO — Sua Scooter Elétrica',
    description: 'Adquira sua scooter elétrica com pagamento simplificado.',
    type: 'website',
    locale: 'pt_BR',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
