export default function ArchivePage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Archive</h1>
        
        <div className="mb-8">
          <p className="text-gray-600 mb-6">
            과거의 소중한 콘텐츠와 기록들을 보관하고 있습니다.
          </p>
          
          {/* 검색 및 필터 섹션 */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  검색
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="아카이브에서 검색..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="sm:w-48">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">전체</option>
                  <option value="news">뉴스</option>
                  <option value="events">이벤트</option>
                  <option value="updates">업데이트</option>
                  <option value="community">커뮤니티</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* 아카이브 목록 */}
          <div className="space-y-6">
            <div className="border-l-4 border-indigo-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                GCS 플랫폼 출시 기념 이벤트
              </h3>
              <p className="text-gray-600 mb-2">
                GCS 플랫폼의 공식 출시를 기념하여 진행된 특별 이벤트의 기록입니다.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>2024-09-01</span>
                <span className="mx-2">•</span>
                <span>이벤트</span>
              </div>
            </div>
            
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                시스템 업데이트 v2.1.0
              </h3>
              <p className="text-gray-600 mb-2">
                새로운 기능과 개선사항이 포함된 시스템 업데이트 소식입니다.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>2024-08-15</span>
                <span className="mx-2">•</span>
                <span>업데이트</span>
              </div>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                커뮤니티 가이드라인 업데이트
              </h3>
              <p className="text-gray-600 mb-2">
                더 나은 커뮤니티 환경을 위한 새로운 가이드라인이 발표되었습니다.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>2024-08-01</span>
                <span className="mx-2">•</span>
                <span>뉴스</span>
              </div>
            </div>
          </div>
          
          {/* 페이지네이션 */}
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                이전
              </button>
              <button className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md">
                1
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                다음
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
