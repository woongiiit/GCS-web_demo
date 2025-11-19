/**
 * Add buyerName and buyerEmail fields to orders table
 * 
 * Usage:
 *   node scripts/add-buyer-fields.js
 * 
 * 또는 package.json에 스크립트 추가:
 *   "db:add-buyer-fields": "node scripts/add-buyer-fields.js"
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addBuyerFields() {
  try {
    console.log('🔄 buyerName, buyerEmail 필드 추가 중...');
    
    // SQL 쿼리 실행
    await prisma.$executeRaw`
      ALTER TABLE "public"."orders" 
      ADD COLUMN IF NOT EXISTS "buyerName" TEXT,
      ADD COLUMN IF NOT EXISTS "buyerEmail" TEXT;
    `;
    
    console.log('✅ 필드 추가 완료!');
    
    // 확인 쿼리
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name IN ('buyerName', 'buyerEmail')
      ORDER BY column_name;
    `;
    
    console.log('\n📋 추가된 필드 확인:');
    console.table(result);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    console.error('\n오류 상세:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
addBuyerFields()
  .then(() => {
    console.log('\n✨ 마이그레이션 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 예상치 못한 오류:', error);
    process.exit(1);
  });

