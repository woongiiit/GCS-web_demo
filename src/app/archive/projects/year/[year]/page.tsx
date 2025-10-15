'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function ProjectsByYearPage() {
  const params = useParams()
  const year = params.year as string
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjectsByYear()
  }, [year])

  const fetchProjectsByYear = async () => {
    try {
      const response = await fetch(`/api/archive/projects?year=${year}`)
      const data = await response.json()
      if (data.success) {
        setProjects(data.data)
      }
    } catch (error) {
      console.error('프로젝트 조회 오류:', error)
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
              <h1 className="text-4xl font-bold text-white mb-4">{year}년 프로젝트</h1>
              <p className="text-white text-sm mb-8">{year}년에 진행된 모든 프로젝트를 확인하세요.</p>
            
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
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-0">
            <div className="bg-white px-4 py-8">
              
              {/* 뒤로가기 버튼 */}
              <div className="mb-6">
                <Link href="/archive" className="inline-flex items-center text-gray-600 hover:text-black transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Archive로 돌아가기
                </Link>
              </div>

              {/* 연도 구분선 */}
              <div className="mb-8">
                <div className="flex flex-col items-start">
                  {/* 위쪽 검은색 구분선 */}
                  <div className="w-48 h-px bg-black mb-2"></div>
                  
                  {/* 연도 텍스트 */}
                  <h2 className="text-2xl font-bold text-black">{year}</h2>
                  
                  {/* 아래쪽 주황색 구분선 */}
                  <div className="w-24 h-px bg-[#f57520] mt-2"></div>
                </div>
              </div>

              {/* 프로젝트 목록 */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                  <p className="text-gray-600">데이터를 불러오는 중...</p>
                </div>
              ) : projects.length > 0 ? (
                <div className="space-y-6">
                  {projects.map((project) => (
                    <Link key={project.id} href={`/archive/projects/${project.id}`}>
                      <div className="bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-6 cursor-pointer border-l-4 border-[#f57520]">
                        <div className="flex gap-6">
                          {/* 프로젝트 이미지 */}
                          {project.images && project.images[0] && (
                            <div className="flex-shrink-0">
                              <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
                                <img 
                                  src={project.images[0]} 
                                  alt={project.title} 
                                  className="w-full h-full object-cover" 
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/placeholder-project.jpg'
                                  }} 
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* 프로젝트 정보 */}
                          <div className="flex-1">
                            <h3 className="text-[#f57520] font-bold text-xl mb-2">
                              {project.title}
                            </h3>
                            
                            {project.teamMembers && project.teamMembers.length > 0 && (
                              <p className="text-gray-500 text-sm mb-3">
                                <span className="font-medium">참여 멤버:</span> {project.teamMembers.join(', ')}
                              </p>
                            )}
                            
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="mb-3">
                                <div className="flex flex-wrap gap-2">
                                  {project.technologies.map((tech: string, index: number) => (
                                    <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                              {project.description}
                            </p>
                            
                            <div className="mt-4 flex items-center text-gray-400 text-xs">
                              <span>작성일: {new Date(project.createdAt).toLocaleDateString('ko-KR')}</span>
                              {project.isFeatured && (
                                <span className="ml-4 bg-[#f57520] text-white px-2 py-1 rounded text-xs">
                                  주요 프로젝트
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">{year}년에 등록된 프로젝트가 없습니다.</p>
                </div>
              )}
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
