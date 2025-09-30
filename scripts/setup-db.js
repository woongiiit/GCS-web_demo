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

      // 상품 카테고리 생성
      const categories = await Promise.all([
        prisma.category.upsert({
          where: { name: 'Apparel' },
          update: {},
          create: {
            name: 'Apparel',
            description: 'GCS 브랜드 의류 컬렉션'
          }
        }),
        prisma.category.upsert({
          where: { name: 'Stationary' },
          update: {},
          create: {
            name: 'Stationary',
            description: '학습과 업무에 필요한 문구류'
          }
        })
      ])

      // 샘플 상품 생성
      await prisma.product.create({
        data: {
          name: 'GCS 로고 티셔츠',
          description: 'GCS 브랜드 로고가 새겨진 기본 티셔츠입니다.',
          price: 25000,
          originalPrice: 30000,
          discount: 17,
          stock: 100,
          tags: ['베스트셀러', 'NEW'],
          features: ['100% 면 소재', '편안한 착용감'],
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['화이트', '블랙', '네이비'],
          categoryId: categories[0].id
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
