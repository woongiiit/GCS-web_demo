import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withCache, generateCacheKey } from '@/lib/cache'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')?.toUpperCase()

    // 캐시 키 생성
    const cacheKey = generateCacheKey(
      'posts',
      category || 'all'
    )

    // 캐시와 함께 데이터 가져오기
    const result = await withCache(cacheKey, async () => {
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

      // 댓글 수 추가
      const postsWithCommentCount = posts.map(post => ({
        ...post,
        commentCount: post._count.comments
      }))

      return {
        success: true,
        data: postsWithCommentCount,
        count: postsWithCommentCount.length
      }
    }, 180000) // 3분 캐시

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

