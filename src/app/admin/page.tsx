'use client'

import {
  Suspense,
  useState,
  useEffect
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      <div className="flex-1 flex flex-col gap-[60px] px-0 py-0">
        {/* 알림/문의/로그 버튼들 */}
        <div className="border-b-2 border-[#eeebe6] flex items-center w-full">
          <Link 
            href="/admin/notifications"
            className="flex-1 flex flex-col gap-3 items-center justify-center py-5 px-0"
          >
            <div className="relative size-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex gap-1 items-center text-[15px] leading-[1.5]">
              <span className="font-normal text-[#443e3c]">알림</span>
              <span className="font-bold text-[#ee4a08]">5</span>
            </div>
          </Link>
          <div className="border-l-2 border-r-2 border-[#eeebe6] flex-1 flex flex-col gap-3 items-center justify-center py-5 px-0">
            <div className="relative size-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex gap-1 items-center text-[15px] leading-[1.5]">
              <span className="font-normal text-[#443e3c]">문의</span>
              <span className="font-bold text-[#ee4a08]">5</span>
            </div>
          </div>
          <Link 
            href="/admin/logs"
            className="flex-1 flex flex-col gap-3 items-center justify-center py-5 px-0"
          >
            <div className="relative size-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div className="flex items-center text-[15px] leading-[1.5]">
              <span className="font-normal text-[#443e3c]">로그</span>
            </div>
          </Link>
        </div>

        {/* Body - 카드 섹션들 */}
        <div className="flex flex-col gap-[40px] px-5 py-0">
          {/* 판매 관리 카드 */}
          <div className="bg-white rounded-xl p-4 flex flex-col gap-[44px]">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2.5 items-center justify-center w-full">
                <p className="flex-1 font-bold text-[15px] leading-[1.5] text-[#443e3c]">
                  판매 관리
                </p>
              </div>
              <div className="h-px relative w-full">
                <div className="absolute bottom-0 left-0 right-0 top-[-2px] border-t border-[#eeebe6]"></div>
              </div>
            </div>
            <div className="flex gap-2.5 items-center w-full">
              <div className="flex-1 flex flex-col font-bold gap-4 px-0 py-3 text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px]">
                <Link href="/admin/orders" className="w-full">
                  모든 주문 내역
                </Link>
                <Link href="/admin/products" className="w-full">
                  상품 관리
                </Link>
                <Link href="/admin/settlements" className="w-full">
                  정산 내역
                </Link>
              </div>
            </div>
          </div>

          {/* 사용자 관리 카드 */}
          <div className="bg-white rounded-xl p-4 flex flex-col gap-[44px]">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2.5 items-center justify-center w-full">
                <p className="flex-1 font-bold text-[15px] leading-[1.5] text-[#443e3c]">
                  사용자 관리
                </p>
              </div>
              <div className="h-px relative w-full">
                <div className="absolute bottom-0 left-0 right-0 top-[-2px] border-t border-[#eeebe6]"></div>
              </div>
            </div>
            <div className="flex flex-col gap-4 justify-center px-0 py-3">
              <div className="flex flex-col font-bold gap-4 text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px] w-full">
                <Link href="/admin/users" className="w-full">
                  회원 관리
                </Link>
                <Link href="/admin/seller-teams" className="w-full">
                  판매팀 관리
                </Link>
              </div>
            </div>
          </div>

          {/* 데이터 카드 */}
          <div className="bg-white rounded-xl p-4 flex flex-col gap-[44px]">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2.5 items-center justify-center w-full">
                <p className="flex-1 font-bold text-[15px] leading-[1.5] text-[#443e3c]">
                  데이터
                </p>
              </div>
              <div className="h-px relative w-full">
                <div className="absolute bottom-0 left-0 right-0 top-[-2px] border-t border-[#eeebe6]"></div>
              </div>
            </div>
            <div className="flex flex-col gap-4 justify-center px-0 py-3">
              <div className="flex flex-col font-bold gap-4 text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px] w-full">
                <p className="w-full">뭘 넣을까요?</p>
                <p className="w-full">몰라영</p>
              </div>
            </div>
          </div>

          {/* 기타 카드 */}
          <div className="bg-white rounded-xl p-4 flex flex-col gap-[44px]">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2.5 items-center justify-center w-full">
                <p className="flex-1 font-bold text-[15px] leading-[1.5] text-[#443e3c]">
                  기타
                </p>
              </div>
              <div className="h-px relative w-full">
                <div className="absolute bottom-0 left-0 right-0 top-[-2px] border-t border-[#eeebe6]"></div>
              </div>
            </div>
            <div className="flex gap-2.5 items-center w-full">
              <div className="flex flex-col gap-4 px-0 py-3">
                <Link href="/admin/terms" className="font-bold text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px] w-full">
                  다 때려박음
                </Link>
              </div>
            </div>
            <div className="flex gap-2.5 items-center w-full">
              <div className="flex flex-col gap-4 px-0 py-3">
                <Link href="/admin/deleted" className="font-bold text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px] w-full">
                  삭제항목
                </Link>
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
                <span className="font-bold">이메일</span> : gcs.web@dongguk.edu
              </p>
              <p>
                <span className="font-bold">주소</span> : 서울특별시 강북구 솔샘로 174, 136동 304호
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
