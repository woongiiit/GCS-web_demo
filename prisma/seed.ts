import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 시작: 데이터베이스 시드 작업...')

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
    }),
    prisma.major.upsert({
      where: { code: 'DIGITAL_MEDIA' },
      update: {},
      create: {
        name: '디지털미디어학',
        code: 'DIGITAL_MEDIA',
        description: '디지털미디어학 전공'
      }
    }),
    prisma.major.upsert({
      where: { code: 'INTERNATIONAL_TRADE' },
      update: {},
      create: {
        name: '국제통상학',
        code: 'INTERNATIONAL_TRADE',
        description: '국제통상학 전공'
      }
    })
  ])

  console.log('✅ 전공 데이터 생성 완료')

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
    }),
    prisma.professor.upsert({
      where: { email: 'prof2@dongguk.edu' },
      update: {},
      create: {
        name: '이교수',
        title: '부교수',
        email: 'prof2@dongguk.edu',
        phone: '02-2260-3001',
        office: '관정관 102호',
        researchAreas: ['백엔드', '데이터베이스', 'Node.js'],
        education: '소프트웨어공학 박사',
        experience: '8년'
      }
    }),
    prisma.professor.upsert({
      where: { email: 'prof3@dongguk.edu' },
      update: {},
      create: {
        name: '박교수',
        title: '조교수',
        email: 'prof3@dongguk.edu',
        phone: '02-2260-3002',
        office: '관정관 103호',
        researchAreas: ['UI/UX', '디자인', '사용자 경험'],
        education: '디자인학 박사',
        experience: '5년'
      }
    })
  ])

  console.log('✅ 교수진 데이터 생성 완료')

  // 과목 데이터 생성
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { code: 'WEB101' },
      update: {},
      create: {
        name: '웹 프로그래밍 기초',
        code: 'WEB101',
        description: 'HTML, CSS, JavaScript 기초',
        credits: 3,
        semester: '1학기',
        year: 2024,
        majorId: majors[0].id,
        professorId: professors[0].id
      }
    }),
    prisma.subject.upsert({
      where: { code: 'WEB102' },
      update: {},
      create: {
        name: 'React 개발',
        code: 'WEB102',
        description: 'React 프레임워크를 이용한 웹 개발',
        credits: 3,
        semester: '2학기',
        year: 2024,
        majorId: majors[0].id,
        professorId: professors[0].id
      }
    }),
    prisma.subject.upsert({
      where: { code: 'WEB103' },
      update: {},
      create: {
        name: 'Node.js 서버 개발',
        code: 'WEB103',
        description: 'Node.js를 이용한 백엔드 개발',
        credits: 3,
        semester: '1학기',
        year: 2024,
        majorId: majors[0].id,
        professorId: professors[1].id
      }
    })
  ])

  console.log('✅ 과목 데이터 생성 완료')

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
    }),
    prisma.category.upsert({
      where: { name: 'Bag & Pouch' },
      update: {},
      create: {
        name: 'Bag & Pouch',
        description: '일상생활과 캠퍼스 라이프를 위한 가방'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Life' },
      update: {},
      create: {
        name: 'Life',
        description: '생활용품과 유틸리티 아이템'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Accessory' },
      update: {},
      create: {
        name: 'Accessory',
        description: '스타일을 완성하는 액세서리'
      }
    })
  ])

  console.log('✅ 상품 카테고리 생성 완료')

  // 샘플 상품 데이터 생성
  const products = await Promise.all([
    // Apparel
    prisma.product.create({
      data: {
        name: 'GCS 로고 티셔츠',
        description: 'GCS 브랜드 로고가 새겨진 기본 티셔츠입니다. 100% 면 소재로 제작되어 편안한 착용감을 제공합니다.',
        price: 25000,
        originalPrice: 30000,
        discount: 17,
        stock: 100,
        imageUrl: '/images/shop/apparel/tshirt-1.jpg',
        tags: ['베스트셀러', 'NEW'],
        features: ['100% 면 소재', '편안한 착용감'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['화이트', '블랙', '네이비'],
        categoryId: categories[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: '후드 집업',
        description: '편안한 착용감의 후드 집업입니다. 가슴 부분에 GCS 로고가 자수로 새겨져 있습니다.',
        price: 45000,
        originalPrice: 55000,
        discount: 18,
        stock: 50,
        imageUrl: '/images/shop/apparel/hoodie-1.jpg',
        tags: ['인기상품'],
        features: ['자수 로고', '편안한 착용감'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['그레이', '블랙', '네이비'],
        categoryId: categories[0].id
      }
    }),
    // Stationary
    prisma.product.create({
      data: {
        name: 'GCS 노트북',
        description: 'GCS 브랜드가 새겨진 스프링 노트북입니다. 100페이지 구성으로 학습과 업무에 적합합니다.',
        price: 8000,
        originalPrice: 10000,
        discount: 20,
        stock: 200,
        imageUrl: '/images/shop/stationary/notebook-1.jpg',
        tags: ['베스트셀러'],
        features: ['100페이지', 'A4 사이즈', '스프링 제본'],
        sizes: [],
        colors: [],
        categoryId: categories[1].id
      }
    }),
    prisma.product.create({
      data: {
        name: '볼펜 세트',
        description: '다양한 색상의 볼펜 세트입니다. 0.5mm 두께로 깔끔한 필기가 가능합니다.',
        price: 12000,
        originalPrice: 15000,
        discount: 20,
        stock: 150,
        imageUrl: '/images/shop/stationary/pen-set.jpg',
        tags: ['NEW'],
        features: ['0.5mm 두께', '5색 세트', '수납 케이스 포함'],
        sizes: [],
        colors: [],
        categoryId: categories[1].id
      }
    }),
    // Bag & Pouch
    prisma.product.create({
      data: {
        name: '토트백',
        description: '내구성이 뛰어난 캔버스 토트백입니다. 넉넉한 수납공간과 스타일리시한 디자인을 제공합니다.',
        price: 28000,
        originalPrice: 35000,
        discount: 20,
        stock: 80,
        imageUrl: '/images/shop/bag/tote.jpg',
        tags: ['베스트셀러'],
        features: ['캔버스 소재', '넉넉한 수납공간', '다양한 색상'],
        sizes: [],
        colors: [],
        categoryId: categories[2].id
      }
    }),
    // Life
    prisma.product.create({
      data: {
        name: '텀블러',
        description: '보온성이 뛰어난 스테인리스 텀블러입니다. 500ml 용량으로 하루 종일 사용하기 좋습니다.',
        price: 18000,
        originalPrice: 25000,
        discount: 28,
        stock: 120,
        imageUrl: '/images/shop/life/tumbler.jpg',
        tags: ['베스트셀러'],
        features: ['500ml 용량', '스테인리스 소재', '보온/보냉 12시간'],
        sizes: [],
        colors: [],
        categoryId: categories[3].id
      }
    }),
    // Accessory
    prisma.product.create({
      data: {
        name: '핀 배지',
        description: '컬렉션용 핀 배지입니다. 고급스러운 금속 소재와 정교한 디테일이 특징입니다.',
        price: 8000,
        originalPrice: 12000,
        discount: 33,
        stock: 300,
        imageUrl: '/images/shop/accessory/pin.jpg',
        tags: ['NEW'],
        features: ['금속 소재', '정교한 디테일', '컬렉션용'],
        sizes: [],
        colors: [],
        categoryId: categories[4].id
      }
    })
  ])

  console.log('✅ 샘플 상품 데이터 생성 완료')

  // 비밀번호 해시 생성 (더 안전한 비밀번호 사용)
  const adminPassword = await bcrypt.hash('GCS_Admin_2024!', 10)
  const userPassword = await bcrypt.hash('GCS_User_2024!', 10)

  // 관리자 계정 생성
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gcs-demo.com' },
    update: {},
    create: {
      email: 'admin@gcs-demo.com',
      password: adminPassword,
      name: '관리자',
      studentId: 'ADMIN001',
      major: 'GCS:Web',
      phone: '010-0000-0000',
      role: 'ADMIN'
    }
  })

  // 일반 사용자 계정 생성
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@gcs-demo.com' },
    update: {},
    create: {
      email: 'user@gcs-demo.com',
      password: userPassword,
      name: '일반사용자',
      studentId: 'USER001',
      major: 'GCS:Web',
      phone: '010-1111-1111',
      role: 'USER'
    }
  })

  console.log('✅ 사용자 데이터 생성 완료')
  console.log('👤 관리자 계정: admin@gcs-demo.com / GCS_Admin_2024!')
  console.log('👤 일반 사용자: user@gcs-demo.com / GCS_User_2024!')

  console.log('🎉 데이터베이스 시드 작업 완료!')
}

main()
  .catch((e) => {
    console.error('❌ 시드 작업 중 오류 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
