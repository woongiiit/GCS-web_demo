import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withCache, generateCacheKey } from '@/lib/cache'

// 동적 렌더링 강제 설정
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')?.toUpperCase()

    // 캐시 키 생성
    const cacheKey = generateCacheKey(
      'posts',
      category || 'all'
    )

    // 캐시 비활성화하여 직접 DB 조회 (디버깅용)
    const whereClause: any = {}
    
    if (category && (category === 'BOARD' || category === 'LOUNGE')) {
      whereClause.category = category
    }

    console.log('Community 글 목록 조회 - 카테고리:', category)
    console.log('WHERE 조건:', whereClause)

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
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // 최대 50개로 제한
    })

    console.log('조회된 글 수:', posts.length)
    console.log('글 목록:', posts.map(p => ({ id: p.id, title: p.title, category: p.category, createdAt: p.createdAt })))

    // 댓글 수 추가
    const postsWithCommentCount = posts.map(post => ({
      ...post,
      commentCount: post._count.comments
    }))

    const result = {
      success: true,
      data: postsWithCommentCount,
      count: postsWithCommentCount.length
    }

    return NextResponse.json(
      result,
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=180, stale-while-revalidate=360',
          'CDN-Cache-Control': 'max-age=180',
          'Vercel-CDN-Cache-Control': 'max-age=180'
        }
      }
    )

  } catch (error: any) {
    console.error('게시글 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

