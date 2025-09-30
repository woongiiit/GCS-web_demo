# Database Setup Guide

## Railway PostgreSQL 설정

### 1. Railway에서 PostgreSQL 데이터베이스 생성

1. Railway 대시보드에서 새 프로젝트 생성
2. "Add Service" → "Database" → "PostgreSQL" 선택
3. 데이터베이스가 생성되면 연결 정보 복사

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Railway PostgreSQL 연결 문자열
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"

# JWT 시크릿 (회원가입/로그인용)
JWT_SECRET="your-super-secret-jwt-key-here"

# Next.js
NEXTAUTH_URL="https://your-app.railway.app"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

### 3. 데이터베이스 마이그레이션 및 시드

```bash
# 1. Prisma 클라이언트 생성
npm run db:generate

# 2. 데이터베이스에 테이블 생성
npx prisma db push

# 3. 초기 데이터 시드
npm run db:seed
```

### 4. Railway 배포 설정

Railway에서 환경 변수를 설정하세요:

1. Railway 프로젝트 → Variables 탭
2. 다음 환경 변수 추가:
   - `DATABASE_URL`: PostgreSQL 연결 문자열
   - `JWT_SECRET`: JWT 서명용 시크릿 키
   - `NEXTAUTH_URL`: 배포된 앱 URL
   - `NEXTAUTH_SECRET`: NextAuth 시크릿

### 5. 배포 후 데이터베이스 설정

Railway에 배포된 후 다음 명령어로 데이터베이스 설정:

```bash
# Railway CLI 사용 (선택사항)
railway run npx prisma db push
railway run npm run db:seed
```

또는 Railway 웹 대시보드에서 터미널을 통해 실행할 수 있습니다.

## 데이터베이스 스키마

### 주요 테이블

- **users**: 사용자 정보 (회원가입 데이터)
- **posts**: 커뮤니티 게시글
- **comments**: 댓글
- **categories**: 상품 카테고리
- **products**: 상품 정보
- **orders**: 주문 정보
- **order_items**: 주문 상품 목록
- **projects**: 아카이브 프로젝트
- **news**: 뉴스
- **majors**: 전공 정보
- **subjects**: 과목 정보
- **professors**: 교수진 정보

### 관계

- User → Posts (1:N)
- User → Comments (1:N)
- User → Orders (1:N)
- Post → Comments (1:N)
- Category → Products (1:N)
- Order → OrderItems (1:N)
- Product → OrderItems (1:N)
- Major → Subjects (1:N)
- Professor → Subjects (1:N)

## 유용한 명령어

```bash
# 데이터베이스 스튜디오 실행 (로컬 개발용)
npm run db:studio

# 데이터베이스 리셋 (개발용)
npm run db:reset

# 마이그레이션 생성 (스키마 변경시)
npm run db:migrate
```
