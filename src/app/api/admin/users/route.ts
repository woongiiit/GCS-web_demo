import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// 동적 렌더링 강제 설정
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const user = await requireAuth(['ADMIN'])
    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'ALL'

    const skip = (page - 1) * limit

    // 검색 조건 구성
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role !== 'ALL') {
      where.role = role
    }

    // 사용자 목록 조회
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          studentId: true,
          major: true,
          phone: true,
          role: true,
          verificationStatus: true,
          verificationImageUrl: true,
          verificationRequestedAt: true,
          verificationApprovedAt: true,
          verificationRejectedAt: true,
          verificationNote: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json(
      {
        success: true,
        data: {
          users,
          totalCount,
          totalPages,
          currentPage: page
        }
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('사용자 목록 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
