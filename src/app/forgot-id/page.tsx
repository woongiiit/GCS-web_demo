'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgVector827 = "https://www.figma.com/api/mcp/asset/91456c85-adba-4cf2-bf7b-941e3707e867"
const imgVector828 = "https://www.figma.com/api/mcp/asset/09407644-d5b1-4aa9-aaf3-d21d9936256f"
const imgEllipse5406 = "https://www.figma.com/api/mcp/asset/2dcf951c-13a6-40ce-b6ec-5c8ef3c5235a"
const imgEllipse5405 = "https://www.figma.com/api/mcp/asset/d492cf9a-4323-4068-a90e-e8ff92e9ead5"
const imgEllipse5404 = "https://www.figma.com/api/mcp/asset/aab4adf0-76a9-4cd9-a481-31508c6e75b6"
const imgVector = "https://www.figma.com/api/mcp/asset/16e75770-565c-40ea-bfbc-5432ca2879b1"
const imgWeuiBackFilled = "https://www.figma.com/api/mcp/asset/d57d654d-7fbc-4576-afa6-ab89eb0bd58e"
const imgLogo1 = "https://www.figma.com/api/mcp/asset/6820c6f1-8688-4f97-abad-df066a5917b5"
const imgLogo2 = "https://www.figma.com/api/mcp/asset/71e80be6-f3d3-406a-a89d-40f642752fae"
const imgLogo3 = "https://www.figma.com/api/mcp/asset/470f7015-44bc-47c7-843f-6c2be4b6f287"
const imgLogo4 = "https://www.figma.com/api/mcp/asset/ab261d18-8acd-4844-a25f-965602b50248"
const imgLogo5 = "https://www.figma.com/api/mcp/asset/7d51254c-1f2b-4918-b4dc-73cfcbe90a46"

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

function maskEmail(email: string) {
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return email
  
  if (localPart.length <= 3) {
    return email
  }
  
  const visibleLength = Math.min(3, localPart.length - 3)
  const masked = localPart.slice(0, visibleLength) + '*'.repeat(localPart.length - visibleLength)
  return `${masked}@${domain}`
}

export default function ForgotIdPage() {
  const [step, setStep] = useState<Step>('form')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

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
        setMaskedEmail(maskEmail(data.data.email))
        setStep('result')
      } else {
        setError(data.error || '해당하는 아이디를 찾을 수 없습니다.')
      }
    } catch (err) {
      console.error('아이디 찾기 오류:', err)
      setError('서버 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const isButtonDisabled = isSubmitting || error !== ''

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
                  {step === 'form' ? '아이디 찾기' : '아이디 확인'}
                </p>
              </div>
            </div>

            {/* 폼 또는 결과 */}
            <div className="flex flex-col h-[428px] items-center justify-end w-full">
              {step === 'form' ? (
                <div className="flex flex-col gap-[48px] items-start w-full">
                  {/* 입력 필드 */}
                  <div className="flex flex-col gap-[16px] items-start w-full px-2">
                    {/* 이름 입력 */}
                    <div className="flex flex-col gap-[2px] items-start w-full">
                      <div className="flex flex-col gap-[5px] items-start w-full">
                        <div className="flex gap-[4px] items-center w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                            이름
                          </p>
                        </div>
                        <div className="border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-3 rounded-[12px] w-full bg-white">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="김봉구"
                            className="font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none text-[#b7b3af] placeholder:text-[#b7b3af]"
                          />
                          <div className="flex items-center relative w-[24px]">
                            <div className="opacity-0 overflow-clip relative shrink-0 size-[24px]">
                              <div className="absolute inset-[8.33%]">
                                <img alt="" className="block max-w-none size-full" src={img1} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 전화번호 입력 */}
                    <div className="flex flex-col gap-[2px] items-start w-full">
                      <div className="flex flex-col gap-[5px] items-start w-full">
                        <div className="flex gap-[4px] items-center w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                            전화번호
                          </p>
                        </div>
                        <div className="border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-3 rounded-[12px] w-full bg-white">
                          <input
                            type="tel"
                            inputMode="numeric"
                            value={phone}
                            onChange={(e) => setPhone(formatPhone(e.target.value))}
                            placeholder="010-1234-5678"
                            maxLength={13}
                            className="font-normal leading-[1.5] text-[13px] tracking-[-0.26px] flex-1 bg-transparent outline-none text-[#b7b3af] placeholder:text-[#b7b3af]"
                          />
                          <div className="flex items-center w-[24px]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 버튼 및 링크 */}
                  <div className="flex flex-col h-[196px] items-center justify-between w-full">
                    <div className="flex flex-col gap-[32px] items-center w-full px-2">
                      {/* 아이디 찾기 버튼 */}
                      <div className="flex flex-col gap-[2px] items-center w-full">
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isButtonDisabled || !name || !phone}
                          className={`w-full h-[55px] rounded-[12px] flex items-center justify-center p-4 ${
                            isButtonDisabled || !name || !phone
                              ? 'bg-[#c9c1b7] cursor-not-allowed'
                              : 'bg-[#443e3c] cursor-pointer hover:opacity-90'
                          }`}
                        >
                          <p className="font-normal leading-[1.5] text-[15px] text-[#f8f6f4]">
                            아이디 찾기
                          </p>
                        </button>
                        {error && (
                          <p className="font-normal leading-[1.75] text-[#f06115] text-[10px] w-full whitespace-pre-wrap">
                            {error}
                          </p>
                        )}
                      </div>

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

                    {/* 비밀번호 찾기 */}
                    <div className="flex h-[19.44px] items-start justify-center">
                      <Link
                        href="/forgot-password"
                        className="flex h-full items-start justify-center w-[74px]"
                      >
                        <p className="font-normal leading-[1.5] text-[13px] text-[#b7b3af] tracking-[-0.26px]">
                          비밀번호 찾기
                        </p>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-[100.5px] items-start w-full pt-[56.5px] pb-[55px] px-4">
                  {/* 아이디 표시 */}
                  <div className="flex flex-col items-start w-full px-2">
                    <div className="flex flex-col gap-[2px] items-start w-full px-2">
                      <div className="flex flex-col gap-[5px] items-start w-full">
                        <div className="flex gap-[4px] items-center w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                            아이디 (이메일)
                          </p>
                        </div>
                        <div className="bg-[#eeebe6] border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-3 rounded-[12px] w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#1a1918] tracking-[-0.26px]">
                            {maskedEmail}
                          </p>
                          <div className="flex items-center relative w-[24px]">
                            <div className="opacity-0 overflow-clip relative shrink-0 size-[24px]">
                              <div className="absolute inset-[8.33%]">
                                <img alt="" className="block max-w-none size-full" src={img1} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 버튼 및 링크 */}
                  <div className="flex flex-col h-[196px] items-center justify-between w-full">
                    <div className="flex flex-col items-center w-full px-2">
                      {/* 로그인 하러가기 버튼 */}
                      <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="w-full h-[55px] rounded-[12px] flex items-center justify-center p-4 bg-[#443e3c] cursor-pointer hover:opacity-90"
                      >
                        <p className="font-normal leading-[1.5] text-[15px] text-[#f8f6f4]">
                          로그인 하러가기
                        </p>
                      </button>
                    </div>

                    {/* 비밀번호 찾기 */}
                    <div className="flex h-[19.44px] items-start justify-center">
                      <Link
                        href="/forgot-password"
                        className="flex h-full items-start justify-center w-[74px]"
                      >
                        <p className="font-normal leading-[1.5] text-[13px] text-[#b7b3af] tracking-[-0.26px]">
                          비밀번호 찾기
                        </p>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
