'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState<'apparel' | 'stationary' | 'bag' | 'life' | 'accessory'>('apparel')

  // 샘플 상품 데이터 (실제로는 API에서 가져올 데이터)
  const sampleProducts = {
    apparel: [
      {
        id: 1,
        name: 'GCS 로고 티셔츠',
        price: '25,000원',
        image: '/images/shop/apparel/tshirt-1.jpg',
        description: 'GCS 브랜드 로고가 새겨진 기본 티셔츠'
      },
      {
        id: 2,
        name: '후드 집업',
        price: '45,000원',
        image: '/images/shop/apparel/hoodie-1.jpg',
        description: '편안한 착용감의 후드 집업'
      },
      {
        id: 3,
        name: '폴로셔츠',
        price: '35,000원',
        image: '/images/shop/apparel/polo-1.jpg',
        description: '클래식한 폴로셔츠 디자인'
      }
    ],
    stationary: [
      {
        id: 4,
        name: 'GCS 노트북',
        price: '8,000원',
        image: '/images/shop/stationary/notebook-1.jpg',
        description: 'GCS 브랜드가 새겨진 스프링 노트북'
      },
      {
        id: 5,
        name: '볼펜 세트',
        price: '12,000원',
        image: '/images/shop/stationary/pen-set.jpg',
        description: '다양한 색상의 볼펜 세트'
      },
      {
        id: 6,
        name: '스티커 팩',
        price: '5,000원',
        image: '/images/shop/stationary/sticker.jpg',
        description: 'GCS 캐릭터 스티커 모음'
      }
    ],
    bag: [
      {
        id: 7,
        name: '토트백',
        price: '28,000원',
        image: '/images/shop/bag/tote.jpg',
        description: '내구성이 뛰어난 캔버스 토트백'
      },
      {
        id: 8,
        name: '백팩',
        price: '55,000원',
        image: '/images/shop/bag/backpack.jpg',
        description: '대학생활에 최적화된 백팩'
      },
      {
        id: 9,
        name: '파우치',
        price: '15,000원',
        image: '/images/shop/bag/pouch.jpg',
        description: '소지품 정리에 유용한 파우치'
      }
    ],
    life: [
      {
        id: 10,
        name: '텀블러',
        price: '18,000원',
        image: '/images/shop/life/tumbler.jpg',
        description: '보온성이 뛰어난 스테인리스 텀블러'
      },
      {
        id: 11,
        name: '마우스패드',
        price: '12,000원',
        image: '/images/shop/life/mousepad.jpg',
        description: '게이밍에 최적화된 마우스패드'
      },
      {
        id: 12,
        name: '키링',
        price: '6,000원',
        image: '/images/shop/life/keyring.jpg',
        description: 'GCS 로고가 새겨진 키링'
      }
    ],
    accessory: [
      {
        id: 13,
        name: '핀 배지',
        price: '8,000원',
        image: '/images/shop/accessory/pin.jpg',
        description: '컬렉션용 핀 배지'
      },
      {
        id: 14,
        name: '목걸이',
        price: '22,000원',
        image: '/images/shop/accessory/necklace.jpg',
        description: '심플한 디자인의 목걸이'
      },
      {
        id: 15,
        name: '팔찌',
        price: '15,000원',
        image: '/images/shop/accessory/bracelet.jpg',
        description: '고급스러운 실버 팔찌'
      }
    ]
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
      <div className="relative min-h-screen bg-white px-4 py-6 sm:px-0">
        <div className="max-w-6xl mx-auto pt-32">
          {/* 페이지 제목 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-8">Shop</h1>
            
            {/* 홈 아이콘 */}
            <Link href="/" className="inline-block mb-8">
              <div className="w-6 h-6 mx-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
            </Link>

            {/* 탭 메뉴 */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-8 mb-8">
              {['apparel', 'stationary', 'bag', 'life', 'accessory'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-2 border-b-2 font-medium transition-colors px-2 py-1 md:px-3 md:py-2 text-sm md:text-base ${
                    activeTab === tab
                      ? 'text-black border-black'
                      : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                  }`}
                >
                  {getCategoryName(tab)}
                </button>
              ))}
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="bg-gray-50 min-h-screen px-4 py-6">
            {/* 카테고리 설명 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-2">{getCategoryName(activeTab)}</h2>
              <p className="text-gray-600">{getCategoryDescription(activeTab)}</p>
            </div>

            {/* 상품 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {sampleProducts[activeTab].map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <div className="text-gray-400 text-sm">
                      {product.name}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                    <p className="text-black font-bold text-lg">{product.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* More 버튼 */}
            <div className="text-right">
              <Link 
                href={`/shop/${activeTab}`}
                className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                More
              </Link>
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