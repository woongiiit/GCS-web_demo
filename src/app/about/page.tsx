'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface AboutContent {
  id: string
  section: string
  title?: string
  content?: string
  imageUrl?: string
  imageAlt?: string
  items?: AboutContentItem[]
}

interface AboutContentItem {
  id: string
  title?: string
  subtitle?: string
  description?: string
  htmlContent?: string
  imageUrl?: string
  imageAlt?: string
  order: number
  type?: 'area' | 'subject'
}

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'gcsweb' | 'intro' | 'lectures' | 'professor'>('gcsweb')
  const [contents, setContents] = useState<Record<string, AboutContent>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchContents()
  }, [])

  const fetchContents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/about')
      const data = await response.json()
      
      if (data.success) {
        setContents(data.data)
      }
    } catch (error) {
      console.error('About 콘텐츠 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentContent = () => {
    const sectionMap = {
      'gcsweb': 'GCS_WEB',
      'intro': 'MAJOR_INTRO', 
      'lectures': 'SUBJECTS',
      'professor': 'PROFESSORS'
    }
    return contents[sectionMap[activeTab]]
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">콘텐츠를 불러오는 중...</p>
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
              <h1 className="text-4xl font-bold text-white mb-4">About GCS</h1>
              <p className="text-white text-sm mb-8">GCS 연계 전공을 소개하는 공간입니다.</p>
            
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

        {/* 서브 메뉴 띠 - 흰색 배경 */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-2 sm:px-0">
                <div className="flex justify-center gap-4 sm:gap-5 md:gap-6 lg:gap-8 py-4">
                <button
                  onClick={() => setActiveTab('gcsweb')}
                className={`pb-2 border-b-2 font-bold transition-colors text-black whitespace-nowrap ${
                    activeTab === 'gcsweb'
                    ? 'border-black'
                    : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{ fontSize: 'clamp(0.625rem, 2vw, 1rem)' }}
                >
                  GCS:Web
                </button>
                <button
                  onClick={() => setActiveTab('intro')}
                className={`pb-2 border-b-2 font-bold transition-colors text-black whitespace-nowrap ${
                    activeTab === 'intro'
                    ? 'border-black'
                    : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{ fontSize: 'clamp(0.625rem, 2vw, 1rem)' }}
                >
                  전공 소개
                </button>
                <button
                  onClick={() => setActiveTab('lectures')}
                className={`pb-2 border-b-2 font-bold transition-colors text-black whitespace-nowrap ${
                    activeTab === 'lectures'
                    ? 'border-black'
                    : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{ fontSize: 'clamp(0.625rem, 2vw, 1rem)' }}
                >
                  개설 과목
                </button>
                <button
                  onClick={() => setActiveTab('professor')}
                className={`pb-2 border-b-2 font-bold transition-colors text-black whitespace-nowrap ${
                    activeTab === 'professor'
                    ? 'border-black'
                    : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{ fontSize: 'clamp(0.625rem, 2vw, 1rem)' }}
                >
                  교수진
                </button>
              </div>
            </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="bg-black min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-8 sm:px-0">
            <DynamicContent 
              activeTab={activeTab} 
              content={getCurrentContent()} 
            />
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

// 동적 콘텐츠 컴포넌트
function DynamicContent({ activeTab, content }: { activeTab: string, content?: AboutContent }) {
  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">콘텐츠가 없습니다.</p>
        <p className="text-gray-500 text-sm mt-2">관리자 페이지에서 콘텐츠를 추가해주세요.</p>
      </div>
    )
  }

  // 개설 과목 탭의 경우 특별한 렌더링
  if (activeTab === 'lectures' && content.items && content.items.length > 0) {
    return <SubjectsContent content={content} />
  }

  return (
    <div className="prose prose-lg max-w-none text-white">
      {/* 메인 타이틀 */}
      <div className="mb-12">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
          {content.title || getDefaultTitle(activeTab)}
        </h2>
        <div className="w-24 h-1 bg-[#f57520]"></div>
      </div>

      {/* 메인 이미지 */}
      {content.imageUrl && (
        <div className="mb-12">
          <img 
            src={content.imageUrl} 
            alt={content.imageAlt || content.title}
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      {/* 메인 콘텐츠 */}
      {content.content && (
        <div className="mb-8">
          <div 
            className="text-gray-300 text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
        </div>
      )}

      {/* 하위 아이템들 */}
      {content.items && content.items.length > 0 && (
        <div className="space-y-8">
          {content.items.map((item) => (
            <div key={item.id} className="border-b border-gray-700 pb-8">
              <h3 className="text-lg font-bold text-white mb-4">
                {item.title}
              </h3>
              {item.subtitle && (
                <h4 className="text-base font-semibold text-gray-300 mb-3">
                  {item.subtitle}
                </h4>
              )}
              {item.description && (
                <p className="text-gray-300 text-base leading-relaxed mb-4">
                  {item.description}
                </p>
              )}
              {item.imageUrl && (
                <div className="mb-4">
                  <img 
                    src={item.imageUrl} 
                    alt={item.imageAlt || item.title}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              )}
              {item.htmlContent && (
                <div 
                  className="text-gray-300 text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.htmlContent }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 개설 과목 전용 콘텐츠 컴포넌트
function SubjectsContent({ content }: { content: AboutContent }) {
  // 영역과 과목을 type 필드로 분리
  const areas = content.items?.filter(item => item.type === 'area') || []
  const subjects = content.items?.filter(item => item.type === 'subject') || []

  return (
    <div className="prose prose-lg max-w-none text-white">
      {/* 메인 타이틀 */}
      <div className="mb-12">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
          {content.title || 'GCS 개설과목'}
        </h2>
        <div className="w-24 h-1 bg-[#f57520]"></div>
      </div>

      {/* 메인 이미지 */}
      {content.imageUrl && (
        <div className="mb-12">
          <img 
            src={content.imageUrl} 
            alt={content.imageAlt || content.title}
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      {/* 영역 섹션 - CSS Grid 동적 컬럼 구조 */}
      {areas.length > 0 && (
        <div className="mb-12">
          <h3 className="text-lg font-bold text-white mb-6">영역</h3>
          <div className={`grid gap-8 ${
            areas.length === 1 ? 'grid-cols-1' :
            areas.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
            areas.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
            areas.length === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {areas.map((area, index) => (
              <div key={area.id || index} className="flex flex-col">
                {/* 영역 제목 - 한글과 영문을 한 줄에 */}
                <div className="mb-3">
                  <h4 className="text-lg font-bold text-white">
                    {area.title}
                    {area.subtitle && (
                      <span className="text-lg font-bold text-white ml-2">{area.subtitle}</span>
                    )}
                  </h4>
                </div>
                
                {/* 구분선 - 흰색 */}
                <div className="w-full h-0.5 bg-white mb-4"></div>
                
                {/* 영역 설명 - 콤마로 구분된 학문들을 개행하여 표시 */}
                {area.description && (
                  <div className="flex-1">
                    <div className="text-gray-300 text-sm leading-relaxed">
                      {area.description?.split(',').map((subject, subjectIndex) => (
                        <div key={subjectIndex}>
                          {subject.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 과목 섹션 - 박스 형태로 렌더링 */}
      {subjects.length > 0 && (
        <div className="mt-16">
          <h3 className="text-lg font-bold text-white mb-8">과목</h3>
          <div className="space-y-4">
            {subjects.map((subject, index) => (
              <div key={subject.id || index} className="border border-white w-full">
                {/* 상단 영역 - 흰색 배경, 과목 코드와 과목명 */}
                <div className="bg-white px-4 py-2">
                  <div className="flex items-center space-x-4">
                    <h4 className="text-base text-black">
                      {subject.subtitle} {/* 과목 코드 */}
                    </h4>
                    <span className="text-base text-black">
                      {subject.title} {/* 과목명 */}
                    </span>
                  </div>
                </div>
                
                {/* 하단 영역 - 검은색 배경, 과목 설명 */}
                {subject.htmlContent && (
                  <div className="bg-black p-4">
                    <div
                      className="text-white text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: subject.htmlContent }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getDefaultTitle(activeTab: string): string {
  const titles = {
    'gcsweb': 'GCS:Web',
    'intro': '그래픽커뮤니케이션사이언스',
    'lectures': '개설 과목',
    'professor': '교수진'
  }
  return titles[activeTab as keyof typeof titles] || 'About'
}