import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 동적 렌더링 강제 설정
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        data: categories,
        count: categories.length 
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
          'CDN-Cache-Control': 'max-age=3600',
          'Vercel-CDN-Cache-Control': 'max-age=3600'
        }
      }
    )

  } catch (error: any) {
    console.error('카테고리 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

