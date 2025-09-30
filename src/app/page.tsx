'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white px-4 py-6 sm:px-0">
        <div className="max-w-6xl mx-auto pt-32">
          {/* 페이지 제목 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-4">GCS</h1>
            <p className="text-gray-600 mb-8">Graphic Communication Science</p>
            
            {/* 홈 아이콘 */}
            <div className="inline-block mb-8">
              <div className="w-6 h-6 mx-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="bg-gray-50 min-h-screen px-4 py-6">
            
            {/* 환영 섹션 */}
            <div className="mb-12">
              <div className="bg-white rounded-lg p-8 mb-8">
                <h2 className="text-3xl font-bold text-black mb-4 text-center">환영합니다</h2>
                <p className="text-gray-600 text-center text-lg leading-relaxed">
                  동국대학교 글로벌커뮤니케이션학부(GCS) 공식 웹사이트에 오신 것을 환영합니다.<br/>
                  디지털 시대의 커뮤니케이션 전문가를 양성하는 우리 학부의 다양한 프로그램과 활동을 만나보세요.
                </p>
              </div>
            </div>

            {/* 주요 섹션들 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-black mb-6">주요 섹션</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                
                {/* About GCS */}
                <Link href="/about" className="group">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${'#5B7C99'}20, ${'#5B7C99'}40)` }}>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#5B7C99' }}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className="font-semibold" style={{ color: '#5B7C99' }}>About GCS</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:transition-colors transition-colors" style={{ color: 'inherit' }} onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#5B7C99'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}>학부 소개</h3>
                      <p className="text-gray-600 text-sm">GCS:Web 전공 소개, 개설 과목, 교수진 정보를 확인하세요.</p>
                    </div>
                  </div>
                </Link>

                {/* Archive */}
                <Link href="/archive" className="group">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${'#8A9A5B'}20, ${'#8A9A5B'}40)` }}>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8A9A5B' }}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <span className="font-semibold" style={{ color: '#8A9A5B' }}>Archive</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:transition-colors transition-colors" style={{ color: 'inherit' }} onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#8A9A5B'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}>프로젝트 & 뉴스</h3>
                      <p className="text-gray-600 text-sm">학부 프로젝트와 최신 소식을 연도별로 확인하세요.</p>
                    </div>
                  </div>
                </Link>

                {/* Community */}
                <Link href="/community" className="group">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${'#B85C47'}20, ${'#B85C47'}40)` }}>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#B85C47' }}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <span className="font-semibold" style={{ color: '#B85C47' }}>Community</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:transition-colors transition-colors" style={{ color: 'inherit' }} onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#B85C47'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}>커뮤니티</h3>
                      <p className="text-gray-600 text-sm">학생들과 소통하고 정보를 공유하는 공간입니다.</p>
                    </div>
                  </div>
                </Link>

                {/* Shop */}
                <Link href="/shop" className="group">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${'#AFA79D'}20, ${'#AFA79D'}40)` }}>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#AFA79D' }}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <span className="font-semibold" style={{ color: '#AFA79D' }}>Shop</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:transition-colors transition-colors" style={{ color: 'inherit' }} onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#AFA79D'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}>GCS Shop</h3>
                      <p className="text-gray-600 text-sm">GCS 브랜드 상품을 만나보세요. 의류, 문구, 액세서리 등 다양한 상품이 있습니다.</p>
                    </div>
                  </div>
                </Link>

                {/* News & Updates */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${'#D4A056'}20, ${'#D4A056'}40)` }}>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D4A056' }}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                      <span className="font-semibold" style={{ color: '#D4A056' }}>News</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">최신 소식</h3>
                    <p className="text-gray-600 text-sm">학부의 최신 소식과 공지사항을 확인하세요.</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${'#5F4B66'}20, ${'#5F4B66'}40)` }}>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#5F4B66' }}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-semibold" style={{ color: '#5F4B66' }}>Contact</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">문의하기</h3>
                    <p className="text-gray-600 text-sm">학부에 대한 문의사항이 있으시면 언제든 연락주세요.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* 통계 섹션 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-black mb-6">GCS 통계</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#5B7C99' }}>500+</div>
                  <div className="text-gray-600">재학생</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#8A9A5B' }}>50+</div>
                  <div className="text-gray-600">졸업생</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#B85C47' }}>20+</div>
                  <div className="text-gray-600">수상 실적</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#AFA79D' }}>10+</div>
                  <div className="text-gray-600">프로그램</div>
                </div>
              </div>
            </div>

            {/* 최근 활동 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-black mb-6">최근 활동</h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderLeftColor: '#D4A056' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">2025년 신입생 오리엔테이션</h3>
                      <p className="text-gray-600 text-sm">3월 2일 - 3월 6일</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#D4A05620', color: '#D4A056' }}>진행중</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderLeftColor: '#8A9A5B' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">GCS 웹 개발 워크숍</h3>
                      <p className="text-gray-600 text-sm">2월 15일 - 2월 16일</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#8A9A5B20', color: '#8A9A5B' }}>완료</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderLeftColor: '#5F4B66' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">졸업작품 전시회</h3>
                      <p className="text-gray-600 text-sm">2월 10일 - 2월 12일</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#5F4B6620', color: '#5F4B66' }}>완료</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 푸터 */}
          <div className="text-center text-gray-400 text-xs mt-12">
            DONGGUK UNIVERSITY
          </div>
        </div>
      </div>
    </div>
  )
}