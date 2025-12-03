'use client'

import {
  Suspense,
  useState,
  useEffect,
  useCallback
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  AdminOrdersTab,
  AdminUserManagementTab
} from './admin-tabs'

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
  const [activeTab, setActiveTab] = useState<
    'users' | 'content' | 'orders'
  >('users')
  const searchParams = useSearchParams()

  const isValidTab = (
    value: string | null
  ): value is 'users' | 'content' | 'orders' => {
    return (
      value === 'users' ||
      value === 'content' ||
      value === 'orders'
    )
  }

  const handleTabChange = useCallback(
    (tab: 'users' | 'content' | 'orders') => {
      setActiveTab(tab)
      const params = new URLSearchParams(searchParams ? searchParams.toString() : '')
      params.set('tab', tab)
      const queryString = params.toString()
      router.replace(queryString ? `/admin?${queryString}` : '/admin', { scroll: false })
    },
    [router, searchParams]
  )

  // 로그인하지 않은 경우 또는 관리자가 아닌 경우 리다이렉트
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
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

  useEffect(() => {
    const tabParam = searchParams ? searchParams.get('tab') : null
    if (isValidTab(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [searchParams, activeTab])

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white">
        {/* 상단 검은색 영역 */}
        <div className="bg-black pt-32 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            {/* 페이지 제목 */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">관리자 페이지</h1>
              <p className="text-white text-sm mb-8">사용자 관리 및 콘텐츠 관리를 수행하세요.</p>
              
              {/* 홈 아이콘 */}
              <Link href="/" className="inline-block">
                <div className="w-6 h-6 mx-auto">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 - 흰색 배경 영역 */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            <div className="flex flex-wrap justify-center gap-6 py-4">
              <button
                onClick={() => handleTabChange('users')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                사용자 관리
              </button>
              <button
                onClick={() => handleTabChange('content')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'content'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                콘텐츠 관리
              </button>
              <button
                onClick={() => handleTabChange('orders')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                모든 주문내역
              </button>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="bg-white min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-0">
            <div className="bg-white px-4 py-8">
              {activeTab === 'users' && <AdminUserManagementTab />}
              {activeTab === 'content' && (
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-black mb-6">콘텐츠 관리</h2>
                  <p className="text-gray-600 mb-6">About 페이지의 각 섹션 콘텐츠를 관리합니다.</p>
                  <Link 
                    href="/admin/content"
                    className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    콘텐츠 관리 페이지로 이동
                  </Link>
                </div>
              )}
              {activeTab === 'orders' && <AdminOrdersTab />}
            </div>
          </div>
        </div>

        {/* 하단 배너 */}
        <div className="bg-white py-6 border-t border-gray-200">
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
