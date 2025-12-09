'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgBack = "https://www.figma.com/api/mcp/asset/39a7b8dc-e4e5-4007-95ee-b4c95c0ec2bc"
const imgProduct = "https://www.figma.com/api/mcp/asset/77c9084f-6e81-45b5-b705-1879a080106c"

type TabType = 'fund' | 'partner_up'

interface Order {
  id: string
  status: string
  totalAmount: number
  shippingAddress: string
  phone: string
  buyerName?: string | null
  buyerEmail?: string | null
  notes?: string | null
  createdAt: string
  fundStatus?: string | null
  partnerUpStatus?: string | null
  orderItems: Array<{
    id: string
    quantity: number
    price: number
    selectedOptions?: any
    product: {
      id: string
      name: string
      images: string[]
      type: string
      brand?: string | null
      author?: {
        name: string
      } | null
      sellerTeam?: {
        name: string
      } | null
    }
  }>
  user: {
    name: string
    email: string
    phone: string
  }
}

function OrderDetailContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('fund')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && orderId) {
      fetchOrderDetail()
    }
  }, [user, orderId])

  const fetchOrderDetail = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/mypage/orders/${orderId}`, { cache: 'no-store' })
      const data = await response.json()
      if (data.success) {
        setOrder(data.data)
        // 첫 번째 주문 아이템의 타입에 따라 탭 설정
        if (data.data.orderItems && data.data.orderItems.length > 0) {
          const firstType = data.data.orderItems[0].product.type
          setActiveTab(firstType === 'FUND' ? 'fund' : 'partner_up')
        }
      }
    } catch (error) {
      console.error('주문 상세 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const weekday = weekdays[date.getDay()]
    return `${year}.${month}.${day} (${weekday})`
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString() + '원'
  }

  const getStatusSteps = () => {
    if (activeTab === 'fund') {
      return [
        { label: '결제 대기', active: order?.fundStatus === 'ORDERED' },
        { label: '결제 완료', active: order?.fundStatus === 'BILLING_COMPLETED' },
        { label: '상품 준비중', active: order?.fundStatus === 'CONFIRMED' || order?.fundStatus === 'PRODUCTION_STARTED' },
        { label: '배송 중', active: order?.fundStatus === 'SHIPPED_OUT' || order?.fundStatus === 'SHIPPING' || order?.fundStatus === 'ARRIVED' },
        { label: '구매 확정', active: order?.fundStatus === 'RECEIVED' },
      ]
    } else {
      return [
        { label: '결제 완료', active: order?.partnerUpStatus === 'ORDERED' || order?.partnerUpStatus === 'CONFIRMED' },
        { label: '상품 준비중', active: order?.partnerUpStatus === 'PRODUCTION_STARTED' },
        { label: '배송 중', active: order?.partnerUpStatus === 'SHIPPED_OUT' || order?.partnerUpStatus === 'SHIPPING' || order?.partnerUpStatus === 'ARRIVED' },
        { label: '구매 확정', active: order?.partnerUpStatus === 'RECEIVED' },
      ]
    }
  }

  const getStatusLabel = () => {
    if (!order) return '결제 대기'
    
    if (activeTab === 'fund') {
      if (order.fundStatus === 'ORDERED') return '결제 대기'
      if (order.fundStatus === 'BILLING_COMPLETED') return '결제 완료'
      if (order.fundStatus === 'CONFIRMED' || order.fundStatus === 'PRODUCTION_STARTED') return '상품 준비중'
      if (order.fundStatus === 'SHIPPED_OUT' || order.fundStatus === 'SHIPPING' || order.fundStatus === 'ARRIVED') return '배송 중'
      if (order.fundStatus === 'RECEIVED') return '구매 확정'
      return '결제 대기'
    } else {
      if (order.partnerUpStatus === 'ORDERED' || order.partnerUpStatus === 'CONFIRMED') return '결제 완료'
      if (order.partnerUpStatus === 'PRODUCTION_STARTED') return '상품 준비중'
      if (order.partnerUpStatus === 'SHIPPED_OUT' || order.partnerUpStatus === 'SHIPPING' || order.partnerUpStatus === 'ARRIVED') return '배송 중'
      if (order.partnerUpStatus === 'RECEIVED') return '구매 확정'
      return '결제 완료'
    }
  }

  const getSellerName = (orderItem: Order['orderItems'][0]) => {
    return orderItem.product.sellerTeam?.name || orderItem.product.author?.name || 'GCS'
  }

  const formatOptions = (options: any) => {
    if (!options) return ''
    const parts: string[] = []
    if (options.quantity) parts.push(`[수량] ${options.quantity}개`)
    if (options.color) parts.push(`[컬러] ${options.color}`)
    if (options.size) parts.push(`[사이즈] ${options.size}`)
    return parts.join(' / ')
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

  if (!user || !order) {
    return null
  }

  const statusSteps = getStatusSteps()
  const firstItem = order.orderItems[0]

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
            주문 상세
          </p>
          <div className="h-[24px] opacity-0 w-[12px]" aria-hidden="true"></div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-col h-[59px] items-start justify-end shrink-0 w-full">
        <div className="bg-[#f8f6f4] flex h-[59px] items-center justify-between pb-[4px] pt-[12px] px-[20px] sticky top-0 w-full">
          <button
            onClick={() => setActiveTab('fund')}
            className={`flex flex-1 h-[43px] items-center justify-center px-[4px] py-0 ${
              activeTab === 'fund' ? 'border-b border-[#1a1918]' : ''
            }`}
          >
            <p
              className={`font-bold leading-[1.5] text-[13px] text-center tracking-[-0.26px] ${
                activeTab === 'fund' ? 'text-[#1a1918]' : 'text-[#b7b3af]'
              }`}
            >
              Fund
            </p>
          </button>
          <button
            onClick={() => setActiveTab('partner_up')}
            className={`flex flex-1 h-[43px] items-center justify-center px-[4px] py-0 ${
              activeTab === 'partner_up' ? 'border-b border-[#1a1918]' : ''
            }`}
          >
            <p
              className={`font-bold leading-[1.5] text-[13px] text-center tracking-[-0.26px] ${
                activeTab === 'partner_up' ? 'text-[#1a1918]' : 'text-[#b7b3af]'
              }`}
            >
              Partner up
            </p>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="bg-[#f8f6f4] flex flex-col gap-[40px] items-center px-0 py-[40px] flex-1 w-full">
        {/* 진행 상태 */}
        <div className="flex items-center justify-between px-[26.5px] py-0 w-full">
          {statusSteps.map((step, index) => (
            <div key={index} className="flex flex-col gap-[4px] items-start">
              <div
                className={`h-[8px] rounded-[2px] w-[64px] ${
                  step.active ? 'bg-[#fd6f22]' : 'bg-[#dcd6cc]'
                }`}
              />
              <div className="flex items-start">
                <p className="font-normal leading-[1.5] text-[10px] text-[#5f5a58]">
                  {step.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 주문 카드 */}
        <div className="flex flex-col items-start w-[322px]">
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-1 flex-col gap-[12px] items-start">
              <div className="flex flex-col gap-[12px] items-start w-full">
                <p className="font-bold h-[20px] leading-[1.5] text-[15px] text-[#5f5a58] w-full whitespace-pre-wrap">
                  {formatDate(order.createdAt)}
                </p>
                <div className="flex flex-col gap-[8px] items-start w-full">
                  <p className="font-normal h-[20px] leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px] w-full whitespace-pre-wrap">
                    {getStatusLabel()}
                  </p>
                  <div className="flex gap-[16px] items-start w-full">
                    <div className="aspect-[82/82] relative rounded-[4px] self-stretch shrink-0 w-[82px]">
                      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4px]">
                        {firstItem.product.images && firstItem.product.images[0] ? (
                          <img
                            alt={firstItem.product.name}
                            src={firstItem.product.images[0]}
                            className="absolute h-full left-0 max-w-none top-0 w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/images/placeholder-product.jpg'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-[8px] items-start">
                      <div className="flex flex-col items-start justify-end leading-[1.5] text-[#1a1918] w-full">
                        <p className="font-normal min-w-full text-[10px] w-[min-content] whitespace-pre-wrap">
                          {getSellerName(firstItem)} 
                        </p>
                        <p className="font-bold text-[13px] tracking-[-0.26px]">
                          {firstItem.product.name}
                        </p>
                      </div>
                      <div className="flex flex-col gap-[4px] items-start leading-[1.5] text-[10px] w-full">
                        <p className="font-normal min-w-full text-[#85817e] w-[min-content] whitespace-pre-wrap">
                          {formatOptions(firstItem.selectedOptions)}
                        </p>
                        <p className="font-bold text-[#85817e]">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-[8px] items-start w-full">
                <button className="bg-white border-[0.531px] border-[#443e3c] border-solid flex flex-1 items-center justify-center px-[8px] py-[4px] rounded-[4px]">
                  <p className="font-normal leading-[1.5] text-[10px] text-[#1a1918]">
                    주문 취소/변경
                  </p>
                </button>
                <button className="bg-white border-[0.531px] border-[#443e3c] border-solid flex flex-1 items-center justify-center px-[8px] py-[4px] rounded-[4px]">
                  <p className="font-normal leading-[1.5] text-[10px] text-[#1a1918] text-center">
                    문의하기
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 주문 정보 */}
        <div className="flex flex-col gap-[13px] items-start">
          <p className="font-bold leading-[1.5] min-w-full text-[17px] text-[#1a1918] w-[min-content] whitespace-pre-wrap">
            주문 정보
          </p>
          <div className="flex flex-col gap-[16px] items-start">
            <div className="flex flex-col gap-[2px] items-start leading-[1.5] text-[13px] text-[#1a1918] tracking-[-0.26px] whitespace-pre-wrap">
              <p className="font-bold relative shrink-0 w-full">
                주문 번호
              </p>
              <p className="font-normal relative shrink-0 w-full">
                {order.id}
              </p>
            </div>
            <div className="flex flex-col gap-[2px] items-start leading-[1.5] text-[13px] text-[#1a1918] tracking-[-0.26px] w-full">
              <p className="font-bold relative shrink-0">
                주문 날짜
              </p>
              <p className="font-normal relative shrink-0">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex flex-col gap-[2px] items-start leading-[1.5] text-[13px] text-[#1a1918] tracking-[-0.26px] w-full">
              <p className="font-bold relative shrink-0">
                배송지
              </p>
              <p className="font-normal relative shrink-0">
                {order.shippingAddress}
              </p>
            </div>
            {order.notes && (
              <div className="flex flex-col gap-[2px] items-start leading-[1.5] text-[13px] text-[#1a1918] tracking-[-0.26px] w-full">
                <p className="font-bold relative shrink-0">
                  배송문구
                </p>
                <p className="font-normal relative shrink-0">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 주문자 정보 */}
        <div className="flex flex-col gap-[13px] items-start">
          <p className="font-bold leading-[1.5] min-w-full text-[17px] text-[#1a1918] w-[min-content] whitespace-pre-wrap">
            주문자 정보
          </p>
          <div className="flex flex-col gap-[16px] items-start">
            <div className="flex flex-col gap-[2px] items-start leading-[1.5] text-[13px] text-[#1a1918] tracking-[-0.26px] whitespace-pre-wrap">
              <p className="font-bold relative shrink-0 w-full">
                주문자
              </p>
              <p className="font-normal relative shrink-0 w-full">
                {order.buyerName || order.user.name}
              </p>
            </div>
            <div className="flex flex-col gap-[2px] items-start leading-[1.5] text-[13px] text-[#1a1918] tracking-[-0.26px] w-full">
              <p className="font-bold relative shrink-0">
                주문자 연락처
              </p>
              <p className="font-normal relative shrink-0">
                {order.phone}
              </p>
            </div>
            <div className="flex flex-col gap-[2px] items-start leading-[1.5] text-[13px] text-[#1a1918] tracking-[-0.26px] w-full">
              <p className="font-bold relative shrink-0">
                주문자 이메일
              </p>
              <p className="font-normal relative shrink-0">
                {order.buyerEmail || order.user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
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
      <OrderDetailContent />
    </Suspense>
  )
}

