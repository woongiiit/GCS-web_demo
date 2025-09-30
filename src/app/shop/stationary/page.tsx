'use client'

import Link from 'next/link'

export default function StationaryPage() {
  const products = [
    {
      id: 1,
      name: 'GCS 노트북',
      price: '8,000원',
      originalPrice: '10,000원',
      discount: '20%',
      image: '/images/shop/stationary/notebook-1.jpg',
      description: 'GCS 브랜드가 새겨진 스프링 노트북입니다. 100페이지 구성으로 학습과 업무에 적합합니다.',
      features: ['100페이지', 'A4 사이즈', '스프링 제본'],
      inStock: true,
      tags: ['베스트셀러']
    },
    {
      id: 2,
      name: '볼펜 세트',
      price: '12,000원',
      originalPrice: '15,000원',
      discount: '20%',
      image: '/images/shop/stationary/pen-set.jpg',
      description: '다양한 색상의 볼펜 세트입니다. 0.5mm 두께로 깔끔한 필기가 가능합니다.',
      features: ['0.5mm 두께', '5색 세트', '수납 케이스 포함'],
      inStock: true,
      tags: ['NEW']
    },
    {
      id: 3,
      name: '스티커 팩',
      price: '5,000원',
      originalPrice: '7,000원',
      discount: '29%',
      image: '/images/shop/stationary/sticker.jpg',
      description: 'GCS 캐릭터 스티커 모음입니다. 노트북, 다이어리 등에 활용하세요.',
      features: ['20장 세트', '다양한 디자인', '고품질 인쇄'],
      inStock: true,
      tags: ['인기상품']
    },
    {
      id: 4,
      name: '메모지 세트',
      price: '6,000원',
      originalPrice: '8,000원',
      discount: '25%',
      image: '/images/shop/stationary/memo.jpg',
      description: '포스트잇 스타일의 메모지 세트입니다. 다양한 크기와 색상으로 구성되어 있습니다.',
      features: ['3가지 크기', '5가지 색상', '접착력 우수'],
      inStock: false,
      tags: ['품절임박']
    }
  ]

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white px-4 py-6 sm:px-0">
        <div className="max-w-6xl mx-auto pt-32">
          {/* 페이지 제목 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-4">Stationary</h1>
            <p className="text-gray-600 mb-8">학습과 업무에 필요한 문구류</p>
            
            {/* 홈 아이콘 */}
            <Link href="/" className="inline-block mb-8">
              <div className="w-6 h-6 mx-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
            </Link>

            {/* Shop으로 돌아가기 */}
            <div className="mb-8">
              <Link 
                href="/shop" 
                className="inline-flex items-center text-gray-600 hover:text-black transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Shop으로 돌아가기
              </Link>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="bg-gray-50 min-h-screen px-4 py-6">
            {/* 상품 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="h-64 bg-gray-200 flex items-center justify-center">
                      <div className="text-gray-400 text-sm">
                        {product.name}
                      </div>
                    </div>
                    
                    {/* 태그 */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {product.tags.map((tag) => (
                        <span 
                          key={tag}
                          className={`px-2 py-1 text-xs rounded-full ${
                            tag === '베스트셀러' ? 'bg-red-500 text-white' :
                            tag === 'NEW' ? 'bg-green-500 text-white' :
                            tag === '인기상품' ? 'bg-blue-500 text-white' :
                            tag === '품절임박' ? 'bg-orange-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* 품절 오버레이 */}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">품절</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    
                    {/* 가격 */}
                    <div className="mb-3">
                      <span className="text-red-600 font-bold text-lg">{product.price}</span>
                      <span className="text-gray-400 line-through ml-2 text-sm">{product.originalPrice}</span>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs ml-2">
                        {product.discount}
                      </span>
                    </div>

                    {/* 특징 */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-1">특징:</div>
                      <ul className="text-xs text-gray-500">
                        {product.features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 장바구니 버튼 */}
                    <button 
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        product.inStock
                          ? 'bg-black text-white hover:bg-gray-800'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!product.inStock}
                    >
                      {product.inStock ? '장바구니에 추가' : '품절'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 필터 및 정렬 옵션 */}
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>전체 상품</option>
                    <option>노트북</option>
                    <option>펜류</option>
                    <option>스티커</option>
                    <option>기타</option>
                  </select>
                  
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>인기순</option>
                    <option>최신순</option>
                    <option>낮은가격순</option>
                    <option>높은가격순</option>
                  </select>
                </div>
                
                <div className="text-sm text-gray-600">
                  총 {products.length}개 상품
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="text-center text-gray-400 text-xs mt-12">
            DONGGUK UNIVERSITY
          </div>
        </div>
      </div>
    </div>
  )
}
