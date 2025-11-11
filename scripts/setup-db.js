const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupDatabase() {
  console.log('🚀 Railway PostgreSQL 데이터베이스 설정 시작...')

  try {
    // 데이터베이스 연결 테스트
    await prisma.$connect()
    console.log('✅ 데이터베이스 연결 성공')

    // 테이블이 이미 존재하는지 확인
    const userCount = await prisma.user.count()
    console.log(`📊 현재 사용자 수: ${userCount}`)

    if (userCount === 0) {
      console.log('🌱 초기 데이터 시드 시작...')
      
      // 전공 데이터 생성
      const majors = await Promise.all([
        prisma.major.upsert({
          where: { code: 'GCS_WEB' },
          update: {},
          create: {
            name: 'GCS:Web',
            code: 'GCS_WEB',
            description: '글로벌커뮤니케이션학부 웹 개발 전공'
          }
        }),
        prisma.major.upsert({
          where: { code: 'GLOBAL_COMM' },
          update: {},
          create: {
            name: '글로벌커뮤니케이션학',
            code: 'GLOBAL_COMM',
            description: '글로벌커뮤니케이션학 전공'
          }
        })
      ])

      // 교수진 데이터 생성
      const professors = await Promise.all([
        prisma.professor.upsert({
          where: { email: 'prof1@dongguk.edu' },
          update: {},
          create: {
            name: '김교수',
            title: '교수',
            email: 'prof1@dongguk.edu',
            phone: '02-2260-3000',
            office: '관정관 101호',
            researchAreas: ['웹 개발', '프론트엔드', 'React'],
            education: '컴퓨터공학 박사',
            experience: '10년'
          }
        })
      ])

      // 샘플 상품 생성
      await prisma.product.create({
        data: {
          name: 'GCS 로고 티셔츠',
          description: '<p>GCS 브랜드 로고가 새겨진 기본 티셔츠입니다.</p>',
          shortDescription: 'GCS 로고가 인쇄된 베이직 티셔츠',
          price: 25000,
          originalPrice: 30000,
          discount: 17,
          stock: 0,
          images: ['/images/shop/sample-product.jpg'],
          brand: 'GCS',
          type: 'FUND',
          fundingGoalAmount: 500000,
          fundingCurrentAmount: 125000,
          fundingSupporterCount: 58
        }
      })

      console.log('✅ 초기 데이터 시드 완료')
    } else {
      console.log('ℹ️  데이터베이스에 이미 데이터가 존재합니다.')
    }

    console.log('🎉 Railway 데이터베이스 설정 완료!')
    
  } catch (error) {
    console.error('❌ 데이터베이스 설정 중 오류 발생:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()
