# 데이터베이스 마이그레이션 가이드 - buyerName, buyerEmail 필드 추가

이 가이드는 `orders` 테이블에 `buyerName`과 `buyerEmail` 필드를 추가하는 방법을 설명합니다.

## 📋 실행할 SQL 쿼리

```sql
-- Add buyerName and buyerEmail fields to orders table
ALTER TABLE "public"."orders" 
ADD COLUMN IF NOT EXISTS "buyerName" TEXT,
ADD COLUMN IF NOT EXISTS "buyerEmail" TEXT;
```

---

## 방법 1: psql 명령줄 도구 사용 (권장)

### 1-1. psql 설치 확인

Windows에서 psql이 설치되어 있는지 확인:
```powershell
psql --version
```

설치되어 있지 않다면:
- PostgreSQL 공식 사이트에서 다운로드: https://www.postgresql.org/download/windows/
- 또는 PostgreSQL 설치 시 함께 설치되는 pgAdmin 4 사용

### 1-2. DATABASE_URL에서 연결 정보 추출

`.env` 파일의 `DATABASE_URL` 형식:
```
postgresql://username:password@host:port/database
```

예시:
```
postgresql://postgres:abc123@switchyard.proxy.rlwy.net:56747/railway
```

### 1-3. psql로 연결

PowerShell에서 실행:
```powershell
# 형식: psql -h [호스트] -p [포트] -U [사용자명] -d [데이터베이스명]
psql -h switchyard.proxy.rlwy.net -p 56747 -U postgres -d railway
```

비밀번호를 입력하라는 프롬프트가 나타나면 `.env` 파일의 비밀번호를 입력하세요.

### 1-4. SQL 실행

psql에 연결된 후:
```sql
ALTER TABLE "public"."orders" 
ADD COLUMN IF NOT EXISTS "buyerName" TEXT,
ADD COLUMN IF NOT EXISTS "buyerEmail" TEXT;
```

### 1-5. 확인

필드가 추가되었는지 확인:
```sql
\d orders
```

또는:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('buyerName', 'buyerEmail');
```

### 1-6. 종료

```sql
\q
```

---

## 방법 2: Railway CLI 사용

### 2-1. Railway CLI 설치

```powershell
npm install -g @railway/cli
```

### 2-2. Railway에 로그인

```powershell
railway login
```

### 2-3. 프로젝트 연결

```powershell
railway link
```

### 2-4. SQL 파일 실행

```powershell
# SQL 파일 내용을 Railway 데이터베이스에 실행
railway run psql $DATABASE_URL -f prisma/migrations/manual_add_buyer_fields.sql
```

또는 직접 SQL 실행:
```powershell
railway run psql $DATABASE_URL -c "ALTER TABLE \"public\".\"orders\" ADD COLUMN IF NOT EXISTS \"buyerName\" TEXT, ADD COLUMN IF NOT EXISTS \"buyerEmail\" TEXT;"
```

---

## 방법 3: 데이터베이스 클라이언트 도구 사용

### 3-1. pgAdmin 4 사용

1. **pgAdmin 4 실행**
   - PostgreSQL 설치 시 함께 설치됨

2. **서버 연결 추가**
   - 우클릭 → "Create" → "Server"
   - General 탭:
     - Name: Railway Database (원하는 이름)
   - Connection 탭:
     - Host: `switchyard.proxy.rlwy.net` (DATABASE_URL에서 추출)
     - Port: `56747` (DATABASE_URL에서 추출)
     - Database: `railway` (DATABASE_URL에서 추출)
     - Username: `postgres` (DATABASE_URL에서 추출)
     - Password: `.env` 파일의 비밀번호

3. **SQL 쿼리 실행**
   - 연결된 서버 → Databases → railway → Schemas → public → Tables → orders
   - 우클릭 → "Query Tool"
   - 다음 SQL 입력:
   ```sql
   ALTER TABLE "public"."orders" 
   ADD COLUMN IF NOT EXISTS "buyerName" TEXT,
   ADD COLUMN IF NOT EXISTS "buyerEmail" TEXT;
   ```
   - 실행 버튼 클릭 (F5 또는 ▶)

### 3-2. DBeaver 사용

1. **DBeaver 다운로드 및 설치**
   - https://dbeaver.io/download/

2. **데이터베이스 연결 생성**
   - "New Database Connection" → PostgreSQL 선택
   - 연결 정보 입력:
     - Host: `switchyard.proxy.rlwy.net`
     - Port: `56747`
     - Database: `railway`
     - Username: `postgres`
     - Password: `.env` 파일의 비밀번호

3. **SQL 실행**
   - 연결된 데이터베이스 → SQL Editor 열기
   - SQL 입력 후 실행 (Ctrl+Enter)

### 3-3. TablePlus 사용

1. **TablePlus 다운로드**
   - https://tableplus.com/

2. **연결 생성**
   - "Create a new connection" → PostgreSQL
   - 연결 정보 입력 후 연결

3. **SQL 실행**
   - SQL 탭에서 쿼리 입력 후 실행

---

## 방법 4: Node.js 스크립트 사용

### 4-1. 스크립트 생성

`scripts/add-buyer-fields.js` 파일 생성:

```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addBuyerFields() {
  try {
    console.log('🔄 buyerName, buyerEmail 필드 추가 중...');
    
    await prisma.$executeRaw`
      ALTER TABLE "public"."orders" 
      ADD COLUMN IF NOT EXISTS "buyerName" TEXT,
      ADD COLUMN IF NOT EXISTS "buyerEmail" TEXT;
    `;
    
    console.log('✅ 필드 추가 완료!');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addBuyerFields();
```

### 4-2. 스크립트 실행

```powershell
node scripts/add-buyer-fields.js
```

---

## 방법 5: Railway 웹 대시보드 사용

### 5-1. Railway 대시보드 접속

1. https://railway.app 접속
2. 프로젝트 선택
3. PostgreSQL 서비스 선택

### 5-2. Query 탭 사용

1. PostgreSQL 서비스 → "Query" 탭 클릭
2. SQL 쿼리 입력:
   ```sql
   ALTER TABLE "public"."orders" 
   ADD COLUMN IF NOT EXISTS "buyerName" TEXT,
   ADD COLUMN IF NOT EXISTS "buyerEmail" TEXT;
   ```
3. "Run" 버튼 클릭

---

## ✅ 마이그레이션 확인

어떤 방법을 사용하든, 마이그레이션이 성공했는지 확인하세요:

### SQL로 확인:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
  AND column_name IN ('buyerName', 'buyerEmail');
```

예상 결과:
```
column_name | data_type | is_nullable
------------|-----------|-------------
buyerName   | text      | YES
buyerEmail  | text      | YES
```

### Prisma로 확인:
```powershell
npx prisma db pull
```

이 명령어는 데이터베이스 스키마를 읽어서 Prisma 스키마와 동기화합니다.

---

## 🔧 문제 해결

### 오류: "column already exists"
- 이미 필드가 존재하는 경우입니다. `IF NOT EXISTS`를 사용했으므로 안전하게 무시할 수 있습니다.

### 오류: "permission denied"
- 데이터베이스 사용자에게 ALTER TABLE 권한이 없는 경우입니다.
- Railway에서는 일반적으로 권한이 있으므로, 다른 데이터베이스 서버를 사용하는 경우 관리자에게 문의하세요.

### 오류: "relation does not exist"
- `orders` 테이블이 존재하지 않는 경우입니다.
- 먼저 Prisma 마이그레이션을 실행하여 테이블을 생성하세요:
  ```powershell
  npx prisma db push
  ```

---

## 📝 다음 단계

마이그레이션이 완료된 후:

1. **Prisma Client 재생성**:
   ```powershell
   npx prisma generate
   ```

2. **애플리케이션 재시작**:
   - 개발 서버를 재시작하여 변경사항을 반영하세요.

3. **테스트**:
   - 체크아웃 페이지에서 주문을 생성하고
   - 주문 내역 페이지에서 `buyerName`과 `buyerEmail`이 올바르게 표시되는지 확인하세요.

---

## 💡 추천 방법

- **로컬 개발 환경**: 방법 1 (psql) 또는 방법 3 (pgAdmin)
- **Railway 프로덕션**: 방법 2 (Railway CLI) 또는 방법 5 (Railway 대시보드)
- **자동화가 필요한 경우**: 방법 4 (Node.js 스크립트)

