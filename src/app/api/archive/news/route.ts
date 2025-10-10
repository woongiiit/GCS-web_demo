import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const featured = searchParams.get('featured') === 'true'

    const whereClause: any = {}
    
    if (year) {
      whereClause.year = parseInt(year)
    }
    
    if (featured) {
      whereClause.isFeatured = true
    }

    const news = await prisma.news.findMany({
      where: whereClause,
      include: {
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
      ]
    })

    // 연도별로 그룹화
    const newsByYear: { [key: number]: any[] } = {}
    news.forEach(item => {
      if (!newsByYear[item.year]) {
        newsByYear[item.year] = []
      }
      newsByYear[item.year].push(item)
    })

    return NextResponse.json(
      { 
        success: true, 
        data: news,
        byYear: newsByYear,
        count: news.length 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('뉴스 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

