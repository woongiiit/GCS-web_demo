'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const menuItems = [
    { href: '/', label: '홈' },
    { href: '/about', label: 'About GCS' },
    { href: '/archive', label: 'Archive' },
    { href: '/community', label: 'Community' },
    { href: '/shop', label: 'Shop' },
    { href: '/posts', label: '게시글' },
    { href: '/login', label: '로그인' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 - 좌측 */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-black hover:text-gray-800 transition-colors">
              GCS Demo
            </Link>
          </div>
          
          {/* 메뉴 - 중앙 */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  nav-item relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300
                  ${isActive(item.href)
                    ? 'text-black bg-black text-white font-semibold shadow-lg'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100 hover:shadow-md'
                  }
                  hover:scale-105 hover:-translate-y-0.5
                `}
              >
                {item.label}
                {/* 활성 상태 하단 밑줄 */}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>
                )}
              </Link>
            ))}
          </div>
          
          {/* 우측 공간 (향후 사용자 메뉴 등) */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
          </div>
        </div>
        
        {/* 모바일 메뉴 */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                  ${isActive(item.href)
                    ? 'text-white bg-black font-semibold shadow-md'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
