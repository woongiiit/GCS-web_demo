import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GCS Demo',
  description: 'Next.js + PostgreSQL 웹 애플리케이션',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-20">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
