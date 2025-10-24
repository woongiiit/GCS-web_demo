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
    const user = await requireAuth()
    
    // 관리자 권한 확인
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, imageUrl, imageAlt, order, isActive } = body

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

    const updatedContent = await prisma.adminContent.update({
      where: { id: params.id },
      data: {
        title,
        content,
        imageUrl,
        imageAlt,
        order: order !== undefined ? order : existingContent.order,
        isActive: isActive !== undefined ? isActive : existingContent.isActive,
        updatedBy: user.id
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
    const user = await requireAuth()
    
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
