'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'
import { PRODUCT_TYPES } from '@/lib/shop/product-types'
import StarRating from '@/components/StarRating'

type RawProductOptionValue = string | { label?: string; priceAdjustment?: number | string }

type RawProductOption = {
  name?: string
  values?: RawProductOptionValue[]
}

type NormalizedOptionValue = {
  label: string
  priceAdjustment: number
}

type NormalizedProductOption = {
  name: string
  values: NormalizedOptionValue[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { user } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [likeCount, setLikeCount] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewStats, setReviewStats] = useState<any>(null)
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewTotalPages, setReviewTotalPages] = useState(1)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewContent, setReviewContent] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [hasUserReview, setHasUserReview] = useState(false)
  const [isApprovingBilling, setIsApprovingBilling] = useState(false)

  const productTypeMeta = product ? getProductTypeMeta(product.type) : null
  const fundingProgress = product ? getFundingProgress(product) : null
  const isFundProduct = product?.type === 'FUND'

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchReviews()
    }
  }, [productId, reviewPage])

  const fetchProduct = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/shop/products/${productId}`)
      const data = await response.json()
      
      if (data.success) {
        setProduct(data.data.product)
        setRelatedProducts(data.data.relatedProducts)
        setLikeCount(data.data.product?.likeCount ?? 0)
        setHasLiked(Boolean(data.data?.liked))
      }
    } catch (error) {
      console.error('상품 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReviews = async () => {
    setIsLoadingReviews(true)
    try {
      const response = await fetch(`/api/shop/products/${productId}/reviews?page=${reviewPage}&limit=10`)
      const data = await response.json()
      
      if (data.success) {
        setReviews(data.data.reviews)
        setReviewStats(data.data.stats)
        setReviewTotalPages(data.data.pagination.totalPages)
        
        // 사용자가 이미 리뷰를 작성했는지 확인
        if (user) {
          const userReview = data.data.reviews.find((r: any) => r.userId === user.id)
          setHasUserReview(!!userReview)
        }
      }
    } catch (error) {
      console.error('리뷰 조회 오류:', error)
    } finally {
      setIsLoadingReviews(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    if (reviewRating === 0) {
      alert('별점을 선택해주세요.')
      return
    }

    if (!reviewContent.trim()) {
      alert('리뷰 내용을 입력해주세요.')
      return
    }

    setIsSubmittingReview(true)
    try {
      const response = await fetch(`/api/shop/products/${productId}/reviews`, {
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
        setShowReviewForm(false)
        setReviewRating(0)
        setReviewContent('')
        setHasUserReview(true)
        fetchReviews()
      } else {
        alert(data.error || '리뷰 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('리뷰 작성 오류:', error)
      alert('리뷰 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('리뷰를 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/shop/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()
      if (response.ok && data.success) {
        alert('리뷰가 삭제되었습니다.')
        setHasUserReview(false)
        fetchReviews()
      } else {
        alert(data.error || '리뷰 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('리뷰 삭제 오류:', error)
      alert('리뷰 삭제 중 오류가 발생했습니다.')
    }
  }

  const canEditProduct =
    !!user &&
    !!product &&
    permissions.canEditProduct(user.role, user.isSeller, product.authorId, user.id)

  const isAdmin = user?.role === 'ADMIN'

  const [isDeleting, setIsDeleting] = useState(false)

  const handleApproveBilling = async () => {
    if (!product || !isFundProduct) return

    if (!confirm('빌링키 결제를 승인하시겠습니까?')) {
      return
    }

    setIsApprovingBilling(true)
    try {
      const response = await fetch(`/api/shop/products/${productId}/billing-approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        alert('빌링키 결제가 승인되었습니다.')
        // 상품 정보 다시 불러오기
        fetchProduct()
      } else {
        alert(data.error || '빌링키 결제 승인 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('빌링키 결제 승인 오류:', error)
      alert('빌링키 결제 승인 중 오류가 발생했습니다.')
    } finally {
      setIsApprovingBilling(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!isAdmin) {
      alert('관리자 권한이 필요합니다.')
      return
    }

    // 첫 번째 확인
    const confirmed = window.confirm('정말로 해당 상품을 삭제하시겠습니까?')
    if (!confirmed) return

    // 두 번째 확인
    const productName = product?.name || '이'
    const deleteConfirmed = window.confirm(`정말로 ${productName} 상품을 삭제합니다.`)
    if (!deleteConfirmed) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/shop/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert('상품이 성공적으로 삭제되었습니다.')
        router.push('/shop')
      } else {
        alert(data.error || '상품 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('상품 삭제 오류:', error)
      alert('상품 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  const productOptions = useMemo(() => normalizeProductOptions(product), [product])

  useEffect(() => {
    if (productOptions.length === 0) {
      setSelectedOptions({})
      return
    }

    const initialSelections: Record<string, string> = {}
    productOptions.forEach((option, index) => {
      const key = getOptionKey(option, index)
      initialSelections[key] = ''
    })

    setSelectedOptions(initialSelections)
  }, [productOptions])

  const handleOptionChange = (option: NormalizedProductOption, optionIndex: number, value: string) => {
    const key = getOptionKey(option, optionIndex)
    setSelectedOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const isAllOptionsSelected = productOptions.every((option, index) => {
    const key = getOptionKey(option, index)
    return selectedOptions[key] && selectedOptions[key].length > 0
  })

  const selectedOptionDetails = useMemo(() => {
    if (!isAllOptionsSelected) return []

    return productOptions
      .map((option, index) => {
        const key = getOptionKey(option, index)
        const selectedLabel = selectedOptions[key]
        if (!selectedLabel) return null

        const matchedValue = option.values.find((value) => value.label === selectedLabel)
        if (!matchedValue) return null

        return {
          name: option.name,
          label: matchedValue.label,
          priceAdjustment: matchedValue.priceAdjustment
        }
      })
      .filter(
        (value): value is { name: string; label: string; priceAdjustment: number } =>
          value !== null
      )
  }, [isAllOptionsSelected, productOptions, selectedOptions])

  const basePrice = typeof product?.price === 'number' ? product.price : 0
  const totalAdjustment = selectedOptionDetails.reduce(
    (sum, option) => sum + option.priceAdjustment,
    0
  )
  const finalPrice = basePrice + totalAdjustment
  const showSummary =
    isAllOptionsSelected && selectedOptionDetails.length === productOptions.length

  const handleBuyNow = () => {
    if (!product) return

    if (!product.isActive) {
      alert('판매 중단된 상품입니다.')
      return
    }

    if (productOptions.length > 0 && !isAllOptionsSelected) {
      alert('모든 옵션을 선택해주세요.')
      return
    }

    if (!user) {
      alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.')
      router.push('/login')
      return
    }

    if (typeof window === 'undefined') return

    const payload = {
      mode: 'direct' as const,
      productId,
      quantity: 1,
      selectedOptions: selectedOptionDetails.map((option) => ({
        name: option.name,
        label: option.label
      }))
    }

    window.sessionStorage.setItem('gcs_checkout_payload', JSON.stringify(payload))
    router.push('/shop/checkout')
  }

  const handleLikeClick = async () => {
    if (hasLiked || isLiking) return

    if (!user) {
      alert('로그인이 필요합니다. 로그인 후 이용해주세요.')
      router.push('/login')
      return
    }

    setIsLiking(true)
    try {
      const response = await fetch(`/api/shop/products/${productId}/like`, {
        method: 'POST'
      })
      const data = await response.json()
      if (response.ok && data.success) {
        const updatedLikeCount = data.data?.likeCount
        const liked = data.data?.liked
        if (typeof updatedLikeCount === 'number') {
          setLikeCount(updatedLikeCount)
        }
        if (typeof liked === 'boolean') {
          setHasLiked(liked)
        }
      } else {
        alert(data.error || '좋아요 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('좋아요 처리 오류:', error)
      alert('좋아요 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLiking(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    if (isFundProduct) {
      alert('Fund 상품은 장바구니를 통해 구매할 수 없습니다. 펀딩 참여 버튼을 사용해주세요.')
      return
    }
    if (!product.isActive) {
      alert('판매 중단된 상품입니다.')
      return
    }

    if (productOptions.length > 0 && !isAllOptionsSelected) {
      alert('모든 옵션을 선택해주세요.')
      return
    }

    if (!user) {
      alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.')
      router.push('/login')
      return
    }

    if (isAddingToCart) return

    setIsAddingToCart(true)
    try {
      const response = await fetch('/api/shop/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          quantity: 1,
          selectedOptions: selectedOptionDetails
        })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        const goToCart = window.confirm('상품을 장바구니에 담았습니다. 장바구니로 이동할까요?')
        if (goToCart) {
          const cartPath = user?.role === 'ADMIN' ? '/admin?tab=cart' : '/mypage?tab=cart'
          router.push(cartPath)
        }
      } else {
        alert(data.error || '장바구니에 담지 못했습니다.')
      }
    } catch (error) {
      console.error('장바구니 담기 오류:', error)
      alert('장바구니에 담지 못했습니다.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-32">
        <div className="text-center">
          <p className="text-gray-600 mb-4">상품을 찾을 수 없습니다.</p>
          <Link href="/shop" className="text-black underline hover:text-gray-600">
            Shop으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // D-Day 계산
  const calculateDDay = (deadline: string | null | undefined): string | null => {
    if (!deadline) return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const deadlineDate = new Date(deadline)
    deadlineDate.setHours(0, 0, 0, 0)
    const diff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return null
    return `D-${diff}`
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 배너 영역 - 이미지 배경 + 주황색 오버레이 */}
      <div className="relative h-[300px] overflow-hidden">
        {/* 배경 이미지 */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
          {/* 배경 이미지가 있다면 여기에 추가 */}
        </div>
        {/* 주황색 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-l from-[rgba(255,178,114,0.6)] to-[#fd6f22]"></div>
        <div className="relative h-full flex flex-col items-start justify-center px-4 sm:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Shop</h1>
          <p className="text-white text-sm sm:text-base">GCS 연계전공생들이 제작한 상품을 만나보세요</p>
        </div>
      </div>

      {/* 탭 메뉴 - 흰색 배경 영역 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-0">
          <div className="flex justify-center space-x-8 py-4">
            <button
              onClick={() => router.push('/shop?type=fund')}
              className={`pb-2 border-b-2 font-medium transition-colors ${
                product?.type === 'FUND'
                  ? 'text-black border-black'
                  : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
              }`}
            >
              Fund
            </button>
            <button
              onClick={() => router.push('/shop?type=partner-up')}
              className={`pb-2 border-b-2 font-medium transition-colors ${
                product?.type === 'PARTNER_UP'
                  ? 'text-black border-black'
                  : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
              }`}
            >
              Partner up
            </button>
          </div>
        </div>
      </div>

      {/* 제품 상세 정보 */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* 왼쪽: 제품 이미지 슬라이더 */}
          <div className="w-full">
            <div className="relative">
              {/* 메인 이미지 */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[currentImageIndex]}
                    alt={`${product.name} ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder-product.jpg'
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <svg className="w-24 h-24 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">이미지 없음</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 이미지 네비게이션 버튼 (이미지가 2개 이상일 때만) */}
              {product.images && product.images.length > 1 && (
                <>
                  {/* 이전 버튼 */}
                  <button
                    onClick={() => setCurrentImageIndex((prev) => 
                      prev === 0 ? product.images.length - 1 : prev - 1
                    )}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center transition-all"
                    title="이전 이미지"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* 다음 버튼 */}
                  <button
                    onClick={() => setCurrentImageIndex((prev) => 
                      prev === product.images.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center transition-all"
                    title="다음 이미지"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* 이미지 인디케이터 */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {product.images.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white w-6' 
                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                        title={`이미지 ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 썸네일 이미지들 (이미지가 2개 이상일 때만) */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-black' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder-product.jpg'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 제품 정보 */}
          <div className="flex flex-col">
            {productTypeMeta && product.type === 'FUND' && (
              <span className="self-start mb-3 bg-[#fd6f22] text-white text-xs font-medium px-3 py-1 rounded-full">
                Fund
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{product.name}</h2>
            <p className="text-sm text-gray-700 mb-6 whitespace-pre-line">{product.shortDescription || product.description}</p>
            <p className="text-2xl font-bold text-[#fd6f22] mb-6">{product.price.toLocaleString()}원</p>

            {typeof fundingProgress === 'number' && isFundProduct && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  {product.fundingDeadline && (
                    <span className="bg-[#fd6f22] text-white text-xs font-medium px-2 py-1 rounded">
                      {calculateDDay(product.fundingDeadline)}
                    </span>
                  )}
                  <span className="text-sm text-gray-600">목표금액 {formatCurrency(product.fundingGoalAmount ?? 0)}원</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="h-2 bg-gray-200 rounded-full flex-1" style={{ minWidth: '100px' }}>
                    <div
                      className="h-full bg-[#fd6f22] rounded-full transition-all"
                      style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-black ml-2">{fundingProgress}%</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-bold text-black mb-1">펀딩 기간</p>
                    <p className="text-sm text-gray-600">
                      {product.fundingStartDate ? formatDate(product.fundingStartDate) : '-'}–{formatDate(product.fundingDeadline)}
                    </p>
                    {product.fundingDeadline && calculateDDay(product.fundingDeadline) && (
                      <span className="inline-block mt-1 bg-[#fd6f22] text-white text-xs font-medium px-2 py-1 rounded">
                        {calculateDDay(product.fundingDeadline)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black mb-1">배송 시작일</p>
                    <p className="text-sm text-gray-600">{formatDate(product.deliveryStartDate) || '-'}</p>
                    {product.deliveryStartDate && (
                      <span className="inline-block mt-1 bg-[#fd6f22] text-white text-xs font-medium px-2 py-1 rounded">
                        예정
                      </span>
                    )}
                  </div>
                </div>
                {isAdmin && isFundProduct && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-800">관리자 결제 승인</h4>
                      {product.billingPaymentApproved ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          승인됨
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          미승인
                        </span>
                      )}
                    </div>
                    {product.billingPaymentApproved && product.billingPaymentApprovedAt && (
                      <p className="text-xs text-gray-600 mb-2">
                        승인일: {new Date(product.billingPaymentApprovedAt).toLocaleString('ko-KR')}
                      </p>
                    )}
                    {!product.billingPaymentApproved && (
                      <button
                        onClick={handleApproveBilling}
                        disabled={isApprovingBilling}
                        className="w-full mt-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                      >
                        {isApprovingBilling ? '승인 중...' : '빌링키 결제 승인하기'}
                      </button>
                    )}
                    {product.fundingGoalAmount && (
                      <p className="text-xs text-gray-500 mt-2">
                        달성률: {((product.fundingCurrentAmount / product.fundingGoalAmount) * 100).toFixed(2)}%
                        {((product.fundingCurrentAmount / product.fundingGoalAmount) * 100) < 100 && (
                          <span className="text-red-600 ml-1">(100% 미달)</span>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {productOptions.length > 0 && (
              <div className="mb-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-black">상품 옵션</h3>
                  {!isAllOptionsSelected && (
                    <span className="text-xs text-red-500">모든 옵션을 선택해주세요.</span>
                  )}
                </div>
                <div className="space-y-4">
                  {productOptions.map((option, index) => {
                    const key = getOptionKey(option, index)
                    const optionValues = option.values
                    const selectedValue = selectedOptions[key] ?? ''

                    return (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {option.name}
                        </label>
                        <select
                          value={selectedValue}
                          onChange={(e) => handleOptionChange(option, index, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors bg-white"
                          >
                          <option value="" disabled>
                            선택하세요
                          </option>
                          {optionValues.map((value) => (
                            <option key={`${key}-${value.label}`} value={value.label}>
                              {value.label}
                              {value.priceAdjustment !== 0 ? ` (${formatPriceAdjustment(value.priceAdjustment)})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  })}
                </div>
                {productOptions.some(option => option.values.some(value => value.priceAdjustment !== 0)) && (
                  <p className="text-xs text-gray-500">
                    * 옵션에 따라 표시된 가격 변동이 기본 판매가에 추가 또는 차감됩니다.
                  </p>
                )}
              </div>
            )}

            {/* 버튼 그룹 */}
            <div className="flex gap-3 mb-4">
              <button
                className={`flex-1 py-3 px-6 rounded transition-colors ${
                  isAllOptionsSelected
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={handleBuyNow}
                disabled={!isAllOptionsSelected}
              >
                {isFundProduct ? '펀딩 참여하기' : '바로 구매'}
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 border py-3 px-6 rounded transition-colors ${
                  isAllOptionsSelected && !isAddingToCart && !isFundProduct
                    ? 'border-black text-black hover:bg-gray-50'
                    : 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100'
                }`}
                disabled={!isAllOptionsSelected || isAddingToCart || isFundProduct}
              >
                {isAddingToCart ? '담는 중...' : '장바구니 담기'}
              </button>
              <button
                type="button"
                onClick={handleLikeClick}
                disabled={isLiking}
                className={`border p-3 rounded transition-colors ${
                  hasLiked
                    ? 'bg-red-500 border-red-500 text-white hover:bg-red-600'
                    : 'border-black text-black hover:bg-gray-50'
                } ${isLiking ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    fill={hasLiked ? 'currentColor' : 'none'}
                  />
                </svg>
              </button>
            </div>
            {isFundProduct && (
              <p className="text-xs text-gray-500 mb-6">
                펀딩 목표 달성 시 등록된 결제 수단으로 자동 결제가 진행됩니다. 참여 이후에는 펀딩 상황을 My Page에서 확인할 수 있습니다.
              </p>
            )}
            {showSummary && (
              <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">선택한 옵션</h4>
                  <div className="space-y-2">
                    {selectedOptionDetails.map((option) => (
                      <div key={option.name} className="flex items-center justify-between text-sm text-gray-700">
                        <span>
                          {option.name} :{' '}
                          <span className="font-medium text-black">{option.label}</span>
                        </span>
                        {option.priceAdjustment !== 0 && (
                          <span className="text-gray-500">{formatPriceAdjustment(option.priceAdjustment)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span>상품 기본가</span>
                    <span className="font-medium text-black">{formatCurrency(basePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>옵션 변동가</span>
                    <span className={totalAdjustment >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {totalAdjustment >= 0 ? '+' : '-'}
                      {formatCurrency(Math.abs(totalAdjustment))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-base font-semibold text-gray-900">최종 결제 금액</span>
                    <span className="text-base font-bold text-black">{formatCurrency(finalPrice)}</span>
                  </div>
                </div>
              </div>
            )}
            {canEditProduct && (
              <div className="mb-6">
                <Link
                  href={`/shop/${productId}/edit`}
                  className="inline-flex items-center justify-center w-full border border-black text-black py-3 px-6 rounded hover:bg-gray-50 transition-colors font-medium"
                >
                  상품 수정
                </Link>
              </div>
            )}
            {isAdmin && (
              <div className="mb-6">
                <button
                  onClick={handleDeleteProduct}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center w-full border border-red-500 text-red-500 py-3 px-6 rounded hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? '삭제 중...' : '상품 삭제하기'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 제품 상세 정보 */}
        <div className="border-t border-gray-200 pt-8">
          <div 
            className="text-sm text-gray-700 mb-8 prose prose-sm max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
                
                {/* 상품 정보 고시 내용 */}
                {product.productDetails && product.productDetails.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                      <h3 className="text-lg font-bold">상품 정보 고시 내용</h3>
                    </div>
                    
                    <table className="w-full text-sm">
                      <tbody>
                        {product.productDetails[0].productionYear && (
                          <tr className="border-b border-gray-200">
                            <td className="px-6 py-3 bg-gray-100 font-semibold w-1/3">제작년도</td>
                            <td className="px-6 py-3 bg-white">{product.productDetails[0].productionYear}</td>
                          </tr>
                        )}
                        {product.productDetails[0].project && (
                          <tr className="border-b border-gray-200">
                            <td className="px-6 py-3 bg-gray-100 font-semibold">프로젝트</td>
                            <td className="px-6 py-3 bg-white">{product.productDetails[0].project}</td>
                          </tr>
                        )}
                        {product.productDetails[0].material && (
                          <tr className="border-b border-gray-200">
                            <td className="px-6 py-3 bg-gray-100 font-semibold">제품 소재</td>
                            <td className="px-6 py-3 bg-white">{product.productDetails[0].material}</td>
                          </tr>
                        )}
                        {product.productDetails[0].color && (
                          <tr className="border-b border-gray-200">
                            <td className="px-6 py-3 bg-gray-100 font-semibold">제품 색상</td>
                            <td className="px-6 py-3 bg-white">{product.productDetails[0].color}</td>
                          </tr>
                        )}
                        {product.productDetails[0].size && (
                          <tr className="border-b border-gray-200">
                            <td className="px-6 py-3 bg-gray-100 font-semibold">사이즈</td>
                            <td className="px-6 py-3 bg-white">{product.productDetails[0].size}</td>
                          </tr>
                        )}
                        {product.productDetails[0].printingMethod && (
                          <tr className="border-b border-gray-200">
                            <td className="px-6 py-3 bg-gray-100 font-semibold">프린팅 방식</td>
                            <td className="px-6 py-3 bg-white">{product.productDetails[0].printingMethod}</td>
                          </tr>
                        )}
                        {product.productDetails[0].manufacturer && (
                          <tr className="border-b border-gray-200">
                            <td className="px-6 py-3 bg-gray-100 font-semibold">제조 협력업체</td>
                            <td className="px-6 py-3 bg-white">{product.productDetails[0].manufacturer}</td>
                          </tr>
                        )}
                        {product.productDetails[0].shippingInfo && (
                          <tr className="border-b border-gray-200">
                            <td className="px-6 py-3 bg-gray-100 font-semibold">배송 안내 및 반품 고지</td>
                            <td className="px-6 py-3 bg-white">{product.productDetails[0].shippingInfo}</td>
                          </tr>
                        )}
                        {product.productDetails[0].qualityStandard && (
                          <tr className="border-b border-gray-200">
                            <td className="px-6 py-3 bg-gray-100 font-semibold">품질 보증 기준</td>
                            <td className="px-6 py-3 bg-white">{product.productDetails[0].qualityStandard}</td>
                          </tr>
                        )}
                        {product.productDetails[0].customerService && (
                          <tr>
                            <td className="px-6 py-3 bg-gray-100 font-semibold">고객 센터 안내</td>
                            <td className="px-6 py-3 bg-white">{product.productDetails[0].customerService}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* 관련 상품 섹션 */}
                <div className="mt-12">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Related Products</h3>
                    <Link href="/shop" className="text-sm font-semibold hover:underline">
                      More
                    </Link>
                  </div>
                  
                  <div className="overflow-x-auto pb-4 scrollbar-hide">
                    {relatedProducts.length > 0 ? (
                      <div className="flex gap-6 min-w-max">
                        {relatedProducts.map((relatedProduct) => (
                          <Link key={relatedProduct.id} href={`/shop/${relatedProduct.id}`} className="group cursor-pointer w-[280px] flex-shrink-0">
                            <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                              {relatedProduct.images && relatedProduct.images[0] ? (
                                <img 
                                  src={relatedProduct.images[0]}
                                  alt={relatedProduct.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/placeholder-product.jpg'
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>
                            <h4 className="font-bold text-base mb-1 line-clamp-1">{relatedProduct.name}</h4>
                            <p className="text-sm text-gray-600 mb-1">{relatedProduct.brand || 'GCS'}</p>
                            <p className="text-sm font-semibold">{relatedProduct.price.toLocaleString()}원</p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        관련 상품이 없습니다.
                      </div>
                    )}
                  </div>
                </div>

                {/* 리뷰 섹션 */}
                <div className="mt-12 border-t border-gray-200 pt-12">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">리뷰</h3>
                  </div>

                  {/* 리뷰 통계 */}
                  {reviewStats && (
                    <div className="mb-8 bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center gap-6 mb-4">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-black mb-1">
                            {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : '0.0'}
                          </div>
                          <StarRating rating={reviewStats.averageRating} readonly size="lg" />
                          <div className="text-sm text-gray-600 mt-2">
                            총 {reviewStats.reviewCount}개의 리뷰
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = reviewStats.distribution[rating] || 0
                              const percentage = reviewStats.reviewCount > 0
                                ? (count / reviewStats.reviewCount) * 100
                                : 0
                              return (
                                <div key={rating} className="flex items-center gap-3">
                                  <span className="text-sm text-gray-600 w-8">{rating}점</span>
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-yellow-400 transition-all"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-gray-600 w-12 text-right">
                                    {count}개
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 리뷰 작성 버튼 */}
                  {user && !hasUserReview && (
                    <div className="mb-6">
                      {!showReviewForm ? (
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                        >
                          리뷰 작성하기
                        </button>
                      ) : (
                        <div className="border border-gray-200 rounded-lg p-6 bg-white">
                          <h4 className="text-lg font-semibold mb-4">리뷰 작성</h4>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              별점
                            </label>
                            <StarRating
                              rating={reviewRating}
                              onRatingChange={setReviewRating}
                              size="lg"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              리뷰 내용
                            </label>
                            <textarea
                              value={reviewContent}
                              onChange={(e) => setReviewContent(e.target.value)}
                              placeholder="상품에 대한 리뷰를 작성해주세요."
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
                              rows={5}
                              maxLength={1000}
                            />
                            <div className="text-xs text-gray-500 mt-1 text-right">
                              {reviewContent.length}/1000
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handleSubmitReview}
                              disabled={isSubmittingReview || reviewRating === 0 || !reviewContent.trim()}
                              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              {isSubmittingReview ? '작성 중...' : '리뷰 등록'}
                            </button>
                            <button
                              onClick={() => {
                                setShowReviewForm(false)
                                setReviewRating(0)
                                setReviewContent('')
                              }}
                              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 리뷰 목록 */}
                  {isLoadingReviews ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                      <p className="text-gray-600 mt-2">리뷰를 불러오는 중...</p>
                    </div>
                  ) : reviews.length > 0 ? (
                    <>
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-semibold text-gray-600">
                                    {review.user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {review.user.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString('ko-KR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>
                              {(user?.id === review.userId || user?.role === 'ADMIN') && (
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="text-sm text-red-600 hover:text-red-800 transition-colors"
                                >
                                  삭제
                                </button>
                              )}
                            </div>
                            <div className="mb-3">
                              <StarRating rating={review.rating} readonly size="sm" />
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>
                          </div>
                        ))}
                      </div>

                      {/* 페이지네이션 */}
                      {reviewTotalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                          <button
                            onClick={() => setReviewPage((prev) => Math.max(1, prev - 1))}
                            disabled={reviewPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            이전
                          </button>
                          <span className="text-sm text-gray-600">
                            {reviewPage} / {reviewTotalPages}
                          </span>
                          <button
                            onClick={() => setReviewPage((prev) => Math.min(reviewTotalPages, prev + 1))}
                            disabled={reviewPage === reviewTotalPages}
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            다음
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>아직 작성된 리뷰가 없습니다.</p>
                      {user && !hasUserReview && (
                        <p className="text-sm mt-2">첫 번째 리뷰를 작성해보세요!</p>
                      )}
                    </div>
                  )}
                </div>
          </div>
        </div>

      {/* 하단 푸터 - 고객지원 및 사업자 정보 */}
      <div className="bg-white py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* 고객지원 */}
            <div>
              <h3 className="text-sm font-bold text-black mb-4">고객지원</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>전화: 010-5238-0236</p>
                <p>이메일: gcsweb01234@gmail.com</p>
                <p>주소: 서울특별시 강북구 솔샘로 174 136동 304호</p>
              </div>
            </div>
            
            {/* 사업자 정보 */}
            <div>
              <h3 className="text-sm font-bold text-black mb-4">사업자 정보</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>대표: 안성은</p>
                <p>회사명: 안북스 스튜디오</p>
                <p>사업자등록번호: 693-01-03164</p>
                <p>통신판매업신고번호: 제 2025-서울강북-0961호</p>
              </div>
            </div>
          </div>
          
          {/* 최하단 저작권 정보 */}
          <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <h3 className="text-sm font-bold text-black">
                GCS<span className="text-[#f57520]">:</span>Web
              </h3>
              <span className="text-xs text-gray-500 ml-2">© 2025 GCSWeb. all rights reserved.</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <a href="#" className="text-xs text-gray-600 underline">개인정보처리방침</a>
              <span className="text-xs text-gray-400">|</span>
              <a href="#" className="text-xs text-gray-600 underline">이용약관</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatPriceAdjustment(price: number) {
  if (!price) return ''
  const absValue = Math.abs(price).toLocaleString()
  if (price > 0) {
    return `+${absValue}원`
  }
  return `-${absValue}원`
}

function getOptionKey(option: { name?: string }, index: number) {
  return `${option.name ?? 'option'}-${index}`
}

function formatCurrency(price: number) {
  return `${price.toLocaleString()}원`
}

function normalizeProductOptions(product: any): NormalizedProductOption[] {
  if (!product || !Array.isArray(product.options)) {
    return []
  }

  return product.options
    .map((option: RawProductOption) => {
      if (!option || typeof option !== 'object') return null
      const optionName = typeof option.name === 'string' ? option.name.trim() : ''
      if (!optionName) return null

      const rawValues = Array.isArray(option.values) ? option.values : []
      const normalizedValues = rawValues
        .map((value) => {
          if (typeof value === 'string') {
            const label = value.trim()
            if (!label) return null
            return { label, priceAdjustment: 0 }
          }

          if (!value || typeof value !== 'object') return null

          const label = typeof value.label === 'string' ? value.label.trim() : ''
          if (!label) return null

          const rawPrice = (value as { priceAdjustment?: number | string }).priceAdjustment
          let priceAdjustment = 0

          if (typeof rawPrice === 'number') {
            priceAdjustment = rawPrice
          } else if (typeof rawPrice === 'string') {
            const cleaned = rawPrice.trim().replace(/,/g, '')
            if (cleaned) {
              const parsedPrice = Number(cleaned)
              if (!Number.isNaN(parsedPrice)) {
                priceAdjustment = parsedPrice
              }
            }
          }

          return { label, priceAdjustment }
        })
        .filter((value): value is NormalizedOptionValue => value !== null)

      if (normalizedValues.length === 0) return null

      return {
        name: optionName,
        values: normalizedValues
      }
    })
    .filter(
      (option: NormalizedProductOption | null): option is NormalizedProductOption =>
        option !== null
    )
}

function getProductTypeMeta(typeId: string | null | undefined) {
  if (!typeId) {
    return null
  }
  return PRODUCT_TYPES.find((type) => type.id === typeId) ?? null
}

function getFundingProgress(product: any) {
  if (!product || product.type !== 'FUND') return null
  const goal = typeof product.fundingGoalAmount === 'number' ? product.fundingGoalAmount : 0
  const current = typeof product.fundingCurrentAmount === 'number' ? product.fundingCurrentAmount : 0
  if (!goal) return 0
  return Math.round((current / goal) * 100)
}

