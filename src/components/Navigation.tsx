'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const { user, isLoading, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const menuItems = [
    { 
      href: '/about', 
      label: 'About GCS',
      subItems: []
    },
    { 
      href: '/archive', 
      label: 'Archive',
      subItems: [
        { href: '/archive?tab=projects', label: 'Project' },
        { href: '/archive?tab=news', label: 'News' }
      ]
    },
    { 
      href: '/community', 
      label: 'Community',
      subItems: [
        { href: '/community?tab=board', label: 'Board' },
        { href: '/community?tab=lounge', label: 'Lounge' }
      ]
    },
    { 
      href: '/shop', 
      label: 'Shop',
      subItems: [
        { href: '/shop?type=fund', label: 'Fund' },
        { href: '/shop?type=partner-up', label: 'Partner up' }
      ]
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleSubMenu = (href: string) => {
    setExpandedMenus(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const myPageHref = '/mypage'

  return (
    <>
      <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* 로고 - 좌측 */}
            <div className="flex-1 flex items-center">
              <Link href="/" className="text-xl font-bold text-black hover:text-gray-800 transition-colors">
                GCS<span className="text-[#f57520]">:</span>Web
              </Link>
            </div>
            
            {/* 메뉴 - 중앙 (데스크톱만) */}
            <div className="flex-1 hidden md:flex justify-center items-center space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    nav-item relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap
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
            
            {/* 우측 영역 */}
            <div className="flex items-center space-x-3">
              {isLoading ? (
                // 로딩 중
                <div className="text-sm text-gray-400">로딩 중...</div>
              ) : user ? (
                // 로그인된 사용자
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 hidden sm:inline">
                    환영합니다.{' '}
                    <Link
                      href={myPageHref}
                      className="text-black font-semibold hover:text-gray-700 hover:underline transition-colors cursor-pointer"
                    >
                      {user.name}
                    </Link>
                    님
                  </span>
                  
                  {/* 마이페이지 아이콘 */}
                  <Link
                    href={myPageHref}
                    className="text-gray-600 hover:text-black transition-colors p-1"
                    title="마이페이지"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                  
                  {/* 로그아웃 아이콘 */}
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-black transition-colors p-1"
                    title="로그아웃"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                // 로그인되지 않은 사용자 - 로그인 아이콘만 표시
                <Link href="/login" className="text-gray-600 hover:text-black transition-colors p-1" title="로그인">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}

              {/* 햄버거 메뉴 버튼 (모바일) */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden text-gray-600 hover:text-black transition-colors p-1"
                title="메뉴"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 오버레이 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black transition-opacity duration-300 ease-in-out"
            style={{ opacity: isMobileMenuOpen ? 0.5 : 0 }}
            onClick={toggleMobileMenu}
          ></div>
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-white flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-black" onClick={toggleMobileMenu}>
                GCS<span className="text-[#f57520]">:</span>Web
              </Link>
              <button
                onClick={toggleMobileMenu}
                className="text-gray-600 hover:text-black transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 메뉴 컨텐츠 */}
            <div className="bg-orange-500 flex-1 p-6 overflow-y-auto">
              <div className="space-y-6 pt-4">
                {menuItems.map((item) => (
                  <div key={item.href}>
                    <div className="flex items-center justify-between">
                      <Link
                        href={item.href}
                        onClick={toggleMobileMenu}
                        className="flex-1 text-black font-bold text-3xl hover:text-gray-800 transition-colors"
                      >
                        {item.label}
                      </Link>
                      {item.subItems.length > 0 && (
                        <button
                          onClick={() => toggleSubMenu(item.href)}
                          className="ml-3 text-black hover:text-gray-800 transition-transform"
                        >
                          <svg
                            className={`w-6 h-6 transition-transform ${expandedMenus.includes(item.href) ? 'rotate-90' : ''}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {item.subItems.length > 0 && (
                      <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          expandedMenus.includes(item.href) 
                            ? 'max-h-40 opacity-100 mt-3' 
                            : 'max-h-0 opacity-0 mt-0'
                        }`}
                      >
                        <div className="ml-4 space-y-2">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={toggleMobileMenu}
                              className="block text-black text-lg font-bold hover:text-gray-800 transition-colors"
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Admin 버튼 (관리자만 표시) */}
              {user?.role === 'ADMIN' && (
                <>
                  <div className="border-t border-gray-300 my-4"></div>
                  <Link
                    href="/admin"
                    onClick={toggleMobileMenu}
                    className="block w-full py-3 px-4 text-center text-white font-bold border-2 border-white rounded-lg hover:bg-white hover:text-orange-500 transition-colors"
                  >
                    Admin
                  </Link>
                </>
              )}
            </div>

            {/* 하단 배너 */}
            <div className="bg-white py-6 border-t border-gray-200 flex-shrink-0">
              <div className="px-4 flex justify-between items-start gap-4">
                {/* 왼쪽: 로고 정보 */}
                <div className="flex-shrink-0">
                  <p className="text-[10px] text-gray-500 mb-0.5">DONGGUK UNIVERSITY</p>
                  <h3 className="text-sm font-bold text-black">
                    GCS<span className="text-[#f57520]">:</span>Web
                  </h3>
                </div>
                
                {/* 오른쪽: 회사 정보 */}
                <div className="flex-1 text-right space-y-1 min-w-0">
                  <p className="text-[10px] text-gray-600 leading-tight">주소: 서울 필동로 1길 30, 동국대학교</p>
                  <p className="text-[10px] text-gray-600 leading-tight">대표자: 김봉구 | 회사명: 제작담</p>
                  <p className="text-[10px] text-gray-600 leading-tight">사업자번호: 000-00-00000</p>
                  <p className="text-[10px] text-gray-600 leading-tight">통신판매업: 제0000-서울중구-0000호</p>
                  
                  <div className="flex items-center justify-end space-x-1.5 pt-1 whitespace-nowrap">
                    <a href="#" className="text-[10px] text-gray-600 underline">개인정보처리방침</a>
                    <span className="text-[10px] text-gray-400">|</span>
                    <a href="#" className="text-[10px] text-gray-600 underline">이용약관</a>
                    <span className="text-[10px] text-gray-400">|</span>
                    <span className="text-[10px] text-gray-500">site by 제작담</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}