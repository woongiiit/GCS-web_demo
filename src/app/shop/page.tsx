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
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 py-4">
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
              <div className="relative z-10 mt-8 overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-max">
                  {/* 샘플 Best Item 1 */}
                  <Link href="/shop/1" className="bg-white w-[200px] flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-full aspect-square bg-gray-100 rounded mb-3 flex items-center justify-center">
                      <div className="w-3/4 h-3/4 bg-gray-300"></div>
                    </div>
                    <h3 className="font-bold text-sm mb-1">동등(動動) 키링</h3>
                    <p className="text-gray-500 text-xs">2025 어멍</p>
                  </Link>
                  
                  {/* 샘플 Best Item 2 */}
                  <Link href="/shop/2" className="bg-white w-[200px] flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-full aspect-square bg-gray-100 rounded mb-3 flex items-center justify-center">
                      <div className="w-3/4 h-3/4 bg-gray-300"></div>
                    </div>
                    <h3 className="font-bold text-sm mb-1">USB (Welcome-kit)</h3>
                    <p className="text-gray-500 text-xs">2025 Kitty</p>
                  </Link>
                  
                  {/* 샘플 Best Item 3 */}
                  <Link href="/shop/3" className="bg-white w-[200px] flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-full aspect-square bg-gray-100 rounded mb-3 flex items-center justify-center">
                      <div className="w-3/4 h-3/4 bg-gray-300"></div>
                    </div>
                    <h3 className="font-bold text-sm mb-1">RFID 차단 카드 홀더</h3>
                    <p className="text-gray-500 text-xs">2025 DEUX</p>
                  </Link>
                </div>
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
            <div className="grid grid-cols-2 gap-4 mb-8">
              {sampleProducts[activeTab].map((product) => (
                <Link 
                  key={product.id} 
                  href={`/shop/${product.id}`}
                  className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 bg-gray-300"></div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm mb-1">{product.name}</h3>
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2">{product.description}</p>
                    <p className="text-black font-bold text-base">{product.price}</p>
                  </div>
                </Link>
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

            {/* 푸터 */}
            <div className="text-center text-gray-400 text-xs mt-12">
              DONGGUK UNIVERSITY
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}