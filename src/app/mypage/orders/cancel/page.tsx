'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgBack = "https://www.figma.com/api/mcp/asset/cb7d194f-1939-4281-829f-676de90d6c42"
const imgLine297 = "https://www.figma.com/api/mcp/asset/53e62aa8-c960-404e-a53a-b4b92cd04c5c"
const imgLine316 = "https://www.figma.com/api/mcp/asset/0baf460d-823b-405f-bf2b-5c2a8bb1431a"
const imgProduct = "https://www.figma.com/api/mcp/asset/6cb0a71e-8e0a-4d66-b1b5-4ea422eb045f"

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

function CancelOrdersContent() {
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
        // 취소/변경된 주문만 필터링
        const filteredOrders = data.data.filter((order: Order) => {
          const hasType = order.orderItems.some((item) => {
            if (activeTab === 'fund') {
              return item.product.type === 'FUND'
            } else {
              return item.product.type === 'PARTNER_UP'
            }
          })
          // 취소된 주문 또는 상태가 변경된 주문
          return hasType && (order.status === 'CANCELLED' || order.fundStatus || order.partnerUpStatus)
        })
        setOrders(filteredOrders)
      }
    } catch (error) {
      console.error('주문 취소/변경 내역 조회 오류:', error)
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

  // 취소된 주문과 변경된 주문 분리
  const cancelledOrders = orders.filter((order) => order.status === 'CANCELLED')
  const changedOrders = orders.filter((order) => order.status !== 'CANCELLED')

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
    <div className="bg-[#f8f6f4] min-h-screen flex flex-col pb-[44px]">
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
            {activeTab === 'fund' ? '주문 취소/변경/환불 내역' : '주문 취소/변경 내역'}
          </p>
          <div className="h-[24px] opacity-0 w-[12px]" aria-hidden="true"></div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-col gap-[36px] items-start shrink-0 w-full">
        <div className="flex flex-col items-start w-full">
          <div className="flex gap-[30px] items-center justify-center leading-[1.5] px-[20px] py-0 text-[13px] tracking-[-0.26px] w-full">
            <button
              onClick={() => setActiveTab('fund')}
              className={`relative shrink-0 ${
                activeTab === 'fund' ? 'font-bold text-[#5f5a58]' : 'font-normal text-[#b7b3af]'
              }`}
            >
              Fund
            </button>
            <button
              onClick={() => setActiveTab('partner_up')}
              className={`relative shrink-0 ${
                activeTab === 'partner_up' ? 'font-bold text-[#5f5a58]' : 'font-normal text-[#b7b3af]'
              }`}
            >
              Partner up
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-[40px] items-end w-full">
          {/* 주문취소 섹션 */}
          {cancelledOrders.length > 0 && (
            <div className="flex flex-col gap-[24px] items-center w-full">
              <div className="flex flex-col gap-[8px] items-start w-full">
                <div className="flex items-center px-[20px] py-0 w-full">
                  <p className="font-bold leading-[1.5] text-[15px] text-[#fd6f22]">
                    주문취소
                  </p>
                </div>
                <div className="h-0 relative w-full">
                  <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
                    <img alt="" className="block max-w-none size-full" src={imgLine297} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-[12px] items-center w-[354px]">
                {cancelledOrders.map((order) => {
                  const firstItem = order.orderItems[0]
                  return (
                    <div key={order.id} className="flex flex-col gap-[12px] items-center w-[322px]">
                      <div className="flex items-start justify-between w-full">
                        <div className="flex flex-1 flex-col gap-[12px] items-start">
                          <div className="flex flex-col gap-[12px] items-start w-full">
                            <p className="font-bold h-[20px] leading-[1.5] text-[15px] text-[#5f5a58] w-full whitespace-pre-wrap">
                              {formatDate(order.createdAt)}
                            </p>
                            <div className="flex flex-col gap-[8px] items-start w-full">
                              <p className="font-normal h-[20px] leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px] w-full whitespace-pre-wrap">
                                주문 완료
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
                                  <div className="flex flex-col gap-[4px] items-start leading-[1.5] text-[10px] text-[#85817e] w-full">
                                    <p className="font-normal min-w-full w-[min-content] whitespace-pre-wrap">
                                      {formatOptions(firstItem.selectedOptions)}
                                    </p>
                                    <p className="font-normal">
                                      {formatCurrency(order.totalAmount)}
                                    </p>
                                    <Link href={`/mypage/orders/${order.id}`}>
                                      <p className="decoration-solid font-bold underline">
                                        주문 상세
                                      </p>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start w-full">
                            <button className="bg-white border-[0.531px] border-[#443e3c] border-solid flex flex-1 items-center justify-center px-[8px] py-[4px] rounded-[4px]">
                              <p className="font-normal leading-[1.5] text-[10px] text-[#1a1918] text-center">
                                문의하기
                              </p>
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* 취소 정보 박스 */}
                      <div className="bg-[#eeebe6] flex flex-col gap-[16px] items-start px-[16px] py-[20px] w-full">
                        <div className="flex flex-col items-start w-full">
                          <p className="font-normal leading-[1.5] text-[10px] text-[#5f5a58]">
                            <span>[진행 상태] </span>
                            <span className="font-bold text-[#e65c00]">취소 중</span>
                          </p>
                        </div>
                        <div className="flex gap-[26px] items-start">
                          <div className="flex flex-col font-bold gap-[16px] items-start leading-[1.5] text-[10px] text-[#1a1918] w-[56px] whitespace-pre-wrap">
                            <p className="relative shrink-0 w-full">
                              주문 번호
                            </p>
                            <p className="relative shrink-0 w-full">
                              접수 사유
                            </p>
                            {activeTab === 'partner_up' && (
                              <p className="relative shrink-0 w-full">
                                옵션
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col font-normal gap-[16px] items-start leading-[1.5] text-[10px] text-[#1a1918]">
                            <p className="relative shrink-0">
                              {order.id}
                            </p>
                            <p className="min-w-full w-[min-content] whitespace-pre-wrap">
                              단순 변심
                            </p>
                            {activeTab === 'partner_up' && (
                              <p className="decoration-solid underline">
                                영수증 확인
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 주문변경 섹션 */}
          {changedOrders.length > 0 && (
            <div className="flex flex-col gap-[20px] items-center w-full">
              <div className="flex flex-col gap-[8px] items-start w-full">
                <div className="flex items-center px-[20px] py-0 w-full">
                  <p className="font-bold leading-[1.5] text-[15px] text-[#fd6f22]">
                    주문변경
                  </p>
                </div>
                <div className="h-0 relative w-full">
                  <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
                    <img alt="" className="block max-w-none size-full" src={imgLine297} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-[12px] items-center w-[354px]">
                <div className="flex flex-col gap-[24px] items-start w-[322px]">
                  {changedOrders.map((order, index) => {
                    const firstItem = order.orderItems[0]
                    return (
                      <div key={order.id}>
                        <div className="flex items-start justify-between w-full">
                          <div className="flex flex-1 flex-col gap-[12px] items-start">
                            <div className="flex flex-col gap-[12px] items-start w-full">
                              <p className="font-bold h-[20px] leading-[1.5] text-[15px] text-[#5f5a58] w-full whitespace-pre-wrap">
                                {formatDate(order.createdAt)}
                              </p>
                              <div className="flex flex-col gap-[8px] items-start w-full">
                                <p className="font-normal h-[20px] leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px] w-full whitespace-pre-wrap">
                                  주문 완료
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
                                    <div className="flex flex-col gap-[4px] items-start leading-[1.5] text-[10px] text-[#85817e] w-full">
                                      <p className="font-normal min-w-full w-[min-content] whitespace-pre-wrap">
                                        {formatOptions(firstItem.selectedOptions)}
                                      </p>
                                      <p className="font-normal">
                                        {formatCurrency(order.totalAmount)}
                                      </p>
                                      <Link href={`/mypage/orders/${order.id}`}>
                                        <p className="decoration-solid font-bold underline">
                                          주문 상세
                                        </p>
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start w-full">
                              <button className="bg-white border-[0.531px] border-[#443e3c] border-solid flex flex-1 items-center justify-center px-[8px] py-[4px] rounded-[4px]">
                                <p className="font-normal leading-[1.5] text-[10px] text-[#1a1918] text-center">
                                  문의하기
                                </p>
                              </button>
                            </div>
                          </div>
                        </div>
                        {index < changedOrders.length - 1 && (
                          <div className="h-0 relative w-full mt-[24px]">
                            <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
                              <img alt="" className="block max-w-none size-full" src={imgLine316} />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                {/* 변경 정보 박스 */}
                <div className="bg-[#eeebe6] flex flex-col gap-[16px] items-start px-[16px] py-[20px] w-full">
                  <div className="flex flex-col items-start w-full">
                    <p className="font-normal leading-[1.5] text-[10px] text-[#5f5a58]">
                      <span>[진행 상태] </span>
                      <span className="font-bold text-[#e65c00]">변경 중</span>
                    </p>
                  </div>
                  <div className="flex gap-[26px] items-start">
                    <div className="flex flex-col font-bold gap-[16px] items-start leading-[1.5] text-[10px] text-[#1a1918] w-[56px] whitespace-pre-wrap">
                      <p className="relative shrink-0 w-full">
                        주문 번호
                      </p>
                      <p className="relative shrink-0 w-full">
                        접수 사유
                      </p>
                      {activeTab === 'fund' && (
                        <>
                          <p className="relative shrink-0 w-full">
                            옵션 (변경 전)
                          </p>
                          <p className="relative shrink-0 w-full">
                            옵션 (변경 후)
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col font-normal gap-[16px] items-start leading-[1.5] text-[10px] text-[#1a1918]">
                      <p className="min-w-full w-[min-content] whitespace-pre-wrap">
                        {changedOrders[0]?.id || ''}
                      </p>
                      <p className="min-w-full w-[min-content] whitespace-pre-wrap">
                        단순 변심
                      </p>
                      {activeTab === 'fund' && (
                        <>
                          <p className="relative shrink-0">
                            {formatOptions(changedOrders[0]?.orderItems[0]?.selectedOptions)}
                          </p>
                          <p className="relative shrink-0">
                            {formatOptions(changedOrders[0]?.orderItems[0]?.selectedOptions)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {orders.length === 0 && (
            <div className="w-full text-center py-8">
              <p className="text-gray-500">취소/변경 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CancelOrdersPage() {
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
      <CancelOrdersContent />
    </Suspense>
  )
}

