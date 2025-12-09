'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgBack = "https://www.figma.com/api/mcp/asset/aa9a35b0-45a5-40bb-8bc7-1e115032dfb1"

interface ReviewableProduct {
  productId: string
  productName: string
  productImage: string
  orderId: string
  orderDate: string
  hasReview: boolean
  reviewId?: string
}

interface Review {
  id: string
  rating: number
  content: string
  createdAt: string
}

function ReviewsContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<ReviewableProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewContent, setReviewContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userReviews, setUserReviews] = useState<Record<string, Review>>({})

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      fetchReviewableProducts()
    }
  }, [user])

  const fetchReviewableProducts = async () => {
    setLoading(true)
    try {
      // 주문 내역 조회
      const ordersResponse = await fetch('/api/mypage/orders', { cache: 'no-store' })
      const ordersData = await ordersResponse.json()

      if (ordersData.success) {
        // 리뷰 작성 가능한 상품 추출 (구매 완료된 주문)
        const reviewableProducts: ReviewableProduct[] = []
        const reviewMap: Record<string, Review> = {}

        for (const order of ordersData.data) {
          // 주문 상태가 완료된 경우만 (CONFIRMED, SHIPPED, DELIVERED 등)
          if (order.status !== 'CANCELLED' && order.status !== 'PENDING') {
            for (const item of order.orderItems) {
              // 이미 리뷰가 있는지 확인
              try {
                const reviewResponse = await fetch(`/api/shop/products/${item.product.id}/reviews`, { cache: 'no-store' })
                const reviewData = await reviewResponse.json()
                
                if (reviewData.success) {
                  const userReview = reviewData.data.reviews.find((r: any) => r.userId === user?.id)
                  if (userReview) {
                    reviewMap[item.product.id] = {
                      id: userReview.id,
                      rating: userReview.rating,
                      content: userReview.content,
                      createdAt: userReview.createdAt
                    }
                  }
                }
              } catch (error) {
                console.error('리뷰 조회 오류:', error)
              }

              reviewableProducts.push({
                productId: item.product.id,
                productName: item.product.name,
                productImage: item.product.images?.[0] || '',
                orderId: order.id,
                orderDate: order.createdAt,
                hasReview: !!reviewMap[item.product.id],
                reviewId: reviewMap[item.product.id]?.id
              })
            }
          }
        }

        // 중복 제거 (같은 상품은 하나만)
        const uniqueProducts = reviewableProducts.reduce((acc, product) => {
          if (!acc.find(p => p.productId === product.productId)) {
            acc.push(product)
          }
          return acc
        }, [] as ReviewableProduct[])

        setProducts(uniqueProducts)
        setUserReviews(reviewMap)
      }
    } catch (error) {
      console.error('리뷰 작성 가능한 상품 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handleWriteReview = (productId: string) => {
    setSelectedProduct(productId)
    const existingReview = userReviews[productId]
    if (existingReview) {
      setReviewRating(existingReview.rating)
      setReviewContent(existingReview.content)
    } else {
      setReviewRating(0)
      setReviewContent('')
    }
  }

  const handleCancelReview = () => {
    setSelectedProduct(null)
    setReviewRating(0)
    setReviewContent('')
  }

  const handleSubmitReview = async () => {
    if (!selectedProduct) return

    if (reviewRating === 0) {
      alert('별점을 선택해주세요.')
      return
    }

    if (!reviewContent.trim()) {
      alert('리뷰 내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/shop/products/${selectedProduct}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          rating: reviewRating,
          content: reviewContent.trim()
        })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        alert('리뷰가 작성되었습니다.')
        handleCancelReview()
        fetchReviewableProducts()
      } else {
        alert(data.error || '리뷰 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('리뷰 작성 오류:', error)
      alert('리뷰 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
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

  const StarRating = ({ rating, onRatingChange, readonly = false }: { rating: number; onRatingChange?: (rating: number) => void; readonly?: boolean }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange && onRatingChange(star)}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} text-2xl`}
          >
            {star <= rating ? '★' : '☆'}
          </button>
        ))}
      </div>
    )
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
            리뷰 쓰기
          </p>
          <div className="h-[24px] opacity-0 w-[12px]" aria-hidden="true"></div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-[20px] items-start w-full px-[20px] py-[20px]">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.productId} className="flex flex-col gap-[12px] items-start w-full">
              <div className="flex gap-[16px] items-start w-full">
                <Link href={`/shop/${product.productId}`} className="aspect-square relative rounded-[4px] shrink-0 w-[82px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4px]">
                    {product.productImage ? (
                      <img
                        alt={product.productName}
                        src={product.productImage}
                        className="absolute h-full left-0 max-w-none top-0 w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder-product.jpg'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200"></div>
                    )}
                  </div>
                </Link>
                <div className="flex flex-1 flex-col gap-[8px] items-start">
                  <div className="flex flex-col items-start justify-end leading-[1.5] text-[#1a1918] w-full">
                    <p className="font-bold text-[15px]">
                      {product.productName}
                    </p>
                  </div>
                  <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px]">
                    구매일: {formatDate(product.orderDate)}
                  </p>
                  {product.hasReview && userReviews[product.productId] && (
                    <div className="flex flex-col gap-[4px] items-start w-full">
                      <div className="flex items-center gap-2">
                        <StarRating rating={userReviews[product.productId].rating} readonly />
                      </div>
                      <p className="font-normal text-[13px] text-[#85817e]">
                        {userReviews[product.productId].content}
                      </p>
                    </div>
                  )}
                  {!product.hasReview && (
                    <button
                      onClick={() => handleWriteReview(product.productId)}
                      className="bg-[#1a1918] text-white px-[16px] py-[8px] rounded-[4px] text-[13px] font-normal"
                    >
                      리뷰 작성하기
                    </button>
                  )}
                </div>
              </div>

              {/* 리뷰 작성 폼 */}
              {selectedProduct === product.productId && (
                <div className="flex flex-col gap-[12px] items-start w-full bg-white p-[16px] rounded-[4px] border border-[#eeebe6]">
                  <div className="flex flex-col gap-[8px] items-start w-full">
                    <p className="font-bold text-[15px] text-[#1a1918]">별점</p>
                    <StarRating rating={reviewRating} onRatingChange={setReviewRating} />
                  </div>
                  <div className="flex flex-col gap-[8px] items-start w-full">
                    <p className="font-bold text-[15px] text-[#1a1918]">리뷰 내용</p>
                    <textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="상품에 대한 리뷰를 작성해주세요."
                      className="w-full min-h-[120px] p-[12px] border border-[#eeebe6] rounded-[4px] text-[13px] resize-none"
                      maxLength={1000}
                    />
                    <p className="text-[12px] text-[#85817e] self-end">
                      {reviewContent.length}/1000
                    </p>
                  </div>
                  <div className="flex gap-[8px] items-center w-full">
                    <button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting || reviewRating === 0 || !reviewContent.trim()}
                      className="flex-1 bg-[#1a1918] text-white px-[16px] py-[8px] rounded-[4px] text-[13px] font-normal disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? '작성 중...' : '리뷰 등록'}
                    </button>
                    <button
                      onClick={handleCancelReview}
                      className="flex-1 bg-white border border-[#443e3c] text-[#1a1918] px-[16px] py-[8px] rounded-[4px] text-[13px] font-normal"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="w-full text-center py-8">
            <p className="text-gray-500">리뷰를 작성할 수 있는 상품이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ReviewsPage() {
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
      <ReviewsContent />
    </Suspense>
  )
}

