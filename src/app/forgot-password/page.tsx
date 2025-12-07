'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgVector827 = "https://www.figma.com/api/mcp/asset/de868fe1-7b8a-49a2-856e-bc696c9f76ee"
const imgVector828 = "https://www.figma.com/api/mcp/asset/cfb03548-f5bf-43a9-a13e-a2abdd8eab4d"
const imgEllipse5406 = "https://www.figma.com/api/mcp/asset/3d8b3f2e-14c2-44d4-bd61-041adba072a2"
const imgEllipse5405 = "https://www.figma.com/api/mcp/asset/4d32a91f-24b6-4aa0-af06-be52d772d565"
const imgEllipse5404 = "https://www.figma.com/api/mcp/asset/6cf55429-82a9-42aa-9ba1-d6371963b5ac"
const imgVector = "https://www.figma.com/api/mcp/asset/dc6e5d1b-f68c-42f2-95f6-2cf52dd80be5"
const imgWeuiBackFilled = "https://www.figma.com/api/mcp/asset/aa6dd487-2a59-41b6-a0db-b52df5521270"
const imgLogo1 = "https://www.figma.com/api/mcp/asset/f9f4d1c5-405e-4c9b-81d3-247dd227b5af"
const imgLogo2 = "https://www.figma.com/api/mcp/asset/baaba4c4-1904-45b4-81f6-fcf7a3569bd4"
const imgLogo3 = "https://www.figma.com/api/mcp/asset/b5270e1e-8975-40ae-bdb0-9d430733c1e0"
const imgLogo4 = "https://www.figma.com/api/mcp/asset/cc317737-4ba7-4aaa-bcb5-694d80bfbe4e"
const imgLogo5 = "https://www.figma.com/api/mcp/asset/5befd4ff-6c5f-4953-8670-34ea24651429"

type Step = 'email' | 'verify' | 'reset' | 'success'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function validatePassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return { isValid: false, message: '불가능' }
  }
  if (!/^[a-zA-Z0-9]+$/.test(password)) {
    return { isValid: false, message: '불가능' }
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { isValid: false, message: '불가능' }
  }
  return { isValid: true, message: '가능' }
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [timer, setTimer] = useState(300) // 5분 타이머
  
  const router = useRouter()

  // 타이머 카운트다운
  useEffect(() => {
    if (step === 'verify' && timer > 0 && emailSent) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [step, timer, emailSent])

  // 비밀번호 검증
  const passwordValidation = validatePassword(password)
  const passwordMatch = confirmPassword ? password === confirmPassword : null

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
        setEmailSent(true)
        setStep('verify')
        setTimer(300)
      } else {
        if (data.error && data.error.includes('가입된')) {
          setError('가입된 이메일이 없습니다.')
        } else {
          setError(data.error || '인증번호 전송에 실패했습니다.')
        }
      }
    } catch (err) {
      console.error('인증번호 전송 오류:', err)
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
        setError('인증번호가 올바르지 않습니다.')
      }
    } catch (err) {
      console.error('인증번호 검증 오류:', err)
      setError('서버 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 비밀번호 재설정
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordValidation.isValid) {
      setError('비밀번호 형식이 올바르지 않습니다.')
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsSubmitting(true)
    setError('')

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
        setError(data.error || '비밀번호 재설정에 실패했습니다.')
      }
    } catch (err) {
      console.error('비밀번호 재설정 오류:', err)
      setError('서버 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const isVerifyButtonDisabled = isSubmitting || !verificationCode || timer === 0
  const isResetButtonDisabled = isSubmitting || !passwordValidation.isValid || passwordMatch !== true

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* 배경 디자인 요소들 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Vector 827 */}
          <div className="absolute left-[-47.67px] top-[-22.16px] w-[522.88px] h-[294.65px] flex items-center justify-center rotate-[339.444deg]">
            <img alt="" className="block max-w-none size-full" src={imgVector827} />
          </div>
          
          {/* Vector 828 */}
          <div className="absolute left-[-27.92px] top-[-23.12px] w-[567.01px] h-[447.70px] flex items-center justify-center rotate-[333.242deg]">
            <img alt="" className="block max-w-none size-full" src={imgVector828} />
          </div>
          
          {/* Ellipse 5406 */}
          <div className="absolute left-[106px] top-[-101px] w-[173.07px] h-[292.81px] flex items-center justify-center rotate-[5.928deg]">
            <img alt="" className="block max-w-none size-full" src={imgEllipse5406} />
          </div>
          
          {/* Ellipse 5405 */}
          <div className="absolute left-[192px] top-[-20px] w-[263.09px] h-[265.69px] flex items-center justify-center rotate-[43.746deg]">
            <img alt="" className="block max-w-none size-full" src={imgEllipse5405} />
          </div>
          
          {/* Ellipse 5404 */}
          <div className="absolute left-[5px] top-[68px] w-[145px] h-[145px]">
            <img alt="" className="block max-w-none size-full" src={imgEllipse5404} />
          </div>
        </div>

        {/* 상단 네비게이션 */}
        <div className="absolute left-[16px] top-[39px] w-[24px] h-[24px] flex items-center justify-center z-10">
          <button
            onClick={handleBack}
            className="h-[24px] w-[12px] flex items-center justify-center"
            aria-label="뒤로가기"
          >
            <img alt="뒤로가기" className="block max-w-none size-full" src={imgWeuiBackFilled} />
          </button>
        </div>

        {/* 로고 */}
        <div className="absolute left-1/2 top-[89px] -translate-x-1/2 h-[29.61px] w-[84px] z-10 shadow-[0px_4px_4px_0px_rgba(197,54,9,0.3)]">
          <Link href="/" className="text-lg font-bold text-white">
            GCS<span className="text-white">:</span>Web
          </Link>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="absolute left-0 top-[181px] w-full bg-[#f8f6f4] rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-4px_10px_0px_rgba(238,74,8,0.4)] pt-[96px] pb-[24px] px-[16px]">
          <div className="flex flex-col gap-[40px] items-center">
            {/* 제목 */}
            <div className="flex gap-[16px] items-center pl-[97px] pr-0 py-0 relative w-full">
              <div className="flex items-center justify-center relative">
                <div className="flex-none scale-y-[-100%]">
                  <div className="relative size-[24px]">
                    <div className="absolute contents left-[9px] top-[5px]">
                      <div className="absolute flex h-[14px] items-center justify-center left-[9px] top-[5px] w-[6px]">
                        <div className="flex-none rotate-[270deg]">
                          <div className="h-[6px] relative w-[14px]">
                            <img alt="" className="block max-w-none size-full" src={imgVector} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center relative">
                <p className="font-bold leading-[1.5] text-[22px] text-[#443e3c] text-center">
                  {step === 'reset' || step === 'success' ? '새 비밀번호 설정' : '비밀번호 찾기'}
                </p>
              </div>
            </div>

            {/* 폼 또는 결과 */}
            {step === 'email' || step === 'verify' ? (
              <div className="flex flex-col gap-[48px] items-start w-full">
                {/* 입력 필드 */}
                <div className="flex flex-col gap-[16px] items-start w-full">
                  {/* 이메일 입력 */}
                  <div className="flex flex-col gap-[2px] items-start w-full px-2">
                    <div className="flex flex-col gap-[5px] items-start w-full">
                      <div className="flex gap-[4px] items-center w-full">
                        <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                          아이디 (이메일)
                        </p>
                      </div>
                      <div className="flex gap-[5px] items-start w-full">
                        <div className={`border ${error && error.includes('가입된') ? 'border-[#f06115]' : 'border-[#5f5a58]'} border-solid flex flex-1 h-[48px] items-center justify-between p-3 rounded-[12px] bg-white`}>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value)
                              setError('')
                            }}
                            placeholder="example@email.com"
                            className="font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none text-[#5f5a58] placeholder:text-[#b7b3af]"
                            disabled={step === 'verify'}
                          />
                          <div className="flex items-center justify-center w-[35px]" />
                        </div>
                        <button
                          type="button"
                          onClick={handleSendCode}
                          disabled={isSubmitting || !email || step === 'verify'}
                          className={`h-[48px] rounded-[12px] flex items-center justify-center px-3 w-[70px] ${
                            isSubmitting || !email || step === 'verify'
                              ? 'bg-[#c9c1b7] cursor-not-allowed'
                              : 'bg-[#443e3c] cursor-pointer hover:opacity-90'
                          }`}
                        >
                          <p className="font-normal leading-[1.5] text-[13px] text-[#f8f6f4] tracking-[-0.26px]">
                            전송
                          </p>
                        </button>
                      </div>
                    </div>
                    {error && error.includes('가입된') && (
                      <p className="font-normal leading-[1.75] text-[#f06115] text-[10px] w-full whitespace-pre-wrap">
                        {error}
                      </p>
                    )}
                    {emailSent && !error && (
                      <p className="font-normal leading-[1.75] text-[#f06115] text-[10px] w-full whitespace-pre-wrap">
                        인증번호가 전송되었습니다.
                      </p>
                    )}
                  </div>

                  {/* 인증번호 입력 */}
                  <div className="flex flex-col gap-[2px] items-start w-full px-2">
                    <div className="flex flex-col gap-[5px] items-start w-full">
                      <div className="flex gap-[4px] items-center w-full">
                        <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                          인증번호
                        </p>
                      </div>
                      <div className="flex gap-[5px] items-start w-full">
                        <div className={`border ${error && error.includes('올바르지') ? 'border-[#f06115]' : 'border-[#5f5a58]'} border-solid flex flex-1 h-[48px] items-center justify-between p-3 rounded-[12px] bg-white`}>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={verificationCode}
                            onChange={(e) => {
                              setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                              setError('')
                            }}
                            placeholder="인증번호 입력"
                            maxLength={6}
                            className="font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none text-[#5f5a58] placeholder:text-[#b7b3af]"
                            disabled={step === 'email'}
                          />
                          {step === 'verify' && timer > 0 && (
                            <div className="flex items-center justify-center w-[35px]">
                              <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                                {formatTime(timer)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {error && error.includes('올바르지') && (
                      <p className="font-normal leading-[1.75] text-[#f06115] text-[10px] w-full whitespace-pre-wrap">
                        {error}
                      </p>
                    )}
                  </div>
                </div>

                {/* 버튼 및 링크 */}
                <div className="flex flex-col gap-[32px] items-center w-full px-2">
                  {/* 인증하기 버튼 */}
                  <button
                    type="button"
                    onClick={step === 'email' ? handleSendCode : handleVerifyCode}
                    disabled={isVerifyButtonDisabled}
                    className={`w-full h-[55px] rounded-[12px] flex items-center justify-center p-4 ${
                      isVerifyButtonDisabled
                        ? 'bg-[#c9c1b7] cursor-not-allowed'
                        : 'bg-[#443e3c] cursor-pointer hover:opacity-90'
                    }`}
                  >
                    <p className="font-normal leading-[1.5] text-[15px] text-[#f8f6f4]">
                      인증하기
                    </p>
                  </button>

                  {/* 회원가입 링크 */}
                  <div className="flex gap-[4px] items-start justify-center leading-[1.5] text-[13px] tracking-[-0.26px] w-full">
                    <p className="font-normal text-[#85817e]">
                      아직 계정이 없습니까?
                    </p>
                    <Link href="/signup" className="font-bold text-[#fd6f22]">
                      회원가입
                    </Link>
                  </div>
                </div>
              </div>
            ) : step === 'reset' ? (
              <div className="flex flex-col gap-[48px] items-start w-full">
                {/* 입력 필드 */}
                <div className="flex flex-col gap-[16px] items-start w-full">
                  {/* 새 비밀번호 입력 */}
                  <div className="flex flex-col gap-[2px] items-start w-full px-2">
                    <div className="flex flex-col gap-[5px] items-start w-full">
                      <div className="flex gap-[4px] items-center w-full">
                        <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                          새 비밀번호
                        </p>
                      </div>
                      <div className="flex gap-[5px] items-start w-full">
                        <div className="border border-[#5f5a58] border-solid flex flex-1 h-[48px] items-center justify-between p-3 rounded-[12px] bg-white">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="8자 이상 영문, 숫자 조합"
                            className="font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none text-[#5f5a58] placeholder:text-[#b7b3af]"
                          />
                          <div className="flex items-center justify-center w-[35px]">
                            {password && (
                              <p className={`font-normal leading-[1.5] text-[13px] tracking-[-0.26px] ${
                                passwordValidation.isValid ? 'text-[#14ae5c]' : 'text-[#f06115]'
                              }`}>
                                {passwordValidation.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="font-normal leading-[1.75] text-[10px] text-[#5f5a58] w-full whitespace-pre-wrap">
                      8자 이상 영문, 숫자 조합
                    </p>
                  </div>

                  {/* 비밀번호 확인 */}
                  <div className="flex flex-col gap-[2px] items-start w-full px-2">
                    <div className="flex flex-col gap-[5px] items-start w-full">
                      <div className="flex gap-[4px] items-center w-full">
                        <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                          비밀번호 확인
                        </p>
                      </div>
                      <div className="flex gap-[5px] items-start w-full">
                        <div className="border border-[#5f5a58] border-solid flex flex-1 h-[48px] items-center justify-between p-3 rounded-[12px] bg-white">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호 확인"
                            className="font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none text-[#5f5a58] placeholder:text-[#b7b3af]"
                          />
                          <div className="flex items-center justify-center w-[35px]">
                            {confirmPassword && (
                              <p className={`font-normal leading-[1.5] text-[13px] tracking-[-0.26px] ${
                                passwordMatch ? 'text-[#14ae5c]' : 'text-[#f06115]'
                              }`}>
                                {passwordMatch ? '일치' : '불일치'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="font-normal leading-[1.75] text-[10px] text-[#5f5a58] w-full whitespace-pre-wrap">
                      8자 이상 영문, 숫자 조합
                    </p>
                  </div>
                </div>

                {/* 버튼 및 링크 */}
                <div className="flex flex-col gap-[32px] items-center w-full px-2">
                  {/* 확인 버튼 */}
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isResetButtonDisabled}
                    className={`w-full h-[55px] rounded-[12px] flex items-center justify-center p-4 ${
                      isResetButtonDisabled
                        ? 'bg-[#c9c1b7] cursor-not-allowed'
                        : 'bg-[#443e3c] cursor-pointer hover:opacity-90'
                    }`}
                  >
                    <p className="font-normal leading-[1.5] text-[15px] text-[#f8f6f4]">
                      확인
                    </p>
                  </button>

                  {/* 로그인 링크 */}
                  <div className="flex gap-[4px] items-start justify-center leading-[1.5] text-[13px] tracking-[-0.26px] w-full">
                    <p className="font-normal text-[#85817e]">
                      로그인 페이지로 돌아갈까요?
                    </p>
                    <Link href="/login" className="font-bold text-[#fd6f22]">
                      로그인
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-[48px] items-start w-full">
                {/* 성공 메시지 */}
                <div className="flex flex-col gap-[16px] items-start w-full">
                  <div className="flex flex-col gap-[2px] items-start w-full px-2">
                    <div className="flex flex-col gap-[5px] items-start w-full">
                      <div className="flex gap-[5px] items-start w-full">
                        <div className="border border-[#5f5a58] border-solid flex flex-1 h-[48px] items-center justify-between p-3 rounded-[12px] bg-[#eeebe6]">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#1a1918] tracking-[-0.26px]">
                            •••••••••••
                          </p>
                          <div className="flex items-center justify-center w-[35px]">
                            <p className="font-normal leading-[1.5] text-[13px] text-[#14ae5c] tracking-[-0.26px]">
                              가능
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[2px] items-start w-full px-2">
                    <div className="flex flex-col gap-[5px] items-start w-full">
                      <div className="flex gap-[5px] items-start w-full">
                        <div className="border border-[#5f5a58] border-solid flex flex-1 h-[48px] items-center justify-between p-3 rounded-[12px] bg-[#eeebe6]">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#1a1918] tracking-[-0.26px]">
                            •••••••••••
                          </p>
                          <div className="flex items-center justify-center w-[35px]">
                            <p className="font-normal leading-[1.5] text-[13px] text-[#14ae5c] tracking-[-0.26px]">
                              일치
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 버튼 및 링크 */}
                <div className="flex flex-col gap-[32px] items-center w-full px-2">
                  {/* 확인 버튼 */}
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="w-full h-[55px] rounded-[12px] flex items-center justify-center p-4 bg-[#443e3c] cursor-pointer hover:opacity-90"
                  >
                    <p className="font-normal leading-[1.5] text-[15px] text-[#f8f6f4]">
                      확인
                    </p>
                  </button>

                  {/* 로그인 링크 */}
                  <div className="flex gap-[4px] items-start justify-center leading-[1.5] text-[13px] tracking-[-0.26px] w-full">
                    <p className="font-normal text-[#85817e]">
                      로그인 페이지로 돌아갈까요?
                    </p>
                    <Link href="/login" className="font-bold text-[#fd6f22]">
                      로그인
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
