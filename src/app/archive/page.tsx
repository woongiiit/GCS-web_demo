'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePermissions } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'

function ArchiveContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { role } = usePermissions()
  const [activeTab, setActiveTab] = useState<'project' | 'news'>('project')
  const [projects, setProjects] = useState<any>({})
  const [news, setNews] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

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

  // 데이터 로드
  useEffect(() => {
    fetchArchiveData()
  }, [])

  const fetchArchiveData = async () => {
    setIsLoading(true)
    try {
      // 프로젝트 조회
      const projectsRes = await fetch('/api/archive/projects')
      const projectsData = await projectsRes.json()
      if (projectsData.success) {
        setProjects(projectsData.byYear)
      }

      // 뉴스 조회
      const newsRes = await fetch('/api/archive/news')
      const newsData = await newsRes.json()
      if (newsData.success) {
        setNews(newsData.byYear)
      }
    } catch (error) {
      console.error('Archive 데이터 조회 오류:', error)
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
            <div className="flex justify-between items-center py-4">
              {/* 탭 버튼들 */}
              <div className="flex justify-center space-x-8 flex-1">
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
              
              {/* 글 작성 버튼 (학생회원, 운영자만) */}
              {permissions.canWritePost(role) && (
                <Link 
                  href={`/archive/write?type=${activeTab}`}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  글 작성
                </Link>
              )}
            </div>
            </div>
          </div>

        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-0">

          {/* 컨텐츠 영역 */}
          <div className="bg-white min-h-screen px-4 py-8">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600">데이터를 불러오는 중...</p>
              </div>
            ) : activeTab === 'project' ? (
              <div>
                {Object.keys(projects).length > 0 ? (
                  Object.keys(projects).sort((a, b) => parseInt(b) - parseInt(a)).map((year) => (
                    <div key={year} className="mb-16">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h2 className="text-2xl font-bold text-black">{year}</h2>
                          <div className="w-12 h-1 bg-[#f57520] mt-1"></div>
                        </div>
                        <Link href={`/archive?tab=projects&year=${year}`} className="text-black font-bold underline hover:text-[#f57520] transition-colors">
                          More
                        </Link>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        {projects[year].slice(0, 4).map((project: any) => (
                          <div key={project.id} className="bg-white hover:shadow-md transition-shadow rounded-lg overflow-hidden">
                            <div className="w-full aspect-[4/3] bg-gray-200 rounded-lg mb-3 overflow-hidden">
                              {project.images && project.images[0] ? (
                                <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" onError={(e) => {
                                  e.currentTarget.src = '/images/placeholder-project.jpg'
                                }} />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>
                            <h3 className="text-[#f57520] font-bold text-base mb-2">
                              {project.title} 
                              {project.teamMembers && project.teamMembers.length > 0 && ` (${project.teamMembers.join(', ')})`}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">등록된 프로젝트가 없습니다.</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {Object.keys(news).length > 0 ? (
                  Object.keys(news).sort((a, b) => parseInt(b) - parseInt(a)).map((year) => (
                    <div key={year} className="mb-16">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h2 className="text-2xl font-bold text-black">{year}</h2>
                          <div className="w-12 h-1 bg-[#f57520] mt-1"></div>
                        </div>
                        <Link href={`/archive?tab=news&year=${year}`} className="text-black font-bold underline hover:text-[#f57520] transition-colors">
                          More
                        </Link>
                      </div>
                      
                      <div className="space-y-6 mt-6">
                        {news[year].slice(0, 5).map((item: any) => (
                          <div key={item.id} className="bg-white border-b border-gray-200 pb-6 hover:bg-gray-50 transition-colors rounded-lg px-4">
                            <div className="flex gap-4">
                              <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                {item.images && item.images[0] ? (
                                  <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" onError={(e) => {
                                    e.currentTarget.src = '/images/placeholder-news.jpg'
                                  }} />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                    No Image
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-[#f57520] font-bold text-base mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.summary || item.content.substring(0, 100)}</p>
                                <span className="text-gray-400 text-xs">
                                  {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">등록된 뉴스가 없습니다.</p>
                  </div>
                )}
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

export default function ArchivePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArchiveContent />
    </Suspense>
  )
}