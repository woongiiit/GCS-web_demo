'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PRODUCT_TYPES } from '@/lib/shop/product-types'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgBack = "https://www.figma.com/api/mcp/asset/4ea977e7-ccd9-4297-9651-c1c464dcd93f"
const imgRightArrow = "https://www.figma.com/api/mcp/asset/9bca105d-92d6-4824-a08c-fb39c2b46c56"
const imgLike = "https://www.figma.com/api/mcp/asset/c270b90c-f25d-404a-b4b7-87c11cdacf3d"

type TabType = 'shop' | 'project' | 'board' | 'lounge'

interface LikedProduct {
  id: string
  name: string
  price: number
  images: string[]
  type: string
  brand: string | null
  sellerTeamName: string
  createdAt: string
}

interface LikedProject {
  id: string
  title: string
  images: string[]
  imageUrl: string | null
  year: number
  teamMembers: string[]
  authorName: string
  createdAt: string
}

interface LikedPost {
  id: string
  title: string
  content: string
  images: string[]
  authorName: string
  createdAt: string
}

function LikesContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('shop')
  const [shopItems, setShopItems] = useState<LikedProduct[]>([])
  const [projectItems, setProjectItems] = useState<LikedProject[]>([])
  const [boardItems, setBoardItems] = useState<LikedPost[]>([])
  const [loungeItems, setLoungeItems] = useState<LikedPost[]>([])
  const [loading, setLoading] = useState(true)

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (user) {
      fetchLikes(activeTab)
    }
  }, [activeTab, user])

  const fetchLikes = async (type: TabType) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/mypage/likes?type=${type}`, {
        cache: 'no-store',
      })
      const data = await response.json()

      if (data.success) {
        switch (type) {
          case 'shop':
            setShopItems(data.data)
            break
          case 'project':
            setProjectItems(data.data)
            break
          case 'board':
            setBoardItems(data.data)
            break
          case 'lounge':
            setLoungeItems(data.data)
            break
        }
      }
    } catch (error) {
      console.error('좋아요 목록 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handleLikeToggle = async (itemId: string, type: TabType) => {
    try {
      let endpoint = ''
      if (type === 'shop') {
        endpoint = `/api/shop/products/${itemId}/like`
      } else if (type === 'project') {
        endpoint = `/api/archive/projects/${itemId}/like`
      } else if (type === 'board' || type === 'lounge') {
        endpoint = `/api/community/posts/${itemId}/like`
      }

      const response = await fetch(endpoint, {
        method: 'POST',
      })

      if (response.ok) {
        // 좋아요 취소 시 목록에서 제거
        fetchLikes(activeTab)
      }
    } catch (error) {
      console.error('좋아요 토글 오류:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString() + '원'
  }

  const getTypeMeta = (type: string) => {
    return PRODUCT_TYPES.find((t) => t.id === type)
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

  if (!user) {
    return null
  }

  return (
    <div className="bg-[#f8f6f4] min-h-screen flex flex-col">
      {/* Nav Bar */}
      <div className="flex-shrink-0">
        <div className="h-[34px]"></div>
        <div className="bg-[#f8f6f4] flex h-[44px] items-center justify-between px-[16px] py-[10px] shadow-[0px_4px_10px_0px_rgba(99,81,73,0.1)]">
          <button
            onClick={handleBack}
            className="h-[24px] w-[12px] flex items-center justify-center"
            aria-label="뒤로가기"
          >
            <img alt="뒤로가기" className="block max-w-none size-full" src={imgBack} />
          </button>
          <p className="font-bold leading-[1.5] text-[15px] text-black">
            좋아요
          </p>
          <div className="h-[24px] opacity-0 w-[12px]" aria-hidden="true"></div>
        </div>
      </div>

      {/* TabBar */}
      <div className="bg-[#f8f6f4] flex h-[59px] items-center justify-between pb-[4px] pt-[12px] px-[20px]">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex h-[43px] items-center justify-center px-[4px] py-0 ${
            activeTab === 'shop'
              ? 'border-b border-[#1a1918]'
              : ''
          }`}
        >
          <p
            className={`font-bold leading-[1.5] text-[13px] text-center tracking-[-0.26px] ${
              activeTab === 'shop' ? 'text-[#1a1918]' : 'text-[#b7b3af]'
            }`}
          >
            Shop
          </p>
        </button>
        <button
          onClick={() => setActiveTab('project')}
          className={`flex h-[43px] items-center justify-center px-[4px] py-0 ${
            activeTab === 'project'
              ? 'border-b border-[#1a1918]'
              : ''
          }`}
        >
          <p
            className={`font-bold leading-[1.5] text-[13px] text-center tracking-[-0.26px] ${
              activeTab === 'project' ? 'text-[#1a1918]' : 'text-[#b7b3af]'
            }`}
          >
            Project
          </p>
        </button>
        <button
          onClick={() => setActiveTab('board')}
          className={`flex h-[43px] items-center justify-center px-[4px] py-0 ${
            activeTab === 'board'
              ? 'border-b border-[#1a1918]'
              : ''
          }`}
        >
          <p
            className={`font-bold leading-[1.5] text-[13px] text-center tracking-[-0.26px] ${
              activeTab === 'board' ? 'text-[#1a1918]' : 'text-[#b7b3af]'
            }`}
          >
            Board
          </p>
        </button>
        <button
          onClick={() => setActiveTab('lounge')}
          className={`flex h-[43px] items-center justify-center px-[4px] py-0 ${
            activeTab === 'lounge'
              ? 'border-b border-[#1a1918]'
              : ''
          }`}
        >
          <p
            className={`font-bold leading-[1.5] text-[13px] text-center tracking-[-0.26px] ${
              activeTab === 'lounge' ? 'text-[#1a1918]' : 'text-[#b7b3af]'
            }`}
          >
            Lounge
          </p>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-wrap gap-[16px] items-start justify-center px-[16px] py-[20px]">
        {loading ? (
          <div className="w-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : activeTab === 'shop' ? (
          shopItems.length > 0 ? (
            shopItems.map((item) => {
              const typeMeta = getTypeMeta(item.type)
              return (
                <div
                  key={item.id}
                  className="flex flex-[1_0_0] flex-col gap-[12px] items-start justify-end min-h-px min-w-[160px]"
                >
                  <div className="aspect-square relative rounded-[4px] w-full">
                    <Link
                      href={`/shop/${item.id}`}
                      className="absolute inset-0"
                    >
                      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4px]">
                        {item.images && item.images[0] ? (
                          <img
                            alt={item.name}
                            src={item.images[0]}
                            className="absolute h-full left-0 max-w-none top-0 w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/images/placeholder-product.jpg'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200"></div>
                        )}
                      </div>
                      {typeMeta && (
                        <div className="absolute bg-[#fd6f22] flex items-center justify-center left-[6.4px] px-[5.333px] py-[2.667px] rounded-full top-[6.4px] pointer-events-none">
                          <p className="font-normal leading-[1.5] text-[13.33px] text-white">
                            {typeMeta.name}
                          </p>
                        </div>
                      )}
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleLikeToggle(item.id, 'shop')
                      }}
                      className="absolute right-[6.4px] top-[6.4px] aspect-square block cursor-pointer h-[24px] w-[24px] z-10"
                      aria-label="좋아요"
                    >
                      <div className="absolute inset-[20.72%_10.07%_12.92%_12.79%]">
                        <div className="absolute inset-0">
                          <img
                            alt="좋아요"
                            className="block max-w-none size-full"
                            src={imgLike}
                          />
                        </div>
                      </div>
                    </button>
                  </div>
                  <div className="flex flex-col gap-[4px] items-start w-full">
                    <div className="flex flex-col items-start w-full">
                      <div className="flex items-center justify-between pl-0 pr-[10.667px] py-0 w-full">
                        <Link
                          href={`/archive/projects/year/${new Date(item.createdAt).getFullYear()}`}
                          className="flex items-center"
                        >
                          <p className="font-bold leading-[1.5] text-[15px] text-[#1a1918]">
                            {item.sellerTeamName}
                          </p>
                          <div className="flex items-center justify-center ml-1">
                            <div className="flex-none rotate-[180deg] scale-y-[-100%]">
                              <div className="relative size-[8px]">
                                <div className="absolute contents left-[6px] top-[3.33px]">
                                  <div className="absolute flex h-[9.333px] items-center justify-center left-[6px] top-[3.33px] w-[4px]">
                                    <div className="flex-none rotate-[270deg]">
                                      <div className="h-[4px] relative w-[9.333px]">
                                        <img
                                          alt=""
                                          className="block max-w-none size-full"
                                          src={imgRightArrow}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                      <Link href={`/shop/${item.id}`}>
                        <p className="font-normal leading-[1.5] text-[15px] text-[#1a1918] w-full whitespace-pre-wrap">
                          {item.name}
                        </p>
                      </Link>
                    </div>
                    <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px] w-full whitespace-pre-wrap">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="w-full text-center py-8">
              <p className="text-gray-500">좋아요한 상품이 없습니다.</p>
            </div>
          )
        ) : activeTab === 'project' ? (
          projectItems.length > 0 ? (
            projectItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-[1_0_0] flex-col gap-[12px] items-start justify-end max-w-[320px] min-h-px min-w-[160px]"
              >
                <div className="aspect-[120/150] flex flex-col items-end justify-end px-[10.667px] py-[53.333px] relative rounded-[4px] w-full">
                  <Link
                    href={`/archive/projects/${item.id}`}
                    className="absolute inset-0"
                  >
                    {item.images && item.images[0] ? (
                      <img
                        alt={item.title}
                        src={item.images[0]}
                        className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder-product.jpg'
                        }}
                      />
                    ) : item.imageUrl ? (
                      <img
                        alt={item.title}
                        src={item.imageUrl}
                        className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder-product.jpg'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-[4px]"></div>
                    )}
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleLikeToggle(item.id, 'project')
                    }}
                    className="absolute right-[6.4px] top-[6.4px] aspect-square block cursor-pointer h-[24px] w-[24px] z-10"
                    aria-label="좋아요"
                  >
                    <div className="absolute inset-[20.72%_10.07%_12.92%_12.79%]">
                      <div className="absolute inset-0">
                        <img
                          alt="좋아요"
                          className="block max-w-none size-full"
                          src={imgLike}
                        />
                      </div>
                    </div>
                  </button>
                </div>
                <div className="flex flex-col gap-[4px] items-start w-full">
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center justify-between pl-0 pr-[5.333px] py-0 w-[160px]">
                      <Link
                        href={`/archive/projects/year/${item.year}`}
                        className="flex items-center"
                      >
                        <p className="font-bold leading-[1.5] text-[15px] text-[#1a1918]">
                          {item.teamMembers.length > 0 ? item.teamMembers[0] : item.authorName}
                        </p>
                        <div className="flex items-center justify-center ml-1">
                          <div className="flex-none rotate-[180deg] scale-y-[-100%]">
                            <div className="relative size-[8px]">
                              <div className="absolute contents left-[6px] top-[3.33px]">
                                <div className="absolute flex h-[9.333px] items-center justify-center left-[6px] top-[3.33px] w-[4px]">
                                  <div className="flex-none rotate-[270deg]">
                                    <div className="h-[4px] relative w-[9.333px]">
                                      <img
                                        alt=""
                                        className="block max-w-none size-full"
                                        src={imgRightArrow}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                    <Link href={`/archive/projects/${item.id}`}>
                      <p className="font-normal leading-[1.5] min-w-full text-[15px] text-[#1a1918] w-[min-content] whitespace-pre-wrap">
                        {item.title}
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full text-center py-8">
              <p className="text-gray-500">좋아요한 프로젝트가 없습니다.</p>
            </div>
          )
        ) : activeTab === 'board' ? (
          boardItems.length > 0 ? (
            boardItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-[1_0_0] flex-col gap-[12px] items-start justify-end min-h-px min-w-[160px]"
              >
                <div className="aspect-square relative rounded-[4px] w-full">
                  <Link
                    href={`/community/${item.id}`}
                    className="absolute inset-0"
                  >
                    {item.images && item.images[0] ? (
                      <img
                        alt={item.title}
                        src={item.images[0]}
                        className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder-product.jpg'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-[4px]"></div>
                    )}
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleLikeToggle(item.id, 'board')
                    }}
                    className="absolute right-[6.4px] top-[6.4px] aspect-square block cursor-pointer h-[24px] w-[24px] z-10"
                    aria-label="좋아요"
                  >
                    <div className="absolute inset-[20.72%_10.07%_12.92%_12.79%]">
                      <div className="absolute inset-0">
                        <img
                          alt="좋아요"
                          className="block max-w-none size-full"
                          src={imgLike}
                        />
                      </div>
                    </div>
                  </button>
                </div>
                <div className="flex flex-col gap-[4px] items-start w-full">
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center justify-between pl-0 pr-[10.667px] py-0 w-full">
                      <p className="font-bold leading-[1.5] text-[15px] text-[#1a1918]">
                        {item.authorName}
                      </p>
                    </div>
                    <Link href={`/community/${item.id}`}>
                      <p className="font-normal leading-[1.5] text-[15px] text-[#1a1918] w-full whitespace-pre-wrap">
                        {item.title}
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full text-center py-8">
              <p className="text-gray-500">좋아요한 게시글이 없습니다.</p>
            </div>
          )
        ) : activeTab === 'lounge' ? (
          loungeItems.length > 0 ? (
            loungeItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-[1_0_0] flex-col gap-[12px] items-start justify-end min-h-px min-w-[160px]"
              >
                <div className="aspect-square relative rounded-[4px] w-full">
                  <Link
                    href={`/community/${item.id}`}
                    className="absolute inset-0"
                  >
                    {item.images && item.images[0] ? (
                      <img
                        alt={item.title}
                        src={item.images[0]}
                        className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder-product.jpg'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-[4px]"></div>
                    )}
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleLikeToggle(item.id, 'lounge')
                    }}
                    className="absolute right-[6.4px] top-[6.4px] aspect-square block cursor-pointer h-[24px] w-[24px] z-10"
                    aria-label="좋아요"
                  >
                    <div className="absolute inset-[20.72%_10.07%_12.92%_12.79%]">
                      <div className="absolute inset-0">
                        <img
                          alt="좋아요"
                          className="block max-w-none size-full"
                          src={imgLike}
                        />
                      </div>
                    </div>
                  </button>
                </div>
                <div className="flex flex-col gap-[4px] items-start w-full">
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center justify-between pl-0 pr-[10.667px] py-0 w-full">
                      <p className="font-bold leading-[1.5] text-[15px] text-[#1a1918]">
                        {item.authorName}
                      </p>
                    </div>
                    <Link href={`/community/${item.id}`}>
                      <p className="font-normal leading-[1.5] text-[15px] text-[#1a1918] w-full whitespace-pre-wrap">
                        {item.title}
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full text-center py-8">
              <p className="text-gray-500">좋아요한 게시글이 없습니다.</p>
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}

export default function LikesPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <LikesContent />
    </Suspense>
  )
}

