#!/bin/sh

echo "🚀 GCS Demo 애플리케이션 시작 중..."

# 환경 변수 확인
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL 환경 변수가 설정되지 않았습니다."
    echo "⚠️  데이터베이스 설정을 건너뛰고 애플리케이션을 시작합니다."
    exec node server.js
fi

echo "✅ DATABASE_URL 환경 변수 확인 완료"

# 데이터베이스 설정 시도
echo "🗄️ 데이터베이스 설정을 시작합니다..."

# Prisma 클라이언트 생성
echo "📦 Prisma 클라이언트 생성 중..."
npx prisma generate || {
    echo "⚠️  Prisma 클라이언트 생성 실패. 애플리케이션을 계속 시작합니다."
    exec node server.js
}

# 데이터베이스 스키마 적용
echo "🏗️ 데이터베이스 스키마 적용 중..."
npx prisma db push || {
    echo "⚠️  데이터베이스 스키마 적용 실패. 애플리케이션을 계속 시작합니다."
    exec node server.js
}

# 초기 데이터 시드 (백그라운드에서 실행)
echo "🌱 초기 데이터 시드 실행 중..."
npm run db:seed &
SEED_PID=$!

# 시드 작업이 완료될 때까지 최대 30초 대기
sleep 30

# 시드 작업이 아직 실행 중이면 백그라운드에서 계속 실행
if kill -0 $SEED_PID 2>/dev/null; then
    echo "🌱 초기 데이터 시드가 백그라운드에서 계속 실행됩니다."
else
    echo "✅ 초기 데이터 시드 완료"
fi

echo "🎉 데이터베이스 설정 완료! 애플리케이션을 시작합니다."

# Next.js 애플리케이션 시작
exec node server.js
