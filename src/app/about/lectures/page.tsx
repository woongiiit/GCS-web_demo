'use client'

import Link from 'next/link'

export default function LecturesPage() {
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
                <Link href="/about/gcsweb" className="text-black hover:text-gray-600 transition-colors font-medium px-2 py-1 md:px-3 md:py-2 rounded-md hover:bg-gray-100 text-sm md:text-base">
                  GCS:Web
                </Link>
                <Link href="/about/intro" className="text-black hover:text-gray-600 transition-colors font-medium px-2 py-1 md:px-3 md:py-2 rounded-md hover:bg-gray-100 text-sm md:text-base">
                  전공 소개
                </Link>
                <Link href="/about/lectures" className="text-black px-2 py-1 md:px-3 md:py-2 pb-1 border-b-2 border-black font-medium text-sm md:text-base">
                  개설 과목
                </Link>
                <Link href="/about/professor" className="text-black hover:text-gray-600 transition-colors font-medium px-2 py-1 md:px-3 md:py-2 rounded-md hover:bg-gray-100 text-sm md:text-base">
                  교수진
                </Link>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-6">개설 과목</h2>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">
              GCS 연계전공은 그래픽 디자인과 커뮤니케이션 기술을 체계적으로 학습할 수 있는 
              다양한 과목들을 제공합니다. 이론과 실무를 균형있게 구성하여 
              실무 현장에서 바로 활용할 수 있는 역량을 기릅니다.
            </p>
            
            <h3 className="text-xl font-semibold text-white mb-4">기초 과목</h3>
            <div className="space-y-4 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold text-lg mb-2">그래픽 디자인 기초</h4>
                <p className="text-gray-300 mb-3">
                  디자인의 기본 원리와 요소를 학습하고, 시각적 커뮤니케이션의 기초를 다집니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">디자인 원리</span>
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">색채 이론</span>
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">레이아웃</span>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold text-lg mb-2">디지털 커뮤니케이션 개론</h4>
                <p className="text-gray-300 mb-3">
                  디지털 시대의 커뮤니케이션 변화와 트렌드를 이해하고, 
                  새로운 미디어 환경에 적응하는 방법을 학습합니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">미디어 이론</span>
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">디지털 트렌드</span>
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">사용자 행동</span>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-4">심화 과목</h3>
            <div className="space-y-4 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold text-lg mb-2">웹 디자인과 개발</h4>
                <p className="text-gray-300 mb-3">
                  현대적인 웹 디자인 원칙과 개발 기술을 학습하여 
                  사용자 중심의 웹사이트를 기획하고 제작합니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">HTML/CSS</span>
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">JavaScript</span>
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">반응형 디자인</span>
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">UX/UI</span>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold text-lg mb-2">브랜드 아이덴티티 디자인</h4>
                <p className="text-gray-300 mb-3">
                  브랜드의 핵심 가치를 시각적으로 표현하는 방법을 학습하고, 
                  통합적인 브랜드 경험을 설계합니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">로고 디자인</span>
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">브랜드 시스템</span>
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">타이포그래피</span>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold text-lg mb-2">인터랙션 디자인</h4>
                <p className="text-gray-300 mb-3">
                  사용자와 디지털 제품 간의 상호작용을 설계하고, 
                  직관적이고 효율적인 인터페이스를 개발합니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">프로토타이핑</span>
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">사용성 테스트</span>
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">정보 아키텍처</span>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-4">실무 프로젝트</h3>
            <div className="space-y-4 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold text-lg mb-2">캡스톤 프로젝트</h4>
                <p className="text-gray-300 mb-3">
                  전공에서 습득한 모든 지식과 기술을 종합하여 실제 문제를 해결하는 
                  통합 프로젝트를 진행합니다.
                </p>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• 기획부터 구현까지 전 과정 참여</li>
                  <li>• 팀워크와 프로젝트 관리 경험</li>
                  <li>• 포트폴리오 제작 및 발표</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold text-lg mb-2">산학협력 프로젝트</h4>
                <p className="text-gray-300 mb-3">
                  실제 기업이나 기관과 연계하여 실무 프로젝트를 진행하며, 
                  현장 경험을 쌓고 네트워킹 기회를 제공합니다.
                </p>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• 클라이언트와의 직접 소통</li>
                  <li>• 실무 요구사항 이해와 적용</li>
                  <li>• 프로젝트 결과물의 실제 활용</li>
                </ul>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-4">수강 가이드</h3>
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">권장 수강 순서</h4>
                  <ol className="text-gray-300 space-y-2 text-sm">
                    <li>1. 그래픽 디자인 기초</li>
                    <li>2. 디지털 커뮤니케이션 개론</li>
                    <li>3. 웹 디자인과 개발</li>
                    <li>4. 브랜드 아이덴티티 디자인</li>
                    <li>5. 인터랙션 디자인</li>
                    <li>6. 캡스톤 프로젝트</li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-3">수강 조건</h4>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• 동국대학교 재학생</li>
                    <li>• 연계전공 신청 필수</li>
                    <li>• 기본적인 컴퓨터 활용 능력</li>
                    <li>• 디자인에 대한 관심과 열정</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-6">연락처</h2>
            <p className="text-gray-300 text-lg mb-8">
              개설 과목에 대한 자세한 정보나 수강 신청 문의가 있으시다면 언제든지 연락해 주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
