import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { permissions } from '@/lib/permissions'
import { invalidateCache } from '@/lib/cache'

// 게시글 상세 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

    // 게시글 조회
    const post = await prisma.post.findUnique({
      where: { id: postId },
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

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 조회수 증가
    await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json(
      { 
        success: true, 
        data: { ...post, views: post.views + 1 } 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('게시글 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 게시글 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    const user = await requireAuth()

    // 게시글 존재 여부 및 작성자 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
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

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 수정 권한 확인
    if (!permissions.canEditPost(user.role as any, post.authorId, user.id)) {
      return NextResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, images } = body

    // 유효성 검사
    if (!title || !content) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 게시글 수정
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        images: images || []
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

    // Community 글 목록 캐시 무효화
    invalidateCache('posts:.*')

    return NextResponse.json(
      { 
        success: true, 
        message: '게시글이 성공적으로 수정되었습니다.',
        data: updatedPost 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('게시글 수정 오류:', error)
    
    if (error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 게시글 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    const user = await requireAuth()

    // 게시글 존재 여부 및 작성자 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
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

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 삭제 권한 확인
    if (!permissions.canEditPost(user.role as any, post.authorId, user.id)) {
      return NextResponse.json(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 게시글 삭제
    await prisma.post.delete({
      where: { id: postId }
    })

    // Community 글 목록 캐시 무효화
    invalidateCache('posts:.*')

    return NextResponse.json(
      { 
        success: true, 
        message: '게시글이 성공적으로 삭제되었습니다.' 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('게시글 삭제 오류:', error)
    
    if (error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}