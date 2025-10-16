import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

// 게시글 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

    // 게시글 존재 여부 확인
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

    // 게시글 삭제
    await prisma.post.delete({
      where: { id: postId }
    })

    return NextResponse.json(
      { 
        success: true, 
        message: '게시글이 성공적으로 삭제되었습니다.' 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('게시글 삭제 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
