import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
})

export const metadata: Metadata = {
  title: 'Mes Projets',
  description: 'Dashboard — Mes Projets',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={plusJakartaSans.variable}>
      <body className="min-h-screen overflow-x-hidden" style={{ background: '#f5f6fa' }}>
        {children}
      </body>
    </html>
  )
}
