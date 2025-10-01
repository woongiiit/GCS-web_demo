'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function CommunityContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'board' | 'lounge'>('board')

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
              <h2 className="text-xl font-bold text-black mb-6">Board</h2>

              {/* 게시글 목록 */}
              <div className="space-y-4 mb-8">
                {/* DB에서 가져온 Board 게시글 데이터가 여기에 표시됩니다 */}
                {/* 예시 구조:
                <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-sm font-semibold text-black mb-1">{post.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">{post.excerpt}</p>
                    <p className="text-xs text-gray-400">{post.author} {post.date}</p>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    <img src={post.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                </div>
                */}
              </div>

              {/* 페이징 */}
              <div className="flex justify-center items-center space-x-2 text-sm mb-8">
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">&lt;</button>
                <button className="px-3 py-1 rounded-md bg-black text-white">1</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">2</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">3</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">4</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">5</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">&gt;</button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-black mb-6">Lounge</h2>

              {/* 게시글 목록 */}
              <div className="space-y-4 mb-8">
                {/* DB에서 가져온 Lounge 게시글 데이터가 여기에 표시됩니다 */}
                {/* 예시 구조:
                <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-sm font-semibold text-black mb-1">{post.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">{post.excerpt}</p>
                    <p className="text-xs text-gray-400">{post.author} {post.date}</p>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    <img src={post.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                </div>
                */}
              </div>

              {/* 페이징 */}
              <div className="flex justify-center items-center space-x-2 text-sm mb-8">
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">&lt;</button>
                <button className="px-3 py-1 rounded-md bg-black text-white">1</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">2</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">3</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">4</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">5</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">&gt;</button>
              </div>
            </div>
          )}

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

export default function CommunityPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommunityContent />
    </Suspense>
  )
}
