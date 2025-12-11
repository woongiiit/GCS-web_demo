'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import AboutTermsModal from '@/components/AboutTermsModal'

interface AboutContent {
  id: string
  section: string
  title?: string
  content?: string
  description?: string  // 한글 소개글
  subtitle?: string     // 영어 소개글
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
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

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
    <div className="fixed inset-0 bg-[#f8f6f4] overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-[#f8f6f4]">
        {/* 배너 영역 - 그라데이션 배경 */}
        <div className="relative h-[191px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-[rgba(255,178,114,0.6)] to-[#fd6f22]"></div>
          <div className="relative h-full flex flex-col items-start justify-end px-[19px] pb-[49px]">
            <h1 className="text-[44px] font-bold text-white mb-0" style={{ fontFamily: 'Paperlogy, sans-serif' }}>
              About GCS
            </h1>
            <p className="text-[15px] text-white">연계전공 GCS 및 사이트 소개</p>
          </div>
        </div>

        {/* 서브 메뉴 띠 */}
        <div className="bg-[#f8f6f4] border-b border-[#1a1918]">
          <div className="max-w-full mx-auto px-5">
            <div className="flex justify-between items-center h-[59px] py-3">
              <button
                onClick={() => setActiveTab('gcsweb')}
                className={`h-[43px] px-1 font-bold text-[13px] leading-[1.5] tracking-[-0.26px] transition-colors whitespace-nowrap ${
                  activeTab === 'gcsweb'
                    ? 'text-[#1a1918] border-b-2 border-[#1a1918]'
                    : 'text-[#b7b3af]'
                }`}
              >
                사이트 소개
              </button>
              <button
                onClick={() => setActiveTab('intro')}
                className={`h-[43px] px-1 font-bold text-[13px] leading-[1.5] tracking-[-0.26px] transition-colors whitespace-nowrap ${
                  activeTab === 'intro'
                    ? 'text-[#1a1918] border-b-2 border-[#1a1918]'
                    : 'text-[#b7b3af]'
                }`}
              >
                전공 소개
              </button>
              <button
                onClick={() => setActiveTab('lectures')}
                className={`h-[43px] px-1 font-bold text-[13px] leading-[1.5] tracking-[-0.26px] transition-colors whitespace-nowrap ${
                  activeTab === 'lectures'
                    ? 'text-[#1a1918] border-b-2 border-[#1a1918]'
                    : 'text-[#b7b3af]'
                }`}
              >
                커리큘럼
              </button>
              <button
                onClick={() => setActiveTab('professor')}
                className={`h-[43px] px-1 font-bold text-[13px] leading-[1.5] tracking-[-0.26px] transition-colors whitespace-nowrap ${
                  activeTab === 'professor'
                    ? 'text-[#1a1918] border-b-2 border-[#1a1918]'
                    : 'text-[#b7b3af]'
                }`}
              >
                교수진 소개
              </button>
            </div>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="bg-[#f8f6f4] min-h-screen">
          <div className="max-w-full mx-auto">
            <DynamicContent 
              activeTab={activeTab} 
              content={getCurrentContent()} 
            />
          </div>
        </div>

        {/* 하단 Footer */}
        <div className="bg-[#f8f6f4]">
          <div className="h-[34px] bg-[#f8f6f4]"></div>
          <div className="bg-[#f8f6f4] px-[21px] py-[21px]">
            <div className="flex flex-col gap-[45px] max-w-[263px]">
              {/* 고객지원 */}
              <div className="flex flex-col gap-2">
                <p className="text-[17px] font-bold text-[#443e3c] leading-[1.5]">고객지원</p>
                <div className="flex flex-col gap-3 text-[13px] leading-[1.5] text-[#85817e] tracking-[-0.26px]">
                  <p className="whitespace-pre-wrap">
                    <span className="font-bold">전화</span>: 010-5238-0236
                  </p>
                  <p>
                    <span className="font-bold">이메일</span>: gcsweb01234@gmail.com
                  </p>
                  <p className="whitespace-pre-wrap">
                    <span className="font-bold">주소</span>: 서울특별시 강북구 솔샘로 174 136동 304호
                  </p>
                </div>
              </div>
              
              {/* 사업자 정보 */}
              <div className="flex flex-col gap-2">
                <p className="text-[17px] font-bold text-[#443e3c] leading-[1.5]">사업자 정보</p>
                <div className="flex flex-col gap-3 text-[13px] leading-[1.5] text-[#85817e] tracking-[-0.26px]">
                  <div className="flex gap-10 whitespace-nowrap">
                    <p>
                      <span className="font-bold">대표</span>: 안성은
                    </p>
                    <p>
                      <span className="font-bold">회사명</span>: 안북스 스튜디오
                    </p>
                  </div>
                  <p className="whitespace-pre-wrap">
                    <span className="font-bold">사업자등록번호</span>: 693-01-03164
                  </p>
                  <p className="whitespace-pre-wrap">
                    <span className="font-bold">통신판매업신고번호</span>: 제 2025-서울강북-0961호
                  </p>
                </div>
              </div>
              
              {/* 로고 및 저작권 */}
              <div className="flex flex-col gap-2">
                <div className="h-[21px] w-[59px] relative">
                  {/* 로고는 나중에 이미지로 교체 가능 */}
                  <p className="text-[10px] font-bold text-[#1a1918]">GCS:Web</p>
                </div>
                <div className="flex flex-col text-[8px] text-[#443e3c] leading-[1.5]">
                  <p className="whitespace-pre-wrap">© 2025 GCS:Web. All rights reserved.</p>
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      setIsTermsModalOpen(true)
                    }}
                    className="underline whitespace-pre-wrap text-left"
                  >
                    이용약관
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[34px] bg-[#f8f6f4]"></div>
        </div>
      </div>
      
      {/* 이용약관 모달 */}
      <AboutTermsModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
      />
    </div>
  )
}

// 동적 콘텐츠 컴포넌트
function DynamicContent({ activeTab, content }: { activeTab: string, content?: AboutContent }) {
  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-[#85817e]">콘텐츠가 없습니다.</p>
        <p className="text-[#85817e] text-sm mt-2">관리자 페이지에서 콘텐츠를 추가해주세요.</p>
      </div>
    )
  }

  // GCS:Web 탭의 경우 특별한 렌더링
  if (activeTab === 'gcsweb') {
    return <GCSWebContent content={content} />
  }

  // 전공 소개 탭의 경우 특별한 렌더링
  if (activeTab === 'intro') {
    return <MajorIntroContent content={content} />
  }

  // 교수진 탭의 경우 특별한 렌더링
  if (activeTab === 'professor' && content.items && content.items.length > 0) {
    return <ProfessorsContent content={content} />
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

      {/* 메인 이미지 - 전공 소개에서는 표시하지 않음 */}
      {activeTab !== 'intro' && content.imageUrl && (
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

// GCS:Web 전용 콘텐츠 컴포넌트
function GCSWebContent({ content }: { content: AboutContent }) {
  // items에서 이미지들 필터링 (최대 4개)
  const images = (content.items?.filter(item => item.imageUrl) || []).slice(0, 4)
  
  return (
    <div className="flex flex-col items-center py-8 px-4">
      {/* 이미지 갤러리 - 4개 가로 배치 */}
      {images.length > 0 && (
        <div className="mb-8 flex gap-3 justify-center flex-wrap">
          {images.map((image, index) => (
            <div key={image.id || index} className="w-[110px] h-[110px] rounded-[4px] overflow-hidden relative">
              <img 
                src={image.imageUrl}
                alt={image.title || `Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* 한글 소개글 */}
      {content.description && (
        <div className="mb-11 px-4 max-w-[343px]">
          <div 
            className="text-[#1a1918] text-[12px] leading-[1.5] font-medium"
            style={{ fontFamily: 'Inter, Noto Sans KR, sans-serif' }}
            dangerouslySetInnerHTML={{ __html: content.description }}
          />
        </div>
      )}

      {/* 영어 소개글 */}
      {content.subtitle && (
        <div className="px-4 max-w-[343px]">
          <div 
            className="text-[#1a1918] text-[13px] leading-[1.5] tracking-[-0.26px]"
            style={{ fontFamily: 'Pretendard, sans-serif' }}
            dangerouslySetInnerHTML={{ __html: content.subtitle }}
          />
        </div>
      )}
    </div>
  )
}

// 전공 소개 전용 콘텐츠 컴포넌트
function MajorIntroContent({ content }: { content: AboutContent }) {
  // items에서 이미지들 필터링 (최대 2개)
  const images = (content.items?.filter(item => item.imageUrl) || []).slice(0, 2)
  
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-[343px] flex flex-col gap-6">
        {/* 제목과 설명 */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col">
            <p className="text-[15px] font-bold text-[#443e3c] leading-[1.5] mb-0">
              {content.title || '그래픽커뮤니케이션사이언스'}
            </p>
            <p className="text-[15px] font-bold text-[#443e3c] leading-[1.5]">
              Graphic Communication Science (GCS)
            </p>
          </div>
          
          {/* 설명 */}
          {(content.content || content.description) && (
            <div className="text-[13px] leading-[1.5] tracking-[-0.26px] text-[#443e3c] whitespace-pre-wrap">
              {content.content ? (
                <div dangerouslySetInnerHTML={{ __html: content.content }} />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: content.description || '' }} />
              )}
            </div>
          )}
        </div>

        {/* 이미지 2개 - 좌우 교차 배치 */}
        {images.length > 0 && (
          <div className="flex flex-col gap-3">
            {images.map((image, index) => (
              <div 
                key={image.id || index} 
                className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div className="w-[110px] h-[110px] rounded-[4px] overflow-hidden relative">
                  <img 
                    src={image.imageUrl}
                    alt={image.title || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 교수진 전용 콘텐츠 컴포넌트
function ProfessorsContent({ content }: { content: AboutContent }) {
  // 교수진 카드들
  const professors = content.items?.filter(item => item.imageUrl || item.title) || []
  
  return (
    <div className="flex flex-col items-start py-8 px-0">
      {/* 타이틀 */}
      <div className="px-4 mb-0">
        <p className="text-[15px] font-bold text-[#1a1918] leading-[1.5]">교수진</p>
      </div>

      {/* 교수진 카드들 */}
      {professors.length > 0 && (
        <div className="flex flex-col gap-[22px] px-5 py-4 w-full">
          {professors.map((professor, index) => {
            const isEven = index % 2 === 0
            return (
              <div 
                key={professor.id || index} 
                className={`flex flex-col ${isEven ? 'items-end' : 'items-start'}`}
              >
                <div className="bg-[#eeebe6] rounded-[8px] p-4 w-[300px]">
                  <div className="flex gap-3 items-center">
                    {/* 텍스트 영역 */}
                    <div className="flex flex-col gap-[6px] w-[175px]">
                      <p className="text-[17px] font-bold text-[#1a1918] leading-[1.5] h-[19px]">
                        {professor.title || ''}
                      </p>
                      <div className="text-[10px] leading-[1.5] text-[#1a1918] whitespace-pre-wrap">
                        {professor.htmlContent ? (
                          <div dangerouslySetInnerHTML={{ __html: professor.htmlContent }} />
                        ) : (
                          <p>{professor.description || ''}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* 이미지 영역 */}
                    {professor.imageUrl && (
                      <div className="w-[80px] h-[95px] rounded-[4px] overflow-hidden flex-shrink-0">
                        <img 
                          src={professor.imageUrl} 
                          alt={professor.title || '교수 사진'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// 개설 과목 전용 콘텐츠 컴포넌트
function SubjectsContent({ content }: { content: AboutContent }) {
  // 과목만 필터링 (type이 'subject'인 것들)
  const subjects = content.items?.filter(item => item.type === 'subject') || []

  return (
    <div className="flex items-center justify-center py-11 px-0">
      <div className="flex flex-col gap-6 items-end max-w-[343px]">
        {subjects.map((subject, index) => (
          <div key={subject.id || index} className="w-full">
            {/* 상단 - 흰색 배경, 과목 코드와 과목명 */}
            <div className="bg-white border-[0.5px] border-[#ffd2a9] border-solid rounded-t-[4px] px-3 py-1">
              <div className="flex gap-3 items-center">
                <p className="text-[13px] leading-[1.5] text-[#85817e] tracking-[-0.26px]">
                  {subject.subtitle || ''}
                </p>
                <p className="text-[13px] leading-[1.5] text-[#85817e] tracking-[-0.26px]">
                  {subject.title || ''}
                </p>
              </div>
            </div>
            
            {/* 하단 - 회색 배경, 과목 설명 */}
            <div className="bg-[#eeebe6] border-[0.5px] border-white border-solid rounded-b-[4px] p-[10px]">
              <div className="text-[10px] leading-[1.5] text-[#1a1918] whitespace-pre-wrap">
                {subject.htmlContent ? (
                  <div dangerouslySetInnerHTML={{ __html: subject.htmlContent }} />
                ) : (
                  <p>{subject.description || ''}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
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