'use client'

import { Suspense, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgBack = "https://www.figma.com/api/mcp/asset/3d13c58f-78ff-4994-9fb1-0f68c4553015"
const imgSearchIcon = "https://www.figma.com/api/mcp/asset/29bd894a-20f5-452f-a7ec-0fc292157412"
const imgCheckbox = "https://www.figma.com/api/mcp/asset/68d7601c-f447-408a-b5eb-4478d332d401"

interface ProductItem {
  id: string
  productNumber: string
  salesMethod: 'Fund' | 'Partner up'
  productName: string
  optionName: string
  price: number
  salesStatus: '판매 중' | '품절'
  isSelected: boolean
}

export default function AllItemsPage() {
  return (
    <Suspense fallback={<AllItemsPageSuspenseFallback />}>
      <AllItemsPageContent />
    </Suspense>
  )
}

function AllItemsPageContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const [items, setItems] = useState<ProductItem[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('전체')
  const [selectedCount, setSelectedCount] = useState(0)
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchItems()
    }
  }, [user])

  const fetchItems = async () => {
    setIsLoadingItems(true)
    try {
      // TODO: 실제 API 엔드포인트로 변경
      // const response = await fetch('/api/admin/all-items')
      // const data = await response.json()
      
      // 임시 데이터 (Figma 디자인 기반)
      const mockItems: ProductItem[] = [
        {
          id: '1',
          productNumber: '12345',
          salesMethod: 'Fund',
          productName: '염소 후드집업',
          optionName: 'W/S',
          price: 39000,
          salesStatus: '판매 중',
          isSelected: false
        },
        {
          id: '2',
          productNumber: '12345',
          salesMethod: 'Fund',
          productName: '염소 후드집업',
          optionName: 'W/S',
          price: 39000,
          salesStatus: '판매 중',
          isSelected: false
        },
        {
          id: '3',
          productNumber: '12345',
          salesMethod: 'Partner up',
          productName: '염소 후드집업',
          optionName: 'W/S',
          price: 39000,
          salesStatus: '품절',
          isSelected: false
        },
        {
          id: '4',
          productNumber: '12345',
          salesMethod: 'Partner up',
          productName: '염소 후드집업',
          optionName: 'W/S',
          price: 39000,
          salesStatus: '품절',
          isSelected: false
        }
      ]
      
      setItems(mockItems)
    } catch (error) {
      console.error('품목 조회 오류:', error)
    } finally {
      setIsLoadingItems(false)
    }
  }

  useEffect(() => {
    const count = items.filter(item => item.isSelected).length
    setSelectedCount(count)
    setSelectAll(count > 0 && count === items.length)
  }, [items])

  const handleToggleSelect = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isSelected: !item.isSelected } : item
    ))
  }

  const handleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)
    setItems(items.map(item => ({ ...item, isSelected: newSelectAll })))
  }

  const handleExport = async () => {
    try {
      // TODO: 실제 API 호출
      // await fetch('/api/admin/all-items/export', { method: 'POST', body: JSON.stringify({ ids: selectedIds }) })
      console.log('내보내기:', items.filter(item => item.isSelected).map(item => item.id))
      alert('내보내기가 완료되었습니다.')
    } catch (error) {
      console.error('내보내기 오류:', error)
    }
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

  const filteredItems = items.filter(item => {
    if (activeFilter === '전체') return true
    if (activeFilter === 'Fund' && item.salesMethod === 'Fund') return true
    if (activeFilter === 'Partner up' && item.salesMethod === 'Partner up') return true
    if (activeFilter === '판매 중' && item.salesStatus === '판매 중') return true
    if (activeFilter === '품절' && item.salesStatus === '품절') return true
    return false
  }).filter(item => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return item.productNumber.toLowerCase().includes(query) ||
           item.productName.toLowerCase().includes(query)
  })

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
            전체 품목 관리
          </p>
          <div className="h-[24px] opacity-0 w-[12px]" aria-hidden="true"></div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-4 items-center pb-[82px] pt-4 px-[15px] overflow-y-auto">
        {/* 검색 및 필터 */}
        <div className="bg-white flex flex-col items-start px-4 py-[15px] rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] w-full">
          <div className="flex flex-col gap-[12px] items-start w-full">
            {/* 검색 바 */}
            <div className="bg-[#f8f6f4] h-[31px] relative rounded-[8px] w-full">
              <div className="flex gap-2 h-[31px] items-center px-4 py-0 w-full">
                <div className="relative size-4">
                  <img alt="검색" className="block max-w-none size-full" src={imgSearchIcon} />
                </div>
                <input
                  type="text"
                  placeholder="상품번호, 상품명 등 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-[18px] min-h-0 min-w-0 bg-transparent border-0 outline-none text-[13px] text-[#85817e] placeholder:text-[#85817e]"
                />
              </div>
            </div>

            {/* 필터 버튼들 */}
            <div className="flex gap-[6px] items-center">
              {['전체', 'Fund', 'Partner up', '판매 중', '품절'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`flex items-center justify-center px-4 py-[9px] rounded-[8px] ${
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

        {/* 전체 건수 */}
        <div className="h-[15px] relative w-full">
          <p className="font-semibold leading-[15px] text-[12px] text-black">
            전체 {filteredItems.length}건
          </p>
        </div>

        {/* 테이블 */}
        <div className="bg-white flex flex-col items-start justify-center overflow-hidden rounded-[12px] w-full">
          {/* 테이블 헤더 */}
          <div className="bg-[#eeebe6] border-b border-[#eeebe6] flex h-[47px] items-center px-3 py-0 w-full">
            <div className="flex gap-[1.5px] items-center w-full">
              <button
                onClick={handleSelectAll}
                className="relative size-6 flex items-center justify-center"
              >
                {selectAll ? (
                  <img alt="선택됨" className="block max-w-none size-full" src={imgCheckbox} />
                ) : (
                  <div className="border-[1.5px] border-[#2a2a2e] rounded-[5px] size-5"></div>
                )}
              </button>
              <div className="flex flex-1 items-center min-h-0 min-w-0">
                <p className="font-semibold leading-[14px] text-[9px] text-black">
                  상품번호
                </p>
              </div>
              <div className="flex flex-1 items-center min-h-0 min-w-0">
                <p className="font-semibold leading-[14px] text-[9px] text-black">
                  판매방식
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center min-h-0 min-w-0">
                <p className="font-semibold leading-[14px] text-[9px] text-black w-[59px] whitespace-pre-wrap">
                  상품명
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center min-h-0 min-w-0">
                <p className="font-semibold leading-[14px] text-[9px] text-black w-[59px] whitespace-pre-wrap">
                  옵션명
                </p>
              </div>
              <div className="flex flex-1 items-center min-h-0 min-w-0">
                <p className="font-semibold leading-[14px] text-[9px] text-black">
                  가격
                </p>
              </div>
              <div className="flex flex-1 items-center min-h-0 min-w-0">
                <p className="font-semibold leading-[14px] text-[9px] text-black">
                  판매여부
                </p>
              </div>
            </div>
          </div>

          {/* 테이블 본문 */}
          <div className="flex flex-col items-start justify-center px-3 py-0 w-full">
            {isLoadingItems ? (
              <div className="flex items-center justify-center py-12 w-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                  <p className="text-gray-600">품목을 불러오는 중...</p>
                </div>
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`border-b border-[#eeebe6] flex flex-col h-[46px] items-start justify-center pb-[1px] pt-0 px-0 w-full ${
                    index === filteredItems.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <div className="flex gap-[1.5px] items-center w-full">
                    <button
                      onClick={() => handleToggleSelect(item.id)}
                      className="relative size-6 flex items-center justify-center"
                    >
                      {item.isSelected ? (
                        <img alt="선택됨" className="block max-w-none size-full" src={imgCheckbox} />
                      ) : (
                        <div className="border-[1.5px] border-[#2a2a2e] rounded-[5px] size-5"></div>
                      )}
                    </button>
                    <div className="flex flex-1 items-start min-h-0 min-w-0 overflow-hidden">
                      <p className="font-normal leading-[14px] text-[9px] text-black">
                        {item.productNumber}
                      </p>
                    </div>
                    <div className="flex flex-1 items-start min-h-0 min-w-0 overflow-hidden">
                      <p className="font-normal leading-[14px] text-[9px] text-black">
                        {item.salesMethod}
                      </p>
                    </div>
                    <div className="flex flex-1 items-start min-h-0 min-w-0 overflow-hidden">
                      <p className="font-normal leading-[14px] text-[9px] text-black">
                        {item.productName}
                      </p>
                    </div>
                    <div className="flex flex-1 items-start min-h-0 min-w-0 overflow-hidden">
                      <p className="font-normal leading-[14px] text-[9px] text-black">
                        {item.optionName}
                      </p>
                    </div>
                    <div className="flex flex-1 items-start min-h-0 min-w-0 overflow-hidden">
                      <p className="font-normal leading-[14px] text-[9px] text-black">
                        {item.price.toLocaleString()}원
                      </p>
                    </div>
                    <div className="flex flex-1 items-start min-h-0 min-w-0 overflow-hidden">
                      <div className="flex items-start overflow-hidden">
                        <div className={`flex h-[19px] items-center justify-center relative rounded-[9px] ${
                          item.salesStatus === '판매 중' ? 'bg-[#4caf50]' : 'bg-[#85817e]'
                        }`}>
                          <p className="font-bold leading-[12px] text-[8px] text-white px-2">
                            {item.salesStatus}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 하단 고정 바 */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#fd6f22] flex items-center justify-between pb-4 pt-4 px-4 rounded-tl-[16px] rounded-tr-[16px] shadow-[0px_-4px_10px_0px_rgba(99,81,73,0.2)] z-50">
          <p className="font-bold leading-[22.5px] text-[15px] text-white w-[65px]">
            {selectedCount}개 선택됨
          </p>
          <div className="h-[35px] relative w-[253px] flex items-center justify-end">
            <button
              onClick={handleExport}
              className="bg-white h-[35px] relative rounded-[8px] w-[77px] flex items-center justify-center"
            >
              <p className="font-semibold leading-[19.5px] text-[13px] text-[#fd6f22] text-center">
                내보내기
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AllItemsPageSuspenseFallback() {
  return (
    <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}
