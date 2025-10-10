'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePermissions } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'

export default function ShopPage() {
  const { role } = usePermissions()
  const [activeTab, setActiveTab] = useState<'apparel' | 'stationary' | 'bag' | 'life' | 'accessory'>('apparel')
  const [bestProducts, setBestProducts] = useState<any[]>([])
  const [categoryProducts, setCategoryProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [activeTab])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      // Best Item 조회
      const bestRes = await fetch('/api/shop/products?bestItem=true')
      const bestData = await bestRes.json()
      if (bestData.success) {
        setBestProducts(bestData.data)
      }

      // 카테고리별 상품 조회
      const categoryRes = await fetch(`/api/shop/products?category=${activeTab}`)
      const categoryData = await categoryRes.json()
      if (categoryData.success) {
        setCategoryProducts(categoryData.data)
      }
    } catch (error) {
      console.error('상품 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const getCategoryName = (category: string) => {
    switch (category) {
      case 'apparel': return 'Apparel'
      case 'stationary': return 'Stationary'
      case 'bag': return 'Bag & Pouch'
      case 'life': return 'Life'
      case 'accessory': return 'Accessory'
      default: return ''
    }
  }

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'apparel': return 'GCS 브랜드 의류 컬렉션'
      case 'stationary': return '학습과 업무에 필요한 문구류'
      case 'bag': return '일상생활과 캠퍼스 라이프를 위한 가방'
      case 'life': return '생활용품과 유틸리티 아이템'
      case 'accessory': return '스타일을 완성하는 액세서리'
      default: return ''
    }
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
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            <div className="flex justify-between items-center py-4">
              {/* 카테고리 탭들 */}
              <div className="flex flex-wrap justify-center gap-4 md:gap-8 flex-1">
              {['apparel', 'stationary', 'bag', 'life', 'accessory'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                    className={`pb-2 border-b-2 font-medium transition-colors text-sm md:text-base ${
                    activeTab === tab
                      ? 'text-black border-black'
                      : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                  }`}
                >
                  {getCategoryName(tab)}
                </button>
              ))}
              </div>
              
              {/* 상품 등록 버튼 (관리자만) */}
              {permissions.canAddProduct(role) && (
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
                <div className="w-16 h-1 bg-black mt-1"></div>
              </div>
              
              {/* Best Item 상품 가로 스크롤 */}
              <div className="relative z-10 mt-8 overflow-x-auto pb-4 scrollbar-hide">
                {isLoading ? (
                  <div className="flex gap-6 min-w-max">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white w-[200px] flex-shrink-0">
                        <div className="w-full aspect-square bg-gray-100 rounded mb-3 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : bestProducts.length > 0 ? (
                  <div className="flex gap-6 min-w-max">
                    {bestProducts.map((product) => (
                      <Link key={product.id} href={`/shop/${product.id}`} className="bg-white w-[200px] flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="w-full aspect-square bg-gray-100 rounded mb-3 overflow-hidden">
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
                        <p className="text-black font-semibold text-sm mt-1">{product.price.toLocaleString()}원</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Best Item이 없습니다.
                  </div>
                )}
              </div>
              
              {/* 하단 보더 */}
              <div className="w-full h-px bg-gray-300 mt-8"></div>
            </div>

            {/* 카테고리 설명 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-2">{getCategoryName(activeTab)}</h2>
              <p className="text-gray-600">{getCategoryDescription(activeTab)}</p>
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
            ) : categoryProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {categoryProducts.map((product) => (
                  <Link 
                    key={product.id} 
                    href={`/shop/${product.id}`}
                    className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="w-full aspect-square bg-gray-100 overflow-hidden">
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
                    <div className="p-3">
                      <h3 className="font-bold text-sm mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-gray-600 text-xs mb-2 line-clamp-2">{product.shortDescription || product.description}</p>
                      <p className="text-black font-bold text-base">{product.price.toLocaleString()}원</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                등록된 상품이 없습니다.
              </div>
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
                <a href="#" className="text-[10px] text-gray-600 underline">이용약관</a>
                <span className="text-[10px] text-gray-400">|</span>
                <span className="text-[10px] text-gray-500">site by 제작담</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}