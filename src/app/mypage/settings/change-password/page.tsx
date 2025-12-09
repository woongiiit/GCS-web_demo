'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgBack = "https://www.figma.com/api/mcp/asset/0728fa67-8ac0-4cc3-b10a-ac87c99f55d3"
const imgEye = "https://www.figma.com/api/mcp/asset/49d40b1a-881d-405b-ad2d-362a650083d1"

function ChangePasswordContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  const handleBack = () => {
    router.back()
  }

  const handleNext = async () => {
    if (!password || password.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    // 영문과 숫자 조합 확인
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    if (!hasLetter || !hasNumber) {
      alert('비밀번호는 영문과 숫자를 포함해야 합니다.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: '', // 비밀번호 변경 페이지에서는 현재 비밀번호가 필요 없을 수도 있음
          newPassword: password,
          confirmPassword: password,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('비밀번호가 변경되었습니다.')
        router.push('/mypage/settings')
      } else {
        alert(data.error || '비밀번호 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error)
      alert('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
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
    <div className="bg-[#f8f6f4] min-h-screen flex flex-col">
      {/* Nav Bar */}
      <div className="flex-shrink-0">
        <div className="h-[34px]"></div>
        <div className="bg-[#f8f6f4] flex h-[44px] items-center justify-between px-[16px] py-[10px] shadow-[0px_4px_10px_0px_rgba(99,81,73,0.1)]">
          <button
            onClick={handleBack}
            className="h-[24px] w-[12px] flex items-center justify-center"
            aria-label="뒤로가기"
          >
            <img alt="뒤로가기" className="block max-w-none size-full" src={imgBack} />
          </button>
          <p className="font-bold leading-[1.5] text-[15px] text-black">
            비밀번호 변경
          </p>
          <div className="h-[24px] opacity-0 w-[12px]" aria-hidden="true"></div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-wrap gap-[16px] items-start justify-center pb-[20px] pt-[40px] px-[16px]">
        <div className="flex flex-[1_0_0] flex-col gap-[40px] items-start min-h-px min-w-px px-[16px] py-0 w-full max-w-[375px]">
          {/* 비밀번호 입력 */}
          <div className="flex flex-col items-start px-[8px] py-0 w-full">
            <div className="flex flex-col gap-[2px] items-start w-full">
              <div className="flex flex-col gap-[5px] items-start w-full">
                <div className="flex gap-[4px] items-center w-full">
                  <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                    비밀번호
                  </p>
                </div>
                <div className="border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-[12px] rounded-[12px] w-full bg-white">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8자 이상의 영문,숫자 조합"
                    className="flex-1 font-normal leading-[1.5] text-[13px] text-[#b7b3af] tracking-[-0.26px] outline-none bg-transparent"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center relative shrink-0 w-[24px] h-[24px]"
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    <div className="overflow-clip relative shrink-0 size-[24px]">
                      <div className="absolute inset-[8.33%]">
                        <div className="absolute inset-0">
                          <img alt="" className="block max-w-none size-full" src={imgEye} />
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 다음 버튼 */}
          <div className="flex flex-col items-center px-[8px] py-0 w-full">
            <button
              onClick={handleNext}
              disabled={saving || !password}
              className="bg-[#443e3c] cursor-pointer flex h-[48px] items-center justify-center p-[16px] rounded-[12px] w-full disabled:opacity-50"
            >
              <p className="font-normal leading-[1.5] text-[15px] text-[#f8f6f4]">
                {saving ? '처리 중...' : '다음'}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <ChangePasswordContent />
    </Suspense>
  )
}

