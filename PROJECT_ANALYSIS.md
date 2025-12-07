# GCS Web Demo 프로젝트 분석 보고서

## 📋 프로젝트 개요

**GCS Web Demo**는 동국대학교 GCS(Graphic Communication Science) 연계전공을 위한 종합 웹 플랫폼입니다. Next.js 14 App Router를 기반으로 구축된 풀스택 웹 애플리케이션으로, 커뮤니티, 아카이브, 전자상거래, 관리자 기능을 포함합니다.

---

## 🏗️ 기술 스택

### Frontend & Backend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API (AuthContext)

### Database & ORM
- **Database**: PostgreSQL
- **ORM**: Prisma 6.18.0
- **Migrations**: Prisma Migrate

### 인증 & 보안
- **인증 방식**: JWT (JSON Web Token)
- **비밀번호 해싱**: bcryptjs
- **Rate Limiting**: Upstash Redis
- **보안 유틸리티**: 커스텀 보안 검증 함수

### 결제 시스템
- **PG사**: PortOne (V2) 통합
- **기능**: 
  - 일반 결제 (일시불)
  - 빌링키 결제 (정기 결제)
  - 결제 웹훅 처리

### 이메일 시스템
- **방식**: 다중 지원 (SMTP, SendGrid, Brevo)
- **용도**: 이메일 인증, 비밀번호 재설정

### 배포
- **플랫폼**: Railway
- **빌드 방식**: Standalone 모드

---

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트 (RESTful)
│   ├── about/             # 학부 소개 페이지
│   ├── admin/             # 관리자 페이지
│   ├── archive/           # 아카이브 (프로젝트, 뉴스)
│   ├── community/         # 커뮤니티 (게시판)
│   ├── shop/              # 쇼핑몰
│   ├── mypage/            # 마이페이지
│   ├── auth/              # 인증 페이지 (로그인, 회원가입 등)
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── Navigation.tsx
│   ├── ChatBot.tsx
│   └── ...
├── contexts/              # React Context
│   └── AuthContext.tsx
├── lib/                   # 유틸리티 함수
│   ├── auth.ts           # 인증 로직
│   ├── prisma.ts         # Prisma 클라이언트
│   ├── permissions.ts    # 권한 관리
│   ├── shop/             # 쇼핑 관련 유틸리티
│   └── ...
└── types/                 # TypeScript 타입 정의

prisma/
├── schema.prisma          # 데이터베이스 스키마
└── migrations/            # 마이그레이션 파일
```

---

## 🎯 주요 기능 모듈

### 1. 사용자 인증 시스템

#### 역할 (Role) 기반 접근 제어
- **GENERAL** (일반회원): 상품 구매만 가능
- **MAJOR** (전공회원): 상품 구매 + 커뮤니티 글쓰기 가능
- **ADMIN** (운영자): 모든 권한
- **isSeller** (판매자): 선택적 권한, 상품 등록 가능

#### 학생 인증 시스템
- 인증 상태: `PENDING` → `REQUESTED` → `APPROVED` / `REJECTED`
- 인증 이미지 업로드 및 관리자 승인/거부 기능
- 승인 시 일반회원에서 전공회원으로 자동 전환

#### 인증 방식
- JWT 토큰 기반 (7일 유효기간)
- HTTP-only 쿠키로 토큰 저장
- 비밀번호: bcryptjs로 해싱

### 2. 커뮤니티 시스템

#### 게시판 카테고리
- **BOARD**: 일반 게시판
- **LOUNGE**: 라운지

#### 기능
- 게시글 작성/수정/삭제
- 댓글 시스템
- 좋아요 기능
- 이미지 업로드 (다중)
- 조회수 카운팅
- 권한별 접근 제어

### 3. 아카이브 시스템

#### 프로젝트 (Projects)
- 연도별 프로젝트 아카이브
- 추천 프로젝트 표시
- 팀 멤버, 기술 스택, GitHub/Demo 링크
- 좋아요 기능

#### 뉴스 (News)
- 연도별 뉴스 아카이브
- 추천 뉴스 표시
- 이미지 업로드
- 좋아요 기능

### 4. 전자상거래 시스템 (Shop)

#### 상품 타입
1. **FUND** (펀딩)
   - 목표 금액 달성 시 자동 결제
   - 현재 모금 금액 추적
   - 서포터 수 카운팅
   - 마감일 설정
   - 빌링키 결제 지원

2. **PARTNER_UP** (협업)
   - 재고 보유 상품
   - 즉시 구매 가능
   - 일반 결제만 지원

#### 주요 기능
- 상품 등록/수정/삭제
- 상품 상세 정보 (옵션, 이미지 등)
- 장바구니 기능
- 주문 관리
- 결제 처리 (PortOne)
- 리뷰 시스템 (별점 + 텍스트)
- 좋아요 기능

#### 결제 프로세스
1. **일반 결제** (Partner Up)
   - 즉시 결제 처리
   - 주문 상태 관리

2. **펀딩 결제** (Fund)
   - 첫 결제: 일반 결제
   - 목표 달성 시: 빌링키로 자동 결제
   - 관리자 승인 필요 (빌링키 결제)

#### 주문 상태 관리
- **Partner Up**: ORDERED → CONFIRMED → PRODUCTION_STARTED → SHIPPED_OUT → SHIPPING → ARRIVED → RECEIVED
- **Fund**: ORDERED → BILLING_COMPLETED → CONFIRMED → ...

### 5. 관리자 시스템

#### 콘텐츠 관리
- **GCS_WEB**: GCS:Web 전공 소개
- **MAJOR_INTRO**: 전공 소개
- **SUBJECTS**: 개설 과목
- **PROFESSORS**: 교수진 소개

#### 사용자 관리
- 역할 변경
- 학생 인증 승인/거부
- 사용자 목록 조회

#### 주문 관리
- 주문 목록 조회
- 주문 상태 변경
- 결제 취소

### 6. 판매팀 시스템

- 판매팀 생성 및 관리
- 판매팀 멤버 관리
- 판매팀별 상품 관리

### 7. 챗봇 시스템

- 사전 정의된 옵션 기반 응답
- 사용자 질문 기록
- 관리자 콘텐츠 관리

---

## 🗄️ 데이터베이스 스키마

### 주요 모델

#### User (사용자)
- 기본 정보: email, name, phone, studentId, major
- 역할 및 권한: role, isSeller, verificationStatus
- 인증 정보: verificationImageUrl, verificationRequestedAt, etc.
- 관계: posts, orders, products, comments 등

#### Post (게시글)
- category: BOARD | LOUNGE
- images: 배열 형태로 다중 이미지 저장
- 관계: author, comments, likes

#### Product (상품)
- 타입: FUND | PARTNER_UP
- 가격 및 재고 정보
- 펀딩 정보 (Fund 타입만)
- 옵션: JSON 형태로 저장
- 관계: orderItems, reviews, likes

#### Order (주문)
- 주문 상태 관리
- 결제 정보 (JSON)
- 빌링 스케줄 정보
- 관계: user, orderItems, paymentRecords

#### BillingSchedule (빌링 스케줄)
- 정기 결제 스케줄 관리
- 상태: SCHEDULED | EXECUTED | FAILED | CANCELLED
- 웹훅으로 자동 업데이트

### 인덱스 전략
- 자주 조회되는 필드에 인덱스 설정
- 복합 인덱스로 쿼리 성능 최적화
- 예: `@@index([category, createdAt])`, `@@index([status, createdAt])`

---

## 🔐 보안 기능

### Rate Limiting
- Upstash Redis 사용
- IP 기반 및 계정 기반 제한
- 로그인 시도 제한

### 입력 검증
- Zod를 통한 스키마 검증
- XSS 방지
- SQL Injection 방지 (Prisma 사용)

### 인증 보안
- JWT 토큰 검증
- HTTP-only 쿠키 사용
- 비밀번호 해싱 (bcrypt)

---

## 📧 이메일 시스템

### 지원 방식
1. **SMTP** (Gmail, Brevo 등)
2. **SendGrid HTTP API**
3. **Brevo HTTP API** (Railway 배포용 권장)

### 용도
- 이메일 인증 코드 발송
- 비밀번호 재설정 링크
- 인증 완료 알림

---

## 🎨 UI/UX 특징

### 디자인
- **브랜드 컬러**: 주황색 (#f57520) 강조
- **반응형 디자인**: 모바일 우선 설계
- **Tailwind CSS**: 유틸리티 기반 스타일링

### 네비게이션
- 상단 고정 네비게이션 바
- 모바일 햄버거 메뉴
- 드롭다운 서브메뉴

### 사용자 경험
- 로딩 상태 표시
- 에러 처리 및 알림
- 이미지 최적화 (Next.js Image)
- 캐싱 전략

---

## 🚀 배포 및 운영

### Railway 배포
- PostgreSQL 데이터베이스 자동 연결
- 환경 변수 관리
- 자동 배포 (GitHub 연동)

### 빌드 최적화
- Standalone 빌드 모드
- Prisma Client 포함
- 이미지 최적화

### 데이터베이스 마이그레이션
- Prisma Migrate 사용
- 개발/프로덕션 환경 분리
- 시드 데이터 지원

---

## 🔄 주요 워크플로우

### 1. 회원가입 → 인증 → 전공회원 전환
```
1. 일반 회원가입 (GENERAL)
2. 학생 인증 요청 (이미지 업로드)
3. 관리자 승인 대기 (REQUESTED)
4. 관리자 승인 → 전공회원 전환 (MAJOR)
```

### 2. 상품 구매 프로세스
```
1. 상품 선택
2. 옵션 선택 및 장바구니 추가
3. 체크아웃 (배송지 입력)
4. PortOne 결제
5. 주문 생성 및 결제 검증
6. 주문 상태 관리
```

### 3. 펀딩 상품 프로세스
```
1. 펀딩 상품 결제 (일반 결제)
2. 목표 금액 달성 확인
3. 빌링키 발급
4. 관리자 빌링키 결제 승인
5. 예약 결제 스케줄 생성
6. 자동 결제 실행 (웹훅)
```

---

## 📊 API 구조

### RESTful API 설계
- `/api/auth/*` - 인증 관련
- `/api/community/*` - 커뮤니티
- `/api/archive/*` - 아카이브
- `/api/shop/*` - 쇼핑몰
- `/api/admin/*` - 관리자
- `/api/mypage/*` - 마이페이지
- `/api/payments/*` - 결제 (웹훅)

### 응답 형식
```typescript
{
  success: boolean,
  data?: any,
  error?: string
}
```

---

## 🛠️ 개발 도구 및 유틸리티

### 개발 스크립트
- `npm run dev` - 개발 서버
- `npm run build` - 프로덕션 빌드
- `npm run db:push` - DB 스키마 푸시
- `npm run db:studio` - Prisma Studio
- `npm run db:seed` - 시드 데이터

### 유틸리티 함수
- 캐시 관리 (`lib/cache.ts`)
- 로깅 (`lib/logger.ts`)
- 보안 검증 (`lib/security.ts`)
- 이메일 발송 (`lib/email.ts`)
- 권한 체크 (`lib/permissions.ts`)

---

## 🎯 설계 특징 및 아키텍처

### 1. 계층화된 아키텍처
- **Presentation Layer**: React 컴포넌트 (app/)
- **API Layer**: Next.js API Routes
- **Business Logic Layer**: lib/ 유틸리티
- **Data Layer**: Prisma ORM

### 2. 권한 기반 접근 제어 (RBAC)
- 역할별 권한 명확히 정의
- 함수형 권한 체크 시스템
- 서버/클라이언트 양쪽 검증

### 3. 확장 가능한 구조
- 모듈화된 컴포넌트
- 재사용 가능한 유틸리티
- 플러그인 가능한 이메일 시스템

### 4. 타입 안전성
- TypeScript 전체 적용
- Prisma로 타입 자동 생성
- 엄격한 타입 체크

### 5. 성능 최적화
- Next.js 서버 사이드 렌더링
- 이미지 최적화
- 데이터베이스 인덱싱
- 캐싱 전략

---

## 🔍 주요 기술적 결정사항

### 1. Next.js App Router
- 최신 Next.js 기능 활용
- 서버 컴포넌트 활용
- 파일 기반 라우팅

### 2. Prisma ORM
- 타입 안전한 데이터베이스 접근
- 마이그레이션 관리
- 관계 관리

### 3. PortOne V2 SDK
- 최신 결제 API 사용
- 빌링키 결제 지원
- 웹훅 처리

### 4. JWT 인증
- Stateless 인증
- 쿠키 기반 토큰 저장
- 서버 사이드 검증

---

## 📝 개선 가능 영역

### 1. 테스트
- 단위 테스트 추가
- 통합 테스트
- E2E 테스트

### 2. 에러 처리
- 글로벌 에러 바운더리
- 더 상세한 에러 메시지
- 에러 로깅 시스템

### 3. 성능
- 이미지 CDN 사용
- 더 적극적인 캐싱
- 데이터베이스 쿼리 최적화

### 4. 모니터링
- 로깅 시스템 통합
- 에러 추적 (Sentry 등)
- 성능 모니터링

---

## 📚 결론

GCS Web Demo는 현대적인 웹 개발 스택을 활용한 잘 구조화된 풀스택 애플리케이션입니다. 

**강점:**
- ✅ 명확한 역할 기반 권한 시스템
- ✅ 확장 가능한 아키텍처
- ✅ 타입 안전성
- ✅ 현대적인 기술 스택
- ✅ 포괄적인 기능 세트

**주요 특징:**
- 🎓 교육 기관 특화 기능 (학생 인증, 전공회원 시스템)
- 🛒 전자상거래 기능 (펀딩, 일반 상품)
- 👥 커뮤니티 기능
- 📦 아카이브 시스템
- ⚙️ 강력한 관리자 도구

이 프로젝트는 동국대학교 GCS 연계전공의 디지털 허브로서 학생, 교수진, 그리고 방문자들에게 통합된 플랫폼을 제공합니다.



