'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // 로그인하지 않았거나 관리자가 아닌 경우 접근 차단
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

  return (
    <div className="fixed inset-0 bg-white overflow-auto">
      <div className="relative min-h-screen bg-white px-4 py-6 sm:px-0">
        <div className="max-w-6xl mx-auto pt-32">
          
          {/* 페이지 제목 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-4">관리자 페이지</h1>
            <p className="text-gray-600 mb-8">GCS Demo 관리자 대시보드</p>
            
            {/* 홈 아이콘 */}
            <Link href="/" className="inline-block mb-8">
              <div className="w-6 h-6 mx-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
            </Link>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="bg-gray-50 min-h-screen px-4 py-6">
            <div className="bg-white rounded-lg shadow-md p-8">
              
              {/* 관리자 정보 */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-black mb-6">관리자 정보</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                      {user.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                      {user.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* 관리 기능 영역 */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-black mb-6">관리 기능</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* 사용자 관리 */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">사용자 관리</h3>
                      <p className="text-gray-600 text-sm mb-4">회원 정보 조회 및 관리</p>
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        관리하기
                      </button>
                    </div>
                  </div>

                  {/* 콘텐츠 관리 */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">콘텐츠 관리</h3>
                      <p className="text-gray-600 text-sm mb-4">게시글 및 프로젝트 관리</p>
                      <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        관리하기
                      </button>
                    </div>
                  </div>

                  {/* 상품 관리 */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">상품 관리</h3>
                      <p className="text-gray-600 text-sm mb-4">쇼핑몰 상품 및 주문 관리</p>
                      <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        관리하기
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* 통계 영역 */}
              <div>
                <h2 className="text-2xl font-bold text-black mb-6">시스템 통계</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">-</div>
                      <div className="text-gray-600">총 사용자</div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">-</div>
                      <div className="text-gray-600">총 게시글</div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">-</div>
                      <div className="text-gray-600">총 상품</div>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">-</div>
                      <div className="text-gray-600">총 주문</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
