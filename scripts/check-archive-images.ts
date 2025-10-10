import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkArchiveImages() {
  try {
    console.log('🔍 Archive 데이터 확인 중...\n')

    // Projects 확인
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        images: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('📦 Projects:')
    projects.forEach((project, index) => {
      console.log(`\n${index + 1}. ${project.title}`)
      console.log(`   ID: ${project.id}`)
      console.log(`   생성일: ${project.createdAt.toLocaleString('ko-KR')}`)
      console.log(`   이미지 개수: ${project.images.length}개`)
      if (project.images.length > 0) {
        project.images.forEach((img, i) => {
          const preview = img.substring(0, 50)
          console.log(`   - 이미지 ${i + 1}: ${preview}...`)
        })
      } else {
        console.log('   ⚠️  이미지 없음')
      }
    })

    // News 확인
    const news = await prisma.news.findMany({
      select: {
        id: true,
        title: true,
        images: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('\n\n📰 News:')
    news.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title}`)
      console.log(`   ID: ${item.id}`)
      console.log(`   생성일: ${item.createdAt.toLocaleString('ko-KR')}`)
      console.log(`   이미지 개수: ${item.images.length}개`)
      if (item.images.length > 0) {
        item.images.forEach((img, i) => {
          const preview = img.substring(0, 50)
          console.log(`   - 이미지 ${i + 1}: ${preview}...`)
        })
      } else {
        console.log('   ⚠️  이미지 없음')
      }
    })

    console.log('\n\n📊 요약:')
    console.log(`- 전체 Projects: ${projects.length}개`)
    console.log(`- 이미지 없는 Projects: ${projects.filter(p => p.images.length === 0).length}개`)
    console.log(`- 전체 News: ${news.length}개`)
    console.log(`- 이미지 없는 News: ${news.filter(n => n.images.length === 0).length}개`)

  } catch (error) {
    console.error('❌ 오류 발생:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkArchiveImages()

