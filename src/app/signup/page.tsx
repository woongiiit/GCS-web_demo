'use client'

import Link from 'next/link'
import React, { useState } from 'react'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    userType: 'GENERAL', // 'GENERAL' 또는 'MAJOR'
    studentId: '',
    major: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    verificationCode: '' // 이메일 인증번호
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)

  // 이메일 인증번호 전송
  const handleSendVerificationCode = async () => {
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: '이메일을 먼저 입력해주세요.' }))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: '올바른 이메일 형식을 입력해주세요.' }))
      return
    }

    setIsSendingCode(true)
    setErrors(prev => ({ ...prev, email: '', verificationCode: '' }))

    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await response.json()

      if (response.ok) {
        setCodeSent(true)
        setRemainingTime(300) // 5분 = 300초
        alert('인증번호가 전송되었습니다. 이메일을 확인해주세요.')
      } else {
        alert(data.error || '인증번호 전송에 실패했습니다.')
      }
    } catch (error) {
      console.error('인증번호 전송 오류:', error)
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSendingCode(false)
    }
  }

  // 이메일 인증번호 검증
  const handleVerifyCode = async () => {
    if (!formData.verificationCode) {
      setErrors(prev => ({ ...prev, verificationCode: '인증번호를 입력해주세요.' }))
      return
    }

    if (!/^\d{6}$/.test(formData.verificationCode)) {
      setErrors(prev => ({ ...prev, verificationCode: '인증번호는 6자리 숫자여야 합니다.' }))
      return
    }

    setIsVerifyingCode(true)
    setErrors(prev => ({ ...prev, verificationCode: '' }))

    try {
      const response = await fetch('/api/auth/verify-email-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email, 
          code: formData.verificationCode,
          purpose: 'signup'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setIsEmailVerified(true)
        setCodeSent(false)
        setRemainingTime(0)
        alert('이메일 인증이 완료되었습니다!')
      } else {
        setErrors(prev => ({ 
          ...prev, 
          verificationCode: data.error || '인증번호가 올바르지 않습니다.' 
        }))
        
        if (data.remainingAttempts !== undefined) {
          alert(`남은 시도 횟수: ${data.remainingAttempts}회`)
        }
      }
    } catch (error) {
      console.error('인증번호 검증 오류:', error)
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsVerifyingCode(false)
    }
  }

  // 카운트다운 타이머
  React.useEffect(() => {
    let timer: NodeJS.Timeout
    if (remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            setCodeSent(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [remainingTime])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // 전화번호 자동 포맷팅
    if (name === 'phone') {
      // 숫자만 추출
      const numbers = value.replace(/\D/g, '')
      
      // 3-4-4 형식으로 포맷팅
      let formatted = numbers
      if (numbers.length >= 3) {
        formatted = numbers.slice(0, 3)
        if (numbers.length >= 7) {
          formatted += '-' + numbers.slice(3, 7)
          if (numbers.length >= 11) {
            formatted += '-' + numbers.slice(7, 11)
          } else if (numbers.length > 7) {
            formatted += '-' + numbers.slice(7)
          }
        } else if (numbers.length > 3) {
          formatted += '-' + numbers.slice(3)
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // 회원 유형이 변경되면 학번, 주전공 필드 초기화
    if (name === 'userType') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        studentId: value === 'GENERAL' ? '' : prev.studentId,
        major: value === 'GENERAL' ? '' : prev.major
      }))
    }
    
    // 입력 시 해당 필드의 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    // 이름 검증
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '이름은 2글자 이상이어야 합니다.'
    }

    // 학번 검증 (전공 회원만)
    if (formData.userType === 'MAJOR') {
      if (!formData.studentId.trim()) {
        newErrors.studentId = '학번을 입력해주세요.'
      } else if (!/^\d{10}$/.test(formData.studentId.trim())) {
        newErrors.studentId = '학번은 10자리 숫자여야 합니다.'
      }
    }

    // 주전공 검증 (전공 회원만)
    if (formData.userType === 'MAJOR') {
      if (!formData.major.trim()) {
        newErrors.major = '주전공을 입력해주세요.'
      } else if (formData.major.trim().length < 2) {
        newErrors.major = '주전공은 2글자 이상이어야 합니다.'
      }
    }

    // 이메일 검증
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.'
    } else if (!isEmailVerified) {
      newErrors.email = '이메일 인증을 완료해주세요.'
    }

    // 전화번호 검증
    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.'
    } else if (!/^010-\d{4}-\d{4}$/.test(formData.phone.trim())) {
      newErrors.phone = '전화번호는 010-XXXX-XXXX 형식으로 입력해주세요.'
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.'
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자리 이상이어야 합니다.'
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '비밀번호는 영문과 숫자를 포함해야 합니다.'
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          userType: formData.userType,
          studentId: formData.userType === 'MAJOR' ? formData.studentId : null,
          major: formData.userType === 'MAJOR' ? formData.major : null,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // 성공 시 로그인 페이지로 이동
        alert('회원가입이 완료되었습니다! 자동으로 로그인되었습니다.')
        window.location.href = '/'
      } else {
        // 서버에서 반환된 에러 메시지 표시
        alert(data.error || '회원가입 중 오류가 발생했습니다.')
      }
      
    } catch (error) {
      console.error('회원가입 오류:', error)
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white px-4 py-6 sm:px-0">
        <div className="max-w-2xl mx-auto pt-32">
          {/* 페이지 제목 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-4">회원가입</h1>
            <p className="text-gray-600 mb-8">GCS:Web Demo에 오신 것을 환영합니다</p>
            
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

          {/* 회원가입 폼 */}
          <div className="bg-gray-50 min-h-screen px-4 py-6">
            <div className="bg-white rounded-lg shadow-md p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 이름 */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                      errors.name ? 'border-red-500' : 'border-gray-300 focus:border-black'
                    }`}
                    placeholder="홍길동"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* 회원 유형 */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">
                    회원 유형 *
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="userType-general"
                        name="userType"
                        value="GENERAL"
                        checked={formData.userType === 'GENERAL'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300"
                      />
                      <label htmlFor="userType-general" className="ml-3 text-sm font-medium text-gray-700">
                        일반 회원
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="userType-major"
                        name="userType"
                        value="MAJOR"
                        checked={formData.userType === 'MAJOR'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300"
                      />
                      <label htmlFor="userType-major" className="ml-3 text-sm font-medium text-gray-700">
                        전공 회원
                      </label>
                    </div>
                  </div>
                </div>

                {/* 학번 (전공 회원만) */}
                {formData.userType === 'MAJOR' && (
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-black mb-2">
                      학번 *
                    </label>
                    <input
                      type="text"
                      id="studentId"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                        errors.studentId ? 'border-red-500' : 'border-gray-300 focus:border-black'
                      }`}
                      placeholder="예: 2020112008"
                      maxLength={10}
                    />
                    {errors.studentId && (
                      <p className="mt-1 text-sm text-red-500">{errors.studentId}</p>
                    )}
                  </div>
                )}

                {/* 주전공 (전공 회원만) */}
                {formData.userType === 'MAJOR' && (
                  <div>
                    <label htmlFor="major" className="block text-sm font-medium text-black mb-2">
                      주전공 *
                    </label>
                    <input
                      type="text"
                      id="major"
                      name="major"
                      value={formData.major}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                        errors.major ? 'border-red-500' : 'border-gray-300 focus:border-black'
                      }`}
                      placeholder="예: 산업시스템공학과"
                    />
                    {errors.major && (
                      <p className="mt-1 text-sm text-red-500">{errors.major}</p>
                    )}
                  </div>
                )}

                {/* 이메일 */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                    이메일 (아이디) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isEmailVerified}
                      className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                        errors.email ? 'border-red-500' : 'border-gray-300 focus:border-black'
                      } ${isEmailVerified ? 'bg-green-50 border-green-300' : ''}`}
                      placeholder="example@dongguk.edu"
                    />
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={isSendingCode || isEmailVerified || !formData.email}
                      className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                        isSendingCode || isEmailVerified || !formData.email
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isSendingCode ? '전송중...' : isEmailVerified ? '인증완료' : '인증번호 전송'}
                    </button>
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                  
                  {/* 이메일 인증번호 입력 */}
                  {codeSent && !isEmailVerified && (
                    <div className="mt-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="verificationCode"
                          value={formData.verificationCode}
                          onChange={handleInputChange}
                          placeholder="인증번호 6자리"
                          maxLength={6}
                          className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                            errors.verificationCode ? 'border-red-500' : 'border-gray-300 focus:border-black'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyCode}
                          disabled={isVerifyingCode || !formData.verificationCode}
                          className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                            isVerifyingCode || !formData.verificationCode
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {isVerifyingCode ? '확인중...' : '인증하기'}
                        </button>
                      </div>
                      {errors.verificationCode && (
                        <p className="mt-1 text-sm text-red-500">{errors.verificationCode}</p>
                      )}
                      {remainingTime > 0 && (
                        <p className="mt-1 text-sm text-blue-600">
                          인증번호가 전송되었습니다. ({Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')} 후 만료)
                        </p>
                      )}
                    </div>
                  )}
                  
                  {isEmailVerified && (
                    <p className="mt-1 text-sm text-green-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      이메일 인증이 완료되었습니다.
                    </p>
                  )}
                </div>

                {/* 전화번호 */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-black mb-2">
                    전화번호 *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-black'
                    }`}
                    placeholder="010-1234-5678"
                    maxLength={13}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* 비밀번호 */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                    비밀번호 *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                      errors.password ? 'border-red-500' : 'border-gray-300 focus:border-black'
                    }`}
                    placeholder="8자리 이상, 영문+숫자 조합"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                {/* 비밀번호 확인 */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
                    비밀번호 확인 *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-black'
                    }`}
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* 제출 버튼 */}
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
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        처리 중...
                      </div>
                    ) : (
                      '회원가입'
                    )}
                  </button>
                </div>

                {/* 로그인 링크 */}
                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    이미 계정이 있으신가요?{' '}
                    <Link href="/login" className="text-black font-medium hover:underline">
                      로그인
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* 푸터 */}
          <div className="text-center text-gray-400 text-xs mt-12">
            DONGGUK UNIVERSITY
          </div>
        </div>
      </div>
    </div>
  )
}
