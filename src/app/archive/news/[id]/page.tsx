'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePermissions } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { role, user } = usePermissions()
  const newsId = params.id as string
  const [news, setNews] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

  useEffect(() => {
    fetchNewsDetail()
    fetchLikeStatus()
  }, [newsId])

  const fetchNewsDetail = async () => {
    try {
      const response = await fetch(`/api/archive/news/${newsId}`)
      const data = await response.json()
      if (data.success) {
        setNews(data.data)
      }
    } catch (error) {
      console.error('뉴스 상세 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/archive/news/${newsId}/like`)
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
      const response = await fetch(`/api/archive/news/${newsId}/like`, {
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

  const nextImage = () => {
    if (news?.images && news.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === news.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (news?.images && news.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? news.images.length - 1 : prev - 1
      )
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말로 이 뉴스를 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/archive/news/${newsId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        alert('뉴스가 성공적으로 삭제되었습니다.')
        router.push('/archive?tab=news')
      } else {
        alert(data.error || '뉴스 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('뉴스 삭제 오류:', error)
      alert('서버 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">뉴스 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">뉴스를 찾을 수 없습니다.</p>
          <Link href="/archive" className="text-[#f57520] hover:underline">
            Archive로 돌아가기
          </Link>
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
            {/* 페이지 제목 */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">{news.title}</h1>
              <p className="text-white text-sm mb-8">{news.year}년 소식</p>
            
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
        <div className="bg-white min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-6 sm:px-0">
            <div className="bg-white px-4 py-8">
              
              {/* 뒤로가기 버튼 */}
              <div className="mb-6">
                <Link href={`/archive/news/year/${news.year}`} className="inline-flex items-center text-gray-600 hover:text-black transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {news.year}년 뉴스로 돌아가기
                </Link>
              </div>

              {/* 뉴스 이미지 갤러리 */}
              {news.images && news.images.length > 0 && (
                <div className="mb-8">
                  <div className="relative bg-gray-200 rounded-lg overflow-hidden">
                    <div className="aspect-video">
                      <img 
                        src={news.images[currentImageIndex]} 
                        alt={`${news.title} - 이미지 ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNTI1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TmV3cyBJbWFnZTwvdGV4dD4KPC9zdmc+'
                        }}
                      />
                    </div>
                    
                    {/* 이미지 네비게이션 */}
                    {news.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        
                        {/* 이미지 인디케이터 */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {news.images.map((_: any, index: number) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* 뉴스 정보 */}
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div>
                  <h2 className="text-2xl font-bold text-black mb-4">뉴스 정보</h2>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-[#f57520] font-bold text-lg mb-2">{news.title}</h3>
                        
                        {/* 관리자/작성자 액션 버튼 */}
                        {permissions.canEditPost(role, news.authorId, user?.id) && (
                          <div className="flex space-x-2">
                            <Link
                              href={`/archive/write?type=news&edit=${news.id}`}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                            >
                              수정
                            </Link>
                            <button
                              onClick={handleDelete}
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                      {news.summary && (
                        <p className="text-gray-600 mb-4">{news.summary}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">연도:</span>
                        <span className="ml-2 text-gray-600">{news.year}년</span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">작성일:</span>
                        <span className="ml-2 text-gray-600">{new Date(news.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    
                    {news.isFeatured && (
                      <div className="pt-4 border-t border-gray-200">
                        <span className="bg-[#f57520] text-white px-3 py-1 rounded-full text-sm font-medium">
                          주요 소식
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 뉴스 상세 내용 */}
                {news.content && (
                  <div>
                    <h2 className="text-2xl font-bold text-black mb-4">뉴스 내용</h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                        {news.content.split('\n').map((paragraph: string, index: number) => {
                          // 이미지 태그 파싱
                          const imageMatch = paragraph.match(/^\[IMAGE:(.+)\]$/)
                          if (imageMatch) {
                            return (
                              <div key={index} className="my-6">
                                <img
                                  src={imageMatch[1]}
                                  alt="뉴스 이미지"
                                  className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNTI1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TmV3cyBJbWFnZTwvdGV4dD4KPC9zdmc+'
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
                  </div>
                )}

                {/* 좋아요 버튼 */}
                <div className="flex justify-center pt-8">
                  <button 
                    onClick={handleLike}
                    disabled={isLikeLoading}
                    className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                      isLiked 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <svg 
                      className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} 
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
                </div>

                {/* 작성자 정보 */}
                <div>
                  <h2 className="text-2xl font-bold text-black mb-4">작성자 정보</h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">작성자:</span> {news.author?.name || '알 수 없음'}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">작성일:</span> {new Date(news.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {news.author?.role === 'ADMIN' ? '운영자' : '학생'}
                        </span>
                      </div>
                    </div>
                  </div>
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
