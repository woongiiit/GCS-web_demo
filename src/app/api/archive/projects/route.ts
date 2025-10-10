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

    const projects = await prisma.project.findMany({
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
    const projectsByYear: { [key: number]: any[] } = {}
    projects.forEach(project => {
      if (!projectsByYear[project.year]) {
        projectsByYear[project.year] = []
      }
      projectsByYear[project.year].push(project)
    })

    return NextResponse.json(
      { 
        success: true, 
        data: projects,
        byYear: projectsByYear,
        count: projects.length 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('프로젝트 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

