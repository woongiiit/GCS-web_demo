export default function CommunityPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Community</h1>
        
        <div className="mb-8">
          <p className="text-gray-600 mb-8">
            GCS 커뮤니티에 오신 것을 환영합니다. 다양한 주제로 소통하고 정보를 공유해보세요.
          </p>
          
          {/* 커뮤니티 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-indigo-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">1,234</div>
              <div className="text-sm text-indigo-600">활성 사용자</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">5,678</div>
              <div className="text-sm text-green-600">총 게시글</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">12,345</div>
              <div className="text-sm text-blue-600">총 댓글</div>
            </div>
          </div>
          
          {/* 인기 토픽 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">인기 토픽</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">기술 토론</h3>
                <p className="text-gray-600 text-sm mb-2">
                  최신 기술 트렌드와 개발 경험을 공유하는 공간입니다.
                </p>
                <div className="text-xs text-gray-500">1,234개 게시글</div>
              </div>
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">질문과 답변</h3>
                <p className="text-gray-600 text-sm mb-2">
                  궁금한 점을 질문하고 답변을 받을 수 있는 Q&A 공간입니다.
                </p>
                <div className="text-xs text-gray-500">2,345개 게시글</div>
              </div>
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">자유게시판</h3>
                <p className="text-gray-600 text-sm mb-2">
                  자유롭게 이야기를 나누고 소통하는 공간입니다.
                </p>
                <div className="text-xs text-gray-500">3,456개 게시글</div>
              </div>
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">이벤트 & 공지</h3>
                <p className="text-gray-600 text-sm mb-2">
                  공식 이벤트와 중요한 공지사항을 확인할 수 있습니다.
                </p>
                <div className="text-xs text-gray-500">123개 게시글</div>
              </div>
            </div>
          </div>
          
          {/* 최근 활동 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">최근 활동</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                  U
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">사용자123</div>
                  <div className="text-gray-600 text-sm">"Next.js 14의 새로운 기능에 대해 질문이 있습니다"</div>
                  <div className="text-xs text-gray-500 mt-1">5분 전</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Admin</div>
                  <div className="text-gray-600 text-sm">새로운 커뮤니티 가이드라인이 업데이트되었습니다.</div>
                  <div className="text-xs text-gray-500 mt-1">1시간 전</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  D
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Developer</div>
                  <div className="text-gray-600 text-sm">"TypeScript와 React의 최신 베스트 프랙티스를 공유합니다"</div>
                  <div className="text-xs text-gray-500 mt-1">3시간 전</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 참여하기 버튼 */}
          <div className="text-center">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
              커뮤니티 참여하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
