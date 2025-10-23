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

    // 캐시 비활성화하여 직접 DB 조회 (디버깅용)
    const whereClause: any = {}
    
    if (year) {
      whereClause.year = parseInt(year)
    }
    
    if (featured) {
      whereClause.isFeatured = true
    }

    console.log('Archive News 조회 - 연도:', year, 'Featured:', featured)
    console.log('WHERE 조건:', whereClause)

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

    console.log('조회된 뉴스 수:', news.length)

    // 연도별로 그룹화
    const newsByYear: { [key: number]: any[] } = {}
    news.forEach(item => {
      if (!newsByYear[item.year]) {
        newsByYear[item.year] = []
      }
      newsByYear[item.year].push(item)
    })

    const result = {
      success: true,
      data: news,
      byYear: newsByYear,
      count: news.length
    }

    return NextResponse.json(
      result,
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
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

