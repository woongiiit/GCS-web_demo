import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 특정 섹션의 콘텐츠 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  try {
    const section = params.section.toUpperCase() as any

    const content = await prisma.adminContent.findUnique({
      where: { section }
    })

    if (!content) {
      return NextResponse.json({
        success: true,
        data: null,
        message: '해당 섹션의 콘텐츠가 없습니다.'
      })
    }

    return NextResponse.json({
      success: true,
      data: content
    })
  } catch (error) {
    console.error('섹션 콘텐츠 조회 오류:', error)
    return NextResponse.json(
      { error: '섹션 콘텐츠 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
