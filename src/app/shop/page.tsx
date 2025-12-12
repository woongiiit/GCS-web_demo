'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePermissions } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'
import { PRODUCT_TYPES } from '@/lib/shop/product-types'
import AboutTermsModal from '@/components/AboutTermsModal'

export default function ShopPage() {
  const { role, isSeller } = usePermissions()
  const [activeTab, setActiveTab] = useState<'FUND' | 'PARTNER_UP'>('FUND')
  const [bestProducts, setBestProducts] = useState<any[]>([])
  const [typeProducts, setTypeProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

  // Fund 상품이 현재 진행 중인지 확인
  const isFundInNow = (product: any) => {
    if (product.type !== 'FUND') return true // Fund 타입이 아니면 항상 포함
    
    if (!product.fundingDeadline) return true // 마감일이 없으면 현재 진행 중으로 간주
    
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const deadline = new Date(product.fundingDeadline)
    deadline.setHours(0, 0, 0, 0)
    
    return deadline >= now
  }

  useEffect(() => {
    fetchProducts()
    setCurrentSlide(0) // 탭 변경 시 슬라이드 초기화
  }, [activeTab])

  // 자동 슬라이드
  useEffect(() => {
    const filteredBestProducts = activeTab === 'FUND' 
      ? bestProducts.filter(isFundInNow)
      : bestProducts
    
    if (filteredBestProducts.length <= 5) return // 5개 이하면 슬라이드 불필요
    
    const maxSlide = Math.max(0, Math.ceil((filteredBestProducts.length - 5) / 2))
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev >= maxSlide) {
          return 0 // 처음으로 돌아가기
        }
        return prev + 1
      })
    }, 3000) // 3초마다 슬라이드

    return () => clearInterval(interval)
  }, [bestProducts, activeTab])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      // Best Item 조회 - activeTab에 따라 타입 필터링, 10개 조회
      const bestRes = await fetch(`/api/shop/products?sort=likes&limit=10&type=${encodeURIComponent(activeTab.toLowerCase())}`, { cache: 'no-store' })
      const bestData = await bestRes.json()
      if (bestData.success) {
        setBestProducts(Array.isArray(bestData.data) ? bestData.data.slice(0, 10) : [])
      }

      // 유형별 상품 조회
      const typeRes = await fetch(`/api/shop/products?type=${encodeURIComponent(activeTab.toLowerCase())}`, { cache: 'no-store' })
      const typeData = await typeRes.json()
      if (typeData.success) {
        setTypeProducts(typeData.data)
      }
    } catch (error) {
      console.error('상품 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const activeTypeMeta = PRODUCT_TYPES.find((type) => type.id === activeTab) ?? PRODUCT_TYPES[0]

  const getTypeMeta = (typeId: string | null | undefined) => {
    if (!typeId) return null
    return PRODUCT_TYPES.find((type) => type.id === typeId) ?? null
  }

  const calculateFundingProgress = (product: any) => {
    if (!product || product.type !== 'FUND') return null
    const goal = typeof product.fundingGoalAmount === 'number' ? product.fundingGoalAmount : 0
    const current = typeof product.fundingCurrentAmount === 'number' ? product.fundingCurrentAmount : 0
    if (!goal || goal <= 0) return 0
    return Math.round((current / goal) * 100)
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '0'
    }
    return value.toLocaleString()
  }

  // Fund 상품을 마감일 기준으로 분리
  const separateFundProducts = (products: any[]) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0) // 시간을 00:00:00으로 설정하여 날짜만 비교
    
    const fundInNow: any[] = []
    const fundInPast: any[] = []
    
    products.forEach((product) => {
      if (product.type === 'FUND' && product.fundingDeadline) {
        const deadline = new Date(product.fundingDeadline)
        deadline.setHours(0, 0, 0, 0)
        
        if (deadline >= now) {
          fundInNow.push(product)
        } else {
          fundInPast.push(product)
        }
      } else if (product.type === 'FUND' && !product.fundingDeadline) {
        // 마감일이 없는 경우 현재 진행 중으로 간주
        fundInNow.push(product)
      }
    })
    
    return { fundInNow, fundInPast }
  }

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white">
        {/* 상단 검은색 영역 */}
        <div className="bg-black pt-32 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
          {/* 페이지 제목 */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Shop</h1>
              <p className="text-white text-sm mb-8">학생들이 직접 제작한 굿즈를 판매하고 공유하는 공간입니다.</p>
            
            {/* 홈 아이콘 */}
              <Link href="/" className="inline-block">
              <div className="w-6 h-6 mx-auto">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
            </Link>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 - 흰색 배경 영역 */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-2 sm:px-0">
            <div className="flex justify-between items-center py-4">
              {/* 카테고리 탭들 */}
              <div className="flex justify-center gap-4 sm:gap-5 md:gap-6 lg:gap-8 flex-1">
                {PRODUCT_TYPES.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'FUND' | 'PARTNER_UP')}
                    className={`pb-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-black border-black'
                        : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                    }`}
                    style={{ fontSize: 'clamp(0.625rem, 2vw, 1rem)' }}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
              
              {/* 상품 등록 버튼 (관리자, 판매자) */}
              {permissions.canAddProduct(role, isSeller) && (
                <Link 
                  href="/shop/add"
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium whitespace-nowrap ml-4"
                >
                  상품 등록
                </Link>
              )}
            </div>
            </div>
          </div>

        {/* 구분선 */}
        <div className="bg-gray-100 h-px"></div>

          {/* 컨텐츠 영역 */}
        <div className="bg-white min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-8 sm:px-0">
            
            {/* Best Item 섹션 */}
            <div className="mb-12 relative">
              {/* NOW 텍스트 */}
              <div className="absolute top-0 right-0 text-2xl font-black text-black leading-none">
                NOW
              </div>
              
              {/* Best Item 타이틀 */}
              <div className="relative z-10 mb-6">
                <h2 className="text-2xl font-bold text-black">Best Item</h2>
                <p className="text-sm text-gray-600 mt-1">좋아요 수가 높은 상품 순으로 정리했어요.</p>
                <div className="w-16 h-1 bg-black mt-1"></div>
              </div>
              
              {/* Best Item 상품 슬라이드 캐러셀 */}
              <div className="relative z-10 mt-8 overflow-hidden">
                {isLoading ? (
                  <div className="flex gap-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i} 
                        className="bg-white flex-shrink-0"
                        style={{ 
                          width: 'calc((100% - 6rem) / 5)',
                          minWidth: '200px'
                        }}
                      >
                        <div className="w-full aspect-square bg-gray-100 rounded mb-3 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (() => {
                  // Fund 탭일 때는 마감일이 지난 항목 제외
                  const filteredBestProducts = activeTab === 'FUND' 
                    ? bestProducts.filter(isFundInNow).slice(0, 10)
                    : bestProducts.slice(0, 10)
                  
                  if (filteredBestProducts.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        Best Item이 없습니다.
                      </div>
                    )
                  }

                  // 슬라이드 이동 계산: 2개씩 이동
                  // 각 아이템 너비: calc((100% - 6rem) / 5)
                  // gap: 1.5rem (24px)
                  // 2개 이동 거리: 2 * (아이템 너비 + gap) = 2 * ((100% - 6rem) / 5 + 1.5rem)
                  
                  return (
                    <div className="relative overflow-hidden">
                      <div 
                        className="flex gap-6 transition-transform duration-500 ease-in-out"
                        style={{ 
                          transform: `translateX(calc(-${currentSlide * 2} * ((100% - 6rem) / 5 + 1.5rem)))`,
                        }}
                      >
                        {filteredBestProducts.map((product) => {
                          const typeMeta = getTypeMeta(product.type)
                          const fundingProgress = calculateFundingProgress(product)
                          return (
                            <Link 
                              key={product.id} 
                              href={`/shop/${product.id}`} 
                              className="bg-white flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                              style={{ 
                                width: 'calc((100% - 6rem) / 5)',
                                minWidth: '200px'
                              }}
                            >
                              <div className="w-full aspect-square bg-gray-100 rounded mb-3 overflow-hidden relative">
                                {typeMeta && (
                                  <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] uppercase tracking-wide px-2 py-1 rounded-full">
                                    {typeMeta.name}
                                  </span>
                                )}
                                {product.images && product.images[0] ? (
                                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" onError={(e) => {
                                    e.currentTarget.src = '/images/placeholder-product.jpg'
                                  }} />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <div className="w-3/4 h-3/4 bg-gray-300"></div>
                                  </div>
                                )}
                              </div>
                              <h3 className="font-bold text-sm mb-1 line-clamp-1">{product.name}</h3>
                              <p className="text-gray-500 text-xs line-clamp-1">{product.brand || 'GCS'}</p>
                              <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                                <span className="text-black font-semibold text-sm">{product.price.toLocaleString()}원</span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.656l-6.828-6.829a4 4 0 010-5.656z" />
                                  </svg>
                                  <span>{product.likeCount ?? 0}</span>
                                </span>
                              </div>
                              {typeof fundingProgress === 'number' && (
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1 uppercase">
                                    <span>Funding</span>
                                    <span>{fundingProgress}%</span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-black transition-all"
                                      style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>
              
              {/* 하단 보더 */}
              <div className="w-full h-px bg-gray-300 mt-8"></div>
            </div>

            {/* Fund 탭일 때 섹션 분리 */}
            {activeTab === 'FUND' ? (
              <>
                {(() => {
                  const { fundInNow, fundInPast } = separateFundProducts(typeProducts)
                  
                  // 상품 카드 렌더링 함수
                  const renderProductCard = (product: any) => {
                    const typeMeta = getTypeMeta(product.type)
                    const fundingProgress = calculateFundingProgress(product)
                    return (
                      <Link 
                        key={product.id} 
                        href={`/shop/${product.id}`}
                        className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <div className="w-full aspect-square bg-gray-100 overflow-hidden relative">
                          {typeMeta && (
                            <span className="absolute top-3 left-3 bg-black/80 text-white text-[11px] uppercase tracking-wide px-3 py-1 rounded-full">
                              {typeMeta.name}
                            </span>
                          )}
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" onError={(e) => {
                              e.currentTarget.src = '/images/placeholder-product.jpg'
                            }} />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <div className="w-3/4 h-3/4 bg-gray-300"></div>
                            </div>
                          )}
                        </div>
                        <div className="p-3 space-y-3">
                          <div>
                            <h3 className="font-bold text-sm mb-1 line-clamp-1">{product.name}</h3>
                            <p className="text-gray-600 text-xs line-clamp-2">{product.shortDescription || product.description}</p>
                          </div>
                          {typeof fundingProgress === 'number' && (
                            <div>
                              <div className="flex items-center justify-between text-[11px] text-gray-500 uppercase">
                                <span>Funding progress</span>
                                <span className="font-semibold text-black">{fundingProgress}%</span>
                              </div>
                              <div className="mt-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-black transition-all"
                                  style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                                />
                              </div>
                              <div className="mt-2 text-[11px] text-gray-500 flex justify-between">
                                <span>Raised {formatCurrency(product.fundingCurrentAmount ?? 0)}원</span>
                                <span>Goal {formatCurrency(product.fundingGoalAmount ?? 0)}원</span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span className="text-black font-bold text-base">{product.price.toLocaleString()}원</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.656l-6.828-6.829a4 4 0 010-5.656z" />
                              </svg>
                              <span>{product.likeCount ?? 0}</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  }
                  
                  return (
                    <>
                      {/* Fund in now 섹션 */}
                      <div className="mb-12">
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold text-black mb-2">Fund in now</h2>
                          <p className="text-gray-600">현재 진행 중인 펀딩 상품입니다.</p>
                        </div>
                        {isLoading ? (
                          <div className="grid grid-cols-2 gap-4 mb-8">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="bg-white rounded-lg overflow-hidden">
                                <div className="w-full aspect-square bg-gray-100 animate-pulse"></div>
                                <div className="p-3">
                                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                                  <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : fundInNow.length > 0 ? (
                          <div className="grid grid-cols-2 gap-4 mb-8">
                            {fundInNow.map(renderProductCard)}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            현재 진행 중인 펀딩 상품이 없습니다.
                          </div>
                        )}
                      </div>
                      
                      {/* Fund in past 섹션 */}
                      <div className="mb-12">
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold text-black mb-2">Fund in past</h2>
                          <p className="text-gray-600">마감된 펀딩 상품입니다.</p>
                        </div>
                        {isLoading ? (
                          <div className="grid grid-cols-2 gap-4 mb-8">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="bg-white rounded-lg overflow-hidden">
                                <div className="w-full aspect-square bg-gray-100 animate-pulse"></div>
                                <div className="p-3">
                                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                                  <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : fundInPast.length > 0 ? (
                          <div className="grid grid-cols-2 gap-4 mb-8">
                            {fundInPast.map(renderProductCard)}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            마감된 펀딩 상품이 없습니다.
                          </div>
                        )}
                      </div>
                    </>
                  )
                })()}
              </>
            ) : (
              <>
                {/* PARTNER_UP 탭일 때 기존 구조 유지 */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-black mb-2">{activeTypeMeta.name}</h2>
                  <p className="text-gray-600">{activeTypeMeta.description}</p>
                </div>

                {/* 상품 그리드 - 2열 */}
                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white rounded-lg overflow-hidden">
                        <div className="w-full aspect-square bg-gray-100 animate-pulse"></div>
                        <div className="p-3">
                          <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                          <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : typeProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {typeProducts.map((product) => {
                      const typeMeta = getTypeMeta(product.type)
                      const fundingProgress = calculateFundingProgress(product)
                      return (
                        <Link 
                          key={product.id} 
                          href={`/shop/${product.id}`}
                          className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                        >
                          <div className="w-full aspect-square bg-gray-100 overflow-hidden relative">
                            {typeMeta && (
                              <span className="absolute top-3 left-3 bg-black/80 text-white text-[11px] uppercase tracking-wide px-3 py-1 rounded-full">
                                {typeMeta.name}
                              </span>
                            )}
                            {product.images && product.images[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" onError={(e) => {
                                e.currentTarget.src = '/images/placeholder-product.jpg'
                              }} />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <div className="w-3/4 h-3/4 bg-gray-300"></div>
                              </div>
                            )}
                          </div>
                          <div className="p-3 space-y-3">
                            <div>
                              <h3 className="font-bold text-sm mb-1 line-clamp-1">{product.name}</h3>
                              <p className="text-gray-600 text-xs line-clamp-2">{product.shortDescription || product.description}</p>
                            </div>
                            {typeof fundingProgress === 'number' && (
                              <div>
                                <div className="flex items-center justify-between text-[11px] text-gray-500 uppercase">
                                  <span>Funding progress</span>
                                  <span className="font-semibold text-black">{fundingProgress}%</span>
                                </div>
                                <div className="mt-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-black transition-all"
                                    style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                                  />
                                </div>
                                <div className="mt-2 text-[11px] text-gray-500 flex justify-between">
                                  <span>Raised {formatCurrency(product.fundingCurrentAmount ?? 0)}원</span>
                                  <span>Goal {formatCurrency(product.fundingGoalAmount ?? 0)}원</span>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span className="text-black font-bold text-base">{product.price.toLocaleString()}원</span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.656l-6.828-6.829a4 4 0 010-5.656z" />
                                </svg>
                                <span>{product.likeCount ?? 0}</span>
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    등록된 상품이 없습니다.
                  </div>
                )}
              </>
            )}


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
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    setIsTermsModalOpen(true)
                  }}
                  className="text-[10px] text-gray-600 underline"
                >
                  이용약관
                </button>
                <span className="text-[10px] text-gray-400">|</span>
                <span className="text-[10px] text-gray-500">site by 제작담</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isTermsModalOpen && (
        <AboutTermsModal 
          isOpen={isTermsModalOpen} 
          onClose={() => setIsTermsModalOpen(false)} 
        />
      )}
    </div>
  )
}