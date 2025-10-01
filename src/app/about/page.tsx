'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'gcsweb' | 'intro' | 'lectures' | 'professor'>('gcsweb')

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
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 py-4">
              <button
                onClick={() => setActiveTab('gcsweb')}
                className={`pb-2 border-b-2 font-bold transition-colors text-sm md:text-base text-black ${
                  activeTab === 'gcsweb'
                    ? 'border-black'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                GCS:Web
              </button>
              <button
                onClick={() => setActiveTab('intro')}
                className={`pb-2 border-b-2 font-bold transition-colors text-sm md:text-base text-black ${
                  activeTab === 'intro'
                    ? 'border-black'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                전공 소개
              </button>
              <button
                onClick={() => setActiveTab('lectures')}
                className={`pb-2 border-b-2 font-bold transition-colors text-sm md:text-base text-black ${
                  activeTab === 'lectures'
                    ? 'border-black'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                개설 과목
              </button>
              <button
                onClick={() => setActiveTab('professor')}
                className={`pb-2 border-b-2 font-bold transition-colors text-sm md:text-base text-black ${
                  activeTab === 'professor'
                    ? 'border-black'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                교수진
              </button>
            </div>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="bg-black min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-8 sm:px-0">
            <div className="prose prose-lg max-w-none text-white">
            
            {/* 탭별 콘텐츠 */}
            {activeTab === 'gcsweb' && (
              <div>
                {/* 메인 타이틀 */}
                <div className="mb-12">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-4">GCS:Web</h2>
                </div>
                
                {/* 이미지 슬라이더 */}
                <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
                  <div className="flex gap-4 min-w-max">
                    <div className="w-[300px] md:w-[400px] h-[200px] md:h-[300px] bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">활동 이미지 1</span>
                    </div>
                    <div className="w-[300px] md:w-[400px] h-[200px] md:h-[300px] bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">활동 이미지 2</span>
                    </div>
                    <div className="w-[300px] md:w-[400px] h-[200px] md:h-[300px] bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">활동 이미지 3</span>
                    </div>
                  </div>
                </div>
                
                {/* 소개 텍스트 */}
                <div className="mb-8">
                  {/* 한글 설명 */}
                  <div className="mb-12 space-y-6 text-gray-300 text-base leading-relaxed">
                    <p>
                      GCS:Web은 동국대학교 연계전공 GCS의 활동 기록을 공유하고, 학생들이 직접 기획·제작한 결과물을 소개하는 이커머스 매거진입니다.
                    </p>
                    
                    <p>
                      이곳은 전공 내에서 이루어지는 프로젝트, 내부 행사 등을 아카이빙하며, 후속 학생들이 창작을 발전시키고 확장해나갈 수 있는지속 가능한 전공 커뮤니티를 지향합니다.
                    </p>
                  </div>
                  
                  {/* 영문 설명 */}
                  <div className="mb-12 space-y-6 text-gray-300 text-base leading-relaxed">
                    <p>
                      GCS:Web is an e-commerce magazine that shares the activities of Dongguk University Interdepartmental major GCS,
                      and shows student-led produced products.
                    </p>
                    
                    <p>
                      This is an archive of projects, and events in our field,
                      so that we aim for a sustainable community where students can develop and expand their creativity.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'intro' && (
              <div>
                {/* 메인 타이틀 */}
                <div className="mb-12">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-4">그래픽커뮤니케이션사이언스</h2>
                  <h3 className="text-base md:text-lg font-bold text-white">
                    Graphic Communication Science (GCS)
                  </h3>
                </div>
                
                {/* 이미지 슬라이더 */}
                <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
                  <div className="flex gap-4 min-w-max">
                    <div className="w-[300px] md:w-[400px] h-[200px] md:h-[300px] bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">활동 이미지 1</span>
                    </div>
                    <div className="w-[300px] md:w-[400px] h-[200px] md:h-[300px] bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">활동 이미지 2</span>
                    </div>
                    <div className="w-[300px] md:w-[400px] h-[200px] md:h-[300px] bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">활동 이미지 3</span>
                    </div>
                  </div>
                </div>
                
                {/* 소개 텍스트 */}
                <div className="mb-8">
                  {/* 전공 소개 섹션 */}
                  <div className="mb-12">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <span className="w-2 h-2 bg-[#f57520] rounded-full mr-3"></span>
                      전공 소개
                    </h3>
                    <p className="text-gray-300 text-base leading-relaxed mb-6">
                      GCS는 예술(디자인)과 경영(마케팅 및 전략), 그리고 공학(프린팅과 패키징) 등의 다양한 분야와 연계된 학제간 전공입니다.
                    </p>
                    <p className="text-gray-300 text-base leading-relaxed">
                      본 전공은 Design, Management, Technology의 세 영역을 축으로, 브랜드 매니지먼트의 핵심인 시각적 커뮤니케이션, 전략적 기획, 기술적 구현을 종합적으로 다룹니다.
                    </p>
                  </div>
                  
                  {/* 교육 철학 섹션 */}
                  <div className="mb-12">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <span className="w-2 h-2 bg-[#f57520] rounded-full mr-3"></span>
                      교육 철학
                    </h3>
                    <p className="text-gray-300 text-base leading-relaxed">
                      동국대학교의 학문적 전통인 원효의 화쟁(和諍) 사상을 교육 철학의 기반으로 삼아, 서로 다른 이론과 관점을 대립이 아닌 조화와 소통을 통해 더 높은 차원의 통합으로 나아가고자 합니다.
                    </p>
                  </div>
                  
                  {/* 장학 및 취업 지원 섹션 */}
                  <div className="mb-12">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <span className="w-2 h-2 bg-[#f57520] rounded-full mr-3"></span>
                      장학 및 취업 지원
                    </h3>
                    
                    <div className="space-y-6 text-gray-300 text-base leading-relaxed">
                      <p>
                        GCS 연계전공 성적 우수자에 한하여 해외 단기연수(3D 프린팅, 패키징, 자산관리, e-book 출판, 첨단 프린팅 운용 관리 등의 분야) 참가 지원
                      </p>
                      
                      <p>
                        GCS 연계전공 교과목의 일정 학점 이수자에 한하여 해외 교환학생 프로그램(Canada Ryerson Univ.) 지원
                      </p>
                      
                      <p>
                        대기업 (현대, CJ, HP, Heidelberg 등) & 정부 연구기관(생산기술연구원)
                      </p>
                      
                      <p>
                        관련 부서 현장 실습, 인턴 및 취업 지원
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lectures' && (
              <div>
                {/* 메인 타이틀 */}
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">GCS 개설과목</h2>
                  <div className="w-24 h-1 bg-[#f57520]"></div>
                </div>
                
                {/* 3개 컬럼 */}
                <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8">
                  {/* 예술 Art */}
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-white mb-2">예술 Art</h3>
                    <div className="w-full h-0.5 bg-white mb-2"></div>
                    <div className="space-y-1 text-gray-300 text-xs md:text-sm">
                      <p>미술학</p>
                      <p>영화영상학</p>
                    </div>
                  </div>
                  
                  {/* 경영 Business */}
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-white mb-2">경영 Business</h3>
                    <div className="w-full h-0.5 bg-white mb-2"></div>
                    <div className="space-y-1 text-gray-300 text-xs md:text-sm">
                      <p>경영학</p>
                      <p>광고홍보학</p>
                      <p>미디어커뮤니케이션학</p>
                    </div>
                  </div>
                  
                  {/* 공학 Engineering */}
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-white mb-2">공학 Engineering</h3>
                    <div className="w-full h-0.5 bg-white mb-2"></div>
                    <div className="space-y-1 text-gray-300 text-xs md:text-sm">
                      <p>기계로봇에너지공학</p>
                      <p>식품생물공학</p>
                      <p>화학생물공학</p>
                    </div>
                  </div>
                </div>
                
                {/* 과목 상세 설명 카드 */}
                <div className="space-y-6 mt-12">
                  {/* GCS2001 컬러매니지먼트 */}
                  <div className="border-2 border-white">
                    {/* 과목명 헤더 */}
                    <div className="bg-white px-6 py-1">
                      <h4 className="text-black text-sm">
                        <span>GCS2001</span>
                        <span className="mx-3"></span>
                        <span>컬러매니지먼트</span>
                      </h4>
                    </div>
                    {/* 과목 설명 */}
                    <div className="bg-black px-6 py-3">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        컬러 캘리브레이션을 이해, 컬러 캘리브레이션의 적용과 방법 대해서 이해, 컬러관리의 입출력장치의 최적화에 대해서 이해, 품질과의 방법과 데이터 보존에 대해서 이해하고, 공정 관리를 이해한다.
                      </p>
                    </div>
                  </div>
                  
                  {/* GCS2004-01 그래픽커뮤니케이션사이언스 입문 */}
                  <div className="border-2 border-white">
                    {/* 과목명 헤더 */}
                    <div className="bg-white px-6 py-1">
                      <h4 className="text-black text-sm">
                        <span>GCS2004-01</span>
                        <span className="mx-3"></span>
                        <span>그래픽커뮤니케이션사이언스 입문</span>
                      </h4>
                    </div>
                    {/* 과목 설명 */}
                    <div className="bg-black px-6 py-3">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        어떤 종류의 인쇄 제품이라도 기획, 인쇄 원고 디자인, 프리프레스, 프레스(인쇄), 포스트 프레스(후가공) 공정에 의해 완제품을 제작할 수 있다. 리프레스 공정(데이터 입고부터 인쇄 원고의 편집 및 수정, 교정, 제판, 컬러 관리까지의 공정), 프레스(인쇄 기계로 제품을 생산하는 인쇄 공정), 포스트프레스(인쇄 제품의 요구 조건에 맞도록 가공하는 후가공 공정)와 같은 제작 공정에 대한 기본적인 이론을 학습한다.
                      </p>
                    </div>
                  </div>
                  
                  {/* GCS4001-01 식품포장 */}
                  <div className="border-2 border-white">
                    <div className="bg-white px-6 py-1">
                      <h4 className="text-black text-sm">
                        <span>GCS4001-01</span>
                        <span className="mx-3"></span>
                        <span>식품포장</span>
                      </h4>
                    </div>
                    <div className="bg-black px-6 py-3">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        식품 포장의 기능, 식품 포장재/포장용기, 포장 식품의 품질변화/유효기간 설정, 식품의 포장공정, 식품 포장설계 등에 관하여 강의한다.
                      </p>
                    </div>
                  </div>
                  
                  {/* GCS4002-01 식품포장특론 */}
                  <div className="border-2 border-white">
                    <div className="bg-white px-6 py-1">
                      <h4 className="text-black text-sm">
                        <span>GCS4002-01</span>
                        <span className="mx-3"></span>
                        <span>식품포장특론</span>
                      </h4>
                    </div>
                    <div className="bg-black px-6 py-3">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        식품 포장재의 물질전달/표면화학, 항균성/항산화성 포장, 가식성 포장, 생분해성 포장, 변형기체 포장, 마이크로웨이브 가열용 포장, 지능형 포장-지시계/센서/RFID-USN 포장유통등에 관하여 강의한다.
                      </p>
                    </div>
                  </div>
                  
                  {/* GCS4004-01 캡스톤디자인 */}
                  <div className="border-2 border-white">
                    <div className="bg-white px-6 py-1">
                      <h4 className="text-black text-sm">
                        <span>GCS4004-01</span>
                        <span className="mx-3"></span>
                        <span>캡스톤디자인</span>
                      </h4>
                    </div>
                    <div className="bg-black px-6 py-3">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        현장에서 부딪히는 문제 해결 능력을 키우기 위해 기획부터 제작까지 일련의 과정을 학생들이 직접 수행한다. 팀 단위로 이루어지며 창의력, 팀워크, 리더십 양성 등을 목표로 한다.
                      </p>
                    </div>
                  </div>
                  
                  {/* GCS4006-01 4차산업과패키징 */}
                  <div className="border-2 border-white">
                    <div className="bg-white px-6 py-1">
                      <h4 className="text-black text-sm">
                        <span>GCS4006-01</span>
                        <span className="mx-3"></span>
                        <span>4차산업과패키징</span>
                      </h4>
                    </div>
                    <div className="bg-black px-6 py-3">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        패키징학은 제품을 안전하게 보관하며 편리성을 제공하고 동시에 소비자들의 구매 욕구를 충족시켜 소비를 유도하는 학문분야이다. 구체적으로, 유통합리화를 위한 포장물류 개선, 포장 폐기물 환경 문제 고려, 전자상거래 활성화를 위한 포장형태 개발 등 패키징 산업과 기술의 전반적인 내용을 배운다.
                      </p>
                    </div>
                  </div>
                  
                  {/* GCS2001 4차산업과상업인쇄 */}
                  <div className="border-2 border-white">
                    <div className="bg-white px-6 py-1">
                      <h4 className="text-black text-sm">
                        <span>GCS2001</span>
                        <span className="mx-3"></span>
                        <span>4차산업과상업인쇄</span>
                      </h4>
                    </div>
                    <div className="bg-black px-6 py-3">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        상업인쇄는 인쇄산업에서 산업의 역사, 비지니스 모델, 기술적인 측면에 있어서 가장 범용하고 중심의 위치에 있다. 이를 바탕으로 상업인쇄와 4차산업 혁신간에 통합적이고 전략적인 시각을 배양하도록 한다. 본 강의에서는 상업인쇄의 기본 지식(기술, 비지니스 모델, 어플리케이션 등), 상업인쇄 어플리케이션과 브랜드 캠패인, 상업인쇄의 4차산업 혁신(디지털 인쇄, Web to Print, Smart factory) 등을 학습한다.
                      </p>
                    </div>
                  </div>
                  
                  {/* 추가 과목들을 위한 주석 */}
                  {/* DB에서 불러온 다른 과목들이 여기에 표시됩니다 */}
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
