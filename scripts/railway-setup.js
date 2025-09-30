#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Railway PostgreSQL 데이터베이스 설정 시작...');

try {
  // 1. Prisma 클라이언트 생성
  console.log('📦 Prisma 클라이언트 생성 중...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma 클라이언트 생성 완료');

  // 2. 데이터베이스 스키마 푸시
  console.log('🗄️ 데이터베이스 스키마 적용 중...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ 데이터베이스 스키마 적용 완료');

  // 3. 초기 데이터 시드
  console.log('🌱 초기 데이터 시드 실행 중...');
  execSync('npm run db:seed', { stdio: 'inherit' });
  console.log('✅ 초기 데이터 시드 완료');

  console.log('🎉 Railway 데이터베이스 설정 완료!');
  console.log('📊 다음 테이블들이 생성되었습니다:');
  console.log('   - users (사용자)');
  console.log('   - posts (게시글)');
  console.log('   - comments (댓글)');
  console.log('   - categories (상품 카테고리)');
  console.log('   - products (상품)');
  console.log('   - orders (주문)');
  console.log('   - order_items (주문 상품)');
  console.log('   - projects (프로젝트)');
  console.log('   - news (뉴스)');
  console.log('   - majors (전공)');
  console.log('   - subjects (과목)');
  console.log('   - professors (교수진)');

} catch (error) {
  console.error('❌ 데이터베이스 설정 중 오류 발생:', error.message);
  process.exit(1);
}
