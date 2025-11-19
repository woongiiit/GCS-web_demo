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

  // 상품은 관리자가 직접 등록하도록 빈 상태로 둠
  console.log('ℹ️  상품 데이터: 빈 상태 (관리자가 직접 등록)')

  /* 샘플 상품 데이터는 주석 처리 - 필요시 아래 예시 구조를 참고하세요.
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: '샘플 티셔츠',
        description: '샘플 상품 상세 설명입니다.',
        shortDescription: '샘플 상품 요약 설명',
        price: 25000,
        originalPrice: 30000,
        discount: 17,
        stock: 100,
        images: ['/images/shop/sample-product.jpg'],
        brand: 'GCS',
        likeCount: 42,
        options: [
          {
            name: '색상',
            values: ['화이트', '블랙', '네이비']
          },
          {
            name: '사이즈',
            values: ['S', 'M', 'L', 'XL']
          }
        ],
        type: 'FUND',
        fundingGoalAmount: 500000,
        fundingCurrentAmount: 120000,
        fundingSupporterCount: 42
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
    where: { email: 'gcsweb01234@gcsweb.kr' },
    update: {},
    create: {
      email: 'gcsweb01234@gcsweb.kr',
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
      role: 'MAJOR',
      verificationStatus: 'APPROVED',
      verificationApprovedAt: new Date()
    }
  })

  // 프로젝트와 뉴스는 관리자/학생회원이 직접 등록하도록 빈 상태로 둠
  console.log('ℹ️  프로젝트 데이터: 빈 상태 (관리자/학생회원이 직접 등록)')
  console.log('ℹ️  뉴스 데이터: 빈 상태 (관리자/학생회원이 직접 등록)')

  console.log('✅ 사용자 데이터 생성 완료')

  // 챗봇 옵션 데이터 생성
  console.log('🤖 챗봇 옵션 데이터 생성 시작...')

  // 첫 번째 레벨 옵션들 (메인 메뉴)
  const mainOptions = await Promise.all([
    prisma.chatBotOption.upsert({
      where: { id: 'main-about' },
      update: {},
      create: {
        id: 'main-about',
        title: 'GCS:Web 소개',
        content: 'GCS:Web에 대해 무엇이 궁금하신가요?',
        category: null, // 메인 메뉴는 category가 null
        order: 1,
        isActive: true
      }
    }),
    prisma.chatBotOption.upsert({
      where: { id: 'main-products' },
      update: {},
      create: {
        id: 'main-products',
        title: '상품 문의',
        content: '상품에 대해 무엇이 궁금하신가요?',
        category: null,
        order: 2,
        isActive: true
      }
    }),
    prisma.chatBotOption.upsert({
      where: { id: 'main-support' },
      update: {},
      create: {
        id: 'main-support',
        title: '고객 지원',
        content: '고객 지원 서비스에 대해 무엇이 궁금하신가요?',
        category: null,
        order: 3,
        isActive: true
      }
    })
  ])

  // 두 번째 레벨 옵션들 - GCS:Web 소개 관련
  const aboutOptions = await Promise.all([
    prisma.chatBotOption.upsert({
      where: { id: 'about-program' },
      update: {},
      create: {
        id: 'about-program',
        title: '프로그램 소개',
        content: 'GCS:Web은 동국대학교 경영대학의 그래픽커뮤니케이션사이언스 연계전공입니다. 그래픽, 경영, 공학 분야를 융합한 실무 중심의 커리큘럼을 제공합니다.',
        category: 'main-about', // 부모 옵션 ID
        order: 1,
        isActive: true
      }
    }),
    prisma.chatBotOption.upsert({
      where: { id: 'about-professors' },
      update: {},
      create: {
        id: 'about-professors',
        title: '교수진 안내',
        content: 'GCS:Web은 그래픽커뮤니케이션, 경영, 공학 분야의 전문 교수진으로 구성되어 있습니다. About GCS 페이지에서 교수진의 상세 정보를 확인하실 수 있습니다.',
        category: 'main-about',
        order: 2,
        isActive: true
      }
    }),
    prisma.chatBotOption.upsert({
      where: { id: 'about-courses' },
      update: {},
      create: {
        id: 'about-courses',
        title: '개설 과목',
        content: 'GCS:Web은 예술(Art), 경영(Business), 공학(Engineering) 세 가지 카테고리의 과목을 제공합니다. About GCS 페이지에서 상세한 과목 정보를 확인하실 수 있습니다.',
        category: 'main-about',
        order: 3,
        isActive: true
      }
    })
  ])

  // 두 번째 레벨 옵션들 - 상품 문의 관련
  const productOptions = await Promise.all([
    prisma.chatBotOption.upsert({
      where: { id: 'product-order' },
      update: {},
      create: {
        id: 'product-order',
        title: '주문/결제 방법',
        content: '상품 주문은 Shop 페이지에서 가능합니다. 원하는 상품을 선택하고 장바구니에 담거나 바로 구매할 수 있습니다. 결제는 신용카드, 계좌이체 등 다양한 방법을 지원합니다.',
        category: 'main-products',
        order: 1,
        isActive: true
      }
    }),
    prisma.chatBotOption.upsert({
      where: { id: 'product-shipping' },
      update: {},
      create: {
        id: 'product-shipping',
        title: '배송 안내',
        content: '일반 주문 상품은 결제 완료 후 3-5일 내 배송됩니다. 펀딩 상품은 목표 달성 후 제작 기간을 거쳐 배송됩니다. 배송비는 상품 상세 페이지에서 확인하실 수 있습니다.',
        category: 'main-products',
        order: 2,
        isActive: true
      }
    }),
    prisma.chatBotOption.upsert({
      where: { id: 'product-refund' },
      update: {},
      create: {
        id: 'product-refund',
        title: '반품/교환',
        content: '상품 수령 후 7일 이내 반품/교환이 가능합니다. 단, 펀딩 상품의 경우 펀딩 특성상 반품이 제한될 수 있습니다. 자세한 내용은 상품 상세 정보 고시를 참고해주세요.',
        category: 'main-products',
        order: 3,
        isActive: true
      }
    })
  ])

  // 두 번째 레벨 옵션들 - 고객 지원 관련
  const supportOptions = await Promise.all([
    prisma.chatBotOption.upsert({
      where: { id: 'support-contact' },
      update: {},
      create: {
        id: 'support-contact',
        title: '연락처 정보',
        content: '주소: 서울 필동로 1길 30, 동국대학교\n대표자: 김봉구\n회사명: 제작담\n사업자번호: 000-00-00000\n고객센터 이메일 문의를 통해 더 자세한 도움을 받으실 수 있습니다.',
        category: 'main-support',
        order: 1,
        isActive: true
      }
    }),
    prisma.chatBotOption.upsert({
      where: { id: 'support-hours' },
      update: {},
      create: {
        id: 'support-hours',
        title: '운영 시간',
        content: '고객센터 운영 시간: 평일 09:00 - 18:00\n주말 및 공휴일은 휴무입니다. 이메일 문의는 24시간 접수 가능하며, 평일 근무 시간에 순차적으로 답변드립니다.',
        category: 'main-support',
        order: 2,
        isActive: true
      }
    }),
    prisma.chatBotOption.upsert({
      where: { id: 'support-faq' },
      update: {},
      create: {
        id: 'support-faq',
        title: '자주 묻는 질문',
        content: '자주 묻는 질문은 다음과 같습니다:\n1. 회원가입은 어떻게 하나요?\n2. 상품은 어떻게 구매하나요?\n3. 펀딩 상품은 언제 배송되나요?\n\n더 자세한 내용은 각 카테고리를 선택해주세요.',
        category: 'main-support',
        order: 3,
        isActive: true
      }
    })
  ])

  console.log('✅ 챗봇 옵션 데이터 생성 완료')
  console.log(`   - 메인 메뉴: ${mainOptions.length}개`)
  console.log(`   - GCS:Web 소개 하위 메뉴: ${aboutOptions.length}개`)
  console.log(`   - 상품 문의 하위 메뉴: ${productOptions.length}개`)
  console.log(`   - 고객 지원 하위 메뉴: ${supportOptions.length}개`)

  console.log('📊 생성된 데이터 요약:')
  console.log(`   - 전공: ${majors.length}개`)
  console.log(`   - 교수진: ${professors.length}명`)
  console.log(`   - 과목: ${subjects.length}개`)
  console.log(`   - 챗봇 옵션: ${mainOptions.length + aboutOptions.length + productOptions.length + supportOptions.length}개`)
  console.log(`   - 상품: 0개 (빈 상태)`)
  console.log(`   - 프로젝트: 0개 (빈 상태)`)
  console.log(`   - 뉴스: 0개 (빈 상태)`)
  
  console.log('\n👤 계정 정보:')
  console.log('   - 관리자: gcsweb01234@gcsweb.kr / GCS_Admin_2024!')
  console.log('   - 일반회원 (구매만 가능): general@gcs-demo.com / GCS_User_2024!')
  console.log('   - 학생회원 (구매+글쓰기): student@gcs-demo.com / GCS_User_2024!')

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
