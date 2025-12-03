import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 로그인 확인 (판매팀 멤버 추가를 위해 판매자도 사용 가능)
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 판매팀 멤버 추가는 판매자 권한 필요
    if (!user.isSeller && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '판매자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '20')

    // 검색 조건 구성
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
        { major: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 사용자 목록 조회 (판매자만 필터링)
    const users = await prisma.user.findMany({
      where: {
        ...where,
        isSeller: true // 판매자만 검색
      },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        major: true,
      },
      orderBy: { name: 'asc' },
      take: limit
    })

    return NextResponse.json(
      {
        success: true,
        data: users
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('사용자 검색 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

