'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function ArchiveContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'project' | 'news'>('project')

  // URL 쿼리 파라미터에서 초기 탭 설정
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'projects' || tab === 'project') {
      setActiveTab('project')
    } else if (tab === 'news') {
      setActiveTab('news')
    }
  }, [searchParams])

  // 탭 변경 시 URL 업데이트
  const handleTabChange = (tab: 'project' | 'news') => {
    setActiveTab(tab)
    const tabParam = tab === 'project' ? 'projects' : 'news'
    router.push(`/archive?tab=${tabParam}`, { scroll: false })
  }

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white">
        {/* 상단 검은색 영역 */}
        <div className="bg-black pt-32 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            {/* 페이지 제목 */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Archive</h1>
              <p className="text-white text-sm mb-8">GCS의 모든 활동과 기록을 모아둔 아카이브입니다.</p>
              
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
                onClick={() => handleTabChange('project')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'project'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                Project
              </button>
              <button
                onClick={() => handleTabChange('news')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'news'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                News
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-0">

          {/* 컨텐츠 영역 */}
          <div className="bg-white min-h-screen px-4 py-8">
            {activeTab === 'project' ? (
              <div>
                {/* 2025 프로젝트 섹션 */}
                <div className="mb-16">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold text-black">2025</h2>
                      <div className="w-12 h-1 bg-[#f57520] mt-1"></div>
                    </div>
                    <button className="text-black font-bold underline hover:text-[#f57520] transition-colors">
                      More
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    {/* DB에서 가져온 프로젝트 데이터가 여기에 표시됩니다 */}
                    {/* 예시 구조:
                    <div className="bg-white">
                      <div className="w-full aspect-[4/3] bg-gray-200 rounded-lg mb-3">
                        <img src={project.image} alt={project.title} className="w-full h-full object-cover rounded-lg" />
                      </div>
                      <h3 className="text-[#f57520] font-bold text-base mb-2">{project.title} {project.members}</h3>
                      <p className="text-gray-600 text-sm">{project.description}</p>
                    </div>
                    */}
                  </div>
                </div>

                {/* 2024 프로젝트 섹션 */}
                <div className="mb-16">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold text-black">2024</h2>
                      <div className="w-12 h-1 bg-[#f57520] mt-1"></div>
                    </div>
                    <button className="text-black font-bold underline hover:text-[#f57520] transition-colors">
                      More
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    {/* DB에서 가져온 프로젝트 데이터가 여기에 표시됩니다 */}
                  </div>
                </div>

                {/* 2023 프로젝트 섹션 */}
                <div className="mb-16">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold text-black">2023</h2>
                      <div className="w-12 h-1 bg-[#f57520] mt-1"></div>
                    </div>
                    <button className="text-black font-bold underline hover:text-[#f57520] transition-colors">
                      More
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    {/* DB에서 가져온 프로젝트 데이터가 여기에 표시됩니다 */}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* 2025 뉴스 섹션 */}
                <div className="mb-16">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold text-black">2025</h2>
                      <div className="w-12 h-1 bg-[#f57520] mt-1"></div>
                    </div>
                    <button className="text-black font-bold underline hover:text-[#f57520] transition-colors">
                      More
                    </button>
                  </div>
                  
                  <div className="space-y-6 mt-6">
                    {/* DB에서 가져온 뉴스 데이터가 여기에 표시됩니다 */}
                    {/* 예시 구조:
                    <div className="bg-white border-b border-gray-200 pb-6">
                      <div className="flex gap-4">
                        <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0">
                          <img src={news.image} alt={news.title} className="w-full h-full object-cover rounded-lg" />
                        </div>
                        <div>
                          <h3 className="text-[#f57520] font-bold text-base mb-2">{news.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{news.description}</p>
                          <span className="text-gray-400 text-xs">{news.date}</span>
                        </div>
                      </div>
                    </div>
                    */}
                  </div>
                </div>

                {/* 2024 뉴스 섹션 */}
                <div className="mb-16">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold text-black">2024</h2>
                      <div className="w-12 h-1 bg-[#f57520] mt-1"></div>
                    </div>
                    <button className="text-black font-bold underline hover:text-[#f57520] transition-colors">
                      More
                    </button>
                  </div>
                  
                  <div className="space-y-6 mt-6">
                    {/* DB에서 가져온 뉴스 데이터가 여기에 표시됩니다 */}
                  </div>
                </div>

                {/* 2023 뉴스 섹션 */}
                <div className="mb-16">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold text-black">2023</h2>
                      <div className="w-12 h-1 bg-[#f57520] mt-1"></div>
                    </div>
                    <button className="text-black font-bold underline hover:text-[#f57520] transition-colors">
                      More
                    </button>
                  </div>
                  
                  <div className="space-y-6 mt-6">
                    {/* DB에서 가져온 뉴스 데이터가 여기에 표시됩니다 */}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="text-center text-gray-400 text-xs mt-12">
            DONGGUK UNIVERSITY
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ArchivePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArchiveContent />
    </Suspense>
  )
}