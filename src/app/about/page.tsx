export default function AboutPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About GCS</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            GCS (Global Community System)는 전 세계 사용자들이 함께 소통하고 성장할 수 있는 
            혁신적인 플랫폼입니다.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">우리의 미션</h2>
          <p className="text-gray-600 mb-6">
            기술과 창의성을 통해 사람들을 연결하고, 더 나은 디지털 경험을 제공하는 것이 
            저희의 목표입니다.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">주요 기능</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>실시간 커뮤니케이션</li>
            <li>콘텐츠 아카이브</li>
            <li>전자상거래 통합</li>
            <li>사용자 맞춤형 경험</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">연락처</h2>
          <p className="text-gray-600">
            더 자세한 정보가 필요하시다면 언제든지 문의해 주세요.
          </p>
        </div>
      </div>
    </div>
  )
}
