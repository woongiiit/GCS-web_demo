'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'
import { PRODUCT_TYPES } from '@/lib/shop/product-types'

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

  const productTypeMeta = product ? getProductTypeMeta(product.type) : null
  const fundingProgress = product ? getFundingProgress(product) : null
  const isFundProduct = product?.type === 'FUND'

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

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

  const canEditProduct =
    !!user &&
    !!product &&
    permissions.canEditProduct(user.role, user.isSeller, product.authorId, user.id)

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

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 검은색 헤더 */}
      <div className="bg-black text-white pt-32 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Shop</h1>
            <p className="text-sm mb-8">학생들이 직접 제작한 굿즈를 판매하고 공유하는 공간입니다.</p>
            
            {/* 홈 아이콘 */}
            <Link href="/" className="inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </Link>
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
            {productTypeMeta && (
              <span className="self-start mb-3 bg-black text-white text-xs uppercase tracking-wider px-3 py-1 rounded-full">
                {productTypeMeta.name}
              </span>
            )}
            <p className="text-sm text-gray-600 mb-2">{product.brand || 'GCS'}</p>
            <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
            <p className="text-sm text-gray-700 mb-6 whitespace-pre-line">{product.shortDescription || product.description}</p>
            <p className="text-2xl font-bold mb-4">{product.price.toLocaleString()}원</p>
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
              <span className="text-base text-gray-700">
                {likeCount.toLocaleString()}명이 좋아합니다.
              </span>
            </div>

            {typeof fundingProgress === 'number' && (
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs text-gray-500 uppercase mb-2">
                  <span>Funding Progress</span>
                  <span className="font-semibold text-black">{fundingProgress}%</span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black transition-all"
                    style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <p className="text-[11px] uppercase text-gray-500">Raised</p>
                    <p className="text-sm font-semibold text-black">{formatCurrency(product.fundingCurrentAmount ?? 0)}</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <p className="text-[11px] uppercase text-gray-500">Goal</p>
                    <p className="text-sm font-semibold text-black">{formatCurrency(product.fundingGoalAmount ?? 0)}</p>
                  </div>
                </div>
                {product.fundingDeadline && (
                  <p className="mt-3 text-xs text-gray-500">
                    펀딩 마감일: {new Date(product.fundingDeadline).toLocaleDateString()}
                  </p>
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
          </div>
        </div>

      {/* 하단 배너 */}
      <div className="bg-white py-6 border-t border-gray-200">
        <div className="px-4 flex justify-between items-start gap-4">
          {/* 왼쪽: 로고 정보 */}
          <div className="flex-shrink-0">
            <p className="text-[10px] text-gray-500 mb-0.5">DONGGUK UNIVERSITY</p>
            <h3 className="text-sm font-bold text-black">
              GCS<span className="text-[#f57520]">:</span>Web
            </h3>
          </div>
          
          {/* 오른쪽: 회사 정보 */}
          <div className="flex-1 text-right space-y-1 min-w-0">
            <p className="text-[10px] text-gray-600 leading-tight">주소: 서울 필동로 1길 30, 동국대학교</p>
            <p className="text-[10px] text-gray-600 leading-tight">대표자: 김봉구 | 회사명: 제작담</p>
            <p className="text-[10px] text-gray-600 leading-tight">사업자번호: 000-00-00000</p>
            <p className="text-[10px] text-gray-600 leading-tight">통신판매업: 제0000-서울중구-0000호</p>
            
            <div className="flex items-center justify-end space-x-1.5 pt-1 whitespace-nowrap">
              <a href="#" className="text-[10px] text-gray-600 underline">개인정보처리방침</a>
              <span className="text-[10px] text-gray-400">|</span>
              <a href="#" className="text-[10px] text-gray-600 underline">이용약관</a>
              <span className="text-[10px] text-gray-400">|</span>
              <span className="text-[10px] text-gray-500">site by 제작담</span>
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

