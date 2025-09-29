'use client'

import Link from 'next/link'

export default function LoungePage() {
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
                className="text-gray-300 hover:text-white transition-colors pb-2 border-b-2 border-transparent hover:border-white"
              >
                Board
              </Link>
              <Link 
                href="/community/lounge" 
                className="text-white pb-2 border-b-2 border-white font-medium"
              >
                Lounge
              </Link>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="bg-gray-50 min-h-screen px-4 py-6">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-black mb-6">Lounge</h2>
            
            {/* 게시글 목록 */}
            <div className="space-y-4">
              {/* 게시글 1 */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-3">
                    <h3 className="font-semibold text-black text-sm mb-1">
                      전공 서적 교환하실 분 찾아요
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      경사세 책 필요한 사람~
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
                      과제 잘 끝내는 법, 자주 쓰는 툴 단축키, 레퍼런스 사이트 공유
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      그런거 없음ㅋ
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
                      다음 굿즈로 만들면 좋은 아이템은?
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      앞치마 vs 팔토시
                    </p>
                    <p className="text-gray-400 text-xs">사용자 2005.08.17</p>
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
                      졸업생의 진로 이야기, 인턴 후기, 취업 경험담 요약
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      저는 서양화 20학번...
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
                      스터디 모임 만들까요?
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      디자인 툴 스터디 같이 하실 분들~
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
                      포트폴리오 리뷰 부탁드려요
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      취업 준비 중인데 조언 부탁드려요!
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
