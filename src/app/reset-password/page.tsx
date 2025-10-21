'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetPasswordContent() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [isValidatingToken, setIsValidatingToken] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [userInfo, setUserInfo] = useState<{email: string, name: string} | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
    label: string
    color: string
  } | null>(null)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      validateToken(tokenParam)
    } else {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      router.push('/login')
    }
  }, [searchParams, router])

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

  const validateToken = async (token: string) => {
    setIsValidatingToken(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setTokenValid(true)
        setUserInfo({
          email: data.user.email,
          name: data.user.name
        })
      } else {
        setError(data.error || '유효하지 않은 토큰입니다.')
        setTokenValid(false)
      }
    } catch (error) {
      console.error('토큰 검증 오류:', error)
      setError('토큰 검증 중 오류가 발생했습니다.')
      setTokenValid(false)
    } finally {
      setIsValidatingToken(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    // 비밀번호 검증
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      setIsSubmitting(false)
      return
    }
    
    try {
      // TODO: 실제 API 호출로 비밀번호 재설정
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
      } else {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const retrySeconds = retryAfter ? parseInt(retryAfter) : 60
          setRetryAfter(retrySeconds)
          setError(`요청이 너무 많습니다. ${retrySeconds}초 후에 다시 시도해주세요.`)
        } else {
          setError(data.error || '비밀번호 재설정에 실패했습니다.')
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
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // 비밀번호 강도 검증
    if (name === 'password') {
      checkPasswordStrength(value)
    }
  }

  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(null)
      return
    }

    let score = 0
    const errors: string[] = []
    const suggestions: string[] = []

    // 최소 길이 검증
    if (password.length < 6) {
      errors.push('비밀번호는 최소 6자 이상이어야 합니다.')
    } else {
      score += 20
    }

    // 길이별 점수
    if (password.length >= 8) score += 10
    if (password.length >= 12) score += 10
    if (password.length >= 16) score += 10

    // 대문자 포함 검증
    if (!/[A-Z]/.test(password)) {
      suggestions.push('대문자를 포함하면 보안이 강화됩니다.')
    } else {
      score += 10
    }

    // 소문자 포함 검증
    if (!/[a-z]/.test(password)) {
      suggestions.push('소문자를 포함하면 보안이 강화됩니다.')
    } else {
      score += 10
    }

    // 숫자 포함 검증
    if (!/\d/.test(password)) {
      suggestions.push('숫자를 포함하면 보안이 강화됩니다.')
    } else {
      score += 10
    }

    // 특수문자 포함 검증
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      suggestions.push('특수문자를 포함하면 보안이 강화됩니다.')
    } else {
      score += 10
    }

    // 연속된 문자 검증
    if (/(.)\1{2,}/.test(password)) {
      errors.push('연속된 동일한 문자는 사용할 수 없습니다.')
    }

    // 일반적인 패턴 검증
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /user/i,
      /test/i,
      /123123/,
      /111111/,
      /000000/
    ]

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push('너무 일반적인 패턴입니다.')
        break
      }
    }

    const finalScore = Math.min(100, score)
    
    let level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
    let label: string
    let color: string

    if (finalScore < 30) {
      level = 'weak'
      label = '매우 약함'
      color = 'text-red-600'
    } else if (finalScore < 50) {
      level = 'fair'
      label = '약함'
      color = 'text-orange-600'
    } else if (finalScore < 70) {
      level = 'good'
      label = '보통'
      color = 'text-yellow-600'
    } else if (finalScore < 90) {
      level = 'strong'
      label = '강함'
      color = 'text-blue-600'
    } else {
      level = 'very-strong'
      label = '매우 강함'
      color = 'text-green-600'
    }

    setPasswordStrength({
      score: finalScore,
      level,
      label,
      color
    })
  }

  // 토큰 검증 중
  if (isValidatingToken) {
    return (
      <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
        <div className="relative min-h-screen bg-white px-4 py-6 sm:px-0">
          <div className="max-w-md mx-auto pt-32">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-black mb-8">비밀번호 재설정</h1>
              <Link href="/" className="inline-block mb-8">
                <div className="w-6 h-6 mx-auto">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                </div>
              </Link>
            </div>

            <div className="bg-gray-50 min-h-screen px-4 py-6">
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600">토큰을 검증하는 중...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 토큰이 유효하지 않은 경우
  if (!tokenValid && !isValidatingToken) {
    return (
      <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
        <div className="relative min-h-screen bg-white px-4 py-6 sm:px-0">
          <div className="max-w-md mx-auto pt-32">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-black mb-8">비밀번호 재설정</h1>
              <Link href="/" className="inline-block mb-8">
                <div className="w-6 h-6 mx-auto">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                </div>
              </Link>
            </div>

            <div className="bg-gray-50 min-h-screen px-4 py-6">
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-2">유효하지 않은 링크</h2>
                  <p className="text-gray-600 mb-4">
                    {error}
                  </p>
                </div>

                <div className="space-y-4">
                  <Link
                    href="/forgot-password"
                    className="block w-full py-3 px-6 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    새로운 재설정 링크 요청
                  </Link>
                  
                  <Link
                    href="/login"
                    className="block w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    로그인 페이지로 돌아가기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
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
                  <h2 className="text-2xl font-bold text-black mb-2">비밀번호가 재설정되었습니다</h2>
                  <p className="text-gray-600 mb-4">
                    새 비밀번호로 로그인하실 수 있습니다.
                  </p>
                </div>

                <Link
                  href="/login"
                  className="block w-full py-3 px-6 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  로그인 페이지로 이동
                </Link>
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
            <h1 className="text-4xl font-bold text-black mb-8">새 비밀번호 설정</h1>
            
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

          {/* 새 비밀번호 설정 폼 */}
          <div className="bg-gray-50 min-h-screen px-4 py-6">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-black mb-2">새 비밀번호를 입력하세요</h2>
                {userInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>{userInfo.name}</strong>님 ({userInfo.email})의 비밀번호를 재설정합니다.
                    </p>
                  </div>
                )}
                <p className="text-gray-600 text-sm">
                  안전한 비밀번호를 설정해주세요.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 오류 메시지 */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                
                {/* 새 비밀번호 */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                    새 비밀번호
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    placeholder="새 비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  
                  {/* 비밀번호 강도 표시 */}
                  {passwordStrength && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">비밀번호 강도</span>
                        <span className={`text-xs font-medium ${passwordStrength.color}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.level === 'weak' ? 'bg-red-500' :
                            passwordStrength.level === 'fair' ? 'bg-orange-500' :
                            passwordStrength.level === 'good' ? 'bg-yellow-500' :
                            passwordStrength.level === 'strong' ? 'bg-blue-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${passwordStrength.score}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {passwordStrength.score < 50 ? '더 강한 비밀번호를 사용하세요.' : '좋은 비밀번호입니다!'}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">최소 6자 이상, 대소문자, 숫자, 특수문자 포함 권장</p>
                </div>

                {/* 비밀번호 확인 */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
                    비밀번호 확인
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

                {/* 설정 버튼 */}
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
                        설정 중...
                      </div>
                    ) : retryAfter !== null ? (
                      `${retryAfter}초 후 다시 시도`
                    ) : (
                      '비밀번호 설정'
                    )}
                  </button>
                </div>

                {/* 링크들 */}
                <div className="text-center pt-4">
                  <Link href="/login" className="text-black text-sm underline hover:text-gray-600">
                    로그인 페이지로 돌아가기
                  </Link>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
