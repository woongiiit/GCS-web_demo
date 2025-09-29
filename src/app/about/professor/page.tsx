'use client'

import Link from 'next/link'

export default function ProfessorPage() {
  return (
    <div className="fixed inset-0 bg-black overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-black px-4 py-6 sm:px-0">
        <div className="max-w-6xl mx-auto pt-24">
          <Link href="/about">
            <h1 className="text-4xl font-bold text-white mb-8 text-center hover:text-gray-300 transition-colors cursor-pointer">About GCS</h1>
          </Link>
          
          <div className="prose prose-lg max-w-none text-white">
            <p className="text-gray-300 mb-8 text-lg leading-relaxed text-center">
              GCS (Graphic Communication Science)는 동국대학교 연계전공으로, 
              그래픽 디자인과 커뮤니케이션 기술을 융합한 혁신적인 전공입니다.
            </p>
            
            {/* 서브 메뉴 배너 */}
            <div className="bg-gray-600 rounded-lg p-4 mb-8">
              <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                <Link href="/about/gcsweb" className="text-gray-300 hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-gray-700">
                  GCS:Web
                </Link>
                <Link href="/about/intro" className="text-gray-300 hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-gray-700">
                  전공 소개
                </Link>
                <Link href="/about/lectures" className="text-gray-300 hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-gray-700">
                  개설 과목
                </Link>
                <Link href="/about/professor" className="text-white bg-gray-800 transition-colors font-medium px-3 py-2 rounded-md">
                  교수진
                </Link>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-6">교수진</h2>
          </div>
          
          <div className="space-y-12 mb-8">
            {/* 김교수 섹션 */}
            <div className="flex flex-col lg:flex-row gap-8 pb-8 border-b border-white">
              {/* 좌측: 설명 */}
              <div className="flex-1">
                <h3 className="text-white font-semibold text-2xl mb-4">김교수</h3>
                <p className="text-gray-300 text-lg mb-4">
                  그래픽 디자인과 시각 커뮤니케이션 전문가로서 15년간의 교육 경험을 가지고 있습니다.
                </p>
                <div className="text-gray-300 space-y-3">
                  <p><span className="text-white font-medium">전공 분야:</span> 그래픽 디자인, 시각 커뮤니케이션, 브랜드 디자인</p>
                  <p><span className="text-white font-medium">연구 분야:</span> 타이포그래피, 색채 이론, 디자인 시스템</p>
                  <p><span className="text-white font-medium">주요 과목:</span> 그래픽 디자인 기초, 브랜드 아이덴티티 디자인, 시각 커뮤니케이션 이론</p>
                  <p><span className="text-white font-medium">학위:</span> 서울대학교 미술대학 시각디자인과 박사</p>
                </div>
              </div>
              
              {/* 우측: 사진 */}
              <div className="lg:w-80 text-center">
                <div className="w-48 h-48 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-700">
                  <img 
                    src="/images/professor1.png" 
                    alt="김교수" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm" style={{display: 'none'}}>
                    김교수
                  </div>
                </div>
                <h3 className="text-white font-semibold text-xl">김교수</h3>
              </div>
            </div>
            
            {/* 이교수 섹션 */}
            <div className="flex flex-col lg:flex-row gap-8 pb-8 border-b border-white">
              {/* 좌측: 설명 */}
              <div className="flex-1">
                <h3 className="text-white font-semibold text-2xl mb-4">이교수</h3>
                <p className="text-gray-300 text-lg mb-4">
                  디지털 미디어와 인터랙션 디자인 전문가로 사용자 중심의 디자인을 추구합니다.
                </p>
                <div className="text-gray-300 space-y-3">
                  <p><span className="text-white font-medium">전공 분야:</span> 디지털 미디어, 인터랙션 디자인, 사용자 경험 디자인</p>
                  <p><span className="text-white font-medium">연구 분야:</span> HCI, 모바일 인터페이스, 가상현실 디자인</p>
                  <p><span className="text-white font-medium">주요 과목:</span> 인터랙션 디자인, UX/UI 디자인, 디지털 미디어 프로젝트</p>
                  <p><span className="text-white font-medium">학위:</span> 카이스트 컴퓨터공학과 박사</p>
                </div>
              </div>
              
              {/* 우측: 사진 */}
              <div className="lg:w-80 text-center">
                <div className="w-48 h-48 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-700">
                  <img 
                    src="/images/professor2.png" 
                    alt="이교수" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm" style={{display: 'none'}}>
                    이교수
                  </div>
                </div>
                <h3 className="text-white font-semibold text-xl">이교수</h3>
              </div>
            </div>
            
            {/* 박교수 섹션 */}
            <div className="flex flex-col lg:flex-row gap-8 pb-8">
              {/* 좌측: 설명 */}
              <div className="flex-1">
                <h3 className="text-white font-semibold text-2xl mb-4">박교수</h3>
                <p className="text-gray-300 text-lg mb-4">
                  웹 기술과 사용자 경험 디자인 전문가로 현대적인 웹 애플리케이션 개발을 지도합니다.
                </p>
                <div className="text-gray-300 space-y-3">
                  <p><span className="text-white font-medium">전공 분야:</span> 웹 개발, 프론트엔드 기술, UI/UX 디자인</p>
                  <p><span className="text-white font-medium">연구 분야:</span> React, Vue.js, 웹 접근성, 반응형 웹 디자인</p>
                  <p><span className="text-white font-medium">주요 과목:</span> 웹 프로그래밍, 프론트엔드 개발, 웹 디자인 프로젝트</p>
                  <p><span className="text-white font-medium">학위:</span> 연세대학교 컴퓨터과학과 박사</p>
                </div>
              </div>
              
              {/* 우측: 사진 */}
              <div className="lg:w-80 text-center">
                <div className="w-48 h-48 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-700">
                  <img 
                    src="/images/professor3.png" 
                    alt="박교수" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm" style={{display: 'none'}}>
                    박교수
                  </div>
                </div>
                <h3 className="text-white font-semibold text-xl">박교수</h3>
              </div>
            </div>
          </div>
          
          {/* 교수진 소개 */}
          <div className="bg-gray-800 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">교수진 소개</h2>
            <p className="text-gray-300 text-lg leading-relaxed text-center">
              GCS 전공의 교수진은 그래픽 디자인, 디지털 미디어, 웹 기술 분야의 전문가들로 구성되어 있습니다. 
              각 교수님들은 이론과 실무를 겸비한 교육을 통해 학생들이 창의적이고 혁신적인 디자이너로 성장할 수 있도록 지도하고 있습니다.
            </p>
          </div>
          
          {/* 연락처 */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-6">연락처</h2>
            <p className="text-gray-300 text-lg mb-8">
              교수진과의 상담이나 문의사항이 있으시면 언제든지 연락해 주세요.
            </p>
            <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-white font-medium mb-2">GCS 전공 사무실</p>
              <p className="text-gray-300">이메일: gcs@dongguk.edu</p>
              <p className="text-gray-300">전화: 02-2260-XXXX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
