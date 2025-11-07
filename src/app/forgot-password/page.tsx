'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Step = 'email' | 'verify' | 'reset' | 'success'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [retryAfter, setRetryAfter] = useState<number | null>(null)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)

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

  // 이메일 전송
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep('verify')
      } else {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const retrySeconds = retryAfter ? parseInt(retryAfter) : 60
          setRetryAfter(retrySeconds)
          setError(`요청이 너무 많습니다. ${retrySeconds}초 후에 다시 시도해주세요.`)
        } else {
          setError(data.error || '인증번호 전송에 실패했습니다.')
        }
      }
      
    } catch (error) {
      console.error('인증번호 전송 오류:', error)
      setError('서버 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 인증번호 검증
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setRemainingAttempts(null)
    
    try {
      const response = await fetch('/api/auth/verify-email-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: verificationCode, purpose: 'password_reset' }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep('reset')
      } else {
        const remainingAttemptsHeader = response.headers.get('X-Remaining-Attempts')
        if (remainingAttemptsHeader) {
          const attempts = parseInt(remainingAttemptsHeader)
          setRemainingAttempts(attempts)
        }
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const retrySeconds = retryAfter ? parseInt(retryAfter) : 60
          setRetryAfter(retrySeconds)
          setError(`요청이 너무 많습니다. ${retrySeconds}초 후에 다시 시도해주세요.`)
        } else {
          setError(data.error || '인증번호가 올바르지 않습니다.')
        }
      }
      
    } catch (error) {
      console.error('인증번호 검증 오류:', error)
      setError('서버 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 비밀번호 재설정
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    // 비밀번호 검증
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setIsSubmitting(false)
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      setIsSubmitting(false)
      return
    }
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep('success')
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

  // 성공 화면
  if (step === 'success') {
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
              <div className="flex-shrink-0">
                <p className="text-[10px] text-gray-500 mb-0.5">DONGGUK UNIVERSITY</p>
                <h3 className="text-sm font-bold text-black">
                  GCS<span className="text-[#f57520]">:</span>Web
                </h3>
              </div>
              
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

          {/* 단계별 폼 */}
          <div className="bg-gray-50 min-h-screen px-4 py-6">
            <div className="bg-white rounded-lg shadow-md p-8">
              {/* 이메일 입력 단계 */}
              {step === 'email' && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-black mb-2">비밀번호를 잊으셨나요?</h2>
                    <p className="text-gray-600 text-sm">
                      가입하신 이메일 주소를 입력하시면<br />
                      비밀번호 재설정 인증번호를 보내드립니다.
                    </p>
                  </div>

                  <form onSubmit={handleSendCode} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                        이메일 주소
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        placeholder="example@dongguk.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

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
                          '인증번호 전송'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* 인증번호 입력 단계 */}
              {step === 'verify' && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-black mb-2">인증번호 입력</h2>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">{email}</span>로 전송된<br />
                      6자리 인증번호를 입력해주세요.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyCode} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                        {remainingAttempts !== null && remainingAttempts > 0 && (
                          <p className="mt-2 text-sm">남은 시도 횟수: {remainingAttempts}회</p>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="code" className="block text-sm font-medium text-black mb-2">
                        인증번호
                      </label>
                      <input
                        id="code"
                        type="text"
                        maxLength={6}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors text-center text-2xl tracking-widest"
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>

                    <div className="pt-4 space-y-3">
                      <button
                        type="submit"
                        disabled={isSubmitting || retryAfter !== null || verificationCode.length !== 6}
                        className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-colors ${
                          isSubmitting || retryAfter !== null || verificationCode.length !== 6
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
                            확인 중...
                          </div>
                        ) : retryAfter !== null ? (
                          `${retryAfter}초 후 다시 시도`
                        ) : (
                          '인증 확인'
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setStep('email')
                          setVerificationCode('')
                          setError('')
                        }}
                        className="w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        이메일 다시 입력
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* 비밀번호 재설정 단계 */}
              {step === 'reset' && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-black mb-2">새 비밀번호 설정</h2>
                    <p className="text-gray-600 text-sm">
                      새로운 비밀번호를 입력해주세요.
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                        새 비밀번호
                      </label>
                      <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        placeholder="새 비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">최소 6자 이상, 대소문자, 숫자, 특수문자 포함 권장</p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
                        비밀번호 확인
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        placeholder="비밀번호를 다시 입력하세요"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>

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
                  </form>
                </>
              )}

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
