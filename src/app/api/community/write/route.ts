import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'

export async function POST(request: Request) {
  try {
    // 인증 확인 및 사용자 정보 가져오기
    const user = await requireAuth()

    // 글 작성 권한 확인 (STUDENT 또는 ADMIN만)
    if (!permissions.canWritePost(user.role as any)) {
      return NextResponse.json(
        { error: permissionErrors.studentOnly },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, category } = body

    // 유효성 검사
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 카테고리 유효성 검사
    const validCategories = ['BOARD', 'LOUNGE']
    const upperCategory = category.toUpperCase()
    
    if (!validCategories.includes(upperCategory)) {
      return NextResponse.json(
        { error: '잘못된 카테고리입니다.' },
        { status: 400 }
      )
    }

    // 게시글 생성
    const post = await prisma.post.create({
      data: {
        title,
        content,
        category: upperCategory as 'BOARD' | 'LOUNGE',
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        message: '게시글이 성공적으로 작성되었습니다.',
        data: post 
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Community 글 작성 오류:', error)
    
    if (error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: permissionErrors.notLoggedIn },
        { status: 401 }
      )
    }
    
    if (error.message === '권한이 부족합니다') {
      return NextResponse.json(
        { error: permissionErrors.insufficientPermission },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

