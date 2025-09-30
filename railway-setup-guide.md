# Railway 데이터베이스 설정 가이드

## 🚀 방법 1: Railway CLI 사용 (권장)

### 1. Railway CLI 설치
```bash
npm install -g @railway/cli
```

### 2. Railway에 로그인
```bash
railway login
```

### 3. 프로젝트 연결
```bash
railway link
```

### 4. 데이터베이스 설정 실행
```bash
railway run npm run railway:db:setup
```

## 🔧 방법 2: 로컬에서 직접 실행

### 1. 환경 변수 설정
Railway 대시보드에서 `DATABASE_URL`을 복사하여 로컬 환경 변수로 설정:

```bash
# Windows (PowerShell)
$env:DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"

# Windows (Command Prompt)
set DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# macOS/Linux
export DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
```

### 2. 데이터베이스 설정 실행
```bash
npm run railway:db:setup
```

## 📋 단계별 데이터베이스 설정 명령어

### 1. Prisma 클라이언트 생성
```bash
npx prisma generate
```

### 2. 데이터베이스 스키마 적용
```bash
npx prisma db push
```

### 3. 초기 데이터 시드
```bash
npm run db:seed
```

## 🔍 문제 해결

### Railway CLI 설치 오류 시:
```bash
# 대안 1: npm 대신 yarn 사용
yarn global add @railway/cli

# 대안 2: npx 사용
npx @railway/cli login
npx @railway/cli link
npx @railway/cli run npm run railway:db:setup
```

### 환경 변수 확인:
```bash
# Railway CLI로 환경 변수 확인
railway variables

# 또는 로컬에서 확인
echo $DATABASE_URL
```
