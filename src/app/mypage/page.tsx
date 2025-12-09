'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TermsOfServiceModal from '@/components/TermsOfServiceModal'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgImage68 = "https://www.figma.com/api/mcp/asset/817fe4c8-3114-4402-be34-8a8aa96e4e3c"
const imgUnion = "https://www.figma.com/api/mcp/asset/f1f075fc-cc50-4edc-8d3e-07a1a052a2f2"
const imgWeuiBackFilled = "https://www.figma.com/api/mcp/asset/aa9a35b0-45a5-40bb-8bc7-1e115032dfb1"
const imgSettings = "https://www.figma.com/api/mcp/asset/e6996bb1-ce33-4e61-9122-59af2f841773"
const imgMdiBell = "https://www.figma.com/api/mcp/asset/bb600bab-cba4-4291-a05c-886a88a32637"
const imgIconParkSolidLike = "https://www.figma.com/api/mcp/asset/dce8c239-5538-4dc5-9762-d50c559b708a"
const imgLine297 = "https://www.figma.com/api/mcp/asset/a273bf71-bbcd-4d46-a610-cf869e02f671"

function MyPageContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getUserRoleLabel = () => {
    if (user.role === 'ADMIN') return '관리자'
    if (user.role === 'MAJOR') return '전공 회원'
    return '일반 회원'
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="bg-[#f8f6f4] min-h-screen flex flex-col">
      {/* Top Section */}
      <div className="flex-shrink-0">
        <div className="h-[34px]"></div>
        <div className="bg-[#f8f6f4] flex h-[44px] items-center justify-between px-[16px] py-[10px] shadow-[0px_4px_10px_0px_rgba(99,81,73,0.1)]">
          <button
            onClick={handleBack}
            className="h-[24px] w-[12px] flex items-center justify-center"
            aria-label="뒤로가기"
          >
            <img alt="뒤로가기" className="block max-w-none size-full" src={imgWeuiBackFilled} />
          </button>
          <p className="font-bold leading-[1.5] text-[15px] text-black">
            마이페이지
          </p>
          <div className="h-[24px] opacity-0 w-[12px]" aria-hidden="true"></div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-[20px] items-start w-full">
        {/* Top Section - Profile */}
        <div className="flex flex-col gap-[36px] items-end w-full px-[20px] pt-[20px]">
          {/* Profile Section */}
          <div className="flex gap-[24px] items-start w-full">
            {/* Profile Image */}
            <div className="bg-white overflow-clip relative rounded-full shrink-0 size-[60px]">
              <div className="absolute h-[64px] left-[-14px] top-0 w-[95px]">
                <img alt="프로필" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage68} />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex flex-1 flex-col items-start">
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-[8px] items-center">
                  <p className="font-bold leading-[1.5] text-[22px] text-black">
                    {user.name || '닉네임'}
                  </p>
                  <button className="relative shrink-0 size-[24px]" aria-label="닉네임 편집">
                    <div className="absolute h-[17.769px] left-[3px] top-[3px] w-[18.265px]">
                      <div className="absolute inset-0">
                        <img alt="편집" className="block max-w-none size-full" src={imgUnion} />
                      </div>
                    </div>
                  </button>
                </div>
                <Link href="/mypage?tab=profile" className="relative shrink-0 size-[24px]" aria-label="설정">
                  <div className="absolute contents left-[2.52px] top-[2px]">
                    <div className="absolute flex items-center justify-center left-[9px] size-[6px] top-[9px]">
                      <div className="flex-none rotate-[180deg] scale-y-[-100%]">
                        <div className="relative size-[6px]">
                          <img alt="설정" className="block max-w-none size-full" src={imgSettings} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="flex h-[26px] items-center">
                <p className="font-normal leading-[1.5] text-[15px] text-[#b7b3af]">
                  {getUserRoleLabel()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mid Section */}
        <div className="flex flex-col gap-[44px] items-start w-full">
          {/* 알림/좋아요 탭 */}
          <div className="border-b-2 border-[#eeebe6] flex items-center w-full">
            <Link 
              href="/mypage/notifications"
              className="flex-1 flex flex-col gap-[12px] items-center justify-center py-5 px-0"
            >
              <div className="relative size-[24px]">
                <img alt="알림" className="block max-w-none size-full" src={imgMdiBell} />
              </div>
              <div className="flex gap-[4px] items-center leading-[1.5] text-[15px]">
                <p className="font-normal text-[#443e3c]">
                  알림
                </p>
                <p className="font-bold text-[#ee4a08]">
                  5
                </p>
              </div>
            </Link>
            <Link 
              href="/mypage/likes"
              className="border-l-2 border-r-2 border-[#eeebe6] flex-1 flex flex-col gap-[12px] items-center justify-center py-5 px-0"
            >
              <div className="relative size-[24px]">
                <img alt="좋아요" className="block max-w-none size-full" src={imgIconParkSolidLike} />
              </div>
              <div className="flex gap-[4px] items-center leading-[1.5] text-[15px]">
                <p className="font-normal text-[#443e3c]">
                  좋아요
                </p>
                <p className="font-bold text-[#ee4a08]">
                  5
                </p>
              </div>
            </Link>
          </div>

          {/* Menu Sections */}
          <div className="flex flex-col gap-[44px] items-start w-full px-[20px]">
            {/* 나의 쇼핑 정보 */}
            <div className="flex flex-col items-start w-full">
              <div className="flex flex-col gap-[8px] items-start w-full">
                <div className="flex items-center justify-center px-0 py-0 w-full">
                  <p className="flex-1 font-normal leading-[1.5] text-[13px] text-[#b7b3af] tracking-[-0.26px]">
                    나의 쇼핑 정보
                  </p>
                </div>
                <div className="h-0 relative w-full">
                  <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
                    <img alt="" className="block max-w-none size-full" src={imgLine297} />
                  </div>
                </div>
              </div>
              <div className="flex items-center px-0 py-0 w-full">
                <div className="flex flex-col font-bold gap-[16px] items-start px-0 py-[12px] text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px] w-full">
                  <Link href="/mypage?tab=orders" className="w-full">
                    주문 내역
                  </Link>
                  <Link href="/mypage?tab=orders" className="w-full">
                    주문 취소/변경 내역
                  </Link>
                  <p className="w-full">리뷰 쓰기</p>
                </div>
              </div>
            </div>

            {/* 나의 창작 정보 */}
            <div className="flex flex-col items-end w-full">
              <div className="flex flex-col gap-[8px] items-start w-full">
                <div className="flex items-center justify-center px-0 py-0 w-full">
                  <p className="flex-1 font-normal leading-[1.5] text-[13px] text-[#b7b3af] tracking-[-0.26px]">
                    나의 창작 정보
                  </p>
                </div>
                <div className="h-0 relative w-full">
                  <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
                    <img alt="" className="block max-w-none size-full" src={imgLine297} />
                  </div>
                </div>
              </div>
              <div className="flex items-center px-0 py-0 w-full">
                <div className="flex flex-col font-bold gap-[16px] items-start px-0 py-[12px] text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px] w-full">
                  <Link href="/mypage?tab=archive" className="w-full">
                    나의 프로젝트
                  </Link>
                  <p className="w-full">창작자 가이드</p>
                </div>
              </div>
            </div>

            {/* 나의 궁금 정보 */}
            <div className="flex flex-col items-start w-full">
              <div className="flex flex-col gap-[8px] items-start w-full">
                <div className="flex items-center justify-center px-0 py-0 w-full">
                  <p className="flex-1 font-normal leading-[1.5] text-[13px] text-[#b7b3af] tracking-[-0.26px]">
                    나의 궁금 정보
                  </p>
                </div>
                <div className="h-0 relative w-full">
                  <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
                    <img alt="" className="block max-w-none size-full" src={imgLine297} />
                  </div>
                </div>
              </div>
              <div className="flex items-center px-0 py-0 w-full">
                <div className="flex flex-col gap-0 items-start px-0 py-[12px]">
                  <p className="font-bold text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px] w-full">
                    문의하기
                  </p>
                </div>
              </div>
            </div>
          </div>
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
              <div className="h-[21px]">
                <Link href="/" className="text-lg font-bold text-black">
                  GCS<span className="text-[#f57520]">:</span>Web
                </Link>
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
      {isTermsModalOpen && <TermsOfServiceModal onClose={() => setIsTermsModalOpen(false)} />}
    </div>
  )
}

export default function MyPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <MyPageContent />
    </Suspense>
  )
}
