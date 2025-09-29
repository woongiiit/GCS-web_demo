import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
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
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    GCS Demo
                  </h1>
                </div>
                <div className="flex items-center space-x-6">
                  <a href="/" className="text-gray-700 hover:text-gray-900 transition-colors">
                    홈
                  </a>
                  <a href="/about" className="text-gray-700 hover:text-gray-900 transition-colors">
                    About GCS
                  </a>
                  <a href="/archive" className="text-gray-700 hover:text-gray-900 transition-colors">
                    Archive
                  </a>
                  <a href="/community" className="text-gray-700 hover:text-gray-900 transition-colors">
                    Community
                  </a>
                  <a href="/shop" className="text-gray-700 hover:text-gray-900 transition-colors">
                    Shop
                  </a>
                  <a href="/posts" className="text-gray-700 hover:text-gray-900 transition-colors">
                    게시글
                  </a>
                  <a href="/login" className="text-gray-700 hover:text-gray-900 transition-colors">
                    로그인
                  </a>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
