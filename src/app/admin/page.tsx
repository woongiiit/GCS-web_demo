'use client'

import {
  Suspense,
  useState,
  useEffect
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgMdiBell = "https://www.figma.com/api/mcp/asset/fec88dd4-2a71-4ffc-ab6d-7067c4e5c152"
const imgMessageSquare = "https://www.figma.com/api/mcp/asset/61c2bfd6-81fa-44b0-87e3-a23138b3bb96"
const imgSave = "https://www.figma.com/api/mcp/asset/ab057780-9b6a-41f9-b1af-6ce9ca190010"
const imgLine297 = "https://www.figma.com/api/mcp/asset/06b40351-0cb3-4462-b8b5-385312e99264"

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminPageSuspenseFallback />}>
      <AdminPageContent />
    </Suspense>
  )
}

function AdminPageContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // 로그인하지 않은 경우 또는 관리자가 아닌 경우 리다이렉트
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/')
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

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="bg-[#f8f6f4] min-h-screen flex flex-col">
      {/* Top Section - Nav Bar는 Navigation 컴포넌트에서 처리 */}
      <div className="flex-shrink-0">
        <div className="h-[34px]"></div>
        {/* Nav Bar는 Navigation 컴포넌트에서 렌더링됨 */}
      </div>

      {/* Mid Section */}
      <div className="flex-1 flex flex-col items-center justify-between px-0 py-0">
        {/* 알림/문의/로그 버튼들 */}
        <div className="border-b-2 border-[#eeebe6] flex items-center w-full">
          <Link 
            href="/admin/notifications"
            className="flex-1 flex flex-col gap-[12px] items-center justify-center py-5 px-0"
          >
            <div className="relative size-6">
              <img alt="알림" className="block max-w-none size-full" src={imgMdiBell} />
            </div>
            <div className="flex gap-1 items-center text-[15px] leading-[1.5]">
              <span className="font-normal text-[#443e3c]">알림</span>
              <span className="font-bold text-[#ee4a08]">5</span>
            </div>
          </Link>
          <Link 
            href="/admin/inquiries"
            className="border-l-2 border-r-2 border-[#eeebe6] flex-1 flex flex-col gap-[12px] items-center justify-center py-5 px-0"
          >
            <div className="relative size-6">
              <img alt="문의" className="block max-w-none size-full" src={imgMessageSquare} />
            </div>
            <div className="flex gap-1 items-center text-[15px] leading-[1.5]">
              <span className="font-normal text-[#443e3c]">문의</span>
              <span className="font-bold text-[#ee4a08]">5</span>
            </div>
          </Link>
          <Link 
            href="/admin/logs"
            className="flex-1 flex flex-col gap-[12px] items-center justify-center py-5 px-0"
          >
            <div className="relative size-6">
              <img alt="로그" className="block max-w-none size-full" src={imgSave} />
            </div>
            <div className="flex items-center text-[15px] leading-[1.5]">
              <span className="font-normal text-[#443e3c]">로그</span>
            </div>
          </Link>
        </div>

        {/* Body - 카드 섹션들 */}
        <div className="flex flex-col gap-[16px] items-start mt-[128px]">
          {/* 판매 관리 카드 */}
          <div className="bg-white rounded-[12px] p-4 flex flex-col w-[344px]">
            <div className="flex flex-col gap-[8px] items-start w-full">
              <div className="flex items-center justify-center w-full">
                <p className="flex-1 font-bold text-[15px] leading-[1.5] text-[#443e3c]">
                  판매 관리
                </p>
              </div>
              <div className="h-0 relative w-full">
                <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
                  <img alt="" className="block max-w-none size-full" src={imgLine297} />
                </div>
              </div>
            </div>
            <div className="flex items-center w-full">
              <div className="flex-1 flex flex-col font-bold gap-[16px] px-0 py-3 text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px]">
                <Link href="/admin/product-cards" className="w-full">상품카드 관리</Link>
                <Link href="/admin/all-items" className="w-full">전체 품목 관리</Link>
                <Link href="/admin/settlements" className="w-full">정산 관리</Link>
                <p className="w-full">리뷰 관리</p>
              </div>
            </div>
          </div>

          {/* 사용자 관리 카드 */}
          <div className="bg-white rounded-[12px] p-4 flex flex-col w-[344px]">
            <div className="flex flex-col gap-[8px] items-start w-full">
              <div className="flex items-center justify-center w-full">
                <p className="flex-1 font-bold text-[15px] leading-[1.5] text-[#443e3c]">
                  사용자 관리
                </p>
              </div>
              <div className="h-0 relative w-full">
                <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
                  <img alt="" className="block max-w-none size-full" src={imgLine297} />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start justify-center px-0 py-3 w-full">
              <div className="flex flex-col font-bold gap-[16px] text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px] w-full">
                <p className="w-full">회원 관리</p>
                <p className="w-full">판매팀 관리</p>
              </div>
            </div>
          </div>

          {/* 데이터 카드 */}
          <div className="bg-white rounded-[12px] p-4 flex flex-col w-[344px]">
            <div className="flex flex-col gap-[8px] items-start w-full">
              <div className="flex items-center justify-center w-full">
                <p className="flex-1 font-bold text-[15px] leading-[1.5] text-[#443e3c]">
                  데이터
                </p>
              </div>
              <div className="h-0 relative w-full">
                <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
                  <img alt="" className="block max-w-none size-full" src={imgLine297} />
                </div>
              </div>
            </div>
            <div className="flex flex-col font-bold gap-[16px] items-start justify-center px-0 py-3 text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px] w-full">
              <div className="flex flex-col gap-[16px] items-start w-full">
                <p className="w-full">사이트 활동</p>
                <p className="w-full">매출 현황</p>
              </div>
              <p className="w-full">콘텐츠 통계</p>
              <p className="w-full">사용자 통계</p>
            </div>
          </div>

          {/* 설정 카드 */}
          <div className="bg-white rounded-[12px] p-4 flex flex-col w-[344px]">
            <div className="flex flex-col gap-[8px] items-start w-full">
              <div className="flex items-center justify-center w-full">
                <p className="flex-1 font-bold text-[15px] leading-[1.5] text-[#443e3c]">
                  설정
                </p>
              </div>
              <div className="h-0 relative w-full">
                <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
                  <img alt="" className="block max-w-none size-full" src={imgLine297} />
                </div>
              </div>
            </div>
            <div className="flex items-center w-full">
              <div className="flex flex-col gap-0 px-0 py-3">
                <p className="font-bold text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px] w-full">
                  이용약관 관리
                </p>
              </div>
            </div>
            <div className="flex items-center w-full">
              <div className="flex flex-col gap-0 px-0 py-3">
                <p className="font-bold text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px] w-full">
                  삭제항목
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#f8f6f4] flex-shrink-0 px-[21px] py-[21px]">
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
              <p className="w-full underline decoration-solid">
                이용약관
              </p>
            </div>
          </div>
        </div>
        <div className="h-[34px]"></div>
      </div>
    </div>
  )
}

function AdminPageSuspenseFallback() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}

// AdminUserManagementTab implementation moved to ./admin-tabs
