'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useParams } from 'next/navigation'

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id
  const [activeTab, setActiveTab] = useState<'details' | 'contact'>('details')

  // 임시 제품 데이터 (실제로는 API에서 가져올 데이터)
  const product = {
    id: productId,
    brand: 'DEUX',
    name: '자비 부적',
    description: '사랑과 행운을 전하는 자비 부적\n내 마음도 꼬~옥 안아취야 해!',
    price: 'W00,000',
    image: '/images/shop/sample-product.jpg',
    category: 'Life',
    details: `🐰 자비부적(慈悲符籍)
내 마음도 꼬~옥 안아취야 해! 🐘💖💜

공모전에서 화제가 된 바로 그 부적!
DEUX팀의 자랑!

"MZ의 심장을 후벼판다"
"귀여움과 힐링의 폭격기"라는 별명이 붙을 정도로 인기 폭발 🔥

자비부적은 단순한 종이가 아니다.
👉 스스로에게 건네는 다정한 자기암시이자,
👉 위로와 행운을 끌어오는 작은 의식 같은 존재.

시험 합격을 바라는 이에게는 진중령 부적
사랑이 필요한 이에게는 따뜻한 포옹 부적
그냥 지친 하루에는 웃음을 주는 작은 힐링템.

이 부적을 지갑이나 가방에 넣고 다니면,
어느 순간 스스로도 모르게 마음이 한결 가벼워지는 걸 느끼게 될 거야.`
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
          {/* 왼쪽: 제품 이미지 */}
          <div className="w-full">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23999"%3E' + product.name + '%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>
          </div>

          {/* 오른쪽: 제품 정보 */}
          <div className="flex flex-col">
            <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
            <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
            <p className="text-sm text-gray-700 mb-6 whitespace-pre-line">{product.description}</p>
            <p className="text-2xl font-bold mb-8">{product.price}</p>

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
                  {product.details}
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
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-bold">상품 정보 고시 내용</h3>
                  </div>
                  
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="px-6 py-3 bg-gray-100 font-semibold w-1/3">제작년도</td>
                        <td className="px-6 py-3 bg-white">2024</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-6 py-3 bg-gray-100 font-semibold">프로젝트</td>
                        <td className="px-6 py-3 bg-white">DEUX</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-6 py-3 bg-gray-100 font-semibold">제품 소재</td>
                        <td className="px-6 py-3 bg-white">제품 소재</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-6 py-3 bg-gray-100 font-semibold">제품 색상</td>
                        <td className="px-6 py-3 bg-white">단색 1종</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-6 py-3 bg-gray-100 font-semibold">사이즈</td>
                        <td className="px-6 py-3 bg-white">0000 × 0000 (단위:)</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-6 py-3 bg-gray-100 font-semibold">프린팅 방식</td>
                        <td className="px-6 py-3 bg-white">프린팅 방식</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-6 py-3 bg-gray-100 font-semibold">제조 현력</td>
                        <td className="px-6 py-3 bg-white">프린팅 업체</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-6 py-3 bg-gray-100 font-semibold">배송 안내 및 반품 고지</td>
                        <td className="px-6 py-3 bg-white">단순 변심으로 인한 교환, 환불이 불가합니다.</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-6 py-3 bg-gray-100 font-semibold">품질 보증 기준</td>
                        <td className="px-6 py-3 bg-white">본 상품은 철저한 품질관리를 거쳐 생산되었습니다.</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3 bg-gray-100 font-semibold">고객 센터 안내</td>
                        <td className="px-6 py-3 bg-white">1234-5678</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* 관련 상품 섹션 */}
                <div className="mt-12">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Related Products</h3>
                    <Link href="/shop" className="text-sm font-semibold hover:underline">
                      More
                    </Link>
                  </div>
                  
                  <div className="overflow-x-auto pb-4">
                    <div className="flex gap-6 min-w-max">
                      {/* 관련 상품 1 */}
                      <Link href="/shop/4" className="group cursor-pointer w-[280px] flex-shrink-0">
                        <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                          <img 
                            src="/images/shop/related-1.jpg"
                            alt="아코 만년 블록 달력"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3E아코 만년 블록 달력%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        </div>
                        <h4 className="font-bold text-base mb-1">아코 만년 블록 달력</h4>
                        <p className="text-sm text-gray-600 mb-1">Deux</p>
                        <p className="text-sm font-semibold">W00,000</p>
                      </Link>
                      
                      {/* 관련 상품 2 */}
                      <Link href="/shop/5" className="group cursor-pointer w-[280px] flex-shrink-0">
                        <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                          <img 
                            src="/images/shop/related-2.jpg"
                            alt="자비 부적"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3E자비 부적%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        </div>
                        <h4 className="font-bold text-base mb-1">자비 부적</h4>
                        <p className="text-sm text-gray-600 mb-1">DEUX</p>
                        <p className="text-sm font-semibold">W00,000</p>
                      </Link>
                      
                      {/* 관련 상품 3 */}
                      <Link href="/shop/6" className="group cursor-pointer w-[280px] flex-shrink-0">
                        <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                          <img 
                            src="/images/shop/related-3.jpg"
                            alt="지혜 부적"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3E지혜 부적%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        </div>
                        <h4 className="font-bold text-base mb-1">지혜 부적</h4>
                        <p className="text-sm text-gray-600 mb-1">DEUX</p>
                        <p className="text-sm font-semibold">W00,000</p>
                      </Link>
                      
                      {/* 추가 관련 상품 예시 (더 많은 상품이 있다는 것을 보여주기 위해) */}
                      <Link href="/shop/7" className="group cursor-pointer w-[280px] flex-shrink-0">
                        <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                          <img 
                            src="/images/shop/related-4.jpg"
                            alt="관련 상품"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3E관련 상품%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        </div>
                        <h4 className="font-bold text-base mb-1">관련 상품</h4>
                        <p className="text-sm text-gray-600 mb-1">DEUX</p>
                        <p className="text-sm font-semibold">W00,000</p>
                      </Link>
                    </div>
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

      {/* 하단 푸터 배너 */}
      <footer className="bg-black text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-8">
          {/* 왼쪽: 대학명과 상표 */}
          <div className="flex flex-col gap-2">
            <p className="text-sm">Dongguk University</p>
            <p className="text-base font-medium">
              GCS<span className="text-[#f57520]">:</span>Web
            </p>
          </div>

          {/* 오른쪽: 회사 정보 */}
          <div className="flex flex-col gap-2 text-xs text-gray-400">
            <div className="flex gap-4">
              <Link href="#" className="hover:text-white">개인정보처리방침</Link>
              <Link href="#" className="hover:text-white">이용약관</Link>
            </div>
            <p>(04620) 서울특별시 중구 필동로 1길 30 동국대학교 충무로영상센터</p>
            <p>Tel: 02-2260-8745 | Email: gc_science@dongguk.edu</p>
            <p className="mt-2">© 2024 Dongguk University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

