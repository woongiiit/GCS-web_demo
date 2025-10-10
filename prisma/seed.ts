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
      where: { email: 'kim.bonggu@dongguk.edu' },
      update: {},
      create: {
        name: '김봉구 교수님',
        title: '대우교수',
        email: 'kim.bonggu@dongguk.edu',
        phone: '02-2260-3000',
        office: '관정관 101호',
        affiliation: '동국대학교 경영대학 GCS연계전공',
        company: '프린팅플랫폼(주)',
        position: '대표이사',
        courses: ['그래픽커뮤니케이션사이언스입문', '캡스톤디자인'],
        researchAreas: ['그래픽커뮤니케이션', '인쇄기술'],
        education: '인쇄공학 박사',
        experience: '15년',
        imageUrl: '/images/professor1.png',
        displayOrder: 1
      }
    }),
    prisma.professor.upsert({
      where: { email: 'kim.byungsoo@dongguk.edu' },
      update: {},
      create: {
        name: '김병수 교수님',
        title: '대우교수',
        email: 'kim.byungsoo@dongguk.edu',
        phone: '02-2260-3001',
        office: '관정관 102호',
        affiliation: '동국대학교 경영대학 GCS연계전공',
        company: 'HP Asia Pacific Graphic Industrial Strategic Biz',
        position: '상무',
        courses: ['4차산업과 패키징'],
        researchAreas: ['패키징', '4차산업'],
        education: '산업공학 박사',
        experience: '12년',
        imageUrl: '/images/professor2.png',
        displayOrder: 2
      }
    }),
    prisma.professor.upsert({
      where: { email: 'kim.jungwook@dongguk.edu' },
      update: {},
      create: {
        name: '김정욱 교수님',
        title: '대우교수',
        email: 'kim.jungwook@dongguk.edu',
        phone: '02-2260-3002',
        office: '관정관 103호',
        affiliation: '동국대학교 경영대학 GCS연계전공',
        company: '콘타그립',
        position: '대표',
        courses: ['컬러매니지먼트와 디자인'],
        researchAreas: ['컬러매니지먼트', '디자인'],
        education: '디자인학 박사',
        experience: '10년',
        imageUrl: '/images/professor3.png',
        displayOrder: 3
      }
    }),
    prisma.professor.upsert({
      where: { email: 'kim.seungyong@dongguk.edu' },
      update: {},
      create: {
        name: '김승용 교수님',
        title: '교수',
        email: 'kim.seungyong@dongguk.edu',
        phone: '02-2260-3003',
        office: '관정관 104호',
        affiliation: '동국대학교 경영대학 GCS연계전공',
        courses: [],
        researchAreas: ['그래픽커뮤니케이션'],
        education: '커뮤니케이션학 박사',
        experience: '8년',
        imageUrl: '/images/professor4.png',
        displayOrder: 4
      }
    }),
    prisma.professor.upsert({
      where: { email: 'jung.guhyeok@dongguk.edu' },
      update: {},
      create: {
        name: '정구현 교수님',
        title: '교수',
        email: 'jung.guhyeok@dongguk.edu',
        phone: '02-2260-3004',
        office: '관정관 105호',
        affiliation: '동국대학교 경영대학 GCS연계전공',
        courses: [],
        researchAreas: ['그래픽커뮤니케이션'],
        education: '미디어학 박사',
        experience: '6년',
        imageUrl: '/images/professor5.png',
        displayOrder: 5
      }
    }),
    prisma.professor.upsert({
      where: { email: 'jung.seungwon@dongguk.edu' },
      update: {},
      create: {
        name: '정승원 교수님',
        title: '교수',
        email: 'jung.seungwon@dongguk.edu',
        phone: '02-2260-3005',
        office: '관정관 106호',
        affiliation: '동국대학교 경영대학 GCS연계전공',
        courses: ['식품포장특론'],
        researchAreas: ['식품포장', '포장공학'],
        education: '포장공학 박사',
        experience: '7년',
        imageUrl: '/images/professor6.png',
        displayOrder: 6
      }
    })
  ])

  console.log('✅ 교수진 데이터 생성 완료')

  // 과목 데이터 생성
  const subjects = await Promise.all([
    // 예술 Art
    prisma.subject.upsert({
      where: { code: 'GCS2001' },
      update: {},
      create: {
        name: '컬러매니지먼트',
        code: 'GCS2001',
        description: '색상의 과학적 이해와 디지털 환경에서의 컬러 매니지먼트 기법을 학습한다.',
        credits: 3,
        semester: '1학기',
        year: 2024,
        category: 'ART',
        majorId: majors[0].id,
        professorId: professors[2].id,
        displayOrder: 1
      }
    }),
    prisma.subject.upsert({
      where: { code: 'GCS2002' },
      update: {},
      create: {
        name: '그래픽디자인',
        code: 'GCS2002',
        description: '시각적 커뮤니케이션을 위한 그래픽 디자인 원리와 실무 기법을 학습한다.',
        credits: 3,
        semester: '2학기',
        year: 2024,
        category: 'ART',
        majorId: majors[0].id,
        professorId: professors[2].id,
        displayOrder: 2
      }
    }),
    prisma.subject.upsert({
      where: { code: 'GCS2003' },
      update: {},
      create: {
        name: '타이포그래피',
        code: 'GCS2003',
        description: '문자 디자인과 타이포그래피의 원리와 실무 적용 방법을 학습한다.',
        credits: 3,
        semester: '1학기',
        year: 2024,
        category: 'ART',
        majorId: majors[0].id,
        professorId: professors[2].id,
        displayOrder: 3
      }
    }),
    // 경영 Business
    prisma.subject.upsert({
      where: { code: 'GCS3001' },
      update: {},
      create: {
        name: '마케팅커뮤니케이션',
        code: 'GCS3001',
        description: '브랜드 커뮤니케이션과 마케팅 전략의 통합적 접근 방법을 학습한다.',
        credits: 3,
        semester: '1학기',
        year: 2024,
        category: 'BUSINESS',
        majorId: majors[0].id,
        professorId: professors[0].id,
        displayOrder: 1
      }
    }),
    prisma.subject.upsert({
      where: { code: 'GCS3002' },
      update: {},
      create: {
        name: '브랜드매니지먼트',
        code: 'GCS3002',
        description: '브랜드 아이덴티티 구축과 관리 전략을 학습한다.',
        credits: 3,
        semester: '2학기',
        year: 2024,
        category: 'BUSINESS',
        majorId: majors[0].id,
        professorId: professors[0].id,
        displayOrder: 2
      }
    }),
    prisma.subject.upsert({
      where: { code: 'GCS3003' },
      update: {},
      create: {
        name: '디지털마케팅',
        code: 'GCS3003',
        description: '디지털 환경에서의 마케팅 전략과 실행 방법을 학습한다.',
        credits: 3,
        semester: '1학기',
        year: 2024,
        category: 'BUSINESS',
        majorId: majors[0].id,
        professorId: professors[0].id,
        displayOrder: 3
      }
    }),
    // 공학 Engineering
    prisma.subject.upsert({
      where: { code: 'GCS4001' },
      update: {},
      create: {
        name: '식품포장',
        code: 'GCS4001',
        description: '식품 포장의 기능, 식품 포장재/포장용기, 포장 식품의 품질변화/유효기간 설정, 식품의 포장공정, 식품 포장설계 등에 관하여 강의한다.',
        credits: 3,
        semester: '1학기',
        year: 2024,
        category: 'ENGINEERING',
        majorId: majors[0].id,
        professorId: professors[5].id,
        displayOrder: 1
      }
    }),
    prisma.subject.upsert({
      where: { code: 'GCS4002' },
      update: {},
      create: {
        name: '식품포장특론',
        code: 'GCS4002',
        description: '식품 포장재의 물질전달/표면화학, 항균성/항산화성 포장, 가식성 포장, 생분해성 포장, 변형기체 포장, 마이크로웨이브 가열용 포장, 지능형 포장-지시계/센서/RFID-USN 포장유통등에 관하여 강의한다.',
        credits: 3,
        semester: '2학기',
        year: 2024,
        category: 'ENGINEERING',
        majorId: majors[0].id,
        professorId: professors[5].id,
        displayOrder: 2
      }
    }),
    prisma.subject.upsert({
      where: { code: 'GCS4004' },
      update: {},
      create: {
        name: '캡스톤디자인',
        code: 'GCS4004',
        description: '현장에서 부딪히는 문제 해결 능력을 키우기 위해 기획부터 제작까지 일련의 과정을 학생들이 직접 수행한다. 팀 단위로 이루어지며 창의력, 팀워크, 리더십 양성 등을 목표로 한다.',
        credits: 3,
        semester: '2학기',
        year: 2024,
        category: 'ENGINEERING',
        majorId: majors[0].id,
        professorId: professors[0].id,
        displayOrder: 3
      }
    })
  ])

  console.log('✅ 과목 데이터 생성 완료')

  // 상품 카테고리 생성
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'apparel' },
      update: {},
      create: {
        name: 'Apparel',
        slug: 'apparel',
        description: 'GCS 브랜드 의류 컬렉션'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'stationary' },
      update: {},
      create: {
        name: 'Stationary',
        slug: 'stationary',
        description: '학습과 업무에 필요한 문구류'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'bag' },
      update: {},
      create: {
        name: 'Bag & Pouch',
        slug: 'bag',
        description: '일상생활과 캠퍼스 라이프를 위한 가방'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'life' },
      update: {},
      create: {
        name: 'Life',
        slug: 'life',
        description: '생활용품과 유틸리티 아이템'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'accessory' },
      update: {},
      create: {
        name: 'Accessory',
        slug: 'accessory',
        description: '스타일을 완성하는 액세서리'
      }
    })
  ])

  console.log('✅ 상품 카테고리 생성 완료')

  // 상품은 관리자가 직접 등록하도록 빈 상태로 둠
  console.log('ℹ️  상품 데이터: 빈 상태 (관리자가 직접 등록)')

  /* 샘플 상품 데이터는 주석 처리 - 필요시 아래 주석 해제
  const products = await Promise.all([
    // Apparel
    prisma.product.create({
      data: {
        name: 'GCS 로고 티셔츠',
        description: 'GCS 브랜드 로고가 새겨진 기본 티셔츠입니다. 100% 면 소재로 제작되어 편안한 착용감을 제공합니다.',
        shortDescription: 'GCS 브랜드 로고가 새겨진 기본 티셔츠',
        price: 25000,
        originalPrice: 30000,
        discount: 17,
        stock: 100,
        imageUrl: '/images/shop/apparel/tshirt-1.jpg',
        images: ['/images/shop/apparel/tshirt-1.jpg', '/images/shop/apparel/tshirt-1-detail.jpg'],
        brand: 'GCS',
        tags: ['베스트셀러', 'NEW'],
        features: ['100% 면 소재', '편안한 착용감'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['화이트', '블랙', '네이비'],
        isBestItem: true,
        categoryId: categories[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: '후드 집업',
        description: '편안한 착용감의 후드 집업입니다. 가슴 부분에 GCS 로고가 자수로 새겨져 있습니다.',
        shortDescription: '편안한 착용감의 후드 집업',
        price: 45000,
        originalPrice: 55000,
        discount: 18,
        stock: 50,
        imageUrl: '/images/shop/apparel/hoodie-1.jpg',
        images: ['/images/shop/apparel/hoodie-1.jpg', '/images/shop/apparel/hoodie-1-detail.jpg'],
        brand: 'GCS',
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
        shortDescription: 'GCS 브랜드가 새겨진 스프링 노트북',
        price: 8000,
        originalPrice: 10000,
        discount: 20,
        stock: 200,
        imageUrl: '/images/shop/stationary/notebook-1.jpg',
        images: ['/images/shop/stationary/notebook-1.jpg', '/images/shop/stationary/notebook-1-detail.jpg'],
        brand: 'GCS',
        tags: ['베스트셀러'],
        features: ['100페이지', 'A4 사이즈', '스프링 제본'],
        sizes: [],
        colors: [],
        isBestItem: true,
        categoryId: categories[1].id
      }
    }),
    prisma.product.create({
      data: {
        name: '볼펜 세트',
        description: '다양한 색상의 볼펜 세트입니다. 0.5mm 두께로 깔끔한 필기가 가능합니다.',
        shortDescription: '다양한 색상의 볼펜 세트',
        price: 12000,
        originalPrice: 15000,
        discount: 20,
        stock: 150,
        imageUrl: '/images/shop/stationary/pen-set.jpg',
        images: ['/images/shop/stationary/pen-set.jpg', '/images/shop/stationary/pen-set-detail.jpg'],
        brand: 'GCS',
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
        shortDescription: '내구성이 뛰어난 캔버스 토트백',
        price: 28000,
        originalPrice: 35000,
        discount: 20,
        stock: 80,
        imageUrl: '/images/shop/bag/tote.jpg',
        images: ['/images/shop/bag/tote.jpg', '/images/shop/bag/tote-detail.jpg'],
        brand: 'GCS',
        tags: ['베스트셀러'],
        features: ['캔버스 소재', '넉넉한 수납공간', '다양한 색상'],
        sizes: [],
        colors: [],
        categoryId: categories[2].id
      }
    }),
    // Life - 자비 부적
    prisma.product.create({
      data: {
        name: '자비 부적',
        description: '🐰 자비부적(慈悲符籍)\n내 마음도 꼬~옥 안아취야 해! 🐘💖💜\n\n공모전에서 화제가 된 바로 그 부적!\nDEUX팀의 자랑!\n\n"MZ의 심장을 후벼판다"\n"귀여움과 힐링의 폭격기"라는 별명이 붙을 정도로 인기 폭발 🔥\n\n자비부적은 단순한 종이가 아니다.\n👉 스스로에게 건네는 다정한 자기암시이자,\n👉 위로와 행운을 끌어오는 작은 의식 같은 존재.\n\n시험 합격을 바라는 이에게는 진중령 부적\n사랑이 필요한 이에게는 따뜻한 포옹 부적\n그냥 지친 하루에는 웃음을 주는 작은 힐링템.\n\n이 부적을 지갑이나 가방에 넣고 다니면,\n어느 순간 스스로도 모르게 마음이 한결 가벼워지는 걸 느끼게 될 거야.',
        shortDescription: '사랑과 행운을 전하는 자비 부적\n내 마음도 꼬~옥 안아취야 해!',
        price: 0,
        stock: 1000,
        imageUrl: '/images/shop/sample-product.jpg',
        images: ['/images/shop/sample-product.jpg', '/images/shop/product-detail-1.jpg', '/images/shop/product-detail-2.jpg'],
        brand: 'DEUX',
        tags: ['인기상품', '힐링'],
        features: ['자기암시', '힐링', '행운'],
        sizes: [],
        colors: ['단색 1종'],
        isBestItem: true,
        categoryId: categories[3].id
      }
    }),
    // Life - 텀블러
    prisma.product.create({
      data: {
        name: '텀블러',
        description: '보온성이 뛰어난 스테인리스 텀블러입니다. 500ml 용량으로 하루 종일 사용하기 좋습니다.',
        shortDescription: '보온성이 뛰어난 스테인리스 텀블러',
        price: 18000,
        originalPrice: 25000,
        discount: 28,
        stock: 120,
        imageUrl: '/images/shop/life/tumbler.jpg',
        images: ['/images/shop/life/tumbler.jpg', '/images/shop/life/tumbler-detail.jpg'],
        brand: 'GCS',
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
        shortDescription: '컬렉션용 핀 배지',
        price: 8000,
        originalPrice: 12000,
        discount: 33,
        stock: 300,
        imageUrl: '/images/shop/accessory/pin.jpg',
        images: ['/images/shop/accessory/pin.jpg', '/images/shop/accessory/pin-detail.jpg'],
        brand: 'GCS',
        tags: ['NEW'],
        features: ['금속 소재', '정교한 디테일', '컬렉션용'],
        sizes: [],
        colors: [],
        categoryId: categories[4].id
      }
    })
  ])

  // 상품 상세 정보 생성
  const productDetails = await Promise.all([
    prisma.productDetail.create({
      data: {
        productId: products[5].id, // 자비 부적
        productionYear: 2024,
        project: 'DEUX',
        material: '종이',
        color: '단색 1종',
        size: '0000 × 0000 (단위:)',
        printingMethod: '디지털 프린팅',
        manufacturer: '프린팅 업체',
        shippingInfo: '단순 변심으로 인한 교환, 환불이 불가합니다.',
        qualityStandard: '본 상품은 철저한 품질관리를 거쳐 생산되었습니다.',
        customerService: '1234-5678'
      }
    })
  ])

  console.log('✅ 샘플 상품 데이터 생성 완료')
  */

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

  // 일반회원 계정 생성 (상품 구매만 가능)
  const generalUser = await prisma.user.upsert({
    where: { email: 'general@gcs-demo.com' },
    update: {},
    create: {
      email: 'general@gcs-demo.com',
      password: userPassword,
      name: '일반회원',
      studentId: 'GENERAL001',
      major: 'GCS:Web',
      phone: '010-1111-1111',
      role: 'GENERAL',
      verificationStatus: 'PENDING'
    }
  })

  // 학생회원 계정 생성 (상품 구매 + 글쓰기 가능)
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@gcs-demo.com' },
    update: {},
    create: {
      email: 'student@gcs-demo.com',
      password: userPassword,
      name: '학생회원',
      studentId: 'STUDENT001',
      major: 'GCS:Web',
      phone: '010-2222-2222',
      role: 'STUDENT',
      verificationStatus: 'APPROVED',
      verificationApprovedAt: new Date()
    }
  })

  // 프로젝트와 뉴스는 관리자/학생회원이 직접 등록하도록 빈 상태로 둠
  console.log('ℹ️  프로젝트 데이터: 빈 상태 (관리자/학생회원이 직접 등록)')
  console.log('ℹ️  뉴스 데이터: 빈 상태 (관리자/학생회원이 직접 등록)')

  console.log('✅ 사용자 데이터 생성 완료')
  console.log('👤 관리자 계정: admin@gcs-demo.com / GCS_Admin_2024!')
  console.log('👤 일반회원 (구매만 가능): general@gcs-demo.com / GCS_User_2024!')
  console.log('👤 학생회원 (구매+글쓰기): student@gcs-demo.com / GCS_User_2024!')

  console.log('📊 생성된 데이터 요약:')
  console.log(`   - 전공: ${majors.length}개`)
  console.log(`   - 교수진: ${professors.length}명`)
  console.log(`   - 과목: ${subjects.length}개`)
  console.log(`   - 상품 카테고리: ${categories.length}개`)
  console.log(`   - 상품: 0개 (빈 상태)`)
  console.log(`   - 프로젝트: 0개 (빈 상태)`)
  console.log(`   - 뉴스: 0개 (빈 상태)`)

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
