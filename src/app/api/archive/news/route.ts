import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withCache, generateCacheKey } from '@/lib/cache'

// 동적 렌더링 강제 설정
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const featured = searchParams.get('featured') === 'true'

    // 캐시 키 생성
    const cacheKey = generateCacheKey(
      'news',
      year || 'all',
      featured ? 'featured' : 'all'
    )

    // 캐시와 함께 데이터 가져오기
    const result = await withCache(cacheKey, async () => {
      const whereClause: any = {}
      
      if (year) {
        whereClause.year = parseInt(year)
      }
      
      if (featured) {
        whereClause.isFeatured = true
      }

      const news = await prisma.news.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          content: true,
          summary: true,
          year: true,
          images: true,
          isFeatured: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              role: true,
            }
          }
        },
        orderBy: [
          { year: 'desc' },
          { createdAt: 'desc' }
        ],
        take: featured ? 5 : 50 // featured는 최대 5개, 전체는 최대 50개로 제한
      })

      // 연도별로 그룹화
      const newsByYear: { [key: number]: any[] } = {}
      news.forEach(item => {
        if (!newsByYear[item.year]) {
          newsByYear[item.year] = []
        }
        newsByYear[item.year].push(item)
      })

      return {
        success: true,
        data: news,
        byYear: newsByYear,
        count: news.length
      }
    }, 900000) // 15분 캐시

    return NextResponse.json(
      result,
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800',
          'CDN-Cache-Control': 'max-age=900',
          'Vercel-CDN-Cache-Control': 'max-age=900'
        }
      }
    )

  } catch (error: any) {
    console.error('뉴스 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

