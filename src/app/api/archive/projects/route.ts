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
      'projects',
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

    console.log('Archive Projects 조회 - 연도:', year, 'Featured:', featured)
    console.log('WHERE 조건:', whereClause)

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

    console.log('조회된 프로젝트 수:', projects.length)

    // 연도별로 그룹화
    const projectsByYear: { [key: number]: any[] } = {}
    projects.forEach(project => {
      if (!projectsByYear[project.year]) {
        projectsByYear[project.year] = []
      }
      projectsByYear[project.year].push(project)
    })

    const result = {
      success: true,
      data: projects,
      byYear: projectsByYear,
      count: projects.length
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
    console.error('프로젝트 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

