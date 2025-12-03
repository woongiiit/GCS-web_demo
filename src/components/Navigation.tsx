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
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-white flex flex-col transform transition-transform duration-300 ease-in-out overflow-y-auto">
            {/* Nav Bar - 상단 고정 */}
            <div className="bg-[#f8f6f4] flex-shrink-0 sticky top-0 z-10">
              {/* Safe Area */}
              <div className="h-[34px]"></div>
              {/* Nav Bar Content */}
              <div className="h-[44px] bg-[#f8f6f4] shadow-[0px_4px_10px_0px_rgba(99,81,73,0.1)] flex items-center justify-between px-4 relative">
                {/* 햄버거 메뉴 아이콘 */}
                <button
                  onClick={toggleMobileMenu}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* 로고 */}
                <Link href="/" className="text-lg font-bold text-black" onClick={toggleMobileMenu}>
                  GCS<span className="text-[#f57520]">:</span>Web
                </Link>
                
                {/* 사용자 아이콘 */}
                <Link
                  href={user ? myPageHref : '/login'}
                  className="text-gray-600 hover:text-black transition-colors"
                  onClick={toggleMobileMenu}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* 메뉴 컨텐츠 - 그라데이션 배경 */}
            <div className="bg-gradient-to-r from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.1)] bg-[#f57520] px-[26px] pt-[44px] pb-[20px]">
              <div className="flex flex-col gap-[32px]">
                <div className="flex flex-col gap-[16px]">
                  {menuItems.map((item) => (
                    <div key={item.href} className="flex flex-col">
                      {item.subItems.length > 0 ? (
                        <button
                          onClick={() => toggleSubMenu(item.href)}
                          className="flex items-center gap-2 text-left"
                        >
                          <span className="text-[28px] font-extrabold text-white leading-[1.75]">
                            {item.label}
                          </span>
                          <div className="flex items-center justify-center">
                            <svg
                              className={`w-6 h-6 transition-transform text-white ${
                                expandedMenus.includes(item.href) ? '' : 'rotate-180'
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </div>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={toggleMobileMenu}
                          className="text-[28px] font-extrabold text-white leading-[1.75]"
                        >
                          {item.label}
                        </Link>
                      )}
                      {item.subItems.length > 0 && expandedMenus.includes(item.href) && (
                        <div className="flex flex-col gap-0 mt-2">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={toggleMobileMenu}
                              className="text-[15px] font-bold text-white leading-[1.5] mt-2"
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* 구분선 */}
                <div className="h-px bg-white/20"></div>
                
                {/* Admin 버튼 (관리자만 표시) */}
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={toggleMobileMenu}
                    className="border border-white rounded-full px-3 py-1 inline-flex items-center justify-center w-fit"
                  >
                    <span className="text-[15px] font-bold text-white leading-[1.5]">
                      Admin
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#f8f6f4] flex-shrink-0">
              <div className="h-[34px]"></div>
              <div className="px-[21px] py-[21px]">
                <div className="flex flex-col gap-[45px]">
                  {/* 고객지원 */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[17px] font-bold text-[#443e3c] leading-[1.5]">
                      고객지원
                    </h3>
                    <div className="flex flex-col gap-3 text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px]">
                      <p>
                        <span className="font-bold">전화</span> : 010-5238-0236
                      </p>
                      <p>
                        <span className="font-bold">이메일</span> : gcsweb01234@gmail.com
                      </p>
                      <p>
                        <span className="font-bold">주소</span> : 서울특별시 강북구 솔샘로 174 136동 304호
                      </p>
                    </div>
                  </div>
                  
                  {/* 사업자 정보 */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[17px] font-bold text-[#443e3c] leading-[1.5]">
                      사업자 정보
                    </h3>
                    <div className="flex flex-col gap-3 text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px]">
                      <div className="flex gap-10">
                        <p>
                          <span className="font-bold">대표</span> : 안성은
                        </p>
                        <p>
                          <span className="font-bold">회사명</span> : 안북스 스튜디오
                        </p>
                      </div>
                      <p>
                        <span className="font-bold">사업자등록번호</span> : 693-01-03164
                      </p>
                      <p>
                        <span className="font-bold">통신판매업신고번호</span> : 제2025-서울중구-0000호
                      </p>
                    </div>
                  </div>
                  
                  {/* 로고 및 저작권 */}
                  <div className="flex flex-col justify-between h-[41px]">
                    <div className="h-[21px]">
                      <Link href="/" className="text-lg font-bold text-black">
                        GCS<span className="text-[#f57520]">:</span>Web
                      </Link>
                    </div>
                    <p className="text-[8px] text-[#443e3c] leading-[1.5]">
                      © 2025 GCS:Web. All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-[34px]"></div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}