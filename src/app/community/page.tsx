'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'board' | 'lounge'>('board')

  return (
    <div className="fixed inset-0 bg-black overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-black pt-16">
        {/* 상단 검은색 배너 */}
        <div className="bg-black w-full px-4 pt-6 pb-4">
          <div className="flex justify-center items-center">
            <div className="text-white font-bold text-lg">GCS:Web</div>
          </div>
        </div>

        {/* Community 섹션 */}
        <div className="bg-black px-4 pt-8 pb-6">
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
              <button
                onClick={() => setActiveTab('board')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'board'
                    ? 'text-white border-white'
                    : 'text-gray-300 border-transparent hover:text-white hover:border-white'
                }`}
              >
                Board
              </button>
              <button
                onClick={() => setActiveTab('lounge')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'lounge'
                    ? 'text-white border-white'
                    : 'text-gray-300 border-transparent hover:text-white hover:border-white'
                }`}
              >
                Lounge
              </button>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="bg-gray-50 min-h-screen px-4 py-6">
          {activeTab === 'board' ? (
            <div>
              <h2 className="text-xl font-bold text-black mb-6">Board</h2>

              {/* 게시글 목록 */}
              <div className="space-y-4 mb-8">
                {/* 게시글 1 */}
                <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-sm font-semibold text-black mb-1">프린팅 업계, AI 시대를 함께 살아야 한다</h3>
                    <p className="text-xs text-gray-600 mb-2">AI가 바꿔가는 디자인제작 현장, 프린팅 업계는 어떻게 대응해야 할까?</p>
                    <p className="text-xs text-gray-400">사용자 2025.08.17</p>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    <img src="/images/board_thumbnail1.png" alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* 게시글 2 */}
                <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-sm font-semibold text-black mb-1">지속 가능한 인쇄산업: 친환경 잉크와 종이의 미래</h3>
                    <p className="text-xs text-gray-600 mb-2">친환경 소재로 진화하는 인쇄, 그 미래를 함께 살펴봅니다.</p>
                    <p className="text-xs text-gray-400">2025.08.17</p>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    {/* <img src="/images/board_thumbnail2.png" alt="Thumbnail" className="w-full h-full object-cover" /> */}
                  </div>
                </div>

                {/* 게시글 3 */}
                <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-sm font-semibold text-black mb-1">GCS가 추천하는 2025 전시</h3>
                    <p className="text-xs text-gray-600 mb-2">올해 주목해야 할 디자인 프린팅 전시 TOP 리스트를 확인하세요.</p>
                    <p className="text-xs text-gray-400">2025.08.17</p>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    <img src="/images/board_thumbnail3.png" alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* 게시글 4 */}
                <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-sm font-semibold text-black mb-1">졸업생 인터뷰: 패키지 디자이너에게 필요한 덕목이란?</h3>
                    <p className="text-xs text-gray-600 mb-2">현업 패키지 디자이너가 말하는, 성공의 핵심 역량은?</p>
                    <p className="text-xs text-gray-400">2025.08.17</p>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    {/* <img src="/images/board_thumbnail4.png" alt="Thumbnail" className="w-full h-full object-cover" /> */}
                  </div>
                </div>
              </div>

              {/* 페이징 */}
              <div className="flex justify-center items-center space-x-2 text-sm mb-8">
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">&lt;</button>
                <button className="px-3 py-1 rounded-md bg-black text-white">1</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">2</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">3</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">4</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">5</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">&gt;</button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-black mb-6">Lounge</h2>

              {/* 게시글 목록 */}
              <div className="space-y-4 mb-8">
                {/* 게시글 1 */}
                <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-sm font-semibold text-black mb-1">전공 서적 교환하실 분 찾아요</h3>
                    <p className="text-xs text-gray-600 mb-2">경사세 책 필요한 사람~</p>
                    <p className="text-xs text-gray-400">사용자 2025.08.17</p>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    <img src="/images/lounge_thumbnail1.png" alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* 게시글 2 */}
                <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-sm font-semibold text-black mb-1">과제 잘 끝내는 법, 자주 쓰는 툴 단축키, 레퍼런스 사이트 공유</h3>
                    <p className="text-xs text-gray-600 mb-2">그런거 없음ㅋ</p>
                    <p className="text-xs text-gray-400">2025.08.17</p>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    {/* <img src="/images/lounge_thumbnail2.png" alt="Thumbnail" className="w-full h-full object-cover" /> */}
                  </div>
                </div>

                {/* 게시글 3 */}
                <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-sm font-semibold text-black mb-1">다음 굿즈로 만들면 좋은 아이템은?</h3>
                    <p className="text-xs text-gray-600 mb-2">앞치마 vs 팔토시</p>
                    <p className="text-xs text-gray-400">사용자 2005.08.17</p>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    <img src="/images/lounge_thumbnail3.png" alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* 게시글 4 */}
                <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-sm font-semibold text-black mb-1">졸업생의 진로 이야기, 인턴 후기, 취업 경험담 요약</h3>
                    <p className="text-xs text-gray-600 mb-2">저는 서양화 20학번...</p>
                    <p className="text-xs text-gray-400">2025.08.17</p>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    {/* <img src="/images/lounge_thumbnail4.png" alt="Thumbnail" className="w-full h-full object-cover" /> */}
                  </div>
                </div>
              </div>

              {/* 페이징 */}
              <div className="flex justify-center items-center space-x-2 text-sm mb-8">
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">&lt;</button>
                <button className="px-3 py-1 rounded-md bg-black text-white">1</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">2</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">3</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">4</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">5</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200">&gt;</button>
              </div>
            </div>
          )}

          {/* 푸터 */}
          <div className="text-center text-gray-400 text-xs">
            DONGGUK UNIVERSITY
          </div>
        </div>
      </div>
    </div>
  )
}
