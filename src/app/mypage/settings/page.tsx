'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgBack = "https://www.figma.com/api/mcp/asset/6e0d2847-9c1e-46bb-8302-7c6e138d3209"
const imgLine = "https://www.figma.com/api/mcp/asset/0328daf3-47d6-4d4b-af7c-f34a58b745a0"

function SettingsContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    studentId: '',
    major: '',
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/mypage/profile', { cache: 'no-store' })
      const data = await response.json()
      if (data.success) {
        setProfile(data.data)
        setFormData({
          name: data.data.name || '',
          phone: data.data.phone || '',
          email: data.data.email || '',
          studentId: data.data.studentId || '',
          major: data.data.major || '',
        })
      }
    } catch (error) {
      console.error('프로필 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/mypage/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          studentId: formData.studentId,
          major: formData.major,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('저장되었습니다.')
        fetchProfile()
      } else {
        alert(data.error || '저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('프로필 저장 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (isLoading || loading) {
    return (
      <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const isMajor = profile.role === 'MAJOR'

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
            설정
          </p>
          <div className="h-[24px] opacity-0 w-[12px]" aria-hidden="true"></div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-wrap gap-[16px] items-start justify-center pb-[20px] pt-[40px] px-[16px]">
        <div className="flex flex-[1_0_0] flex-col gap-[60px] items-start min-h-px min-w-px px-[16px] py-0 w-full max-w-[375px]">
          {isMajor ? (
            // 전공 회원 정보
            <div className="flex flex-col gap-[28px] items-center w-full">
              {/* 일반 회원 정보 */}
              <div className="flex flex-col gap-[12px] items-start w-full">
                <div className="flex items-start px-[8px] py-0 w-full">
                  <p className="font-bold leading-[1.5] text-[17px] text-[#5f5a58]">
                    일반 회원 정보
                  </p>
                </div>
                <div className="flex flex-col gap-[20px] items-start w-full">
                  {/* 이름 */}
                  <div className="flex flex-col items-start px-[8px] py-0 w-full">
                    <div className="flex flex-col gap-[2px] items-start w-full">
                      <div className="flex flex-col gap-[5px] items-start w-full">
                        <div className="flex gap-[4px] items-center w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                            이름
                          </p>
                        </div>
                        <div className="bg-[#eeebe6] border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-[12px] rounded-[12px] w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                            {formData.name}
                          </p>
                          <div className="flex items-center w-[24px]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 전화번호 */}
                  <div className="flex flex-col items-start px-[8px] py-0 w-full">
                    <div className="flex flex-col gap-[2px] items-start w-full">
                      <div className="flex flex-col gap-[5px] items-start w-full">
                        <div className="flex gap-[4px] items-center w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                            전화번호
                          </p>
                        </div>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-[12px] rounded-[12px] w-full bg-white text-[13px] text-[#5f5a58] tracking-[-0.26px]"
                          placeholder="010-0000-0000"
                        />
                      </div>
                    </div>
                  </div>
                  {/* 이메일 */}
                  <div className="flex flex-col items-start px-[8px] py-0 w-full">
                    <div className="flex flex-col gap-[2px] items-start w-full">
                      <div className="flex flex-col gap-[5px] items-start w-full">
                        <div className="flex gap-[4px] items-center w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                            이메일
                          </p>
                        </div>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-[12px] rounded-[12px] w-full bg-white text-[13px] text-[#5f5a58] tracking-[-0.26px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* 구분선 */}
              <div className="h-0 relative w-full">
                <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
                  <img alt="" className="block max-w-none size-full" src={imgLine} />
                </div>
              </div>
              {/* 전공 회원 정보 */}
              <div className="flex flex-col gap-[12px] items-start w-full">
                <div className="flex items-start px-[8px] py-0 w-full">
                  <p className="font-bold leading-[1.5] text-[17px] text-[#5f5a58]">
                    전공 회원 정보
                  </p>
                </div>
                <div className="flex flex-col gap-[20px] items-start w-full">
                  {/* 학번 */}
                  <div className="flex flex-col items-start px-[8px] py-0 w-full">
                    <div className="flex flex-col gap-[2px] items-start w-full">
                      <div className="flex flex-col gap-[5px] items-start w-full">
                        <div className="flex gap-[4px] items-center w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                            학번
                          </p>
                        </div>
                        <input
                          type="text"
                          value={formData.studentId}
                          onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                          className="border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-[12px] rounded-[12px] w-full bg-white text-[13px] text-[#5f5a58] tracking-[-0.26px]"
                          placeholder="학번을 입력하세요"
                        />
                      </div>
                    </div>
                  </div>
                  {/* 학과 */}
                  <div className="flex flex-col items-start px-[8px] py-0 w-full">
                    <div className="flex flex-col gap-[2px] items-start w-full">
                      <div className="flex flex-col gap-[5px] items-start w-full">
                        <div className="flex gap-[4px] items-center w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                            학과
                          </p>
                        </div>
                        <input
                          type="text"
                          value={formData.major}
                          onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                          className="border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-[12px] rounded-[12px] w-full bg-white text-[13px] text-[#5f5a58] tracking-[-0.26px]"
                          placeholder="학과를 입력하세요"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // 일반 회원 정보
            <div className="flex flex-col gap-[20px] items-start w-full">
              {/* 이름 */}
              <div className="flex flex-col items-start px-[8px] py-0 w-full">
                <div className="flex flex-col gap-[2px] items-start w-full">
                  <div className="flex flex-col gap-[5px] items-start w-full">
                    <div className="flex gap-[4px] items-center w-full">
                      <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                        이름
                      </p>
                    </div>
                    <div className="bg-[#eeebe6] border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-[12px] rounded-[12px] w-full">
                      <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                        {formData.name}
                      </p>
                      <div className="flex items-center w-[24px]"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* 전화번호 */}
              <div className="flex flex-col items-start px-[8px] py-0 w-full">
                <div className="flex flex-col gap-[2px] items-start w-full">
                  <div className="flex flex-col gap-[5px] items-start w-full">
                    <div className="flex gap-[4px] items-center w-full">
                      <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                        전화번호
                      </p>
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-[12px] rounded-[12px] w-full bg-white text-[13px] text-[#5f5a58] tracking-[-0.26px]"
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>
              </div>
              {/* 이메일 */}
              <div className="flex flex-col items-start px-[8px] py-0 w-full">
                <div className="flex flex-col gap-[2px] items-start w-full">
                  <div className="flex flex-col gap-[5px] items-start w-full">
                    <div className="flex gap-[4px] items-center w-full">
                      <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                        이메일
                      </p>
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-[12px] rounded-[12px] w-full bg-white text-[13px] text-[#5f5a58] tracking-[-0.26px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#443e3c] cursor-pointer flex items-center justify-center p-[12px] rounded-[12px] w-full disabled:opacity-50"
          >
            <p className="font-normal leading-[1.5] text-[13px] text-[#f8f6f4] tracking-[-0.26px]">
              {saving ? '저장 중...' : '저장'}
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
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
      <SettingsContent />
    </Suspense>
  )
}

