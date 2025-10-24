import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// 모든 콘텐츠 조회
export async function GET() {
  try {
    const contents = await prisma.adminContent.findMany({
      orderBy: [
        { section: 'asc' },
        { order: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: contents
    })
  } catch (error) {
    console.error('콘텐츠 조회 오류:', error)
    return NextResponse.json(
      { error: '콘텐츠 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 콘텐츠 생성
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // 관리자 권한 확인
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { section, title, content, imageUrl, imageAlt, order } = body

    // 필수 필드 검증
    if (!section) {
      return NextResponse.json(
        { error: '섹션은 필수입니다.' },
        { status: 400 }
      )
    }

    // 해당 섹션의 기존 콘텐츠 확인
    const existingContent = await prisma.adminContent.findUnique({
      where: { section }
    })

    if (existingContent) {
      return NextResponse.json(
        { error: '해당 섹션의 콘텐츠가 이미 존재합니다. 수정을 사용해주세요.' },
        { status: 400 }
      )
    }

    const newContent = await prisma.adminContent.create({
      data: {
        section,
        title,
        content,
        imageUrl,
        imageAlt,
        order: order || 0,
        updatedBy: user.id
      }
    })

    return NextResponse.json({
      success: true,
      data: newContent,
      message: '콘텐츠가 생성되었습니다.'
    })
  } catch (error) {
    console.error('콘텐츠 생성 오류:', error)
    return NextResponse.json(
      { error: '콘텐츠 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
