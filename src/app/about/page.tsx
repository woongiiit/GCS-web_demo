'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="fixed inset-0 bg-black overflow-auto">
      <div className="relative min-h-screen bg-black px-4 py-6 sm:px-0">
        <div className="max-w-4xl mx-auto pt-24">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">About GCS</h1>
          
          <div className="prose prose-lg max-w-none text-white">
            <p className="text-gray-300 mb-8 text-lg leading-relaxed text-center">
              GCS (Graphic Communication Science)는 동국대학교 연계전공으로, 
              그래픽 디자인과 커뮤니케이션 기술을 융합한 혁신적인 전공입니다.
            </p>
            
            {/* 서브 메뉴 배너 */}
            <div className="bg-gray-600 rounded-lg p-4 mb-8">
              <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                <button className="text-gray-300 hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-gray-700">
                  GCS:Web
                </button>
                <button className="text-gray-300 hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-gray-700">
                  전공 소개
                </button>
                <button className="text-gray-300 hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-gray-700">
                  개설 과목
                </button>
                <Link href="/about/professor" className="text-gray-300 hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-gray-700">
                  교수진
                </Link>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-6">우리의 미션</h2>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">
              창의적인 그래픽 디자인과 첨단 커뮤니케이션 기술을 통해 
              새로운 시각적 경험을 창조하고, 디지털 시대의 커뮤니케이션을 혁신하는 것이 
              저희의 목표입니다.
            </p>
            
            <h2 className="text-2xl font-semibold text-white mb-6">주요 기능</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-3 mb-8 text-lg">
              <li>아카이빙: 학생들의 다양한 활동 기록을 체계적으로 분류하고 보관</li>
              <li>E-커머스: 학생들이 직접 만든 제품을 구매할 수 있는 공간</li>
              <li>커뮤니티: 학생들의 정보 공유, 소통, 교류 공간</li>
              <li>전공 홍보: GCS 전공 안내 및 매력 소개</li>
            </ul>
            
            
            <h2 className="text-2xl font-semibold text-white mb-6">연락처</h2>
            <p className="text-gray-300 text-lg mb-8">
              더 자세한 정보가 필요하시다면 언제든지 문의해 주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
