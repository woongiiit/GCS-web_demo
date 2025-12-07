'use client'

import { Suspense, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgBack = "https://www.figma.com/api/mcp/asset/bad87d57-9fe1-4d0b-a682-58e7e41becb6"

interface SettlementHistory {
  id: string
  sellerTeam: string
  paymentDate: string
  amount: number
  status: '완료' | '대기' | '취소'
}

export default function SettlementsPage() {
  return (
    <Suspense fallback={<SettlementsPageSuspenseFallback />}>
      <SettlementsPageContent />
    </Suspense>
  )
}

function SettlementsPageContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sellerTeam, setSellerTeam] = useState('')
  const [settlementHistories, setSettlementHistories] = useState<SettlementHistory[]>([])
  const [isLoadingHistories, setIsLoadingHistories] = useState(true)

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchRecentSettlements()
    }
  }, [user])

  const fetchRecentSettlements = async () => {
    setIsLoadingHistories(true)
    try {
      // TODO: 실제 API 엔드포인트로 변경
      // const response = await fetch('/api/admin/settlements/recent')
      // const data = await response.json()
      
      // 임시 데이터 (Figma 디자인 기반)
      const mockHistories: SettlementHistory[] = [
        {
          id: '1',
          sellerTeam: '유랑',
          paymentDate: '2024-11-10',
          amount: 523000,
          status: '완료'
        },
        {
          id: '2',
          sellerTeam: 'MUA',
          paymentDate: '2024-10-10',
          amount: 687000,
          status: '완료'
        },
        {
          id: '3',
          sellerTeam: '여명',
          paymentDate: '2024-09-10',
          amount: 451000,
          status: '완료'
        }
      ]
      
      setSettlementHistories(mockHistories)
    } catch (error) {
      console.error('정산 내역 조회 오류:', error)
    } finally {
      setIsLoadingHistories(false)
    }
  }

  const handleSearch = async () => {
    try {
      setIsLoadingHistories(true)
      // TODO: 실제 API 호출
      // const response = await fetch('/api/admin/settlements', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ startDate, endDate, sellerTeam })
      // })
      // const data = await response.json()
      
      console.log('정산 내역 조회:', { startDate, endDate, sellerTeam })
      // 검색 결과 처리
      await fetchRecentSettlements()
    } catch (error) {
      console.error('정산 내역 조회 오류:', error)
    } finally {
      setIsLoadingHistories(false)
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

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="bg-[#f8f6f4] min-h-screen flex flex-col">
      {/* Nav Bar */}
      <div className="flex-shrink-0">
        <div className="bg-[#f8f6f4] h-[34px]"></div>
        <div className="bg-[#f8f6f4] flex h-[44px] items-center justify-between px-[16px] py-[10px] shadow-[0px_4px_10px_0px_rgba(99,81,73,0.1)]">
          <button
            onClick={handleBack}
            className="h-[24px] w-[12px] flex items-center justify-center"
            aria-label="뒤로가기"
          >
            <img alt="뒤로가기" className="block max-w-none size-full" src={imgBack} />
          </button>
          <p className="font-bold leading-[1.5] text-[15px] text-black">
            정산 관리
          </p>
          <div className="h-[24px] opacity-0 w-[12px]" aria-hidden="true"></div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-4 items-start p-4 overflow-y-auto">
        {/* 정산 내역 조회 */}
        <div className="bg-white flex flex-col gap-4 items-start pb-0 pt-4 px-4 rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] w-full">
          <div className="flex h-6 items-start relative w-full">
            <p className="flex-1 font-normal leading-6 text-[16px] text-[#443e3c] whitespace-pre-wrap">
              정산 내역 조회
            </p>
          </div>

          {/* 정산 기간 시작 */}
          <div className="flex flex-col gap-2 items-start w-full">
            <div className="flex h-6 items-start relative w-full">
              <p className="flex-1 font-normal leading-6 text-[16px] text-[#5f5a58] whitespace-pre-wrap">
                정산 기간 시작
              </p>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-[#5f5a58] h-[42px] rounded-[10px] w-full px-3 text-[14px]"
            />
          </div>

          {/* 정산 기간 종료 */}
          <div className="flex flex-col gap-2 items-start w-full">
            <div className="flex h-6 items-start relative w-full">
              <p className="flex-1 font-normal leading-6 text-[16px] text-[#5f5a58] whitespace-pre-wrap">
                정산 기간 종료
              </p>
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-[#5f5a58] h-[42px] rounded-[10px] w-full px-3 text-[14px]"
            />
          </div>

          {/* 판매팀 */}
          <div className="flex flex-col gap-2 items-start w-full">
            <div className="flex h-6 items-start relative w-full">
              <p className="flex-1 font-normal leading-6 text-[16px] text-[#5f5a58] whitespace-pre-wrap">
                판매팀
              </p>
            </div>
            <input
              type="text"
              value={sellerTeam}
              onChange={(e) => setSellerTeam(e.target.value)}
              placeholder="판매팀명을 입력하세요"
              className="border border-[#5f5a58] h-[42px] rounded-[10px] w-full px-3 text-[14px]"
            />
          </div>

          {/* 정산 내역 보기 버튼 */}
          <button
            onClick={handleSearch}
            className="bg-[#fd6f22] h-10 relative rounded-[10px] w-full mb-4"
          >
            <p className="font-normal leading-6 text-[16px] text-[#f8f6f4] text-center">
              정산 내역 보기
            </p>
          </button>
        </div>

        {/* 최근 정산 내역 */}
        <div className="bg-white flex flex-col gap-4 items-start pb-0 pt-4 px-4 rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] w-full">
          <div className="flex h-6 items-start relative w-full">
            <p className="flex-1 font-normal leading-6 text-[16px] text-[#443e3c] whitespace-pre-wrap">
              최근 정산 내역
            </p>
          </div>

          <div className="flex flex-col gap-3 items-start w-full">
            {isLoadingHistories ? (
              <div className="flex items-center justify-center py-12 w-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                  <p className="text-gray-600">정산 내역을 불러오는 중...</p>
                </div>
              </div>
            ) : (
              settlementHistories.map((history) => (
                <SettlementHistoryCard key={history.id} history={history} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SettlementHistoryCard({ history }: { history: SettlementHistory }) {
  return (
    <div className="bg-[#f8f6f4] flex h-[73px] items-center justify-between pl-3 pr-3 py-0 rounded-[10px] w-full">
      <div className="h-[48px] relative w-[141px]">
        <div className="flex h-6 items-start relative w-full">
          <p className="flex-1 font-normal leading-6 text-[16px] text-[#443e3c] whitespace-pre-wrap">
            판매팀: {history.sellerTeam}
          </p>
        </div>
        <div className="h-6 relative w-full mt-0">
          <p className="font-normal leading-6 text-[16px] text-[#85817e] whitespace-pre-wrap">
            지급일: {history.paymentDate}
          </p>
        </div>
      </div>
      <div className="h-[49px] relative w-[72px]">
        <div className="h-6 relative w-full">
          <p className="font-normal leading-6 text-[16px] text-[#443e3c] text-right">
            {history.amount.toLocaleString()}원
          </p>
        </div>
        <div className="bg-[#14ae5c] flex items-center justify-center px-3 py-0.5 rounded-full mt-1">
          <p className="font-bold leading-4 text-[12px] text-[#f8f6f4] text-right">
            {history.status}
          </p>
        </div>
      </div>
    </div>
  )
}

function SettlementsPageSuspenseFallback() {
  return (
    <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}
