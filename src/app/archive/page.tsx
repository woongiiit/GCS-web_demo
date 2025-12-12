'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePermissions } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'
import Footer from '@/components/Footer'

function ArchiveContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { role } = usePermissions()
  const [activeTab, setActiveTab] = useState<'project' | 'news'>('project')
  const [projects, setProjects] = useState<any>({})
  const [news, setNews] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<string>('연도')
  const [selectedTag, setSelectedTag] = useState<string>('태그')
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)

  // URL 쿼리 파라미터에서 초기 탭 설정
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'projects' || tab === 'project') {
      setActiveTab('project')
    } else if (tab === 'news') {
      setActiveTab('news')
    }
  }, [searchParams])

  // 탭 변경 시 URL 업데이트 및 데이터 새로고침
  const handleTabChange = (tab: 'project' | 'news') => {
    setActiveTab(tab)
    const tabParam = tab === 'project' ? 'projects' : 'news'
    router.push(`/archive?tab=${tabParam}`, { scroll: false })
    fetchArchiveData()
  }

  // 데이터 로드
  useEffect(() => {
    fetchArchiveData()
  }, [])

  const fetchArchiveData = async () => {
    setIsLoading(true)
    try {
      const [projectsRes, newsRes] = await Promise.all([
        fetch('/api/archive/projects', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        }),
        fetch('/api/archive/news', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
      ])

      const [projectsData, newsData] = await Promise.all([
        projectsRes.json(),
        newsRes.json()
      ])

      if (projectsData.success) {
        setProjects(projectsData.byYear)
      }

      if (newsData.success) {
        setNews(newsData.byYear)
      }
    } catch (error) {
      console.error('Archive 데이터 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 연도 목록 추출
  const getYearList = () => {
    const years = new Set<string>()
    if (activeTab === 'project') {
      Object.keys(projects).forEach(year => years.add(year))
    } else {
      Object.keys(news).forEach(year => years.add(year))
    }
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))
  }

  // 태그 목록 추출 (프로젝트의 경우)
  const getTagList = () => {
    if (activeTab !== 'project') return []
    const tags = new Set<string>()
    Object.values(projects).forEach((yearProjects: any) => {
      yearProjects.forEach((project: any) => {
        if (project.tag) tags.add(project.tag)
      })
    })
    return Array.from(tags)
  }

  // 필터링된 데이터
  const getFilteredData = () => {
    const data = activeTab === 'project' ? projects : news
    const filtered = { ...data }

    // 연도 필터
    if (selectedYear !== '연도' && selectedYear !== '전체') {
      Object.keys(filtered).forEach(year => {
        if (year !== selectedYear) delete filtered[year]
      })
    }

    // 태그 필터 (프로젝트만)
    if (activeTab === 'project' && selectedTag !== '태그' && selectedTag !== '전체') {
      Object.keys(filtered).forEach(year => {
        filtered[year] = filtered[year].filter((item: any) => item.tag === selectedTag)
      })
    }

    return filtered
  }

  const filteredData = getFilteredData()

  return (
    <div className="fixed inset-0 bg-[#f8f6f4] overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-[#f8f6f4]">
        {/* NavBar 높이만큼 상단 여백 */}
        <div className="h-[78px]"></div>

        {/* 배너 영역 - 그라데이션 배경 */}
        <div className="relative h-[191px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-[rgba(255,178,114,0.6)] to-[#fd6f22]"></div>
          <div className="relative h-full flex flex-col items-start justify-end px-[19px] pb-[49px]">
            <h1 className="text-[44px] font-bold text-white mb-0" style={{ fontFamily: 'Paperlogy, sans-serif' }}>
              Archive
            </h1>
            <p className="text-[15px] text-white">GCS의 모든 활동과 기록</p>
          </div>
        </div>

        {/* 서브 메뉴 띠 */}
        <div className="bg-[#f8f6f4]">
          <div className="max-w-full mx-auto px-5">
            <div className="flex gap-12 sm:gap-[21px] items-center justify-center h-[59px] py-3">
              <button
                onClick={() => handleTabChange('project')}
                className={`h-[43px] px-1 font-bold text-[13px] leading-[1.5] tracking-[-0.26px] transition-colors whitespace-nowrap ${
                  activeTab === 'project'
                    ? 'text-[#1a1918] border-b-2 border-[#1a1918]'
                    : 'text-[#b7b3af]'
                }`}
              >
                Project
              </button>
              <button
                onClick={() => handleTabChange('news')}
                className={`h-[43px] px-1 font-bold text-[13px] leading-[1.5] tracking-[-0.26px] transition-colors whitespace-nowrap ${
                  activeTab === 'news'
                    ? 'text-[#1a1918] border-b-2 border-[#1a1918]'
                    : 'text-[#b7b3af]'
                }`}
              >
                News
              </button>
            </div>
          </div>
        </div>

        {/* 드롭다운 필터 */}
        {activeTab === 'project' && (
          <div className="flex gap-[20px] items-center px-[16px] py-[20px]">
            {/* 연도 드롭다운 */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsYearDropdownOpen(!isYearDropdownOpen)
                  setIsTagDropdownOpen(false)
                }}
                className="bg-white flex gap-[8px] items-center pl-3 pr-0 py-1 rounded-[8px] shadow-[0px_4px_4px_0px_rgba(34,32,31,0.14)] w-[126px]"
              >
                <span className="flex-1 text-left text-[13px] leading-[1.5] text-[#1a1918] tracking-[-0.26px]">
                  {selectedYear}
                </span>
                <div className="w-[24px] h-[24px] flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transform transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`}>
                    <path d="M5 7L1 3H9L5 7Z" fill="#1a1918" />
                  </svg>
                </div>
              </button>
              {isYearDropdownOpen && (
                <div className="absolute top-full mt-1 bg-white rounded-[8px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.05)] w-[126px] z-10">
                  <button
                    onClick={() => {
                      setSelectedYear('전체')
                      setIsYearDropdownOpen(false)
                    }}
                    className="w-full text-left px-3 py-1 text-[13px] text-[#1a1918] hover:bg-gray-50 rounded-t-[8px]"
                  >
                    전체
                  </button>
                  <div className="h-px bg-[#dcd6cc]"></div>
                  {getYearList().map((year) => (
                    <div key={year}>
                      <button
                        onClick={() => {
                          setSelectedYear(year)
                          setIsYearDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-1 text-[13px] text-[#1a1918] hover:bg-gray-50"
                      >
                        {year}
                      </button>
                      {year !== getYearList()[getYearList().length - 1] && (
                        <div className="h-px bg-[#dcd6cc]"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 태그 드롭다운 */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsTagDropdownOpen(!isTagDropdownOpen)
                  setIsYearDropdownOpen(false)
                }}
                className="bg-white flex gap-[8px] items-center pl-3 pr-0 py-1 rounded-[8px] shadow-[0px_4px_4px_0px_rgba(34,32,31,0.14)] w-[126px]"
              >
                <span className="flex-1 text-left text-[13px] leading-[1.5] text-[#1a1918] tracking-[-0.26px]">
                  {selectedTag}
                </span>
                <div className="w-[24px] h-[24px] flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transform transition-transform ${isTagDropdownOpen ? 'rotate-180' : ''}`}>
                    <path d="M5 7L1 3H9L5 7Z" fill="#1a1918" />
                  </svg>
                </div>
              </button>
              {isTagDropdownOpen && (
                <div className="absolute top-full mt-1 bg-white rounded-[8px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.05)] w-[126px] z-10">
                  <button
                    onClick={() => {
                      setSelectedTag('전체')
                      setIsTagDropdownOpen(false)
                    }}
                    className="w-full text-left px-3 py-1 text-[13px] text-[#1a1918] hover:bg-gray-50 rounded-t-[8px]"
                  >
                    전체
                  </button>
                  {getTagList().map((tag, index) => (
                    <div key={tag}>
                      {index > 0 && <div className="h-px bg-[#dcd6cc]"></div>}
                      <button
                        onClick={() => {
                          setSelectedTag(tag)
                          setIsTagDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-1 text-[13px] text-[#1a1918] hover:bg-gray-50"
                      >
                        {tag}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 컨텐츠 영역 */}
        <div className="bg-[#f8f6f4] min-h-screen">
          <div className="flex flex-col gap-[40px] items-center px-0 py-[40px]">
            {/* 글 등록 버튼 - 로그인한 사용자에게만 표시 */}
            {role && (
              <div className="flex justify-end w-full max-w-6xl px-4">
                <Link 
                  href={`/archive/write?type=${activeTab === 'project' ? 'project' : 'news'}`}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  글 등록
                </Link>
              </div>
            )}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a1918] mx-auto mb-4"></div>
                <p className="text-[#85817e]">데이터를 불러오는 중...</p>
              </div>
            ) : activeTab === 'project' ? (
              <>
                {Object.keys(filteredData).length > 0 ? (
                  Object.keys(filteredData).sort((a, b) => parseInt(b) - parseInt(a)).map((year) => {
                    const yearProjects = filteredData[year]
                    if (!yearProjects || yearProjects.length === 0) return null
                    
                    return (
                      <div key={year} className="flex flex-col gap-[8px] items-center w-full">
                        <div className="flex items-center w-[271px]">
                          <p className="font-bold text-[22px] leading-[1.5] text-[#1a1918]">
                            {year} {yearProjects[0]?.tag || ''}
                          </p>
                        </div>
                        <div className="flex gap-[24px] items-end justify-center flex-wrap px-4">
                          {yearProjects.slice(0, 3).map((project: any, index: number) => {
                            const isMiddle = index === 1
                            return (
                              <Link key={project.id} href={`/archive/projects/${project.id}`} className="flex flex-col gap-[21px] items-start">
                                <div 
                                  className={`relative shadow-[0px_4px_10px_0px_rgba(0,0,0,0.2)] ${
                                    isMiddle 
                                      ? 'h-[338.25px] w-[270.6px]' 
                                      : 'aspect-[1080/1350] w-[246px]'
                                  } rounded-[4px] overflow-hidden`}
                                >
                                  {project.images && project.images[0] ? (
                                    <img 
                                      src={project.images[0]} 
                                      alt={project.title} 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = '/images/placeholder-project.jpg'
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-[#eeebe6] flex items-center justify-center">
                                      <span className="text-[#85817e] text-sm">이미지 없음</span>
                                    </div>
                                  )}
                                  {!isMiddle && (
                                    <div className="absolute inset-0 bg-[rgba(0,0,0,0.2)]"></div>
                                  )}
                                </div>
                                <div className="flex flex-col items-start w-[134px]">
                                  <p className="font-bold text-[17px] leading-[1.5] text-[#1a1918]">
                                    {project.title}
                                  </p>
                                  <p className="font-normal text-[13px] leading-[1.5] text-[#1a1918] tracking-[-0.26px]">
                                    {project.teamMembers && project.teamMembers.length > 0 
                                      ? project.teamMembers.join(', ') 
                                      : '작가명 없음'}
                                  </p>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                        {yearProjects.length > 3 && (
                          <div className="h-px w-[326px] bg-[#eeebe6] mt-[40px]"></div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12">
                    <p className="text-[#85817e]">등록된 프로젝트가 없습니다.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-[#85817e]">News 탭은 준비 중입니다.</p>
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

export default function ArchivePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArchiveContent />
    </Suspense>
  )
}
