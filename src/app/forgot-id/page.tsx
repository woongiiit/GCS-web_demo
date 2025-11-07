'use client'

import Link from 'next/link'
import { useState } from 'react'

type Step = 'form' | 'result'

interface FindIdResponse {
  success: boolean
  data?: {
    email: string
  }
  error?: string
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '')

  if (digits.length === 0) {
    return ''
  }

  let formatted = digits.slice(0, 3)

  if (digits.length > 3) {
    formatted += '-' + digits.slice(3, 7)
  }

  if (digits.length > 7) {
    formatted += '-' + digits.slice(7, 11)
  }

  return formatted
}

export default function ForgotIdPage() {
  const [step, setStep] = useState<Step>('form')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/auth/find-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
        }),
      })

      const data: FindIdResponse = await response.json()

      if (response.ok && data.success && data.data) {
        setMaskedEmail(data.data.email)
        setStep('result')
      } else {
        setError(data.error || '일치하는 계정을 찾을 수 없습니다.')
      }
    } catch (err) {
      console.error('아이디 찾기 오류:', err)
      setError('서버 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white px-4 py-6 sm:px-0">
        <div className="max-w-md mx-auto pt-32">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-8">아이디 찾기</h1>

            <Link href="/" className="inline-block mb-8">
              <div className="w-6 h-6 mx-auto">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-black"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
              </div>
            </Link>
          </div>

          <div className="bg-gray-50 min-h-screen px-4 py-6">
            <div className="bg-white rounded-lg shadow-md p-8">
              {step === 'form' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-black mb-2">가입 정보를 입력해주세요</h2>
                    <p className="text-gray-600 text-sm">
                      회원가입 시 등록한 이름과 전화번호를 입력하면<br />
                      아이디(이메일)를 확인할 수 있습니다.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                      이름
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                      placeholder="홍길동"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-black mb-2">
                      전화번호
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                      placeholder="010-1234-5678"
                      maxLength={13}
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">숫자만 입력해도 자동으로 형식이 맞춰집니다.</p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-colors ${
                        isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          확인 중...
                        </div>
                      ) : (
                        '아이디 확인'
                      )}
                    </button>
                  </div>

                  <div className="text-center pt-4 space-y-2">
                    <div>
                      <Link href="/login" className="text-black text-sm underline hover:text-gray-600">
                        로그인 페이지로 돌아가기
                      </Link>
                    </div>
                    <div>
                      <Link href="/forgot-password" className="text-black text-sm underline hover:text-gray-600">
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                </form>
              )}

              {step === 'result' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-[#f57520]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-black mb-2">아이디를 확인했습니다</h2>
                    <p className="text-gray-600 text-sm">
                      아래의 아이디로 로그인해주세요.
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-2">아이디 (이메일)</p>
                    <p className="text-xl font-semibold text-black">{maskedEmail}</p>
                  </div>

                  <div className="space-y-3">
                    <Link
                      href="/login"
                      className="block w-full py-4 px-6 bg-black text-white rounded-lg font-medium text-center hover:bg-gray-800 transition-colors"
                    >
                      로그인 페이지로 이동
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('form')
                        setMaskedEmail('')
                        setName('')
                        setPhone('')
                        setError('')
                      }}
                      className="w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      다시 찾기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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
                <a href="#" className="text-[10px] text-gray-600 underline">
                  개인정보처리방침
                </a>
                <span className="text-[10px] text-gray-400">|</span>
                <a href="#" className="text-[10px] text-gray-600 underline">
                  이용약관
                </a>
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

