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
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

  const postId = params.id as string

  // 권한 체크
  if (!permissions.canViewCommunityPost(role)) {
    return (
      <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
        <div className="relative min-h-screen bg-white">
          <div className="relative h-[300px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-[rgba(255,178,114,0.6)] to-[#fd6f22]"></div>
            <div className="relative h-full flex flex-col items-center justify-center px-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Community</h1>
              <p className="text-white text-sm sm:text-base">GCS의 소식과 대화가 모이는 곳</p>
            </div>
          </div>
          <div className="bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Community 글을 보려면 로그인이 필요합니다.</p>
              <div className="flex space-x-4 justify-center">
                <Link 
                  href="/login"
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  로그인
                </Link>
                <Link 
                  href="/community"
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  목록으로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (postId) {
      fetchPost()
      fetchLikeStatus()
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

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/like`)
      const data = await response.json()
      
      if (data.success) {
        setIsLiked(data.liked)
        setLikeCount(data.likeCount)
      }
    } catch (error) {
      console.error('좋아요 상태 조회 오류:', error)
    }
  }

  const handleLike = async () => {
    if (isLikeLoading) return
    
    setIsLikeLoading(true)
    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsLiked(data.liked)
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1)
      } else {
        alert(data.error || '좋아요 처리에 실패했습니다.')
      }
    } catch (error) {
      console.error('좋아요 처리 오류:', error)
      alert('서버 오류가 발생했습니다.')
    } finally {
      setIsLikeLoading(false)
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

  // HTML 태그를 제거하고 텍스트만 추출하는 함수
  const stripHtmlTags = (html: string): string => {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  // 날짜를 YYYY.MMDD 형식으로 변환 (Figma 디자인에 맞춤)
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}${day}`
  }

  // content에서 첫 번째 문단을 추출하여 부제로 사용
  const getSubtitle = (content: string): string => {
    const text = stripHtmlTags(content)
    const firstParagraph = text.split('\n').find(p => p.trim().length > 0) || ''
    return firstParagraph.substring(0, 50) // 최대 50자
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
        <div className="relative min-h-screen bg-white">
          <div className="relative h-[300px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-[rgba(255,178,114,0.6)] to-[#fd6f22]"></div>
            <div className="relative h-full flex flex-col items-center justify-center px-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Community</h1>
              <p className="text-white text-sm sm:text-base">GCS의 소식과 대화가 모이는 곳</p>
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
          <div className="relative h-[300px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-[rgba(255,178,114,0.6)] to-[#fd6f22]"></div>
            <div className="relative h-full flex flex-col items-center justify-center px-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Community</h1>
              <p className="text-white text-sm sm:text-base">GCS의 소식과 대화가 모이는 곳</p>
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
                onClick={() => router.push('/community?tab=board')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  post.category === 'BOARD'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                Board
              </button>
              <button
                onClick={() => router.push('/community?tab=lounge')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  post.category === 'LOUNGE'
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
          <div className="max-w-4xl mx-auto px-4 py-8 sm:px-0">
            {/* 게시글 제목 및 정보 */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">{post.title}</h1>
              <p className="text-gray-600 text-sm sm:text-base mb-2">{getSubtitle(post.content)}</p>
              <p className="text-gray-500 text-sm">{formatDate(post.createdAt)}</p>
            </div>

            {/* 관리자/작성자 액션 버튼 */}
            {permissions.canEditPost(role, post.authorId, post.author.id) && (
              <div className="flex space-x-2 mb-8">
                <Link
                  href={`/community/write?category=${post.category.toLowerCase()}&edit=${post.id}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  수정
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  삭제
                </button>
              </div>
            )}

            {/* 이미지 갤러리 */}
            {post.images && post.images.length > 0 && (
              <div className="mb-8">
                <div className="relative bg-gray-200 rounded-lg overflow-hidden">
                  <div className="w-full">
                    <img 
                      src={post.images[currentImageIndex]} 
                      alt={`${post.title} - 이미지 ${currentImageIndex + 1}`}
                      className="w-full h-auto object-cover"
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
            <div className="prose max-w-none mb-8">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
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
                <button 
                  onClick={handleLike}
                  disabled={isLikeLoading}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    isLiked 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg 
                    className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} 
                    fill={isLiked ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                  <span>{isLikeLoading ? '처리중...' : `좋아요 ${likeCount}`}</span>
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  공유
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 푸터 - 고객지원 및 사업자 정보 */}
        <div className="bg-white py-8 border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* 고객지원 */}
              <div>
                <h3 className="text-sm font-bold text-black mb-4">고객지원</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>전화: 010-5238-0236</p>
                  <p>이메일: gcsweb01234@gmail.com</p>
                  <p>주소: 서울특별시 강북구 솔샘로 174 136동 304호</p>
                </div>
              </div>
              
              {/* 사업자 정보 */}
              <div>
                <h3 className="text-sm font-bold text-black mb-4">사업자 정보</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>대표: 안성은</p>
                  <p>회사명: 안북스 스튜디오</p>
                  <p>사업자등록번호: 693-01-03164</p>
                  <p>통신판매업신고번호: 제 2025-서울강북-0961호</p>
                </div>
              </div>
            </div>
            
            {/* 최하단 저작권 정보 */}
            <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center mb-4 sm:mb-0">
                <h3 className="text-sm font-bold text-black">
                  GCS<span className="text-[#f57520]">:</span>Web
                </h3>
                <span className="text-xs text-gray-500 ml-2">© 2025 GCSWeb. all rights reserved.</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <a href="#" className="text-xs text-gray-600 underline">개인정보처리방침</a>
                <span className="text-xs text-gray-400">|</span>
                <a href="#" className="text-xs text-gray-600 underline">이용약관</a>
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
