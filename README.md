# GCS Demo

Next.js와 PostgreSQL을 사용한 웹 애플리케이션입니다.

## 🚀 기술 스택

- **Frontend & Backend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Deployment**: Railway

## 📋 주요 기능

- 사용자 인증 시스템 (JWT)
- 게시글 CRUD 기능
- 반응형 웹 디자인
- API 라우트
- Railway 자동 배포

## 🛠️ 설치 및 실행

### 1. 의존성 설치

\`\`\`bash
npm install
\`\`\`

### 2. 환경 변수 설정

\`env.example\` 파일을 복사하여 \`.env.local\` 파일을 생성하고 필요한 값들을 설정하세요:

\`\`\`bash
cp env.example .env.local
\`\`\`

### 3. 데이터베이스 설정

Prisma를 사용하여 데이터베이스를 설정합니다:

\`\`\`bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 스키마 푸시
npm run db:push
\`\`\`

### 4. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인할 수 있습니다.

## 📁 프로젝트 구조

\`\`\`
src/
├── app/                 # Next.js App Router
│   ├── api/            # API 라우트
│   ├── globals.css     # 전역 스타일
│   ├── layout.tsx      # 루트 레이아웃
│   ├── page.tsx        # 홈페이지
│   ├── posts/          # 게시글 페이지
│   └── login/          # 로그인 페이지
├── lib/                # 유틸리티 함수
│   ├── auth.ts         # 인증 관련 함수
│   └── prisma.ts       # Prisma 클라이언트
└── types/              # TypeScript 타입 정의

prisma/
└── schema.prisma       # 데이터베이스 스키마
\`\`\`

## 🚀 Railway 배포

1. Railway 계정에 로그인
2. 새 프로젝트 생성
3. GitHub 저장소 연결
4. PostgreSQL 데이터베이스 추가
5. 환경 변수 설정
6. 자동 배포 완료

## 📝 API 엔드포인트

- \`GET /api/health\` - 서버 상태 확인
- \`POST /api/auth/login\` - 사용자 로그인

## 🔧 개발 명령어

\`\`\`bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint

# Prisma 스튜디오 실행
npm run db:studio
\`\`\`

## 📄 라이선스

MIT License
