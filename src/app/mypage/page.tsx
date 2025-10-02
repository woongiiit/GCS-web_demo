'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserInfo {
  id: string
  email: string
  name: string
  studentId: string
  major: string
  phone: string
  role: string
}

export default function MyPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'cart'>('profile')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    major: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // 사용자 정보 로드
  useEffect(() => {
    if (user) {
      setUserInfo({
        id: user.id,
        email: user.email,
        name: user.name,
        studentId: user.studentId,
        major: user.major,
        phone: user.phone,
        role: user.role
      })
      setFormData({
        name: user.name || '',
        studentId: user.studentId || '',
        major: user.major || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      // 비밀번호 변경 요청
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('비밀번호가 성공적으로 변경되었습니다.')
        setMessageType('success')
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setMessage(data.error || '비밀번호 변경 중 오류가 발생했습니다.')
        setMessageType('error')
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error)
      setMessage('서버 오류가 발생했습니다. 다시 시도해주세요.')
      setMessageType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

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

  if (!user) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white">
        {/* 상단 검은색 영역 */}
        <div className="bg-black pt-32 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            {/* 페이지 제목 */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">마이페이지</h1>
              <p className="text-white text-sm mb-8">개인정보 및 장바구니를 관리하세요.</p>
              
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
            <div className="flex justify-center space-x-8 py-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                개인정보수정
              </button>
              <button
                onClick={() => setActiveTab('cart')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'cart'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                장바구니
              </button>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="bg-white min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-0">
            <div className="bg-white px-4 py-8">
              {activeTab === 'profile' ? (
                <div>
                  {/* 사용자 정보 */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-black mb-6">개인정보</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {user.name}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">학번</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {user.studentId}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">주전공</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {user.major}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {user.phone}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {user.email}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {user.role === 'ADMIN' ? '관리자' : '일반 사용자'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 비밀번호 변경 */}
                  <div>
                    <h2 className="text-2xl font-bold text-black mb-6">비밀번호 변경</h2>
                    
                    {message && (
                      <div className={`mb-6 p-4 rounded-lg ${
                        messageType === 'success' 
                          ? 'bg-green-50 border border-green-200 text-green-700'
                          : 'bg-red-50 border border-red-200 text-red-700'
                      }`}>
                        {message}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          현재 비밀번호
                        </label>
                        <input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                          value={formData.currentPassword}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          새 비밀번호
                        </label>
                        <input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                          value={formData.newPassword}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          새 비밀번호 확인
                        </label>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-colors ${
                          isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
                        }`}
                      >
                        {isSubmitting ? '변경 중...' : '비밀번호 변경'}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div>
                  {/* 장바구니 탭 */}
                  <h2 className="text-2xl font-bold text-black mb-6">장바구니</h2>
                  
                  {/* 장바구니가 비어있을 때 */}
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
                    <p className="text-gray-500 mb-6">원하는 상품을 장바구니에 담아보세요.</p>
                    <Link
                      href="/shop"
                      className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      쇼핑하러 가기
                    </Link>
                  </div>

                  {/* 장바구니 아이템이 있을 때의 예시 (주석 처리) */}
                  {/* 
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                        <img src="/images/shop/sample-product.jpg" alt="상품" className="w-full h-full object-cover rounded-lg" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">상품명</h3>
                        <p className="text-sm text-gray-500">브랜드명</p>
                        <p className="text-lg font-semibold text-black">25,000원</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100">
                          <span className="text-gray-600">-</span>
                        </button>
                        <span className="w-8 text-center">1</span>
                        <button className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100">
                          <span className="text-gray-600">+</span>
                        </button>
                      </div>
                      <button className="text-red-500 hover:text-red-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  */}
                </div>
              )}
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
