import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// About 페이지의 모든 섹션 콘텐츠 조회
export async function GET() {
  try {
    const contents = await prisma.adminContent.findMany({
      where: {
        isActive: true
      },
      include: {
        items: {
          where: {
            isActive: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: [
        { section: 'asc' },
        { order: 'asc' }
      ]
    })

    // 섹션별로 그룹화
    const sections = contents.reduce((acc, content) => {
      acc[content.section] = content
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      success: true,
      data: sections
    })
  } catch (error) {
    console.error('About 콘텐츠 조회 오류:', error)
    return NextResponse.json(
      { error: 'About 콘텐츠 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
