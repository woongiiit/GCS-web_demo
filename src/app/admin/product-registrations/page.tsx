'use client'

import { Suspense, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgBack = "https://www.figma.com/api/mcp/asset/2b6f4870-7bf4-4b16-bbd7-c65c18b3ad5c"
const imgDropdownArrow = "https://www.figma.com/api/mcp/asset/3a773a01-ef59-4c05-8ed0-f829e68027b4"

interface ProductOption {
  name: string
  values: string[]
}

interface PriceOption {
  option: string
  price: number
}

interface ProductRegistration {
  id: string
  name: string
  type: 'Fund' | 'Partner up'
  seller: string
  requester: string
  requestDate: string
  fundingPeriod: string
  targetAmount: number
  deliveryMethods: string[]
  description: string
  options?: ProductOption[]
  prices?: PriceOption[]
  productionSchedule?: string[]
  settlementAccount?: string
  isExpanded?: boolean
}

export default function ProductRegistrationsPage() {
  return (
    <Suspense fallback={<ProductRegistrationsPageSuspenseFallback />}>
      <ProductRegistrationsPageContent />
    </Suspense>
  )
}

function ProductRegistrationsPageContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const [registrations, setRegistrations] = useState<ProductRegistration[]>([])
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(true)
  const [sortOrder, setSortOrder] = useState('최신순')

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchRegistrations()
    }
  }, [user])

  const fetchRegistrations = async () => {
    setIsLoadingRegistrations(true)
    try {
      // TODO: 실제 API 엔드포인트로 변경
      // const response = await fetch('/api/admin/product-registrations')
      // const data = await response.json()
      
      // 임시 데이터 (Figma 디자인 기반)
      const mockRegistrations: ProductRegistration[] = [
        {
          id: '1',
          name: '염소 후드집업',
          type: 'Fund',
          seller: 'MUA',
          requester: '김무성',
          requestDate: '2025.12.04 13:13',
          fundingPeriod: '2025.12.20 ~ 2025.04.30',
          targetAmount: 2500000,
          deliveryMethods: ['택배 배송', '현장 수령'],
          description: '이 염소 후드집업은 염소 두개골이 반쪽으로 갈라집니다.',
          options: [
            { name: '색깔', values: ['Black', 'White'] },
            { name: '키링', values: ['키링 있음', '키링 없음'] }
          ],
          prices: [
            { option: 'Black / 키링 있음', price: 40000 },
            { option: 'Black / 키링 없음', price: 36000 },
            { option: 'White / 키링 있음', price: 40000 },
            { option: 'White / 키링 없음', price: 36000 }
          ],
          productionSchedule: [
            '13일 최종 결제',
            '14일 상품 제작',
            '20일 배송 시작'
          ],
          settlementAccount: '국민은행 123456-78-901234',
          isExpanded: false
        },
        {
          id: '2',
          name: '웹 연동형 NFC 키링',
          type: 'Partner up',
          seller: '유랑',
          requester: '배민영',
          requestDate: '2025.12.04 13:13',
          fundingPeriod: '2025.12.24 ~ 2025.05.05',
          targetAmount: 1600000,
          deliveryMethods: ['택배 배송', '현장 수령'],
          description: '웹 연동형 NFC 키링',
          isExpanded: false
        }
      ]
      
      setRegistrations(mockRegistrations)
    } catch (error) {
      console.error('등록 요청 조회 오류:', error)
    } finally {
      setIsLoadingRegistrations(false)
    }
  }

  const toggleExpand = (id: string) => {
    setRegistrations(registrations.map(reg => 
      reg.id === id ? { ...reg, isExpanded: !reg.isExpanded } : reg
    ))
  }

  const handleApprove = async (id: string) => {
    try {
      // TODO: 실제 API 호출
      // await fetch(`/api/admin/product-registrations/${id}/approve`, { method: 'POST' })
      console.log('승인:', id)
      // 승인 후 목록에서 제거
      setRegistrations(registrations.filter(reg => reg.id !== id))
    } catch (error) {
      console.error('승인 오류:', error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      // TODO: 실제 API 호출
      // await fetch(`/api/admin/product-registrations/${id}/reject`, { method: 'POST' })
      console.log('거부:', id)
      // 거부 후 목록에서 제거
      setRegistrations(registrations.filter(reg => reg.id !== id))
    } catch (error) {
      console.error('거부 오류:', error)
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
            등록 요청 상품
          </p>
          <div className="h-[24px] opacity-0 w-[12px]" aria-hidden="true"></div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-4 items-center pb-5 pt-5 px-0 overflow-y-auto">
        {/* 총 등록 요청 수 */}
        <div className="h-[19px] relative w-[335px]">
          <p className="font-semibold leading-[18.6px] text-[12.4px] text-[#443e3c]">
            총 {registrations.length}개의 등록 요청
          </p>
        </div>

        {/* 정렬 드롭다운 */}
        <div className="h-[33px] relative w-[344px]">
          <div className="absolute bg-white h-[33px] left-0 rounded-[8px] top-0 w-[345px] flex items-center px-3 justify-between">
            <p className="font-semibold leading-[14px] text-[9.5px] text-[#85817e]">
              {sortOrder}
            </p>
            <div className="relative size-[11px]">
              <img alt="드롭다운" className="block max-w-none size-full" src={imgDropdownArrow} />
            </div>
          </div>
        </div>

        {/* 등록 요청 카드 리스트 */}
        <div className="flex flex-col gap-4 items-center w-full px-[20px]">
          {isLoadingRegistrations ? (
            <div className="flex items-center justify-center py-12 w-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600">등록 요청을 불러오는 중...</p>
              </div>
            </div>
          ) : (
            registrations.map((registration) => (
              <ProductRegistrationCard
                key={registration.id}
                registration={registration}
                onToggleExpand={toggleExpand}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ProductRegistrationCard({
  registration,
  onToggleExpand,
  onApprove,
  onReject
}: {
  registration: ProductRegistration
  onToggleExpand: (id: string) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  const isExpanded = registration.isExpanded || false

  return (
    <div className="bg-white flex flex-col gap-3 items-start p-4 rounded-[12px] shadow-[0px_0.954px_2.863px_0px_rgba(0,0,0,0.1),0px_0.954px_1.908px_-0.954px_rgba(0,0,0,0.1)] w-[335px]">
      {/* 기본 정보 */}
      <div className="flex flex-col gap-[4px] items-start w-full">
        <div className="flex gap-2 h-[21px] items-center w-full">
          <p className="font-bold leading-[21px] text-[15px] text-[#1a1918]">
            {registration.name}
          </p>
          <div className="bg-[#fd6f22] h-[18px] relative rounded-[4px] flex items-center justify-center px-1.5 py-0.5">
            <p className="font-normal leading-[14px] text-[10px] text-white tracking-[-0.3px]">
              {registration.type}
            </p>
          </div>
        </div>
        <div className="h-[19px] relative w-full">
          <p className="font-normal leading-[19px] text-[12px] text-[#85817e]">
            {registration.seller}
          </p>
        </div>
        <div className="h-[14px] relative w-full">
          <p className="font-normal leading-[14px] text-[10px] text-[#85817e]">
            요청자: {registration.requester} • {registration.requestDate}
          </p>
        </div>
      </div>

      {/* 펀딩 정보 */}
      <div className="bg-[#f8f6f4] flex flex-col gap-[4px] items-start pt-3 px-3 pb-0 rounded-[8px] w-full">
        <div className="flex gap-0.5 items-start w-full">
          <p className="font-semibold leading-[17px] text-[12px] text-[#443e3c] w-[43px]">
            펀딩기간:
          </p>
          <p className="font-normal leading-[17px] text-[12px] text-[#443e3c]">
            {registration.fundingPeriod}
          </p>
        </div>
        <div className="flex gap-0.5 items-start w-full">
          <p className="font-semibold leading-[17px] text-[12px] text-[#443e3c] w-[43px]">
            목표금액:
          </p>
          <p className="font-normal leading-[17px] text-[12px] text-[#443e3c]">
            {registration.targetAmount.toLocaleString()}원
          </p>
        </div>
        <div className="flex gap-0.5 items-start w-full">
          <p className="font-semibold leading-[17px] text-[12px] text-[#443e3c] w-[43px]">
            수령방식:
          </p>
          <p className="font-normal leading-[17px] text-[12px] text-[#443e3c]">
            {registration.deliveryMethods.join(', ')}
          </p>
        </div>
        <div className="h-[16px] relative w-full">
          <p className="font-normal leading-[16px] text-[10.5px] text-[#85817e]">
            {registration.description}
          </p>
        </div>
      </div>

      {/* 상세 정보 보기 버튼 */}
      <div className="h-[32px] relative w-full">
        <button
          onClick={() => onToggleExpand(registration.id)}
          className="w-full h-full flex items-center justify-center"
        >
          <p className="font-semibold leading-[17px] text-[12px] text-[#fd6f22] text-center">
            {isExpanded ? '접기' : '상세 정보 보기'}
          </p>
        </button>
      </div>

      {/* 확장된 상세 정보 */}
      {isExpanded && (
        <div className="flex flex-col gap-[10px] items-start w-full pt-3 border-t border-[#e8e4df]">
          {/* 옵션 정보 */}
          {registration.options && registration.options.length > 0 && (
            <div className="flex flex-col gap-2 items-start w-full">
              <div className="h-[19px] relative w-full">
                <p className="font-bold leading-[19px] text-[12.4px] text-[#1a1918]">
                  옵션 정보
                </p>
              </div>
              {registration.options.map((option, idx) => (
                <div key={idx} className="bg-[#eeebe6] flex flex-col gap-1 items-start pt-2.5 px-2.5 pb-0 rounded-[8px] w-full">
                  <div className="h-[17px] relative w-full">
                    <p className="font-semibold leading-[17px] text-[11.5px] text-[#443e3c]">
                      {option.name}
                    </p>
                  </div>
                  <div className="flex gap-2 items-start w-full">
                    {option.values.map((value, valueIdx) => (
                      <div key={valueIdx} className="bg-white flex flex-col items-start pt-1 px-2 pb-0 rounded-[4px]">
                        <p className="font-normal leading-[16px] text-[10.5px] text-[#1a1918]">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 가격 정보 */}
          {registration.prices && registration.prices.length > 0 && (
            <div className="flex flex-col gap-2 items-start w-full">
              <div className="h-[19px] relative w-full">
                <p className="font-bold leading-[19px] text-[12.4px] text-[#1a1918]">
                  가격 정보
                </p>
              </div>
              <div className="bg-[#dcd6cc] grid grid-cols-2 gap-0 rounded-[8px] w-full overflow-hidden">
                {registration.prices.map((price, idx) => (
                  <div key={idx} className="bg-[#eeebe6] flex flex-col gap-0.5 items-start pt-2 px-2 pb-0">
                    <p className="font-normal leading-[16px] text-[10.5px] text-[#443e3c]">
                      {price.option}
                    </p>
                    <p className="font-bold leading-[17px] text-[11.5px] text-[#fd6f22]">
                      {price.price.toLocaleString()}원
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 제작/배송 일정 */}
          {registration.productionSchedule && registration.productionSchedule.length > 0 && (
            <div className="flex flex-col gap-2 items-start w-full">
              <div className="h-[19px] relative w-full">
                <p className="font-bold leading-[19px] text-[12.4px] text-[#1a1918]">
                  제작/배송 일정
                </p>
              </div>
              <div className="bg-[#eeebe6] flex flex-col gap-0 items-start pt-2.5 px-2.5 pb-0 rounded-[8px] w-full">
                {registration.productionSchedule.map((schedule, idx) => (
                  <div key={idx} className="h-[16px] relative w-full">
                    <p className="font-normal leading-[16px] text-[10.5px] text-[#443e3c]">
                      {schedule}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 정산 계좌 */}
          {registration.settlementAccount && (
            <div className="flex flex-col gap-2 items-start w-full">
              <div className="h-[19px] relative w-full">
                <p className="font-bold leading-[19px] text-[12.4px] text-[#1a1918]">
                  정산 계좌
                </p>
              </div>
              <div className="bg-[#eeebe6] flex flex-col items-start pt-2.5 px-2.5 pb-0 rounded-[8px] w-full">
                <p className="font-normal leading-[17px] text-[11.5px] text-[#443e3c]">
                  {registration.settlementAccount}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 거부/승인 버튼 */}
      <div className="flex gap-2 h-[38px] items-start w-full">
        <button
          onClick={() => onReject(registration.id)}
          className="bg-[#f8f6f4] flex flex-1 items-start justify-center min-h-0 min-w-0 px-0 py-2.5 rounded-[8px]"
        >
          <p className="font-bold leading-[19px] text-[13px] text-[#443e3c] text-center">
            거부
          </p>
        </button>
        <button
          onClick={() => onApprove(registration.id)}
          className="bg-[#fd6f22] flex flex-1 items-start justify-center min-h-0 min-w-0 px-0 py-2.5 rounded-[8px]"
        >
          <p className="font-bold leading-[19px] text-[13px] text-white text-center">
            승인
          </p>
        </button>
      </div>
    </div>
  )
}

function ProductRegistrationsPageSuspenseFallback() {
  return (
    <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}
