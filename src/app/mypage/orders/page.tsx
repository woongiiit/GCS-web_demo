'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgBack = "https://www.figma.com/api/mcp/asset/2b69c665-405d-405f-b8a3-d7ed0b3ee87b"
const imgLine = "https://www.figma.com/api/mcp/asset/2fa46f85-f822-42e6-b60c-bdcbae26a388"
const imgProduct = "https://www.figma.com/api/mcp/asset/c02608ed-8846-4fef-a9ee-09bdbc4d677e"

type TabType = 'fund' | 'partner_up'

interface Order {
  id: string
  status: string
  totalAmount: number
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
}

function OrdersContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('fund')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user, activeTab])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/mypage/orders', { cache: 'no-store' })
      const data = await response.json()
      if (data.success) {
        // 탭에 따라 필터링
        const filteredOrders = data.data.filter((order: Order) => {
          const hasType = order.orderItems.some((item) => {
            if (activeTab === 'fund') {
              return item.product.type === 'FUND'
            } else {
              return item.product.type === 'PARTNER_UP'
            }
          })
          return hasType
        })
        setOrders(filteredOrders)
      }
    } catch (error) {
      console.error('주문 내역 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const weekday = weekdays[date.getDay()]
    return `${month}.${day}.${String(date.getFullYear()).slice(-2)} (${weekday})`
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString() + '원'
  }

  const getStatusLabel = (order: Order) => {
    if (order.status === 'CANCELLED') return '주문 취소'
    
    if (activeTab === 'fund') {
      if (order.fundStatus === 'ORDERED') return '결제 대기'
      if (order.fundStatus === 'BILLING_COMPLETED') return '결제 완료'
      if (order.fundStatus === 'CONFIRMED') return '상품 준비중'
      if (order.fundStatus === 'PRODUCTION_STARTED') return '상품 준비중'
      if (order.fundStatus === 'SHIPPED_OUT') return '배송 중'
      if (order.fundStatus === 'SHIPPING') return '배송 중'
      if (order.fundStatus === 'ARRIVED') return '배송 중'
      if (order.fundStatus === 'RECEIVED') return '구매 완료'
      return '결제 대기'
    } else {
      if (order.partnerUpStatus === 'ORDERED') return '결제 완료'
      if (order.partnerUpStatus === 'CONFIRMED') return '상품 준비중'
      if (order.partnerUpStatus === 'PRODUCTION_STARTED') return '상품 준비중'
      if (order.partnerUpStatus === 'SHIPPED_OUT') return '배송 중'
      if (order.partnerUpStatus === 'SHIPPING') return '배송 중'
      if (order.partnerUpStatus === 'ARRIVED') return '배송 중'
      if (order.partnerUpStatus === 'RECEIVED') return '구매 완료'
      return '결제 완료'
    }
  }

  const getSellerName = (orderItem: Order['orderItems'][0]) => {
    return orderItem.product.sellerTeam?.name || orderItem.product.author?.name || 'GCS'
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
            주문내역
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
      <div className="bg-[#f8f6f4] flex flex-col items-center px-0 py-[40px] flex-1 w-full">
        <div className="flex flex-col gap-[24px] items-start w-[322px]">
          {orders.length > 0 ? (
            orders.map((order) => {
              const firstItem = order.orderItems[0]
              const statusLabel = getStatusLabel(order)
              
              return (
                <div key={order.id} className="flex flex-col gap-[24px] items-start w-full">
                  <div className="flex items-start justify-between w-full">
                    <div className="flex flex-1 flex-col gap-[12px] items-start">
                      <div className="flex flex-col gap-[12px] items-start w-full">
                        <p className="font-bold leading-[1.5] text-[15px] text-[#5f5a58]">
                          {formatDate(order.createdAt)}
                        </p>
                        <div className="flex flex-col gap-[8px] items-start w-full">
                          <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                            {statusLabel}
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
                                <p className="font-normal min-w-full text-[13px] tracking-[-0.26px] w-[min-content] whitespace-pre-wrap">
                                  {getSellerName(firstItem)} 
                                </p>
                                <p className="font-bold text-[15px]">
                                  {firstItem.product.name}
                                </p>
                              </div>
                              <div className="flex flex-col font-bold gap-[4px] items-start leading-[1.5] text-[13px] text-[#85817e] tracking-[-0.26px] w-full">
                                <p className="relative shrink-0">
                                  {formatCurrency(order.totalAmount)}
                                </p>
                                <Link href={`/mypage/orders/${order.id}`}>
                                  <p className="decoration-solid relative shrink-0 underline">
                                    주문 상세
                                  </p>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-[8px] items-start w-full">
                        <button className="bg-white border-[0.531px] border-[#443e3c] border-solid flex flex-1 items-center justify-center px-[8px] py-[4px] rounded-[4px]">
                          <p className="font-normal leading-[1.5] text-[10px] text-[#1a1918]">
                            환불
                          </p>
                        </button>
                        <button className="bg-white border-[0.531px] border-[#443e3c] border-solid flex flex-1 items-center justify-center px-[8px] py-[4px] rounded-[4px]">
                          <p className="font-normal leading-[1.5] text-[10px] text-[#1a1918] text-center">
                            문의하기
                          </p>
                        </button>
                        <button className="bg-[#1a1918] border-[0.531px] border-[#1a1918] border-solid flex flex-1 items-center justify-center px-[8px] py-[4px] rounded-[4px]">
                          <p className="font-normal leading-[1.5] text-[10px] text-white text-center">
                            리뷰 쓰기
                          </p>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="h-0 relative w-full">
                    <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
                      <img alt="" className="block max-w-none size-full" src={imgLine} />
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="w-full text-center py-8">
              <p className="text-gray-500">주문 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
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
      <OrdersContent />
    </Suspense>
  )
}

