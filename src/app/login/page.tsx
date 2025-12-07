'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgWeuiBackFilled = "https://www.figma.com/api/mcp/asset/e2e9865b-4b36-464a-9cff-c6b0819cb36f"
const imgVector827 = "https://www.figma.com/api/mcp/asset/0385a130-356b-4d95-85f0-73374df47b4d"
const imgVector828 = "https://www.figma.com/api/mcp/asset/ee9d1e5b-de35-4f75-a8f1-7cada1951901"
const imgEllipse5406 = "https://www.figma.com/api/mcp/asset/163efa4d-8242-41f0-acee-80324da94df0"
const imgEllipse5405 = "https://www.figma.com/api/mcp/asset/13ece281-66c4-4a0a-9bf7-4b851e5bf3c5"
const imgEllipse5404 = "https://www.figma.com/api/mcp/asset/2d5e842e-6710-499b-936f-17f2c6cbf053"
const imgVector = "https://www.figma.com/api/mcp/asset/20c0ddc6-bbc3-4007-b24d-5c39d795be6f"
const imgLine316 = "https://www.figma.com/api/mcp/asset/a7e03601-7d5c-413d-a6f7-d6e245b1af56"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [failureCount, setFailureCount] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(300) // 5분 = 300초
  
  const router = useRouter()
  const { login } = useAuth()

  // 잠금 타이머
  useEffect(() => {
    if (isLocked && lockTimer > 0) {
      const timer = setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) {
            setIsLocked(false)
            return 300
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isLocked, lockTimer])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const validateEmail = (email: string) => {
    if (!email) {
      return '이메일을 입력해주세요.'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return '이메일 형식이 올바르지 않습니다.'
    }
    return null
  }

  const validatePassword = (password: string) => {
    if (!password) {
      return '비밀번호를 입력해주세요.'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 잠금 상태 확인
    if (isLocked) {
      return
    }

    // 유효성 검사
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)
    
    setErrors({
      email: emailError || undefined,
      password: passwordError || undefined,
    })

    if (emailError || passwordError) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // 로그인 성공
        setFailureCount(0)
        login(data.user)
        router.push('/')
        router.refresh()
      } else {
        // 로그인 실패
        const newFailureCount = failureCount + 1
        setFailureCount(newFailureCount)
        
        if (newFailureCount >= 5) {
          setIsLocked(true)
          setLockTimer(300)
          setErrors({
            email: '잠시 후 다시 시도해주세요.',
            password: undefined,
          })
        } else {
          setErrors({
            email: '5회 실패시 로그인 시도가 불가합니다. (1/5)',
            password: '5회 실패시 로그인 시도가 불가합니다. (4/5)',
          })
        }
      }
      
    } catch (error) {
      console.error('로그인 오류:', error)
      setErrors({
        email: '서버 오류가 발생했습니다. 다시 시도해주세요.',
      })
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
    // 입력 시 에러 초기화
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      })
    }
  }

  const handleBack = () => {
    router.back()
  }

  const isButtonDisabled = isSubmitting || isLocked

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

        {/* 로그인 폼 */}
        <div className="absolute left-0 top-[181px] w-full bg-[#f8f6f4] rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-4px_10px_0px_rgba(238,74,8,0.4)] pt-[96px] pb-[24px] px-[16px]">
          <div className="flex flex-col gap-[40px] items-center">
            {/* 제목 */}
            <p className="font-bold leading-[1.5] text-[22px] text-[#443e3c] text-center">
              로그인
            </p>

            {/* 폼 */}
            <div className="flex flex-col items-center justify-end w-full">
              <div className="flex flex-col gap-[48px] items-start w-full">
                {/* 입력 필드 */}
                <div className="flex flex-col gap-[16px] items-start w-full px-2">
                  {/* 이메일 입력 */}
                  <div className="flex flex-col gap-[2px] items-start w-full">
                    <div className="flex flex-col gap-[5px] items-start w-full">
                      <div className="flex gap-[4px] items-center w-full">
                        <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                          아이디 (이메일)
                        </p>
                      </div>
                      <div
                        className={`border ${
                          errors.email ? 'border-[#f06115]' : isLocked ? 'border-[#5f5a58]' : 'border-[#5f5a58]'
                        } border-solid flex h-[48px] items-center justify-between p-3 rounded-[12px] w-full ${
                          isLocked ? 'bg-[#f8f6f4]' : 'bg-white'
                        }`}
                      >
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={isLocked}
                          placeholder="example@email.com"
                          className={`font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none ${
                            formData.email ? 'text-[#5f5a58]' : 'text-[#b7b3af]'
                          }`}
                        />
                        {isLocked && (
                          <div className="flex items-center justify-center w-[35px]">
                            <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                              {formatTime(lockTimer)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {errors.email && (
                      <p className="font-normal leading-[1.75] text-[#f06115] text-[10px] w-full whitespace-pre-wrap">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* 비밀번호 입력 */}
                  <div className="flex flex-col gap-[2px] items-start w-full">
                    <div className="flex flex-col gap-[5px] items-start w-full">
                      <div className="flex gap-[4px] items-center w-full">
                        <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                          비밀번호
                        </p>
                      </div>
                      <div
                        className={`border ${
                          errors.password ? 'border-[#f06115]' : 'border-[#5f5a58]'
                        } border-solid flex h-[48px] items-center justify-between p-3 rounded-[12px] w-full bg-white`}
                      >
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          disabled={isLocked}
                          placeholder={formData.password ? '' : '8자 이상의 영문,숫자 조합'}
                          className={`font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none ${
                            formData.password ? 'text-[#5f5a58]' : 'text-[#b7b3af]'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="w-[24px] h-[24px] flex items-center justify-center"
                          aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                        >
                          <div className="overflow-clip relative shrink-0 size-[24px]">
                            <div className="absolute inset-[8.33%]">
                              <img alt="" className="block max-w-none size-full" src={imgVector} />
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                    {errors.password && (
                      <p className="font-normal leading-[1.75] text-[#f06115] text-[10px] w-full whitespace-pre-wrap">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>

                {/* 버튼 및 링크 */}
                <div className="flex flex-col h-[218px] items-center justify-between w-full px-2">
                  <div className="flex flex-col gap-[32px] items-center w-full">
                    {/* 로그인 버튼 */}
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={isButtonDisabled}
                      className={`w-full h-[55px] rounded-[12px] flex items-center justify-center p-4 ${
                        isButtonDisabled
                          ? 'bg-[#c9c1b7] cursor-not-allowed'
                          : 'bg-[#443e3c] cursor-pointer hover:opacity-90'
                      }`}
                    >
                      <p className="font-normal leading-[1.5] text-[15px] text-[#f8f6f4]">
                        로그인
                      </p>
                    </button>

                    {/* 회원가입 링크 */}
                    <div className="flex gap-[4px] items-center leading-[1.5] text-[13px] tracking-[-0.26px]">
                      <p className="font-normal text-[#85817e]">
                        아직 계정이 없으신가요?
                      </p>
                      <Link href="/signup" className="font-bold text-[#fd6f22]">
                        회원가입
                      </Link>
                    </div>
                  </div>

                  {/* 아이디 찾기 / 비밀번호 찾기 */}
                  <div className="flex gap-[24px] h-[19.44px] items-center">
                    <Link
                      href="/forgot-id"
                      className="flex h-full items-start justify-end w-[74px]"
                    >
                      <p className="font-normal leading-[1.5] text-[13px] text-[#b7b3af] tracking-[-0.26px]">
                        아이디 찾기
                      </p>
                    </Link>
                    <div className="flex h-[19.44px] items-center justify-center w-0">
                      <div className="flex-none rotate-[270deg]">
                        <div className="h-0 relative w-[19.44px]">
                          <img alt="" className="block max-w-none size-full" src={imgLine316} />
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="flex h-full items-start w-[74px]"
                    >
                      <p className="font-normal leading-[1.5] text-[13px] text-[#b7b3af] tracking-[-0.26px]">
                        비밀번호 찾기
                      </p>
                    </Link>
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
