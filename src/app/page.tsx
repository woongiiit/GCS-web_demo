export default function Home() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            GCS Demo에 오신 것을 환영합니다
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Next.js와 PostgreSQL을 사용한 웹 애플리케이션입니다.
          </p>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                🚀 기술 스택
              </h2>
              <ul className="text-gray-600 space-y-1">
                <li>• Next.js 14 (App Router)</li>
                <li>• TypeScript</li>
                <li>• PostgreSQL</li>
                <li>• Prisma ORM</li>
                <li>• Tailwind CSS</li>
                <li>• Railway 배포</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                📝 주요 기능
              </h2>
              <ul className="text-gray-600 space-y-1">
                <li>• 사용자 인증 시스템</li>
                <li>• 게시글 CRUD 기능</li>
                <li>• 반응형 웹 디자인</li>
                <li>• API 라우트</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
