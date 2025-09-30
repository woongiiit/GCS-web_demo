'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ArchivePage() {
  const [activeTab, setActiveTab] = useState<'project' | 'news'>('project')

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white px-4 py-6 sm:px-0">
        <div className="max-w-6xl mx-auto pt-32">
          {/* 페이지 제목 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-8">Archive</h1>
            
            {/* 홈 아이콘 */}
            <Link href="/" className="inline-block mb-8">
              <div className="w-6 h-6 mx-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
            </Link>

            {/* 탭 메뉴 */}
            <div className="flex justify-center space-x-8 mb-8">
              <button
                onClick={() => setActiveTab('project')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'project'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                Project
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'news'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                News
              </button>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="bg-gray-50 min-h-screen px-4 py-6">
            {activeTab === 'project' ? (
              <div>
                {/* 연도별 프로젝트 섹션 - DB에서 데이터를 가져올 구조 */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-black mb-6">2025</h2>
                  {/* 프로젝트 카드들이 여기에 동적으로 렌더링됩니다 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* DB에서 가져온 프로젝트 데이터가 여기에 표시됩니다 */}
                  </div>
                  {/* More 버튼 */}
                  <div className="text-right">
                    <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                      More
                    </button>
                  </div>
                </div>

                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-black mb-6">2024</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* DB에서 가져온 프로젝트 데이터가 여기에 표시됩니다 */}
                  </div>
                  <div className="text-right">
                    <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                      More
                    </button>
                  </div>
                </div>

                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-black mb-6">2023</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* DB에서 가져온 프로젝트 데이터가 여기에 표시됩니다 */}
                  </div>
                  <div className="text-right">
                    <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                      More
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* 연도별 뉴스 섹션 - DB에서 데이터를 가져올 구조 */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-black mb-6">2025</h2>
                  <div className="space-y-6">
                    {/* DB에서 가져온 뉴스 데이터가 여기에 표시됩니다 */}
                  </div>
                </div>

                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-black mb-6">2024</h2>
                  <div className="space-y-6">
                    {/* DB에서 가져온 뉴스 데이터가 여기에 표시됩니다 */}
                  </div>
                </div>

                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-black mb-6">2023</h2>
                  <div className="space-y-6">
                    {/* DB에서 가져온 뉴스 데이터가 여기에 표시됩니다 */}
                  </div>
                </div>
              </div>
            )}
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