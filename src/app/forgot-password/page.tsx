'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState({
    email: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState('')
  const [retryAfter, setRetryAfter] = useState<number | null>(null)

  // 카운트다운 타이머
  useEffect(() => {
    if (retryAfter && retryAfter > 0) {
      const timer = setTimeout(() => {
        setRetryAfter(retryAfter - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (retryAfter === 0) {
      setRetryAfter(null)
      setError('')
    }
  }, [retryAfter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      // TODO: 실제 API 호출로 비밀번호 재설정 이메일 전송
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setIsEmailSent(true)
      } else {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const retrySeconds = retryAfter ? parseInt(retryAfter) : 60
          setRetryAfter(retrySeconds)
          setError(`요청이 너무 많습니다. ${retrySeconds}초 후에 다시 시도해주세요.`)
        } else {
          setError(data.error || '이메일 전송에 실패했습니다.')
        }
      }
      
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error)
      setError('서버 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (isEmailSent) {
    return (
      <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
        <div className="relative min-h-screen bg-white px-4 py-6 sm:px-0">
          <div className="max-w-md mx-auto pt-32">
            {/* 페이지 제목 */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-black mb-8">비밀번호 재설정</h1>
              
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

            {/* 성공 메시지 */}
            <div className="bg-gray-50 min-h-screen px-4 py-6">
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-2">이메일이 전송되었습니다</h2>
                  <p className="text-gray-600 mb-4">
                    <span className="font-medium">{formData.email}</span>로<br />
                    비밀번호 재설정 링크를 전송했습니다.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>📧 이메일이 도착하지 않나요?</strong><br />
                      스팸함을 확인하거나, 관리자에게 문의해주세요.
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    이메일을 확인하고 링크를 클릭하여 새 비밀번호를 설정해주세요.
                  </p>
                </div>

                <div className="space-y-4">
                  <Link
                    href="/login"
                    className="block w-full py-3 px-6 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    로그인 페이지로 돌아가기
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsEmailSent(false)
                      setFormData({ email: '' })
                    }}
                    className="block w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    다른 이메일로 다시 시도
                  </button>
                </div>
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

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white px-4 py-6 sm:px-0">
        <div className="max-w-md mx-auto pt-32">
          {/* 페이지 제목 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-8">비밀번호 재설정</h1>
            
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

          {/* 비밀번호 재설정 폼 */}
          <div className="bg-gray-50 min-h-screen px-4 py-6">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-black mb-2">비밀번호를 잊으셨나요?</h2>
                <p className="text-gray-600 text-sm">
                  가입하신 이메일 주소를 입력하시면<br />
                  비밀번호 재설정 링크를 보내드립니다.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 오류 메시지 */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                
                {/* 이메일 */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                    이메일 주소
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    placeholder="example@dongguk.edu"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* 전송 버튼 */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || retryAfter !== null}
                    className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-colors ${
                      isSubmitting || retryAfter !== null
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        전송 중...
                      </div>
                    ) : retryAfter !== null ? (
                      `${retryAfter}초 후 다시 시도`
                    ) : (
                      '재설정 링크 전송'
                    )}
                  </button>
                </div>

                {/* 링크들 */}
                <div className="text-center pt-4 space-y-2">
                  <div>
                    <Link href="/login" className="text-black text-sm underline hover:text-gray-600">
                      로그인 페이지로 돌아가기
                    </Link>
                  </div>
                  <div>
                    <Link href="/signup" className="text-black text-sm underline hover:text-gray-600">
                      회원가입
                    </Link>
                  </div>
                </div>
              </form>
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
