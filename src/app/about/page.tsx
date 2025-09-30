'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'gcsweb' | 'intro' | 'lectures' | 'professor'>('gcsweb')

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
                <button
                  onClick={() => setActiveTab('gcsweb')}
                  className={`pb-2 border-b-2 font-medium transition-colors px-2 py-1 md:px-3 md:py-2 text-sm md:text-base ${
                    activeTab === 'gcsweb'
                      ? 'text-black border-black'
                      : 'text-black border-transparent hover:text-gray-600 hover:border-gray-300'
                  }`}
                >
                  GCS:Web
                </button>
                <button
                  onClick={() => setActiveTab('intro')}
                  className={`pb-2 border-b-2 font-medium transition-colors px-2 py-1 md:px-3 md:py-2 text-sm md:text-base ${
                    activeTab === 'intro'
                      ? 'text-black border-black'
                      : 'text-black border-transparent hover:text-gray-600 hover:border-gray-300'
                  }`}
                >
                  전공 소개
                </button>
                <button
                  onClick={() => setActiveTab('lectures')}
                  className={`pb-2 border-b-2 font-medium transition-colors px-2 py-1 md:px-3 md:py-2 text-sm md:text-base ${
                    activeTab === 'lectures'
                      ? 'text-black border-black'
                      : 'text-black border-transparent hover:text-gray-600 hover:border-gray-300'
                  }`}
                >
                  개설 과목
                </button>
                <button
                  onClick={() => setActiveTab('professor')}
                  className={`pb-2 border-b-2 font-medium transition-colors px-2 py-1 md:px-3 md:py-2 text-sm md:text-base ${
                    activeTab === 'professor'
                      ? 'text-black border-black'
                      : 'text-black border-transparent hover:text-gray-600 hover:border-gray-300'
                  }`}
                >
                  교수진
                </button>
              </div>
            </div>
            
            {/* 탭별 콘텐츠 */}
            {activeTab === 'gcsweb' && (
              <div>
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
                      <li>• React, Next.js</li>
                      <li>• TypeScript</li>
                      <li>• Tailwind CSS</li>
                      <li>• Figma, Adobe Creative Suite</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-3">백엔드</h4>
                    <ul className="text-gray-300 space-y-2">
                      <li>• Node.js, Express</li>
                      <li>• PostgreSQL</li>
                      <li>• Prisma ORM</li>
                      <li>• Railway 배포</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'intro' && (
              <div>
                <h2 className="text-2xl font-semibold text-white mb-6">전공 소개</h2>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                  GCS (Graphic Communication Science)는 동국대학교 연계전공으로, 
                  그래픽 디자인과 커뮤니케이션 기술을 융합한 혁신적인 전공입니다.
                </p>
                
                <h3 className="text-xl font-semibold text-white mb-4">교육 목표</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-3 mb-8 text-lg">
                  <li>창의적 그래픽 디자인 역량 개발</li>
                  <li>디지털 커뮤니케이션 기술 습득</li>
                  <li>사용자 중심의 디자인 사고력 향상</li>
                  <li>실무 프로젝트를 통한 전문성 강화</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-white mb-4">취업 분야</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-3">디자인 분야</h4>
                    <ul className="text-gray-300 space-y-2">
                      <li>• UI/UX 디자이너</li>
                      <li>• 그래픽 디자이너</li>
                      <li>• 브랜드 디자이너</li>
                      <li>• 웹 디자이너</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-3">개발 분야</h4>
                    <ul className="text-gray-300 space-y-2">
                      <li>• 프론트엔드 개발자</li>
                      <li>• 풀스택 개발자</li>
                      <li>• 웹 개발자</li>
                      <li>• 디지털 마케터</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lectures' && (
              <div>
                <h2 className="text-2xl font-semibold text-white mb-6">개설 과목</h2>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                  GCS 연계전공에서는 그래픽 디자인과 웹 개발을 중심으로 
                  체계적인 커리큘럼을 제공합니다.
                </p>
                
                <div className="space-y-6 mb-8">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">1학년</h3>
                    <ul className="text-gray-300 space-y-2">
                      <li>• 디자인 기초</li>
                      <li>• 프로그래밍 입문</li>
                      <li>• 시각 커뮤니케이션</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">2학년</h3>
                    <ul className="text-gray-300 space-y-2">
                      <li>• 웹 디자인</li>
                      <li>• 프론트엔드 개발</li>
                      <li>• 사용자 경험 디자인</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">3학년</h3>
                    <ul className="text-gray-300 space-y-2">
                      <li>• 백엔드 개발</li>
                      <li>• 데이터베이스</li>
                      <li>• 프로젝트 관리</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">4학년</h3>
                    <ul className="text-gray-300 space-y-2">
                      <li>• 캡스톤 디자인</li>
                      <li>• 졸업 프로젝트</li>
                      <li>• 포트폴리오 제작</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'professor' && (
              <div>
                <h2 className="text-2xl font-semibold text-white mb-6">교수진</h2>
                
                <div className="space-y-12 mb-8">
                  {/* 김교수 섹션 */}
                  <div className="flex flex-col lg:flex-row gap-8 pb-8 border-b border-white">
                    {/* 모바일: 사진, 데스크톱: 설명 */}
                    <div className="flex-1 lg:order-1 order-2">
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
                    
                    {/* 모바일: 설명, 데스크톱: 사진 */}
                    <div className="w-32 text-center lg:order-2 order-1 mx-auto">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-700">
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
                    </div>
                  </div>

                  {/* 이교수 섹션 */}
                  <div className="flex flex-col lg:flex-row gap-8 pb-8 border-b border-white">
                    {/* 모바일: 사진, 데스크톱: 설명 */}
                    <div className="flex-1 lg:order-1 order-2">
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
                    
                    {/* 모바일: 설명, 데스크톱: 사진 */}
                    <div className="w-32 text-center lg:order-2 order-1 mx-auto">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-700">
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
                    </div>
                  </div>

                  {/* 박교수 섹션 */}
                  <div className="flex flex-col lg:flex-row gap-8 pb-8">
                    {/* 모바일: 사진, 데스크톱: 설명 */}
                    <div className="flex-1 lg:order-1 order-2">
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
                    
                    {/* 모바일: 설명, 데스크톱: 사진 */}
                    <div className="w-32 text-center lg:order-2 order-1 mx-auto">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-700">
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
                    </div>
                  </div>
                </div>

                {/* 교수진 소개 */}
                <div className="bg-gray-800 rounded-lg p-8 mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-6 text-center">교수진 소개</h2>
                  <p className="text-gray-300 text-lg leading-relaxed text-center">
                    동국대학교 GCS 연계전공 교수진은 그래픽 디자인, 시각 커뮤니케이션, 디지털 미디어, 웹 기술 등
                    다양한 분야의 전문가들로 구성되어 있습니다. 학생들에게 최신 이론과 실무 경험을 바탕으로
                    혁신적인 교육을 제공하며, 미래 시대의 창의적 인재 양성에 힘쓰고 있습니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
