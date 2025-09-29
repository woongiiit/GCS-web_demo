'use client'

import Link from 'next/link'

export default function BoardPage() {
  return (
    <div className="fixed inset-0 bg-black overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-black">
        {/* 상단 검은색 배너 */}
        <div className="bg-black w-full px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-white font-bold text-lg">GCS:Web</div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black text-sm font-medium">U</span>
              </div>
              <div className="flex flex-col space-y-1">
                <div className="w-5 h-0.5 bg-white"></div>
                <div className="w-5 h-0.5 bg-white"></div>
                <div className="w-5 h-0.5 bg-white"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Community 섹션 */}
        <div className="bg-black px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-3">Community</h1>
            <p className="text-white text-sm mb-4">
              GCS 전공생과 교수님, 졸업생 모두가 함께 소통하는 커뮤니티입니다.
            </p>
            
            {/* 홈 아이콘 */}
            <Link href="/" className="inline-block mb-6">
              <div className="w-6 h-6 mx-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
            </Link>

            {/* 서브 메뉴 */}
            <div className="flex justify-center space-x-8 mb-8">
              <Link 
                href="/community/board" 
                className="text-white pb-2 border-b-2 border-white font-medium"
              >
                Board
              </Link>
              <Link 
                href="/community/lounge" 
                className="text-gray-300 hover:text-white transition-colors pb-2 border-b-2 border-transparent hover:border-white"
              >
                Lounge
              </Link>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="bg-gray-50 min-h-screen px-4 py-6">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-black mb-6">Board</h2>
            
            {/* 게시글 목록 */}
            <div className="space-y-4">
              {/* 게시글 1 */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-3">
                    <h3 className="font-semibold text-black text-sm mb-1">
                      프린팅 업계, AI 시대를 함께 살아야 한다
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      AI가 바꿔가는 디자인제작 현장, 프린팅 업계는 어떻게 대응해야 할까?
                    </p>
                    <p className="text-gray-400 text-xs">사용자 2025.08.17</p>
                  </div>
                  <div className="w-16 h-16 bg-gray-300 rounded flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 rounded"></div>
                  </div>
                </div>
              </div>

              {/* 게시글 2 */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-3">
                    <h3 className="font-semibold text-black text-sm mb-1">
                      지속 가능한 인쇄산업: 친환경 잉크와 종이의 미래
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      친환경 소재로 진화하는 인쇄, 그 미래를 함께 살펴봅니다.
                    </p>
                    <p className="text-gray-400 text-xs">2025.08.17</p>
                  </div>
                </div>
              </div>

              {/* 게시글 3 */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-3">
                    <h3 className="font-semibold text-black text-sm mb-1">
                      GCS가 추천하는 2025 전시
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      올해 주목해야 할 디자인 프린팅 전시 TOP 리스트를 확인하세요.
                    </p>
                    <p className="text-gray-400 text-xs">2025.08.17</p>
                  </div>
                  <div className="w-16 h-16 bg-gray-300 rounded flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 rounded"></div>
                  </div>
                </div>
              </div>

              {/* 게시글 4 */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-3">
                    <h3 className="font-semibold text-black text-sm mb-1">
                      졸업생 인터뷰: 패키지 디자이너에게 필요한 덕목이란?
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      현업 패키지 디자이너가 말하는, 성공의 핵심 역량은?
                    </p>
                    <p className="text-gray-400 text-xs">2025.08.17</p>
                  </div>
                </div>
              </div>

              {/* 게시글 5 */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-3">
                    <h3 className="font-semibold text-black text-sm mb-1">
                      디지털 프린팅 기술의 혁신과 미래 전망
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      최신 디지털 프린팅 기술 동향과 업계 전망을 살펴봅니다.
                    </p>
                    <p className="text-gray-400 text-xs">2025.08.16</p>
                  </div>
                </div>
              </div>

              {/* 게시글 6 */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-3">
                    <h3 className="font-semibold text-black text-sm mb-1">
                      GCS 졸업생들의 성공 스토리 모음
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      다양한 분야에서 활약하는 졸업생들의 이야기를 들어보세요.
                    </p>
                    <p className="text-gray-400 text-xs">2025.08.16</p>
                  </div>
                  <div className="w-16 h-16 bg-gray-300 rounded flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 페이징 */}
            <div className="flex justify-center items-center space-x-2 mt-8 mb-4">
              <button className="text-gray-400 text-sm">&lt;</button>
              <button className="bg-black text-white px-3 py-1 rounded text-sm">1</button>
              <button className="text-gray-600 px-3 py-1 text-sm">2</button>
              <button className="text-gray-600 px-3 py-1 text-sm">3</button>
              <button className="text-gray-600 px-3 py-1 text-sm">4</button>
              <button className="text-gray-600 px-3 py-1 text-sm">5</button>
              <button className="text-gray-400 text-sm">&gt;</button>
            </div>

            {/* 푸터 */}
            <div className="text-center text-gray-400 text-xs">
              DONGGUK UNIVERSITY
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
