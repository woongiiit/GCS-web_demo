import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withCache, generateCacheKey } from '@/lib/cache'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const featured = searchParams.get('featured') === 'true'

    // 캐시 키 생성
    const cacheKey = generateCacheKey(
      'projects',
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

      const projects = await prisma.project.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          year: true,
          teamMembers: true,
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
        take: featured ? 10 : 50 // featured는 최대 10개, 전체는 최대 50개로 제한
      })

      // 연도별로 그룹화
      const projectsByYear: { [key: number]: any[] } = {}
      projects.forEach(project => {
        if (!projectsByYear[project.year]) {
          projectsByYear[project.year] = []
        }
        projectsByYear[project.year].push(project)
      })

      return {
        success: true,
        data: projects,
        byYear: projectsByYear,
        count: projects.length
      }
    }, 1800000) // 30분 캐시

    return NextResponse.json(
      result,
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600',
          'CDN-Cache-Control': 'max-age=1800',
          'Vercel-CDN-Cache-Control': 'max-age=1800'
        }
      }
    )

  } catch (error: any) {
    console.error('프로젝트 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

