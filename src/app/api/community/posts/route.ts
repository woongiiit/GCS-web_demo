import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')?.toUpperCase()

    const whereClause: any = {}
    
    if (category && (category === 'BOARD' || category === 'LOUNGE')) {
      whereClause.category = category
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        },
        comments: {
          select: {
            id: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 댓글 수 추가
    const postsWithCommentCount = posts.map(post => ({
      ...post,
      commentCount: post.comments.length
    }))

    return NextResponse.json(
      { 
        success: true, 
        data: postsWithCommentCount,
        count: postsWithCommentCount.length 
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

