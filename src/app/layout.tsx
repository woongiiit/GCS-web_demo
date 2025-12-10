import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ChatBot from '@/components/ChatBot'
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
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
            <ChatBot />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
