'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import HomepageTermsModal from '@/components/HomepageTermsModal'
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgVector827 = "https://www.figma.com/api/mcp/asset/7e181655-5c1b-451e-a8d5-fdbf073f37fd"
const imgVector828 = "https://www.figma.com/api/mcp/asset/f720a260-fee5-4db7-ac7b-85e93a9c255e"
const imgEllipse5406 = "https://www.figma.com/api/mcp/asset/19874800-c05a-4ec4-a796-9b3e985cae4d"
const imgEllipse5405 = "https://www.figma.com/api/mcp/asset/005f71e3-8164-41e0-bbbd-88082f255fce"
const imgEllipse5404 = "https://www.figma.com/api/mcp/asset/2d27c7bc-3c36-4cf2-a2a4-bbc2b53a42d7"
const imgLine336 = "https://www.figma.com/api/mcp/asset/5e49690b-51c9-4590-aa82-0586802bdfd8"
const imgLine297 = "https://www.figma.com/api/mcp/asset/da440d6a-cfa9-4df0-b4eb-e18aad5fbcd2"
const imgWeuiBackFilled = "https://www.figma.com/api/mcp/asset/b9549685-7b14-425c-b3f1-905099411dc7"
const imgRightArrow = "https://www.figma.com/api/mcp/asset/0be9a1e8-4180-4acb-8832-2403b3b2081a"
const imgCheckFilled = "https://www.figma.com/api/mcp/asset/14b97bcb-a8a3-4493-b4e2-d6e80e978b0a"
const imgCheckLight = "https://www.figma.com/api/mcp/asset/0be9a1e8-4180-4acb-8832-2403b3b2081a"
const imgLogo1 = "https://www.figma.com/api/mcp/asset/6820c6f1-8688-4f97-abad-df066a5917b5"
const imgLogo2 = "https://www.figma.com/api/mcp/asset/71e80be6-f3d3-406a-a89d-40f642752fae"
const imgLogo3 = "https://www.figma.com/api/mcp/asset/470f7015-44bc-47c7-843f-6c2be4b6f287"
const imgLogo4 = "https://www.figma.com/api/mcp/asset/ab261d18-8acd-4844-a25f-965602b50248"
const imgLogo5 = "https://www.figma.com/api/mcp/asset/7d51254c-1f2b-4918-b4dc-73cfcbe90a46"
const imgRadioFilled = "https://www.figma.com/api/mcp/asset/246f5511-6666-4b97-bd46-c6aaf8268268"
const imgRadioRegular = "https://www.figma.com/api/mcp/asset/376859ba-7c48-4959-be2f-b3929f643445"
const imgEye = "https://www.figma.com/api/mcp/asset/20c0ddc6-bbc3-4007-b24d-5c39d795be6f"
const imgCheckCircle = "https://www.figma.com/api/mcp/asset/14b97bcb-a8a3-4493-b4e2-d6e80e978b0a"

type Step = 'terms' | 'info'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return ''
  let formatted = digits.slice(0, 3)
  if (digits.length > 3) {
    formatted += '-' + digits.slice(3, 7)
  }
  if (digits.length > 7) {
    formatted += '-' + digits.slice(7, 11)
  }
  return formatted
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

export default function SignupPage() {
  const [step, setStep] = useState<Step>('terms')
  const router = useRouter()

  // 약관 동의 상태
  const [agreeAll, setAgreeAll] = useState(false)
  const [agreeAge, setAgreeAge] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)

  // 모달 상태
  const [isHomepageTermsOpen, setIsHomepageTermsOpen] = useState(false)
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false)

  // 회원정보 입력 상태
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [userType, setUserType] = useState<'GENERAL' | 'MAJOR'>('GENERAL')
  const [studentId, setStudentId] = useState('')
  const [major, setMajor] = useState('')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // 검증 및 상태
  const [nicknameChecked, setNicknameChecked] = useState(false)
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<boolean | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [timer, setTimer] = useState(300)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 전체 동의 체크박스 동작
  useEffect(() => {
    if (agreeAll) {
      setAgreeAge(true)
      setAgreeTerms(true)
      setAgreePrivacy(true)
    } else {
      if (agreeAge && agreeTerms && agreePrivacy) {
        // 모든 개별 동의가 체크되어 있으면 전체 동의도 체크
      } else {
        // 하나라도 해제되면 전체 동의 해제
      }
    }
  }, [agreeAll, agreeAge, agreeTerms, agreePrivacy])

  useEffect(() => {
    if (agreeAge && agreeTerms && agreePrivacy && !agreeAll) {
      setAgreeAll(true)
    } else if ((!agreeAge || !agreeTerms || !agreePrivacy) && agreeAll) {
      setAgreeAll(false)
    }
  }, [agreeAge, agreeTerms, agreePrivacy])

  // 타이머 카운트다운
  useEffect(() => {
    if (step === 'info' && timer > 0 && emailSent && !emailVerified) {
      const interval = setInterval(() => {
        setTimer((prev) => (prev <= 1 ? 0 : prev - 1))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [step, timer, emailSent, emailVerified])

  // 비밀번호 검증
  const passwordValidation = validatePassword(password)
  const passwordMatch = confirmPassword ? password === confirmPassword : null

  const handleBack = () => {
    if (step === 'info') {
      setStep('terms')
    } else {
      router.back()
    }
  }

  // 닉네임 중복 확인
  const handleCheckNickname = async () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }
    try {
      // TODO: 실제 API 호출
      setNicknameChecked(true)
      setIsNicknameAvailable(true)
      setError('')
    } catch (err) {
      console.error('닉네임 중복 확인 오류:', err)
    }
  }

  // 이메일 인증번호 전송
  const handleSendEmailCode = async () => {
    if (!email.trim()) {
      setError('이메일을 입력해주세요.')
      return
    }
    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()
      if (response.ok) {
        setEmailSent(true)
        setTimer(300)
        setError('')
      } else {
        setError(data.error || '인증번호 전송에 실패했습니다.')
      }
    } catch (err) {
      console.error('인증번호 전송 오류:', err)
      setError('인증번호 전송에 실패했습니다.')
    }
  }

  // 인증번호 확인
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('인증번호를 입력해주세요.')
      return
    }
    if (!email.trim()) {
      setError('이메일을 입력해주세요.')
      return
    }
    try {
      const response = await fetch('/api/auth/verify-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(),
          code: verificationCode.trim()
        }),
      })

      const data = await response.json()
      if (response.ok && data.verified) {
        setEmailVerified(true)
        setEmailSent(false)
        setTimer(0)
        setError('')
      } else {
        setError(data.error || '인증번호가 올바르지 않습니다.')
      }
    } catch (err) {
      console.error('인증번호 검증 오류:', err)
      setError('인증번호 검증에 실패했습니다.')
    }
  }

  // 회원가입 제출
  const handleSignup = async () => {
    if (!nickname || !phone || !email || !password || !confirmPassword) {
      setError('모든 필수 항목을 입력해주세요.')
      return
    }
    if (!emailVerified) {
      setError('이메일 인증을 완료해주세요.')
      return
    }
    if (!passwordValidation.isValid) {
      setError('비밀번호 형식이 올바르지 않습니다.')
      return
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (userType === 'MAJOR' && (!studentId || !major)) {
      setError('학번과 전공을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nickname || name, // 닉네임이 있으면 닉네임을 이름으로 사용, 없으면 이름 사용
          phone: phone, // 하이픈 포함 형식으로 전송 (010-XXXX-XXXX)
          email,
          password,
          userType,
          studentId: userType === 'MAJOR' ? studentId : null,
          major: userType === 'MAJOR' ? major : null,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        router.push('/login')
      } else {
        setError(data.error || '회원가입에 실패했습니다.')
      }
    } catch (err) {
      console.error('회원가입 오류:', err)
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedToInfo = agreeAge && agreeTerms && agreePrivacy
  const canSignup = nickname && phone && emailVerified && passwordValidation.isValid && passwordMatch === true && (userType === 'GENERAL' || (studentId && major))

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll', WebkitOverflowScrolling: 'touch' }}>
      <div className="relative min-h-screen w-full">
        {/* 배경 디자인 요소들 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-[-47.67px] top-[-22.16px] w-[522.88px] h-[294.65px] flex items-center justify-center rotate-[339.444deg]">
            <img alt="" className="block max-w-none size-full" src={imgVector827} />
          </div>
          <div className="absolute left-[-27.92px] top-[-23.12px] w-[567.01px] h-[447.70px] flex items-center justify-center rotate-[333.242deg]">
            <img alt="" className="block max-w-none size-full" src={imgVector828} />
          </div>
          <div className="absolute left-[106px] top-[-101px] w-[173.07px] h-[292.81px] flex items-center justify-center rotate-[5.928deg]">
            <img alt="" className="block max-w-none size-full" src={imgEllipse5406} />
          </div>
          <div className="absolute left-[192px] top-[-20px] w-[263.09px] h-[265.69px] flex items-center justify-center rotate-[43.746deg]">
            <img alt="" className="block max-w-none size-full" src={imgEllipse5405} />
          </div>
          <div className="absolute left-[5px] top-[68px] w-[145px] h-[145px]">
            <img alt="" className="block max-w-none size-full" src={imgEllipse5404} />
          </div>
        </div>

        {/* 상단 네비게이션 */}
        <div className="absolute left-[16px] top-[39px] w-[24px] h-[24px] flex items-center justify-center z-10">
          <button onClick={handleBack} className="h-[24px] w-[12px] flex items-center justify-center" aria-label="뒤로가기">
            <img alt="뒤로가기" className="block max-w-none size-full" src={imgWeuiBackFilled} />
          </button>
        </div>

        {/* 로고 */}
        <div className="absolute h-[29.608px] left-[calc(50%-0.5px)] shadow-[0px_4px_4px_0px_rgba(197,54,9,0.3)] top-[89px] translate-x-[-50%] w-[84px] z-10">
          <Link href="/" className="block h-full w-full relative">
            <div className="absolute inset-[1.48%_82.19%_0_0]">
              <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
                <img className="block max-w-none size-full" alt="GCS Logo" src={imgLogo1} />
              </div>
            </div>
            <div className="absolute inset-[0_0_0_68.67%]">
              <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
                <img className="block max-w-none size-full" alt="GCS Logo" src={imgLogo2} />
              </div>
            </div>
            <div className="absolute inset-[32.59%_-3.66%_23.7%_-2.35%]">
              <img className="block max-w-none size-full" alt="GCS Logo" src={imgLogo3} />
            </div>
            <div className="absolute inset-[1.48%_65.71%_0.06%_18.58%]">
              <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
                <img className="block max-w-none size-full" alt="GCS Logo" src={imgLogo4} />
              </div>
            </div>
            <div className="absolute inset-[1.48%_32.86%_0_36.07%]">
              <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
                <img className="block max-w-none size-full" alt="GCS Logo" src={imgLogo5} />
              </div>
            </div>
          </Link>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="absolute left-0 top-[181px] w-full bg-[#f8f6f4] rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-4px_10px_0px_rgba(238,74,8,0.4)] pt-[96px] pb-[24px] px-[16px]">
          <div className="flex flex-col gap-[40px] items-center">
            {/* 제목 */}
            <div className="h-[33px] relative w-full">
              <div className="absolute left-0 top-0 w-full">
                <div className="h-[33px] relative">
                  <div className="absolute left-[-40px] top-[5px] w-[24px] h-[24px] flex items-center justify-center">
                    <div className="flex-none scale-y-[-100%]">
                      <div className="relative size-[24px]">
                        <div className="absolute contents left-[9px] top-[5px]">
                          <div className="absolute flex h-[14px] items-center justify-center left-[9px] top-[5px] w-[6px]">
                            <div className="flex-none rotate-[270deg]">
                              <div className="h-[6px] relative w-[14px]">
                                <img alt="" className="block max-w-none size-full" src={imgRightArrow} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute left-1/2 top-0 -translate-x-1/2">
                    <p className="font-bold leading-[1.5] text-[22px] text-[#443e3c] text-center">
                      회원가입
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {step === 'terms' ? (
              <div className="flex flex-col gap-[48px] items-start w-full">
                {/* 약관 동의 목록 */}
                <div className="flex flex-col gap-[16px] items-start w-full px-2">
                  {/* 약관 전체 동의 */}
                  <div className="flex gap-[12px] items-center w-full pr-3">
                    <button
                      type="button"
                      onClick={() => setAgreeAll(!agreeAll)}
                      className="relative shrink-0 size-[24px] flex items-center justify-center"
                    >
                      {agreeAll ? (
                        <img alt="체크됨" className="block max-w-none size-full" src={imgCheckFilled} />
                      ) : (
                        <div className="border-[1.5px] border-[#2a2a2e] rounded-[5px] size-[20px] relative">
                          <div className="absolute flex inset-[31.25%_35.42%_43.75%_39.58%] items-center justify-center">
                            <div className="flex-none h-[5.657px] rotate-[225deg] w-[2.828px]">
                              <div className="relative size-full">
                                <img alt="" className="block max-w-none size-full" src={imgCheckLight} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </button>
                    <div className="flex flex-1 items-center">
                      <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                        약관 전체 동의
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {}}
                      className="flex items-center justify-center relative shrink-0"
                    >
                      <div className="flex-none rotate-[180deg] scale-y-[-100%]">
                        <div className="relative size-[16.667px]">
                          <div className="absolute contents left-[7.5px] top-[4.17px]">
                            <div className="absolute flex h-[11.667px] items-center justify-center left-[7.5px] top-[4.17px] w-[5px]">
                              <div className="flex-none rotate-[270deg]">
                                <div className="h-[5px] relative w-[11.667px]">
                                  <img alt="" className="block max-w-none size-full" src={imgRightArrow} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* 구분선 */}
                  <div className="h-px relative w-full">
                    <img alt="" className="block max-w-none size-full" src={imgLine336} />
                  </div>

                  {/* 만 14세 이상 */}
                  <div className="flex gap-[12px] items-center w-full pr-3">
                    <button
                      type="button"
                      onClick={() => setAgreeAge(!agreeAge)}
                      className="relative shrink-0 size-[24px] flex items-center justify-center"
                    >
                      {agreeAge ? (
                        <img alt="체크됨" className="block max-w-none size-full" src={imgCheckFilled} />
                      ) : (
                        <div className="border-[1.5px] border-[#2a2a2e] rounded-[5px] size-[20px] relative">
                          <div className="absolute flex inset-[31.25%_35.42%_43.75%_39.58%] items-center justify-center">
                            <div className="flex-none h-[5.657px] rotate-[225deg] w-[2.828px]">
                              <div className="relative size-full">
                                <img alt="" className="block max-w-none size-full" src={imgCheckLight} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </button>
                    <div className="flex flex-1 items-center">
                      <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                        [필수] 만 14세 이상입니다.
                      </p>
                    </div>
                  </div>

                  {/* 홈페이지 이용약관 동의 */}
                  <div className="flex gap-[12px] items-center w-full pr-3">
                    <button
                      type="button"
                      onClick={() => setAgreeTerms(!agreeTerms)}
                      className="relative shrink-0 size-[24px] flex items-center justify-center"
                    >
                      {agreeTerms ? (
                        <img alt="체크됨" className="block max-w-none size-full" src={imgCheckFilled} />
                      ) : (
                        <div className="border-[1.5px] border-[#2a2a2e] rounded-[5px] size-[20px] relative">
                          <div className="absolute flex inset-[31.25%_35.42%_43.75%_39.58%] items-center justify-center">
                            <div className="flex-none h-[5.657px] rotate-[225deg] w-[2.828px]">
                              <div className="relative size-full">
                                <img alt="" className="block max-w-none size-full" src={imgCheckLight} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </button>
                    <div className="flex flex-1 items-center">
                      <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                        [필수] 홈페이지 이용약관 동의
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsHomepageTermsOpen(true)}
                      className="flex items-center justify-center relative shrink-0"
                    >
                      <div className="flex-none rotate-[180deg] scale-y-[-100%]">
                        <div className="relative size-[16.667px]">
                          <div className="absolute contents left-[7.5px] top-[4.17px]">
                            <div className="absolute flex h-[11.667px] items-center justify-center left-[7.5px] top-[4.17px] w-[5px]">
                              <div className="flex-none rotate-[270deg]">
                                <div className="h-[5px] relative w-[11.667px]">
                                  <img alt="" className="block max-w-none size-full" src={imgRightArrow} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
          </div>

                  {/* 개인정보 수집·이용 동의 */}
                  <div className="flex gap-[12px] items-center w-full pr-3">
                    <button
                      type="button"
                      onClick={() => setAgreePrivacy(!agreePrivacy)}
                      className="relative shrink-0 size-[24px] flex items-center justify-center"
                    >
                      {agreePrivacy ? (
                        <img alt="체크됨" className="block max-w-none size-full" src={imgCheckFilled} />
                      ) : (
                        <div className="border-[1.5px] border-[#2a2a2e] rounded-[5px] size-[20px] relative">
                          <div className="absolute flex inset-[31.25%_35.42%_43.75%_39.58%] items-center justify-center">
                            <div className="flex-none h-[5.657px] rotate-[225deg] w-[2.828px]">
                              <div className="relative size-full">
                                <img alt="" className="block max-w-none size-full" src={imgCheckLight} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </button>
                    <div className="flex flex-1 items-center">
                      <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                        [필수] 개인정보 수집·이용 동의
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPrivacyPolicyOpen(true)}
                      className="flex items-center justify-center relative shrink-0"
                    >
                      <div className="flex-none rotate-[180deg] scale-y-[-100%]">
                        <div className="relative size-[16.667px]">
                          <div className="absolute contents left-[7.5px] top-[4.17px]">
                            <div className="absolute flex h-[11.667px] items-center justify-center left-[7.5px] top-[4.17px] w-[5px]">
                              <div className="flex-none rotate-[270deg]">
                                <div className="h-[5px] relative w-[11.667px]">
                                  <img alt="" className="block max-w-none size-full" src={imgRightArrow} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 다음 버튼 */}
                <div className="flex flex-col items-center w-full px-2">
                  <button
                    type="button"
                    onClick={() => canProceedToInfo && setStep('info')}
                    disabled={!canProceedToInfo}
                    className={`w-full h-[55px] rounded-[12px] flex items-center justify-center p-4 ${
                      canProceedToInfo
                        ? 'bg-[#443e3c] cursor-pointer hover:opacity-90'
                        : 'bg-[#c9c1b7] cursor-not-allowed'
                    }`}
                  >
                    <p className="font-normal leading-[1.5] text-[15px] text-[#f8f6f4]">
                      다음
                    </p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-[68px] items-start w-full pb-24">
                {/* 회원정보 입력 섹션 */}
                <div className="flex flex-col gap-[32px] items-center w-full px-2">
                  {/* 회원정보 */}
                  <div className="flex flex-col gap-[20px] items-start w-full">
                    <p className="font-bold leading-[1.5] text-[17px] text-[#5f5a58] w-full">
                      회원정보
                    </p>
                    <div className="flex flex-col gap-[16px] items-start w-full">
                      {/* 닉네임 */}
                      <div className="flex flex-col gap-[2px] items-start w-full">
                        <div className="flex flex-col gap-[5px] items-start w-full">
                          <div className="flex gap-[4px] items-center w-full">
                            <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                              닉네임
                            </p>
                          </div>
                          <div className="flex gap-[5px] items-start w-full">
                            <div className={`border ${error && !nickname ? 'border-[#f06115]' : 'border-[#5f5a58]'} flex flex-1 h-[48px] items-center justify-between p-3 rounded-[12px] bg-white`}>
                              <input
                                type="text"
                                value={nickname}
                                onChange={(e) => {
                                  setNickname(e.target.value)
                                  setNicknameChecked(false)
                                  setIsNicknameAvailable(null)
                                  setError('')
                                }}
                                placeholder="닉네임 입력"
                                className="font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none text-[#5f5a58] placeholder:text-[#b7b3af]"
                              />
                              <div className="flex items-center justify-center w-[35px]" />
                            </div>
                            <button
                              type="button"
                              onClick={handleCheckNickname}
                              disabled={!nickname || nicknameChecked}
                              className={`h-[48px] rounded-[12px] flex items-center justify-center px-3 w-[70px] ${
                                !nickname || nicknameChecked
                                  ? 'bg-[#c9c1b7] cursor-not-allowed'
                                  : 'bg-[#443e3c] cursor-pointer hover:opacity-90'
                              }`}
                            >
                              <p className="font-normal leading-[1.5] text-[13px] text-[#f8f6f4] tracking-[-0.26px]">
                                중복 확인
                              </p>
                            </button>
                          </div>
                        </div>
                        {isNicknameAvailable === true && nicknameChecked && (
                          <p className="font-normal leading-[1.75] text-[#f06115] text-[10px] w-full whitespace-pre-wrap">
                            사용할 수 있는 닉네임입니다.
                          </p>
                        )}
                      </div>

                      {/* 전화번호 */}
                      <div className="flex flex-col gap-[2px] items-start w-full">
                        <div className="flex flex-col gap-[5px] items-start w-full">
                          <div className="flex gap-[4px] items-center w-full">
                            <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                              전화번호
                            </p>
                          </div>
                          <div className="border border-[#5f5a58] flex h-[48px] items-center justify-between p-3 rounded-[12px] bg-white w-full">
                      <input
                              type="tel"
                              value={phone}
                              onChange={(e) => {
                                setPhone(formatPhone(e.target.value))
                                setError('')
                              }}
                              placeholder="010-1234-5678"
                              maxLength={13}
                              className="font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none text-[#5f5a58] placeholder:text-[#b7b3af]"
                            />
                            <div className="flex items-center w-[24px]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="h-px relative w-full">
                    <img alt="" className="block max-w-none size-full" src={imgLine297} />
                  </div>

                  {/* 회원유형 */}
                  <div className="flex flex-col gap-[20px] items-start w-full">
                    <p className="font-bold leading-[1.5] text-[17px] text-[#5f5a58] w-full">
                      회원유형
                    </p>
                    <div className="flex gap-[8px] items-center w-full">
                      <button
                        type="button"
                        onClick={() => setUserType('GENERAL')}
                        className="relative shrink-0 size-[16px] flex items-center justify-center"
                      >
                        <img alt={userType === 'GENERAL' ? '선택됨' : '선택 안됨'} className="block max-w-none size-full" src={userType === 'GENERAL' ? imgRadioFilled : imgRadioRegular} />
                      </button>
                      <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                        일반 회원
                      </p>
                    </div>
                    <div className="flex gap-[8px] items-center w-full">
                      <button
                        type="button"
                        onClick={() => setUserType('MAJOR')}
                        className="relative shrink-0 size-[16px] flex items-center justify-center"
                      >
                        <img alt={userType === 'MAJOR' ? '선택됨' : '선택 안됨'} className="block max-w-none size-full" src={userType === 'MAJOR' ? imgRadioFilled : imgRadioRegular} />
                      </button>
                      <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                        전공 회원
                      </p>
                    </div>

                    {/* 전공 회원 추가 필드 */}
                    {userType === 'MAJOR' && (
                      <div className="flex flex-col gap-[16px] items-start w-full mt-4">
                        {/* 학번 */}
                        <div className="flex flex-col gap-[2px] items-start w-full">
                          <div className="flex flex-col gap-[5px] items-start w-full">
                            <div className="flex gap-[4px] items-center w-full">
                              <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                                학번
                              </p>
                            </div>
                            <div className="border border-[#5f5a58] flex h-[48px] items-center justify-between p-3 rounded-[12px] bg-white w-full">
                              <input
                                type="text"
                                value={studentId}
                                onChange={(e) => {
                                  setStudentId(e.target.value.replace(/\D/g, '').slice(0, 10))
                                  setError('')
                                }}
                                placeholder="학번 입력"
                                maxLength={10}
                                className="font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none text-[#5f5a58] placeholder:text-[#b7b3af]"
                              />
                              <div className="flex items-center w-[24px]" />
                    </div>
                  </div>
                </div>

                        {/* 전공 */}
                        <div className="flex flex-col gap-[2px] items-start w-full">
                          <div className="flex flex-col gap-[5px] items-start w-full">
                            <div className="flex gap-[4px] items-center w-full">
                              <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                                전공
                              </p>
                            </div>
                            <div className="border border-[#5f5a58] flex h-[48px] items-center justify-between p-3 rounded-[12px] bg-white w-full">
                    <input
                      type="text"
                                value={major}
                                onChange={(e) => {
                                  setMajor(e.target.value)
                                  setError('')
                                }}
                                placeholder="전공 입력"
                                className="font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none text-[#5f5a58] placeholder:text-[#b7b3af]"
                              />
                              <div className="flex items-center w-[24px]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 구분선 */}
                  <div className="h-px relative w-full">
                    <img alt="" className="block max-w-none size-full" src={imgLine297} />
                  </div>

                  {/* ID/PW */}
                  <div className="flex flex-col gap-[20px] items-start w-full">
                    <p className="font-bold leading-[1.5] text-[17px] text-[#5f5a58] w-full">
                      ID/PW
                    </p>
                    <div className="flex flex-col gap-[16px] items-start w-full">
                      {/* 아이디 (이메일) */}
                      <div className="flex flex-col gap-[2px] items-start w-full">
                        <div className="flex flex-col gap-[5px] items-start w-full">
                          <div className="flex gap-[4px] items-center w-full">
                            <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                              아이디 (이메일)
                            </p>
                          </div>
                          <div className="flex items-center justify-between w-full gap-2">
                            <div className={`border ${emailSent && !emailVerified ? 'border-[#5f5a58]' : emailVerified ? 'border-[#14ae5c]' : error && !email ? 'border-[#f06115]' : 'border-[#5f5a58]'} flex flex-1 h-[48px] items-center justify-between p-3 rounded-[12px] bg-white`}>
                    <input
                      type="email"
                                value={email}
                                onChange={(e) => {
                                  setEmail(e.target.value)
                                  setEmailSent(false)
                                  setEmailVerified(false)
                                  setError('')
                                }}
                      placeholder="example@dongguk.edu"
                                disabled={emailVerified}
                                className="font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none text-[#5f5a58] placeholder:text-[#b7b3af] disabled:opacity-50"
                    />
                              <div className="flex items-center justify-center w-[35px]" />
                            </div>
                    <button
                      type="button"
                              onClick={handleSendEmailCode}
                              disabled={!email || emailVerified || emailSent}
                              className={`h-[48px] rounded-[12px] flex items-center justify-center px-3 ${
                                !email || emailVerified || emailSent
                                  ? 'bg-[#c9c1b7] cursor-not-allowed'
                                  : 'bg-[#443e3c] cursor-pointer hover:opacity-90'
                              }`}
                            >
                              <p className="font-normal leading-[1.5] text-[13px] text-[#f8f6f4] tracking-[-0.26px] text-center whitespace-nowrap">
                                {emailSent ? '전송' : '인증번호 전송'}
                              </p>
                    </button>
                  </div>
                        </div>
                        {emailSent && !emailVerified && (
                          <p className="font-normal leading-[1.75] text-[#f06115] text-[10px] w-full whitespace-pre-wrap">
                            인증번호가 전송되었습니다.
                          </p>
                        )}
                      </div>

                      {/* 인증번호 */}
                      <div className="flex flex-col gap-[2px] items-start w-full">
                        <div className="flex flex-col gap-[5px] items-start w-full">
                          <div className="flex gap-[4px] items-center w-full">
                            <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                              인증번호
                            </p>
                          </div>
                          <div className="flex gap-[5px] items-start w-full">
                            <div className={`border ${error && error.includes('인증번호') ? 'border-[#f06115]' : emailVerified ? 'border-[#14ae5c]' : 'border-[#5f5a58]'} flex flex-1 h-[48px] items-center justify-between p-3 rounded-[12px] bg-white`}>
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
                                disabled={emailVerified || !emailSent}
                                className="font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none text-[#5f5a58] placeholder:text-[#b7b3af] disabled:opacity-50"
                              />
                              {emailSent && timer > 0 && !emailVerified && (
                                <div className="flex items-center justify-center w-[35px]">
                                  <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                                    {formatTime(timer)}
                                  </p>
                                </div>
                              )}
                              {emailVerified && (
                                <div className="flex items-center justify-center w-[35px]">
                                  <p className="font-normal leading-[1.5] text-[13px] text-[#14ae5c] tracking-[-0.26px]">
                                    완료
                                  </p>
                                </div>
                              )}
                            </div>
                        <button
                          type="button"
                          onClick={handleVerifyCode}
                              disabled={!verificationCode || emailVerified || !emailSent || timer === 0}
                              className={`h-[48px] rounded-[12px] flex items-center justify-center px-3 w-[70px] ${
                                !verificationCode || emailVerified || !emailSent || timer === 0
                                  ? 'bg-[#c9c1b7] cursor-not-allowed'
                                  : 'bg-[#443e3c] cursor-pointer hover:opacity-90'
                              }`}
                            >
                              <p className="font-normal leading-[1.5] text-[13px] text-[#f8f6f4] tracking-[-0.26px]">
                                확인
                              </p>
                        </button>
                      </div>
                    </div>
                        {emailVerified && (
                          <p className="font-normal leading-[1.75] text-[#f06115] text-[10px] w-full whitespace-pre-wrap">
                            인증이 완료되었습니다.
                    </p>
                  )}
                </div>

                      {/* 새 비밀번호 */}
                      <div className="flex flex-col gap-[2px] items-start w-full">
                        <div className="flex flex-col gap-[5px] items-start w-full">
                          <div className="flex gap-[4px] items-center w-full">
                            <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                              새 비밀번호
                            </p>
                          </div>
                          <div className="border border-[#5f5a58] flex flex-1 h-[48px] items-center justify-between p-3 rounded-[12px] bg-white w-full">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value)
                                setError('')
                              }}
                              placeholder="8자 이상 영문, 숫자 조합"
                              className="font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none text-[#5f5a58] placeholder:text-[#b7b3af]"
                            />
                            <div className="flex items-center gap-2">
                              {password && (
                                <p className={`font-normal leading-[1.5] text-[13px] tracking-[-0.26px] ${
                                  passwordValidation.isValid ? 'text-[#14ae5c]' : 'text-[#f06115]'
                                }`}>
                                  {passwordValidation.message}
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="size-[24px] flex items-center justify-center"
                                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                              >
                                <img alt="비밀번호 토글" className="block max-w-none size-full" src={imgEye} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="font-normal leading-[1.75] text-[10px] text-[#5f5a58] w-full whitespace-pre-wrap">
                          8자 이상 영문, 숫자 조합
                        </p>
                </div>

                {/* 비밀번호 확인 */}
                      <div className="flex flex-col gap-[2px] items-start w-full">
                        <div className="flex flex-col gap-[5px] items-start w-full">
                          <div className="flex gap-[4px] items-center w-full">
                            <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                              비밀번호 확인
                            </p>
                          </div>
                          <div className="border border-[#5f5a58] flex flex-1 h-[48px] items-center justify-between p-3 rounded-[12px] bg-white w-full">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                setError('')
                              }}
                              placeholder="8자 이상 영문, 숫자 조합"
                              className="font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none text-[#5f5a58] placeholder:text-[#b7b3af]"
                            />
                            <div className="flex items-center gap-2">
                              {confirmPassword && (
                                <p className={`font-normal leading-[1.5] text-[13px] tracking-[-0.26px] ${
                                  passwordMatch ? 'text-[#14ae5c]' : 'text-[#f06115]'
                                }`}>
                                  {passwordMatch ? '일치' : '불일치'}
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="size-[24px] flex items-center justify-center"
                                aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                              >
                                <img alt="비밀번호 토글" className="block max-w-none size-full" src={imgEye} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="font-normal leading-[1.75] text-[10px] text-[#5f5a58] w-full whitespace-pre-wrap">
                          8자 이상 영문, 숫자 조합
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 회원가입 버튼 */}
                <div className="flex flex-col items-center w-full px-2">
                  {error && (
                    <p className="font-normal leading-[1.75] text-[#f06115] text-[10px] w-full mb-4 text-center">
                      {error}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleSignup}
                    disabled={!canSignup || isSubmitting}
                    className={`w-full h-[55px] rounded-[12px] flex items-center justify-center p-4 ${
                      canSignup && !isSubmitting
                        ? 'bg-[#443e3c] cursor-pointer hover:opacity-90'
                        : 'bg-[#c9c1b7] cursor-not-allowed'
                    }`}
                  >
                    <p className="font-normal leading-[1.5] text-[15px] text-[#f8f6f4]">
                      {isSubmitting ? '처리 중...' : '회원가입'}
                    </p>
                  </button>
                </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* 약관 모달들 */}
      <HomepageTermsModal isOpen={isHomepageTermsOpen} onClose={() => setIsHomepageTermsOpen(false)} />
      <PrivacyPolicyModal isOpen={isPrivacyPolicyOpen} onClose={() => setIsPrivacyPolicyOpen(false)} />
    </div>
  )
}
