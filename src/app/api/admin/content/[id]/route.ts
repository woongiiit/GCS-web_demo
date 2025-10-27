import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// 특정 콘텐츠 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const content = await prisma.adminContent.findUnique({
      where: { id: params.id }
    })

    if (!content) {
      return NextResponse.json(
        { error: '콘텐츠를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: content
    })
  } catch (error) {
    console.error('콘텐츠 조회 오류:', error)
    return NextResponse.json(
      { error: '콘텐츠 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 콘텐츠 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let user
    try {
      user = await requireAuth()
    } catch (authError) {
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
    const { title, content, description, subtitle, imageUrl, imageAlt, order, isActive, items } = body

    // 콘텐츠 존재 확인
    const existingContent = await prisma.adminContent.findUnique({
      where: { id: params.id }
    })

    if (!existingContent) {
      return NextResponse.json(
        { error: '콘텐츠를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 기존 items 삭제 후 새로 생성
    if (items) {
      await prisma.adminContentItem.deleteMany({
        where: { contentId: params.id }
      })
    }

    const updatedContent = await prisma.adminContent.update({
      where: { id: params.id },
      data: {
        title,
        content,
        description,
        subtitle,
        imageUrl,
        imageAlt,
        order: order !== undefined ? order : existingContent.order,
        isActive: isActive !== undefined ? isActive : existingContent.isActive,
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
        items: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedContent,
      message: '콘텐츠가 수정되었습니다.'
    })
  } catch (error) {
    console.error('콘텐츠 수정 오류:', error)
    return NextResponse.json(
      { error: '콘텐츠 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 콘텐츠 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let user
    try {
      user = await requireAuth()
    } catch (authError) {
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

    // 콘텐츠 존재 확인
    const existingContent = await prisma.adminContent.findUnique({
      where: { id: params.id }
    })

    if (!existingContent) {
      return NextResponse.json(
        { error: '콘텐츠를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    await prisma.adminContent.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: '콘텐츠가 삭제되었습니다.'
    })
  } catch (error) {
    console.error('콘텐츠 삭제 오류:', error)
    return NextResponse.json(
      { error: '콘텐츠 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
