'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgBack = "https://www.figma.com/api/mcp/asset/bb6bebad-5ef4-47cf-8504-6f27b2da18df"
const imgLine = "https://www.figma.com/api/mcp/asset/5d3365f3-0ce8-4dc9-b053-017151d40a19"
const imgTrash = "https://www.figma.com/api/mcp/asset/85fd3188-42ac-4762-acb7-6c1aef224efd"
const imgPlus = "https://www.figma.com/api/mcp/asset/00806099-a8bc-40a1-a434-01c7ada5ca98"

function SellerTeamContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [team, setTeam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    teamName: '',
    representative: '',
    accountHolder: '',
    bankName: '',
    accountNumber: '',
  })
  const [members, setMembers] = useState<any[]>([])
  const [isRepresentative, setIsRepresentative] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && user.isSeller) {
      fetchTeamInfo()
    }
  }, [user])

  const fetchTeamInfo = async () => {
    try {
      const response = await fetch('/api/mypage/seller-teams', { cache: 'no-store' })
      const data = await response.json()
      if (data.success && data.data.length > 0) {
        const firstTeam = data.data[0]
        setTeam(firstTeam)
        setFormData({
          teamName: firstTeam.name || '',
          representative: '', // TODO: 대표자 정보는 별도로 관리 필요
          accountHolder: '',
          bankName: '',
          accountNumber: '',
        })
        
        // 팀 상세 정보 가져오기
        const teamDetailResponse = await fetch('/api/seller-teams', { cache: 'no-store' })
        const teamDetailData = await teamDetailResponse.json()
        if (teamDetailData.success) {
          const teamDetail = teamDetailData.data.find((t: any) => t.id === firstTeam.id)
          if (teamDetail && teamDetail.members) {
            setMembers(teamDetail.members)
            
            // 첫 번째 멤버가 현재 사용자면 대표자
            if (teamDetail.members.length > 0 && teamDetail.members[0].id === user?.id) {
              setIsRepresentative(true)
            }
          }
        }
      }
    } catch (error) {
      console.error('판매팀 정보 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: 판매팀 정보 업데이트 API 구현 필요
      alert('저장되었습니다.')
    } catch (error) {
      console.error('판매팀 정보 저장 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!team) return
    
    if (!confirm('정말 이 팀원을 제거하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/seller-teams/${team.id}/members?userId=${memberId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        alert('팀원이 제거되었습니다.')
        fetchTeamInfo()
      } else {
        alert(data.error || '팀원 제거에 실패했습니다.')
      }
    } catch (error) {
      console.error('팀원 제거 오류:', error)
      alert('팀원 제거 중 오류가 발생했습니다.')
    }
  }

  const handleAddMember = () => {
    // TODO: 팀원 추가 모달 구현
    alert('팀원 추가 기능은 추후 구현 예정입니다.')
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

  if (!user || !user.isSeller || !team) {
    return (
      <div className="bg-[#f8f6f4] min-h-screen flex items-center justify-center">
        <p className="text-gray-600">판매팀 정보를 찾을 수 없습니다.</p>
      </div>
    )
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
            설정
          </p>
          <div className="h-[24px] opacity-0 w-[12px]" aria-hidden="true"></div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-wrap gap-[16px] items-start justify-center pb-[20px] pt-[40px] px-[16px]">
        <div className="flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-px px-[16px] py-0 w-full max-w-[375px]">
          {/* 팀 정보 */}
          <div className="flex flex-col gap-[12px] items-start w-full">
            <div className="flex items-start px-[8px] py-0 w-full">
              <p className="font-bold leading-[1.5] text-[17px] text-[#5f5a58]">
                팀 정보
              </p>
            </div>
            <div className="flex flex-col items-start w-full">
              <div className="flex flex-col items-start px-[8px] py-0 w-full">
                <div className="flex flex-col gap-[2px] items-start w-full">
                  <div className="flex flex-col gap-[5px] items-start w-full">
                    <div className="flex gap-[4px] items-center w-full">
                      <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                        팀명
                      </p>
                    </div>
                    <input
                      type="text"
                      value={formData.teamName}
                      onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                      className="border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-[12px] rounded-[12px] w-full bg-white text-[13px] text-[#5f5a58] tracking-[-0.26px]"
                      placeholder="팀명을 입력하세요"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 대표자 정보 */}
          {isRepresentative ? (
            <>
              <div className="flex flex-col gap-[12px] items-start w-full">
                <div className="flex items-start px-[8px] py-0 w-full">
                  <p className="font-bold leading-[1.5] text-[17px] text-[#5f5a58]">
                    대표자
                  </p>
                </div>
                <div className="flex flex-col gap-[20px] items-start w-full">
                  {/* 대표자 */}
                  <div className="flex flex-col items-start px-[8px] py-0 w-full">
                    <div className="flex flex-col gap-[2px] items-start w-full">
                      <div className="flex flex-col gap-[5px] items-start w-full">
                        <div className="flex gap-[4px] items-center w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                            대표자
                          </p>
                        </div>
                        <div className="flex gap-[5px] items-start w-full">
                          <input
                            type="text"
                            value={formData.representative}
                            onChange={(e) => setFormData({ ...formData, representative: e.target.value })}
                            className="border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-[12px] rounded-[12px] w-[216px] bg-white text-[13px] text-[#5f5a58] tracking-[-0.26px]"
                            placeholder="대표자명"
                          />
                          <button className="bg-[#443e3c] cursor-pointer flex flex-1 items-center justify-center p-[12px] rounded-[12px]">
                            <p className="font-normal leading-[1.5] text-[13px] text-[#f8f6f4] tracking-[-0.26px]">
                              권한 넘기기
                            </p>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 예금주명 */}
                  <div className="flex flex-col items-start px-[8px] py-0 w-full">
                    <div className="flex flex-col gap-[2px] items-start w-full">
                      <div className="flex flex-col gap-[5px] items-start w-full">
                        <div className="flex gap-[4px] items-center w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                            예금주명
                          </p>
                        </div>
                        <input
                          type="text"
                          value={formData.accountHolder}
                          onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                          className="border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-[12px] rounded-[12px] w-full bg-white text-[13px] text-[#5f5a58] tracking-[-0.26px]"
                          placeholder="예금주명"
                        />
                      </div>
                    </div>
                  </div>
                  {/* 은행명 */}
                  <div className="flex flex-col items-start px-[8px] py-0 w-full">
                    <div className="flex flex-col gap-[2px] items-start w-full">
                      <div className="flex flex-col gap-[5px] items-start w-full">
                        <div className="flex gap-[4px] items-center w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                            은행명
                          </p>
                        </div>
                        <input
                          type="text"
                          value={formData.bankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          className="border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-[12px] rounded-[12px] w-full bg-white text-[13px] text-[#5f5a58] tracking-[-0.26px]"
                          placeholder="은행명"
                        />
                      </div>
                    </div>
                  </div>
                  {/* 계좌 */}
                  <div className="flex flex-col items-start px-[8px] py-0 w-full">
                    <div className="flex flex-col gap-[2px] items-start w-full">
                      <div className="flex flex-col gap-[5px] items-start w-full">
                        <div className="flex gap-[4px] items-center w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                            계좌
                          </p>
                        </div>
                        <input
                          type="text"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          className="border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-[12px] rounded-[12px] w-full bg-white text-[13px] text-[#5f5a58] tracking-[-0.26px]"
                          placeholder="000-000000-00000"
                        />
                        <p className="font-normal leading-[1.75] text-[10px] text-[#f06115] w-full whitespace-pre-wrap">
                          판매팀이 정산 받을 계좌입니다.
                        </p>
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
            </>
          ) : (
            <>
              <div className="flex flex-col gap-[12px] items-start w-full">
                <div className="flex items-start px-[8px] py-0 w-full">
                  <p className="font-bold leading-[1.5] text-[17px] text-[#5f5a58]">
                    대표자
                  </p>
                </div>
                <div className="flex flex-col items-start w-full">
                  <div className="flex flex-col items-start px-[8px] py-0 w-full">
                    <div className="flex flex-col gap-[2px] items-start w-full">
                      <div className="flex flex-col gap-[5px] items-start w-full">
                        <div className="flex gap-[4px] items-center w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                            대표자
                          </p>
                        </div>
                        <div className="bg-[#eeebe6] flex items-start w-full">
                          <div className="border border-[#5f5a58] border-solid flex flex-1 h-[48px] items-center justify-between p-[12px] rounded-[12px] bg-white">
                            <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                              {members.length > 0 ? members[0].name : '대표자'}
                            </p>
                            <div className="flex items-center justify-center w-[35px]"></div>
                          </div>
                        </div>
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
            </>
          )}

          {/* 팀원 */}
          <div className="flex flex-col gap-[12px] items-start w-full">
            <div className="flex items-start px-[8px] py-0 w-full">
              <p className="font-bold leading-[1.5] text-[17px] text-[#5f5a58]">
                팀원
              </p>
            </div>
            <div className="flex flex-col gap-[20px] items-start w-full">
              {members.map((member, index) => (
                <div key={member.id} className="flex flex-col items-start px-[8px] py-0 w-full">
                  <div className="flex flex-col gap-[2px] items-start w-full">
                    <div className="flex flex-col gap-[5px] items-start w-full">
                      <div className="flex gap-[4px] items-center w-full">
                        <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                          팀원 {index + 1}
                        </p>
                      </div>
                      <div className="border border-[#5f5a58] border-solid flex h-[48px] items-center justify-between p-[12px] rounded-[12px] w-full bg-white">
                        <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                          {member.name}
                        </p>
                        {isRepresentative && member.id !== user?.id && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="flex items-center relative shrink-0 w-[24px] h-[24px]"
                            aria-label="팀원 제거"
                          >
                            <img alt="삭제" className="block max-w-none size-full" src={imgTrash} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {isRepresentative && (
              <button
                onClick={handleAddMember}
                className="relative shrink-0 size-[24px] ml-[8px]"
                aria-label="팀원 추가"
              >
                <img alt="추가" className="block max-w-none size-full" src={imgPlus} />
              </button>
            )}
          </div>

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

export default function SellerTeamPage() {
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
      <SellerTeamContent />
    </Suspense>
  )
}

