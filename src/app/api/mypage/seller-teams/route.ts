import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 사용자가 속한 판매팀 목록 조회
export async function GET() {
  try {
    const user = await requireAuth()

    // 판매자 권한 확인
    if (!user.isSeller) {
      return NextResponse.json(
        { error: '판매자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 사용자가 속한 판매팀 조회
    const userTeams = await prisma.userSellerTeam.findMany({
      where: {
        userId: user.id
      },
      include: {
        sellerTeam: {
          include: {
            members: {
              select: {
                userId: true
              }
            },
            _count: {
              select: {
                products: true
              }
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    const teams = userTeams.map((userTeam) => ({
      id: userTeam.sellerTeam.id,
      name: userTeam.sellerTeam.name,
      description: userTeam.sellerTeam.description,
      memberCount: userTeam.sellerTeam.members.length,
      productCount: userTeam.sellerTeam._count.products,
      joinedAt: userTeam.joinedAt
    }))

    return NextResponse.json({
      success: true,
      data: teams
    })
  } catch (error: unknown) {
    console.error('판매팀 목록 조회 오류:', error)

    if (error instanceof Error && error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: '판매팀 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

