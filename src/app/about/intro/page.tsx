'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface AboutContentItem {
  id?: string
  title?: string
  subtitle?: string
  description?: string
  htmlContent?: string
  imageUrl?: string
  imageAlt?: string
  order: number
  type?: string
}

export default function IntroPage() {
  const [content, setContent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/about')
      const data = await response.json()
      
      if (data.success && data.data.MAJOR_INTRO) {
        console.log('전공소개 데이터:', data.data.MAJOR_INTRO)
        console.log('subtitle 값:', data.data.MAJOR_INTRO.subtitle)
        setContent(data.data.MAJOR_INTRO)
      }
    } catch (error) {
      console.error('콘텐츠 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black overflow-auto flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-black px-4 py-6 sm:px-0">
        <div className="max-w-6xl mx-auto pt-32">
          <Link href="/about">
            <h1 className="text-4xl font-bold text-white mb-8 text-center hover:text-gray-300 transition-colors cursor-pointer">About GCS</h1>
          </Link>
          
          <div className="prose prose-lg max-w-none text-white">
            <p className="text-gray-300 mb-6 text-lg leading-relaxed text-center">
              GCS 연계 전공을 소개하는 공간입니다.
            </p>
            
            {/* 홈 아이콘 */}
            <Link href="/" className="flex justify-center mb-8">
              <div className="w-6 h-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
            </Link>
            
            {/* 서브 메뉴 배너 */}
            <div className="bg-white rounded-lg p-4 mb-8">
              <div className="flex flex-wrap justify-center gap-2 md:gap-8">
                <Link href="/about/gcsweb" className="text-black hover:text-gray-600 transition-colors font-medium px-2 py-1 md:px-3 md:py-2 rounded-md hover:bg-gray-100 text-sm md:text-base">
                  GCS:Web
                </Link>
                <Link href="/about/intro" className="text-black px-2 py-1 md:px-3 md:py-2 pb-1 border-b-2 border-black font-medium text-sm md:text-base">
                  전공 소개
                </Link>
                <Link href="/about/lectures" className="text-black hover:text-gray-600 transition-colors font-medium px-2 py-1 md:px-3 md:py-2 rounded-md hover:bg-gray-100 text-sm md:text-base">
                  개설 과목
                </Link>
                <Link href="/about/professor" className="text-black hover:text-gray-600 transition-colors font-medium px-2 py-1 md:px-3 md:py-2 rounded-md hover:bg-gray-100 text-sm md:text-base">
                  교수진
                </Link>
              </div>
            </div>
            
            {/* 콘텐츠 표시 */}
            {content ? (
              <>
                {/* 다중 이미지 표시 */}
                {content?.items && content.items.filter((item: AboutContentItem) => item.imageUrl).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {content.items.filter((item: AboutContentItem) => item.imageUrl).map((item: AboutContentItem, index: number) => (
                      <div key={item.id || index}>
                        <img 
                          src={item.imageUrl}
                          alt={item.title || content.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <h2 className="text-2xl font-semibold text-white mb-4">{content.title}</h2>
                
                {content.subtitle && (
                  <p className="text-gray-300 text-lg mb-8 leading-relaxed font-medium italic">
                    {content.subtitle}
                  </p>
                )}
                
                {content.content && (
                  <div 
                    className="text-gray-300 text-lg mb-8 leading-relaxed prose prose-lg max-w-none prose-invert"
                    dangerouslySetInnerHTML={{ __html: content.content }}
                  />
                )}
                
                {!content.content && (
                  <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                    GCS(Graphic Communication Science) 연계전공은 동국대학교의 혁신적인 교육 프로그램으로,
                    그래픽 디자인과 커뮤니케이션 기술을 융합하여 디지털 시대의 창의적 인재를 양성합니다.
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-white mb-6">전공 소개</h2>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                  GCS(Graphic Communication Science) 연계전공은 동국대학교의 혁신적인 교육 프로그램으로,
                  그래픽 디자인과 커뮤니케이션 기술을 융합하여 디지털 시대의 창의적 인재를 양성합니다.
                </p>
              </>
            )}
            
            <h3 className="text-xl font-semibold text-white mb-4">교육 목표</h3>
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <ul className="text-gray-300 space-y-4 text-lg">
                <li className="flex items-start">
                  <span className="text-white font-semibold mr-3">•</span>
                  <span>창의적 사고와 디자인 감각을 갖춘 그래픽 디자이너 양성</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white font-semibold mr-3">•</span>
                  <span>디지털 기술과 커뮤니케이션 이론을 통합적으로 이해하는 전문가 양성</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white font-semibold mr-3">•</span>
                  <span>실무 중심의 프로젝트를 통해 현장 적응력 강화</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white font-semibold mr-3">•</span>
                  <span>글로벌 트렌드를 반영한 혁신적 커뮤니케이션 솔루션 개발</span>
                </li>
              </ul>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-4">핵심 역량</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">디자인 역량</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• 시각적 커뮤니케이션 디자인</li>
                  <li>• 브랜드 아이덴티티 개발</li>
                  <li>• 타이포그래피와 레이아웃</li>
                  <li>• 색채 이론과 활용</li>
                </ul>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">기술 역량</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• 웹 디자인과 개발</li>
                  <li>• 디지털 미디어 제작</li>
                  <li>• 인터랙션 디자인</li>
                  <li>• 사용자 경험(UX) 설계</li>
                </ul>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-4">전공 특징</h3>
            <div className="space-y-6 mb-8">
              <div className="border-l-4 border-white pl-6">
                <h4 className="text-white font-semibold mb-2">융합 교육</h4>
                <p className="text-gray-300">
                  인문학적 사고와 기술적 실무를 결합하여 종합적 문제 해결 능력을 기릅니다.
                </p>
              </div>
              <div className="border-l-4 border-white pl-6">
                <h4 className="text-white font-semibold mb-2">실무 중심</h4>
                <p className="text-gray-300">
                  실제 프로젝트와 산업체 연계를 통한 현장 경험을 제공합니다.
                </p>
              </div>
              <div className="border-l-4 border-white pl-6">
                <h4 className="text-white font-semibold mb-2">창의적 사고</h4>
                <p className="text-gray-300">
                  디자인 씽킹과 프로토타이핑을 통한 혁신적 아이디어 구현 능력을 개발합니다.
                </p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-4">진로 방향</h3>
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h4 className="text-white font-semibold mb-2">디자인 분야</h4>
                  <p className="text-gray-300 text-sm">그래픽 디자이너, 브랜드 디자이너, UI/UX 디자이너</p>
                </div>
                <div className="text-center">
                  <h4 className="text-white font-semibold mb-2">개발 분야</h4>
                  <p className="text-gray-300 text-sm">프론트엔드 개발자, 웹 개발자, 디지털 마케터</p>
                </div>
                <div className="text-center">
                  <h4 className="text-white font-semibold mb-2">기획 분야</h4>
                  <p className="text-gray-300 text-sm">콘텐츠 기획자, 프로덕트 매니저, 커뮤니케이션 전문가</p>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-6">연락처</h2>
            <p className="text-gray-300 text-lg mb-8">
              GCS 전공에 대한 자세한 정보나 상담이 필요하시다면 언제든지 문의해 주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
