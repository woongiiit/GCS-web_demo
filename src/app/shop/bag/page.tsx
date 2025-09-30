'use client'

import Link from 'next/link'

export default function BagPage() {
  const products = [
    {
      id: 1,
      name: '토트백',
      price: '28,000원',
      originalPrice: '35,000원',
      discount: '20%',
      image: '/images/shop/bag/tote.jpg',
      description: '내구성이 뛰어난 캔버스 토트백입니다. 넉넉한 수납공간과 스타일리시한 디자인을 제공합니다.',
      features: ['캔버스 소재', '넉넉한 수납공간', '다양한 색상'],
      inStock: true,
      tags: ['베스트셀러']
    },
    {
      id: 2,
      name: '백팩',
      price: '55,000원',
      originalPrice: '70,000원',
      discount: '21%',
      image: '/images/shop/bag/backpack.jpg',
      description: '대학생활에 최적화된 백팩입니다. 노트북 수납공간과 다양한 포켓이 있어 실용적입니다.',
      features: ['노트북 수납공간', '여러 포켓', '어깨 보호 패드'],
      inStock: true,
      tags: ['인기상품']
    },
    {
      id: 3,
      name: '파우치',
      price: '15,000원',
      originalPrice: '20,000원',
      discount: '25%',
      image: '/images/shop/bag/pouch.jpg',
      description: '소지품 정리에 유용한 파우치입니다. 다양한 크기와 디자인으로 선택할 수 있습니다.',
      features: ['방수 소재', '지퍼 잠금', '컴팩트 사이즈'],
      inStock: true,
      tags: ['NEW']
    },
    {
      id: 4,
      name: '크로스백',
      price: '32,000원',
      originalPrice: '40,000원',
      discount: '20%',
      image: '/images/shop/bag/crossbag.jpg',
      description: '일상생활에 편리한 크로스백입니다. 가볍고 실용적인 디자인이 특징입니다.',
      features: ['가벼운 소재', '조절 가능한 스트랩', '안전한 지퍼'],
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
            <h1 className="text-4xl font-bold text-black mb-4">Bag & Pouch</h1>
            <p className="text-gray-600 mb-8">일상생활과 캠퍼스 라이프를 위한 가방</p>
            
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
                    <option>백팩</option>
                    <option>토트백</option>
                    <option>크로스백</option>
                    <option>파우치</option>
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
