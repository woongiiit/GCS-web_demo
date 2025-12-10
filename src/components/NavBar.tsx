'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import TermsOfServiceModal from './TermsOfServiceModal'

// Figma image asset URLs for NavBar
const imgVector = "https://www.figma.com/api/mcp/asset/5d8e99da-ec61-4d26-97b7-e206b4acd949";
const imgEllipse33 = "https://www.figma.com/api/mcp/asset/d94c0c84-ae63-40e1-bc2c-1c059fc022cc";
const imgRectangle2 = "https://www.figma.com/api/mcp/asset/141b3cf6-eb4b-4e6b-bc65-d8a0c13a7ecb";
const imgBurger = "https://www.figma.com/api/mcp/asset/12b8fd6e-6811-4056-a06f-b620cedd4e82";
const img5 = "https://www.figma.com/api/mcp/asset/0083f04b-c6c4-4f79-955f-16d8539ba33e";
const img6 = "https://www.figma.com/api/mcp/asset/1988d300-64b1-4f7d-83d0-7298e4cbb843";
const img7 = "https://www.figma.com/api/mcp/asset/05dd2805-4ef3-4ff1-ba31-67a4571ca807";
const img8 = "https://www.figma.com/api/mcp/asset/27891397-84ba-4270-ba80-ace71723ecd7";
const img9 = "https://www.figma.com/api/mcp/asset/3c7f601f-bae1-4dea-93a0-5c9e33362501";
const img = "https://www.figma.com/api/mcp/asset/3a1838f0-3c69-4122-af88-626f832f5313";
const img1 = "https://www.figma.com/api/mcp/asset/1b8b45db-3bc5-49c9-a978-c98f7a10dcbe";
const img2 = "https://www.figma.com/api/mcp/asset/d9e0f8de-9cf1-458d-83e6-afc87a67d2c9";
const img3 = "https://www.figma.com/api/mcp/asset/42aa2995-575d-4bb2-b775-a090ba2b3595";
const img4 = "https://www.figma.com/api/mcp/asset/6dfdb18b-2e85-4ece-8f4e-27922b958ab7";

function IconexLightUser({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute contents left-[5px] top-[3px]">
        <div className="absolute flex items-center justify-center left-[8px] size-[8px] top-[3px]">
          <div className="flex-none rotate-[180deg] scale-y-[-100%]">
            <div className="relative size-[8px]">
              <div className="absolute inset-[-9.38%]">
                <img alt="" className="block max-w-none size-full" src={imgEllipse33} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute h-[7.5px] left-[5px] top-[13px] w-[14px]">
          <div className="absolute inset-[3.85%_-5.36%_-6.03%_-5.36%]">
            <img alt="" className="block max-w-none size-full" src={imgRectangle2} />
          </div>
        </div>
      </div>
    </div>
  );
}

function IconexLightBurger({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute h-[12px] left-[4px] top-[6px] w-[16px]">
        <div className="absolute inset-[-6.25%_-4.69%]">
          <img alt="" className="block max-w-none size-full" src={imgBurger} />
        </div>
      </div>
    </div>
  );
}

export default function NavBar() {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

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
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-[#f8f6f4] h-[34px] shrink-0 w-full" />
        <div className="bg-[#f8f6f4] h-[44px] overflow-clip relative shadow-[0px_4px_10px_0px_rgba(99,81,73,0.1)] shrink-0 w-full">
          <button
            onClick={toggleMobileMenu}
            className="absolute left-[16px] size-[24px] top-[10px] cursor-pointer"
          >
            <IconexLightBurger className="size-full" />
          </button>
          <Link 
            href={user ? myPageHref : '/login'} 
            className="absolute inset-[22.73%_4.27%_22.73%_89.33%] cursor-pointer"
          >
            <IconexLightUser className="size-full" />
          </Link>
          <Link href="/" className="absolute h-[18.9px] left-[160.69px] top-[12.55px] w-[53.62px]">
            <div className="absolute inset-[1.48%_82.19%_0_0]">
              <img className="block max-w-none size-full" alt="GCS Logo" src={img5} />
            </div>
            <div className="absolute inset-[0_0_0_68.67%]">
              <img className="block max-w-none size-full" alt="GCS Logo" src={img6} />
            </div>
            <div className="absolute inset-[32.59%_-3.66%_23.7%_-2.35%]">
              <img className="block max-w-none size-full" alt="GCS Logo" src={img7} />
            </div>
            <div className="absolute inset-[1.48%_65.71%_0.06%_18.58%]">
              <img className="block max-w-none size-full" alt="GCS Logo" src={img8} />
            </div>
            <div className="absolute inset-[1.48%_32.86%_0_36.07%]">
              <img className="block max-w-none size-full" alt="GCS Logo" src={img9} />
            </div>
          </Link>
        </div>
      </div>

      {/* 모바일 메뉴 오버레이 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
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
                  <IconexLightBurger className="size-[24px]" />
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
                  <IconexLightUser className="size-[24px]" />
                </Link>
              </div>
            </div>

            {/* 메뉴 컨텐츠 - 그라데이션 배경 */}
            <div className="bg-gradient-to-r from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.1)] bg-[#f57520] px-[26px] pt-[44px] pb-[88px]">
              <div className="flex flex-col gap-[16px]">
                {menuItems.map((item) => (
                  <div key={item.href} className="flex flex-col">
                    {item.subItems.length > 0 ? (
                      <button
                        onClick={() => toggleSubMenu(item.href)}
                        className="flex items-center gap-2 text-left cursor-pointer"
                      >
                        <span className="text-[28px] font-extrabold text-white leading-[1.75]">
                          {item.label}
                        </span>
                        <div className="flex items-center justify-center relative shrink-0 size-[24px]">
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
                  <div className="flex flex-col gap-[8px] items-start w-[181px]">
                    <div className="h-[21px] relative shrink-0 w-[59px]">
                      <div className="absolute inset-[1.48%_82.19%_0_0]">
                        <img className="block max-w-none size-full" alt="GCS Logo" src={img} />
                      </div>
                      <div className="absolute inset-[0_0_0_68.67%]">
                        <img className="block max-w-none size-full" alt="GCS Logo" src={img1} />
                      </div>
                      <div className="absolute inset-[32.59%_-3.66%_23.7%_-2.35%]">
                        <img className="block max-w-none size-full" alt="GCS Logo" src={img2} />
                      </div>
                      <div className="absolute inset-[1.48%_65.71%_0.06%_18.58%]">
                        <img className="block max-w-none size-full" alt="GCS Logo" src={img3} />
                      </div>
                      <div className="absolute inset-[1.48%_32.86%_0_36.07%]">
                        <img className="block max-w-none size-full" alt="GCS Logo" src={img4} />
                      </div>
                    </div>
                    <div className="flex flex-col text-[8px] text-[#443e3c] leading-[1.5] w-full">
                      <p className="w-full">
                        © 2025 GCS:Web. All rights reserved.
                      </p>
                      <button 
                        onClick={() => setIsTermsModalOpen(true)} 
                        className="w-full text-left underline decoration-solid text-[8px] text-[#443e3c] leading-[1.5]"
                      >
                        이용약관
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-[34px]"></div>
            </div>
          </div>
        </div>
      )}
      {isTermsModalOpen && <TermsOfServiceModal onClose={() => setIsTermsModalOpen(false)} />}
    </>
  );
}

