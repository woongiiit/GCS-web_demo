'use client'

import Link from 'next/link'

export default function GCSWebPage() {
  return (
    <div className="fixed inset-0 bg-black overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-black px-4 py-6 sm:px-0">
        <div className="max-w-6xl mx-auto pt-24">
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
                <Link href="/about/gcsweb" className="text-black px-2 py-1 md:px-3 md:py-2 pb-1 border-b-2 border-black font-medium text-sm md:text-base">
                  GCS:Web
                </Link>
                <Link href="/about/intro" className="text-black hover:text-gray-600 transition-colors font-medium px-2 py-1 md:px-3 md:py-2 rounded-md hover:bg-gray-100 text-sm md:text-base">
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
            
            <h2 className="text-2xl font-semibold text-white mb-6">GCS:Web</h2>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">
              GCS:Web은 그래픽 커뮤니케이션 과학의 웹 기술 분야를 다루는 핵심 프로그램입니다.
              현대 웹 디자인과 개발 기술을 통합하여 사용자 중심의 디지털 경험을 창조합니다.
            </p>
            
            <h3 className="text-xl font-semibold text-white mb-4">주요 특징</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-3 mb-8 text-lg">
              <li>반응형 웹 디자인과 사용자 경험(UX/UI) 최적화</li>
              <li>현대적인 프론트엔드 기술 스택 활용</li>
              <li>그래픽 디자인과 웹 개발의 융합 교육</li>
              <li>실무 프로젝트 기반 학습</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-white mb-4">기술 스택</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">프론트엔드</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• HTML5, CSS3, JavaScript (ES6+)</li>
                  <li>• React, Vue.js, Next.js</li>
                  <li>• Tailwind CSS, Styled Components</li>
                  <li>• TypeScript</li>
                </ul>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">디자인 도구</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• Figma, Adobe Creative Suite</li>
                  <li>• Sketch, Principle</li>
                  <li>• Prototyping Tools</li>
                  <li>• 디자인 시스템 구축</li>
                </ul>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-4">프로젝트 예시</h3>
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h4 className="text-white font-semibold mb-3">포트폴리오 웹사이트</h4>
              <p className="text-gray-300 mb-3">
                학생들의 창작 작품을 전시할 수 있는 개인 포트폴리오 웹사이트를 제작합니다.
                반응형 디자인과 인터랙티브 요소를 활용하여 창의적인 표현을 구현합니다.
              </p>
              <h4 className="text-white font-semibold mb-3">브랜드 웹사이트</h4>
              <p className="text-gray-300">
                실제 브랜드의 아이덴티티를 반영한 웹사이트를 기획하고 제작합니다.
                사용자 경험을 고려한 정보 아키텍처와 시각적 디자인을 통합합니다.
              </p>
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-6">연락처</h2>
            <p className="text-gray-300 text-lg mb-8">
              GCS:Web 프로그램에 대한 자세한 정보가 필요하시다면 언제든지 문의해 주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
