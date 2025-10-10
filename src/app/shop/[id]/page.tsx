'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const [activeTab, setActiveTab] = useState<'details' | 'contact'>('details')
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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
      }
    } catch (error) {
      console.error('상품 조회 오류:', error)
    } finally {
      setIsLoading(false)
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

      {/* 카테고리 탭 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-0">
          <div className="flex justify-center gap-4 md:gap-8 py-4 overflow-x-auto">
            <Link 
              href="/shop?tab=apparel" 
              className="pb-2 border-b-2 border-transparent text-gray-400 hover:text-black hover:border-gray-300 font-medium transition-colors text-sm md:text-base whitespace-nowrap"
            >
              Apparel
            </Link>
            <Link 
              href="/shop?tab=stationary" 
              className="pb-2 border-b-2 border-transparent text-gray-400 hover:text-black hover:border-gray-300 font-medium transition-colors text-sm md:text-base whitespace-nowrap"
            >
              Stationary
            </Link>
            <Link 
              href="/shop?tab=bag" 
              className="pb-2 border-b-2 border-transparent text-gray-400 hover:text-black hover:border-gray-300 font-medium transition-colors text-sm md:text-base whitespace-nowrap"
            >
              Bag & Pouch
            </Link>
            <Link 
              href="/shop?tab=life" 
              className="pb-2 border-b-2 border-transparent text-gray-400 hover:text-black hover:border-gray-300 font-medium transition-colors text-sm md:text-base whitespace-nowrap"
            >
              Life
            </Link>
            <Link 
              href="/shop?tab=accessory" 
              className="pb-2 border-b-2 border-transparent text-gray-400 hover:text-black hover:border-gray-300 font-medium transition-colors text-sm md:text-base whitespace-nowrap"
            >
              Accessory
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
            <p className="text-sm text-gray-600 mb-2">{product.brand || 'GCS'}</p>
            <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
            <p className="text-sm text-gray-700 mb-6 whitespace-pre-line">{product.shortDescription || product.description}</p>
            <p className="text-2xl font-bold mb-8">{product.price.toLocaleString()}원</p>

            {/* 버튼 그룹 */}
            <div className="flex gap-3 mb-4">
              <button className="flex-1 bg-black text-white py-3 px-6 rounded hover:bg-gray-800 transition-colors">
                (Buy)
              </button>
              <button className="flex-1 border border-black text-black py-3 px-6 rounded hover:bg-gray-50 transition-colors">
                (Add to cart)
              </button>
              <button className="border border-black text-black p-3 rounded hover:bg-gray-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>

            <Link href="#" className="text-sm text-gray-600 underline hover:text-black">
              제안되 보관가기
            </Link>
          </div>
        </div>

        {/* 하단 탭 (Details / Contact) */}
        <div className="border-t border-gray-200">
          <div className="flex gap-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-2 text-sm ${
                activeTab === 'details'
                  ? 'text-black border-b-2 border-black font-semibold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              (Details)
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-4 px-2 text-sm ${
                activeTab === 'contact'
                  ? 'text-black border-b-2 border-black font-semibold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              (Contact)
            </button>
          </div>

          {/* 탭 내용 */}
          <div className="py-8">
            {activeTab === 'details' && (
              <div>
                <div className="text-sm text-gray-700 whitespace-pre-line mb-8">
                  {product.description}
                </div>
                
                {/* 제품 예시 사진 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src="/images/shop/product-detail-1.jpg"
                      alt="제품 예시 1"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3E제품 예시 1%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                  <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src="/images/shop/product-detail-2.jpg"
                      alt="제품 예시 2"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3E제품 예시 2%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                </div>
                
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
            )}
            {activeTab === 'contact' && (
              <div className="text-sm text-gray-700">
                <p>문의사항이 있으시면 연락주세요.</p>
                <p className="mt-4">Email: contact@gcsweb.com</p>
              </div>
            )}
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

