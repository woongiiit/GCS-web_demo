'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePermissions } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'

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
        {/* 상단 검은색 영역 */}
        <div className="bg-black pt-32 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            {/* 페이지 제목 */}
          <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Community</h1>
              <p className="text-white text-sm mb-8">GCS 전공생과 교수님, 졸업생 모두가 함께 소통하는 커뮤니티입니다.</p>
            
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">Board</h2>
                {permissions.canWritePost(role) && (
                  <Link 
                    href="/community/write?category=board"
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    글 작성
                  </Link>
                )}
              </div>

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
                      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <div className="flex items-start gap-4">
                          {/* 대표 이미지 */}
                          {post.images && post.images.length > 0 && (
                            <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={post.images[0]}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-black mb-2">{post.title}</h3>
                            <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {stripHtmlTags(post.content).substring(0, 100)}...
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span>{post.author.name}</span>
                              <span>조회 {post.views}</span>
                              <span>좋아요 {post.likeCount || 0}</span>
                              <span>댓글 {post.commentCount}</span>
                              <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">Lounge</h2>
                {permissions.canWritePost(role) && (
                  <Link 
                    href="/community/write?category=lounge"
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    글 작성
                  </Link>
                )}
              </div>

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
                      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <div className="flex items-start gap-4">
                          {/* 대표 이미지 */}
                          {post.images && post.images.length > 0 && (
                            <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={post.images[0]}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-black mb-2">{post.title}</h3>
                            <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {stripHtmlTags(post.content).substring(0, 100)}...
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span>{post.author.name}</span>
                              <span>조회 {post.views}</span>
                              <span>좋아요 {post.likeCount || 0}</span>
                              <span>댓글 {post.commentCount}</span>
                              <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
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
