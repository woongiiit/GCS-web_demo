'use client'

import { Suspense, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgBack = "https://www.figma.com/api/mcp/asset/8647d1b1-3a3e-431f-a5d9-69751455c036"
const imgRightArrow = "https://www.figma.com/api/mcp/asset/4fb4cb01-963e-4e86-9a64-96b0743bab6c"
const imgSearchIcon = "https://www.figma.com/api/mcp/asset/aab955e5-e297-45a4-bb25-161742f6d075"
const imgProduct = "https://www.figma.com/api/mcp/asset/827d2ea4-a45d-43c3-8985-9a1fe4339c21"
const imgCheckFilled = "https://www.figma.com/api/mcp/asset/af2105d2-51eb-4f7e-9727-830d92e408b1"
const imgCheckLight = "https://www.figma.com/api/mcp/asset/3e67c984-467a-4bd1-972b-65681c243a7b"
const imgToggle = "https://www.figma.com/api/mcp/asset/5a43a947-85df-409b-bc84-8646fad44c8d"
const imgLikeOff = "https://www.figma.com/api/mcp/asset/cb92fc1e-9575-48f4-9e23-54d4c17443a1"

interface ProductCard {
  id: string
  title: string
  seller: string
  dateRange: string
  status: 'open' | 'closed'
  progress: number
  targetAmount: number
  isPublic: boolean
  type: 'Fund' | 'Partner up'
  isSelected: boolean
}

export default function ProductCardsPage() {
  return (
    <Suspense fallback={<ProductCardsPageSuspenseFallback />}>
      <ProductCardsPageContent />
    </Suspense>
  )
}

function ProductCardsPageContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const [products, setProducts] = useState<ProductCard[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [selectedCount, setSelectedCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('전체')

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchProducts()
    }
  }, [user])

  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    try {
      // TODO: 실제 API 엔드포인트로 변경
      // const response = await fetch('/api/admin/product-cards')
      // const data = await response.json()
      
      // 임시 데이터 (Figma 디자인 기반)
      const mockProducts: ProductCard[] = [
        {
          id: '1',
          title: '염소 후드집업',
          seller: 'MUA',
          dateRange: '2025.03.24~2025.07.30',
          status: 'closed',
          progress: 70,
          targetAmount: 39930,
          isPublic: true,
          type: 'Fund',
          isSelected: true
        },
        {
          id: '2',
          title: '염소 후드집업',
          seller: 'MUA',
          dateRange: '2025.03.24~2025.07.30',
          status: 'closed',
          progress: 70,
          targetAmount: 39930,
          isPublic: true,
          type: 'Fund',
          isSelected: false
        }
      ]
      
      setProducts(mockProducts)
      setSelectedCount(mockProducts.filter(p => p.isSelected).length)
    } catch (error) {
      console.error('상품 조회 오류:', error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleToggleSelect = (id: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, isSelected: !p.isSelected } : p
    ))
    setSelectedCount(prev => {
      const product = products.find(p => p.id === id)
      return product?.isSelected ? prev - 1 : prev + 1
    })
  }

  const handleTogglePublic = (id: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, isPublic: !p.isPublic } : p
    ))
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="bg-[#f8f6f4] min-h-screen flex flex-col">
      {/* Nav Bar */}
      <div className="flex-shrink-0">
        <div className="bg-[#f8f6f4] h-[34px]"></div>
        <div className="bg-[#f8f6f4] flex h-[44px] items-center justify-between px-[16px] py-[10px] shadow-[0px_4px_10px_0px_rgba(99,81,73,0.1)]">
          <button
            onClick={handleBack}
            className="h-[24px] w-[12px] flex items-center justify-center"
            aria-label="뒤로가기"
          >
            <img alt="뒤로가기" className="block max-w-none size-full" src={imgBack} />
          </button>
          <p className="font-bold leading-[1.5] text-[15px] text-black">
            상품카드 관리
          </p>
          <div className="h-[24px] opacity-0 w-[12px]" aria-hidden="true"></div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-[31px] items-center pb-[65px] pt-0 px-[15px] overflow-y-auto">
        {/* 상품 등록 요청 */}
        <Link href="/admin/product-registrations" className="bg-[#eeebe6] flex h-[40px] items-center px-5 py-3 rounded-[12px] w-full mt-4">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex gap-1 items-center">
              <p className="font-normal leading-[1.5] text-[15px] text-black">
                상품 등록 요청
              </p>
              <p className="font-bold leading-[1.5] text-[15px] text-[#fd6f22]">
                2
              </p>
            </div>
            <div className="relative size-6">
              <img alt="화살표" className="block max-w-none size-full" src={imgRightArrow} />
            </div>
          </div>
        </Link>

        {/* 검색 및 필터 */}
        <div className="bg-white flex flex-col items-start px-4 py-[15px] rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] w-full">
          <div className="flex flex-col gap-[12px] items-start w-full">
            {/* 검색 바 */}
            <div className="bg-[#f8f6f4] h-8 relative rounded-[8px] w-full">
              <div className="flex gap-2 h-8 items-center px-4 py-0 w-full">
                <div className="relative size-4">
                  <img alt="검색" className="block max-w-none size-full" src={imgSearchIcon} />
                </div>
                <input
                  type="text"
                  placeholder="상품명, 판매팀 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-[18px] min-h-0 min-w-0 bg-transparent border-0 outline-none text-[13px] text-[#85817e] placeholder:text-[#85817e]"
                />
              </div>
            </div>

            {/* 필터 버튼들 */}
            <div className="flex gap-[6px] items-center">
              {['전체', 'Fund', 'Partner up', '공개', '비공개'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`flex items-center justify-center px-3 py-[9px] rounded-[8px] ${
                    activeFilter === filter
                      ? 'bg-[#fd6f22]'
                      : 'bg-[#f8f6f4]'
                  }`}
                >
                  <p className={`font-semibold leading-[18px] text-[12px] text-center ${
                    activeFilter === filter
                      ? 'text-white'
                      : 'text-[#666666]'
                  }`}>
                    {filter}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 상품 카드 리스트 */}
        <div className="flex flex-col gap-4 items-start w-full">
          {isLoadingProducts ? (
            <div className="flex items-center justify-center py-12 w-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600">상품을 불러오는 중...</p>
              </div>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleSelect={handleToggleSelect}
                onTogglePublic={handleTogglePublic}
              />
            ))
          )}
        </div>
      </div>

      {/* 하단 고정 바 */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#fd6f22] flex items-center justify-between pb-[14px] pt-4 px-4 rounded-tl-[16px] rounded-tr-[16px] shadow-[0px_-2px_10px_0px_rgba(0,0,0,0.1)] z-50">
          <p className="font-bold leading-[22.5px] text-[15px] text-white w-[63px]">
            {selectedCount}개 선택됨
          </p>
          <div className="h-[35px] relative w-[191px]">
            <button className="bg-[#443e3c] h-[35px] relative rounded-[8px] w-[54px] flex items-center justify-center">
              <p className="font-bold leading-[19.5px] text-[13px] text-white text-center">
                삭제
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductCard({ 
  product, 
  onToggleSelect, 
  onTogglePublic 
}: { 
  product: ProductCard
  onToggleSelect: (id: string) => void
  onTogglePublic: (id: string) => void
}) {
  return (
    <div className="bg-[#eeebe6] flex flex-col gap-[9px] items-center px-0 py-5 rounded-[12px] w-full">
      {/* 체크박스 및 공개 토글 */}
      <div className="flex items-start justify-between w-[318px]">
        <button
          onClick={() => onToggleSelect(product.id)}
          className="relative size-6"
        >
          {product.isSelected ? (
            <img alt="선택됨" className="block max-w-none size-full" src={imgCheckFilled} />
          ) : (
            <img alt="선택 안됨" className="block max-w-none size-full" src={imgCheckLight} />
          )}
        </button>
        <div className="flex gap-1 items-center">
          <p className="font-normal leading-[1.5] text-[10px] text-[#5f5a58]">
            공개
          </p>
          <button
            onClick={() => onTogglePublic(product.id)}
            className={`flex items-center justify-end p-[2px] rounded-full w-[38px] ${
              product.isPublic ? 'bg-[#fd6f22]' : 'bg-gray-300'
            }`}
          >
            <div className="relative size-[14px]">
              <img alt="토글" className="block max-w-none size-full" src={imgToggle} />
            </div>
          </button>
        </div>
      </div>

      {/* 상품 카드 */}
      <div className="flex flex-col gap-2 items-start w-[315px]">
        <div className="flex gap-4 items-start w-full">
          {/* 상품 이미지 */}
          <div className="relative rounded-[4px] shrink-0 size-[100px]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4px]">
              <img alt={product.title} className="absolute h-[138%] left-[-1%] max-w-none top-[-19%] w-[105%]" src={imgProduct} />
            </div>
            <div className="absolute left-[80px] size-4 top-[80px]">
              <img alt="좋아요" className="block max-w-none size-full" src={imgLikeOff} />
            </div>
            <div className="absolute bg-[#fd6f22] flex items-center justify-center left-1 px-1 py-0.5 rounded-full top-1">
              <p className="font-normal leading-[1.5] text-[10px] text-white tracking-[-0.3px]">
                {product.type}
              </p>
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="flex flex-1 flex-col gap-2 items-start min-h-0 min-w-0 self-stretch">
            <div className="flex flex-col items-start justify-end leading-[1.5] text-[#1a1918] w-full">
              <p className="font-bold text-[15px]">
                {product.title}
              </p>
              <p className="font-normal min-w-full text-[13px] tracking-[-0.26px] whitespace-pre-wrap">
                {product.seller}
              </p>
            </div>
            <div className="flex flex-col items-start w-full">
              <p className="font-normal leading-[1.5] text-[10px] text-[#85817e] w-full whitespace-pre-wrap">
                {product.dateRange}
              </p>
            </div>
            <div className={`flex h-[19px] items-center justify-center px-1 py-0.5 rounded w-full ${
              product.status === 'closed' ? 'bg-[#fd6f22]' : 'bg-gray-300'
            }`}>
              <p className="font-bold leading-[1.5] text-[10px] text-[#f8f6f4] text-center">
                {product.status === 'closed' ? '마감' : '진행중'}
              </p>
            </div>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="flex flex-col gap-1 items-start w-full">
          <div className="flex gap-2 items-center w-full">
            <div className="flex-1 h-2.5 relative rounded-full min-h-0 min-w-0">
              <div className="absolute bg-black inset-0 opacity-5 rounded-full"></div>
              <div 
                className="absolute h-2.5 left-0 overflow-hidden rounded-full top-1/2 translate-y-[-50%] bg-[#0d6fff]"
                style={{ width: `${product.progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-center">
              <p className="font-bold leading-[1.5] text-[13px] text-[#1a1918] text-center tracking-[-0.26px]">
                {product.progress}%
              </p>
            </div>
          </div>
          <div className="flex items-start justify-end w-full">
            <div className="flex items-center justify-center px-1 py-0.5 rounded">
              <p className="font-bold leading-[1.5] text-[#1a1918] text-[10px] text-center">
                목표금액 {product.targetAmount.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3 h-9 items-start justify-center w-[318px]">
        <button className="bg-[#fd6f22] flex flex-1 items-start justify-center min-h-0 min-w-0 px-0 py-2 rounded">
          <p className="font-bold leading-[1.5] text-[13px] text-[#f8f6f4] text-center tracking-[-0.26px]">
            주문 내역
          </p>
        </button>
        <button className="bg-[#f8f6f4] flex flex-1 items-start justify-center min-h-0 min-w-0 px-1 py-2 rounded">
          <p className="font-bold leading-[1.5] text-[#1a1918] text-[13px] text-center tracking-[-0.26px] w-[58px] whitespace-pre-wrap">
            상품 수정
          </p>
        </button>
      </div>
    </div>
  )
}

function ProductCardsPageSuspenseFallback() {
  return (
    <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}
