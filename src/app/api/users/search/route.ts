import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인 (Archive 작성은 관리자만 가능)
    const user = await requireAuth(['ADMIN'])
    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
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

    // 사용자 목록 조회 (이름, 이메일, 학번만)
    const users = await prisma.user.findMany({
      where,
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

