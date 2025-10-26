import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// 모든 콘텐츠 조회
export async function GET() {
  try {
    const contents = await prisma.adminContent.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      },
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
  console.log('POST /api/admin/content 요청 시작')
  try {
    let user
    try {
      console.log('인증 확인 중...')
      user = await requireAuth()
      console.log('인증 성공:', user.email)
    } catch (authError) {
      console.log('인증 실패:', authError)
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    // 관리자 권한 확인
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('요청 본문:', body)
    const { section, title, content, imageUrl, imageAlt, order, items } = body

    // 필수 필드 검증
    if (!section) {
      console.log('섹션이 없습니다:', section)
      return NextResponse.json(
        { error: '섹션은 필수입니다.' },
        { status: 400 }
      )
    }

    console.log('섹션 값:', section, '타입:', typeof section)

    // 해당 섹션의 기존 콘텐츠 확인
    console.log('기존 콘텐츠 확인 중...')
    const existingContent = await prisma.adminContent.findUnique({
      where: { section }
    })
    console.log('기존 콘텐츠:', existingContent)

    if (existingContent) {
      return NextResponse.json(
        { error: '해당 섹션의 콘텐츠가 이미 존재합니다. 수정을 사용해주세요.' },
        { status: 400 }
      )
    }

    console.log('새 콘텐츠 생성 중...')
    console.log('생성 데이터:', {
      section,
      title,
      content,
      imageUrl,
      imageAlt,
      order: order || 0,
      updatedBy: user.id
    })
    
    const newContent = await prisma.adminContent.create({
      data: {
        section,
        title,
        content,
        imageUrl,
        imageAlt,
        order: order || 0,
        updatedBy: user.id,
        items: items ? {
          create: items.map((item: any) => ({
            title: item.title,
            subtitle: item.subtitle,
            description: item.description,
            htmlContent: item.htmlContent,
            imageUrl: item.imageUrl,
            imageAlt: item.imageAlt,
            order: item.order || 0,
            isActive: item.isActive !== false,
            type: item.type,
            updatedBy: user.id
          }))
        } : undefined
      },
      include: {
        items: true
      }
    })
    console.log('콘텐츠 생성 성공:', newContent)

    return NextResponse.json({
      success: true,
      data: newContent,
      message: '콘텐츠가 생성되었습니다.'
    })
  } catch (error) {
    console.error('콘텐츠 생성 오류:', error)
    console.error('오류 스택:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: '콘텐츠 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
