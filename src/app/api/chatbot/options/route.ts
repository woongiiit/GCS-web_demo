import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 동적 렌더링 강제 설정
export const dynamic = 'force-dynamic'

// 활성화된 챗봇 옵션 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const whereClause: any = {
      isActive: true
    }

    // category가 제공되면 해당 카테고리의 옵션들을, 없으면 category가 null인 메인 메뉴 옵션들을 반환
    if (category) {
      whereClause.category = category
    } else {
      whereClause.category = null
    }

    const options = await prisma.chatBotOption.findMany({
      where: whereClause,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: options
    })
  } catch (error: any) {
    console.error('챗봇 옵션 조회 오류:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: '서버 오류가 발생했습니다.' 
      },
      { status: 500 }
    )
  }
}

