'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetchProjectDetail()
  }, [projectId])

  const fetchProjectDetail = async () => {
    try {
      const response = await fetch(`/api/archive/projects/${projectId}`)
      const data = await response.json()
      if (data.success) {
        setProject(data.data)
      }
    } catch (error) {
      console.error('프로젝트 상세 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextImage = () => {
    if (project?.images && project.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === project.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (project?.images && project.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? project.images.length - 1 : prev - 1
      )
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">프로젝트 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">프로젝트를 찾을 수 없습니다.</p>
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
              <h1 className="text-4xl font-bold text-white mb-4">{project.title}</h1>
              <p className="text-white text-sm mb-8">{project.year}년 프로젝트</p>
            
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
                <Link href={`/archive/projects/year/${project.year}`} className="inline-flex items-center text-gray-600 hover:text-black transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {project.year}년 프로젝트로 돌아가기
                </Link>
              </div>

              {/* 프로젝트 이미지 갤러리 */}
              {project.images && project.images.length > 0 && (
                <div className="mb-8">
                  <div className="relative bg-gray-200 rounded-lg overflow-hidden">
                    <div className="aspect-video">
                      <img 
                        src={project.images[currentImageIndex]} 
                        alt={`${project.title} - 이미지 ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder-project.jpg'
                        }}
                      />
                    </div>
                    
                    {/* 이미지 네비게이션 */}
                    {project.images.length > 1 && (
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
                          {project.images.map((_: any, index: number) => (
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

              {/* 프로젝트 정보 */}
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div>
                  <h2 className="text-2xl font-bold text-black mb-4">프로젝트 정보</h2>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <h3 className="text-[#f57520] font-bold text-lg mb-2">{project.title}</h3>
                      <p className="text-gray-600">{project.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">연도:</span>
                        <span className="ml-2 text-gray-600">{project.year}년</span>
                      </div>
                      
                      {project.semester && (
                        <div>
                          <span className="font-medium text-gray-700">학기:</span>
                          <span className="ml-2 text-gray-600">{project.semester}</span>
                        </div>
                      )}
                      
                      {project.teamMembers && project.teamMembers.length > 0 && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700">참여 멤버:</span>
                          <span className="ml-2 text-gray-600">{project.teamMembers.join(', ')}</span>
                        </div>
                      )}
                      
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700">사용 기술:</span>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {project.technologies.map((tech: string, index: number) => (
                              <span key={index} className="bg-[#f57520] text-white px-3 py-1 rounded-full text-sm">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {project.isFeatured && (
                      <div className="pt-4 border-t border-gray-200">
                        <span className="bg-[#f57520] text-white px-3 py-1 rounded-full text-sm font-medium">
                          주요 프로젝트
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 프로젝트 상세 내용 */}
                {project.content && (
                  <div>
                    <h2 className="text-2xl font-bold text-black mb-4">프로젝트 상세</h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                        {project.content.split('\n').map((paragraph: string, index: number) => (
                          <p key={index} className="mb-4">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 링크 정보 */}
                {(project.githubUrl || project.demoUrl) && (
                  <div>
                    <h2 className="text-2xl font-bold text-black mb-4">관련 링크</h2>
                    <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                      {project.githubUrl && (
                        <div>
                          <a 
                            href={project.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-[#f57520] hover:underline"
                          >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub 저장소
                          </a>
                        </div>
                      )}
                      
                      {project.demoUrl && (
                        <div>
                          <a 
                            href={project.demoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-[#f57520] hover:underline"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            데모 사이트
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 작성자 정보 */}
                <div>
                  <h2 className="text-2xl font-bold text-black mb-4">작성자 정보</h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">작성자:</span> {project.author?.name || '알 수 없음'}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">작성일:</span> {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {project.author?.role === 'ADMIN' ? '운영자' : '학생'}
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
