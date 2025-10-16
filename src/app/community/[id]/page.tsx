'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePermissions } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'

function CommunityDetailContent() {
  const params = useParams()
  const router = useRouter()
  const { role } = usePermissions()
  const [post, setPost] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const postId = params.id as string

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const fetchPost = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/community/posts/${postId}`)
      const data = await response.json()
      
      if (data.success) {
        setPost(data.data)
      } else {
        console.error('게시글 조회 실패:', data.error)
        router.push('/community')
      }
    } catch (error) {
      console.error('게시글 조회 오류:', error)
      router.push('/community')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        alert('게시글이 삭제되었습니다.')
        router.push('/community')
      } else {
        alert(data.error || '게시글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('게시글 삭제 오류:', error)
      alert('서버 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
        <div className="relative min-h-screen bg-white">
          <div className="bg-black pt-32 pb-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-0">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">Community</h1>
                <p className="text-white text-sm mb-8">게시글을 불러오는 중...</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">게시글을 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
        <div className="relative min-h-screen bg-white">
          <div className="bg-black pt-32 pb-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-0">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">Community</h1>
                <p className="text-white text-sm mb-8">게시글을 찾을 수 없습니다.</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">게시글을 찾을 수 없습니다.</p>
              <Link 
                href="/community"
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                목록으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white">
        {/* 상단 검은색 영역 */}
        <div className="bg-black pt-32 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Community</h1>
              <p className="text-white text-sm mb-8">게시글 상세보기</p>
              
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

        {/* 메인 컨텐츠 영역 */}
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-8 sm:px-0">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {/* 게시글 헤더 */}
              <div className="border-b border-gray-200 pb-6 mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        {post.category === 'BOARD' ? 'Board' : 'Lounge'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-black mb-4">{post.title}</h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>작성자: {post.author.name}</span>
                      <span>조회 {post.views}</span>
                      <span>댓글 {post.commentCount}</span>
                    </div>
                  </div>
                  
                  {/* 관리자/작성자 액션 버튼 */}
                  {permissions.canEditPost(role, post.authorId, post.author.id) && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 이미지 갤러리 */}
              {post.images && post.images.length > 0 && (
                <div className="mb-8">
                  <div className="relative bg-gray-200 rounded-lg overflow-hidden">
                    <div className="aspect-video">
                      <img 
                        src={post.images[currentImageIndex]} 
                        alt={`${post.title} - 이미지 ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNTI1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q29tbXVuaXR5IEltYWdlPC90ZXh0Pgo8L3N2Zz4='
                        }}
                      />
                    </div>
                    
                    {/* 이미지 네비게이션 */}
                    {post.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : post.images.length - 1)}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev < post.images.length - 1 ? prev + 1 : 0)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* 이미지 썸네일 */}
                  {post.images.length > 1 && (
                    <div className="flex space-x-2 mt-4 overflow-x-auto">
                      {post.images.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            currentImageIndex === index ? 'border-black' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`썸네일 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 게시글 내용 */}
              <div className="prose max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap">
                  {post.content.split('\n').map((paragraph: string, index: number) => {
                    // 이미지 태그 파싱
                    const imageMatch = paragraph.match(/^\[IMAGE:(.+)\]$/)
                    if (imageMatch) {
                      return (
                        <div key={index} className="my-6">
                          <img
                            src={imageMatch[1]}
                            alt="게시글 이미지"
                            className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNTI1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q29tbXVuaXR5IEltYWdlPC90ZXh0Pgo8L3N2Zz4='
                            }}
                          />
                        </div>
                      )
                    }
                    
                    // 빈 줄 처리
                    if (paragraph.trim() === '') {
                      return <br key={index} />
                    }
                    
                    // 일반 텍스트
                    return (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    )
                  })}
                </div>
              </div>

              {/* 하단 액션 버튼 */}
              <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
                <Link 
                  href="/community"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  목록으로
                </Link>
                
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    좋아요
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    공유
                  </button>
                </div>
              </div>
            </div>
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

export default function CommunityDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommunityDetailContent />
    </Suspense>
  )
}
