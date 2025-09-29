export default function ShopPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Shop</h1>
        
        <div className="mb-8">
          <p className="text-gray-600 mb-8">
            GCS에서 제공하는 다양한 상품과 서비스를 만나보세요.
          </p>
          
          {/* 카테고리 필터 */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                전체
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                디지털 상품
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                프리미엄 서비스
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                교육 과정
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                도구 & 리소스
              </button>
            </div>
          </div>
          
          {/* 상품 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 상품 1 */}
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-2xl font-bold">GCS Pro</div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">GCS Pro 플랜</h3>
                <p className="text-gray-600 text-sm mb-3">
                  고급 기능과 우선 지원을 제공하는 프리미엄 플랜입니다.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">월 ₩29,000</span>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    구매하기
                  </button>
                </div>
              </div>
            </div>
            
            {/* 상품 2 */}
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                <div className="text-white text-2xl font-bold">교육 과정</div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Next.js 마스터 클래스</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Next.js를 활용한 풀스택 웹 개발을 배우는 종합 과정입니다.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">₩199,000</span>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    구매하기
                  </button>
                </div>
              </div>
            </div>
            
            {/* 상품 3 */}
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <div className="text-white text-2xl font-bold">도구</div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">GCS 개발자 도구</h3>
                <p className="text-gray-600 text-sm mb-3">
                  개발 효율성을 높여주는 다양한 도구와 템플릿 모음입니다.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">₩49,000</span>
                  <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                    구매하기
                  </button>
                </div>
              </div>
            </div>
            
            {/* 상품 4 */}
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <div className="text-white text-2xl font-bold">API</div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">GCS API 엑세스</h3>
                <p className="text-gray-600 text-sm mb-3">
                  GCS 플랫폼의 모든 API에 대한 무제한 액세스 권한입니다.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">월 ₩99,000</span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    구매하기
                  </button>
                </div>
              </div>
            </div>
            
            {/* 상품 5 */}
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <div className="text-white text-2xl font-bold">컨설팅</div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">1:1 기술 컨설팅</h3>
                <p className="text-gray-600 text-sm mb-3">
                  전문가와의 1시간 1:1 기술 컨설팅 세션입니다.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">₩150,000</span>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    구매하기
                  </button>
                </div>
              </div>
            </div>
            
            {/* 상품 6 */}
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <div className="text-white text-2xl font-bold">리소스</div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">디자인 리소스 팩</h3>
                <p className="text-gray-600 text-sm mb-3">
                  UI/UX 디자인에 활용할 수 있는 고품질 리소스 모음입니다.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">₩79,000</span>
                  <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                    구매하기
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* 장바구니 및 계정 정보 */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">쇼핑 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">장바구니</h3>
                <p className="text-gray-600 text-sm mb-4">현재 장바구니가 비어있습니다.</p>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                  장바구니 보기
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">계정 정보</h3>
                <p className="text-gray-600 text-sm mb-4">구매 내역과 구독 관리를 확인하세요.</p>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  계정 관리
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
