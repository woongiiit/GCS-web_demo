'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePermissions } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'
import Footer from '@/components/Footer'

function CommunityContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { role, user } = usePermissions()
  const [activeTab, setActiveTab] = useState<'board' | 'lounge'>('board')
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // HTML 태그를 제거하고 텍스트만 추출하는 함수
  const stripHtmlTags = (html: string): string => {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  // 날짜를 YYYY.MM.DD 형식으로 변환
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  // URL 쿼리 파라미터에서 초기 탭 설정
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'board') {
      setActiveTab('board')
    } else if (tab === 'lounge') {
      setActiveTab('lounge')
    }
  }, [searchParams])

  // 탭 변경 시 URL 업데이트
  const handleTabChange = (tab: 'board' | 'lounge') => {
    setActiveTab(tab)
    router.push(`/community?tab=${tab}`, { scroll: false })
  }

  // 게시글 데이터 로드
  useEffect(() => {
    fetchPosts()
  }, [activeTab])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/community/posts?category=${activeTab}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setPosts(data.data)
      }
    } catch (error) {
      console.error('게시글 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white">
        {/* 상단 배너 영역 - 이미지 배경 + 주황색 오버레이 */}
        <div className="relative h-[300px] overflow-hidden">
          {/* 배경 이미지 (나중에 실제 이미지로 교체 가능) */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
            {/* 배경 이미지가 있다면 여기에 추가 */}
          </div>
          {/* 주황색 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-l from-[rgba(255,178,114,0.6)] to-[#fd6f22]"></div>
          <div className="relative h-full flex flex-col items-center justify-center px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Community</h1>
            <p className="text-white text-sm sm:text-base">GCS의 소식과 대화가 모이는 곳</p>
          </div>
        </div>

        {/* 탭 메뉴 - 흰색 배경 영역 */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            <div className="flex justify-center space-x-8 py-4">
              <button
                onClick={() => handleTabChange('board')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'board'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                Board
              </button>
              <button
                onClick={() => handleTabChange('lounge')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'lounge'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                Lounge
              </button>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-0">
          {activeTab === 'board' ? (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">Board</h2>
                <p className="text-gray-600 text-sm sm:text-base">GCS의 최신 소식과 산업 트렌드를 한눈에</p>
              </div>
              {permissions.canWritePost(role) && (
                <div className="flex justify-end mb-6">
                  <Link 
                    href="/community/write?category=board"
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    글 작성
                  </Link>
                </div>
              )}

              {/* 게시글 목록 */}
              <div className="space-y-4 mb-8">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">게시글을 불러오는 중...</p>
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <div 
                      key={post.id} 
                      onClick={() => {
                        if (permissions.canViewCommunityPost(role)) {
                          router.push(`/community/${post.id}`)
                        } else {
                          router.push('/login')
                        }
                      }}
                      className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <div className="flex items-start gap-4 sm:gap-6">
                          {/* 대표 이미지 */}
                          {post.images && post.images.length > 0 ? (
                            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={post.images[0]}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-gray-200"></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-black mb-2 line-clamp-2">{post.title}</h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {stripHtmlTags(post.content).substring(0, 100)}
                              {stripHtmlTags(post.content).length > 100 && '...'}
                            </p>
                            <div className="text-sm text-gray-500">
                              {formatDate(post.createdAt)}
                            </div>
                          </div>
                        </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    작성된 게시글이 없습니다.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">Lounge</h2>
                <p className="text-gray-600 text-sm sm:text-base">GCS 구성원만을 위한 소통공간</p>
              </div>
              {permissions.canWritePost(role) && (
                <div className="flex justify-end mb-6">
                  <Link 
                    href="/community/write?category=lounge"
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    글 작성
                  </Link>
                </div>
              )}

              {/* 게시글 목록 */}
              <div className="space-y-4 mb-8">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">게시글을 불러오는 중...</p>
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <div 
                      key={post.id} 
                      onClick={() => {
                        if (permissions.canViewCommunityPost(role)) {
                          router.push(`/community/${post.id}`)
                        } else {
                          router.push('/login')
                        }
                      }}
                      className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <div className="flex items-start gap-4 sm:gap-6">
                          {/* 대표 이미지 */}
                          {post.images && post.images.length > 0 ? (
                            <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={post.images[0]}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gray-200"></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-black mb-2 line-clamp-2">{post.title}</h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {stripHtmlTags(post.content).substring(0, 100)}
                              {stripHtmlTags(post.content).length > 100 && '...'}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>{post.author.name}</span>
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    작성된 게시글이 없습니다.
                  </div>
                )}
              </div>
            </div>
          )}

          </div>
        </div>

        {/* 하단 Footer */}
        <Footer />
      </div>
    </div>
  )
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommunityContent />
    </Suspense>
  )
}
