import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 모든 판매팀 목록 조회
export async function GET() {
  try {
    const teams = await prisma.sellerTeam.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: teams.map((team) => ({
        id: team.id,
        name: team.name,
        description: team.description,
        memberCount: team.members.length,
        productCount: team._count.products,
        members: team.members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          joinedAt: member.joinedAt
        })),
        createdAt: team.createdAt,
        updatedAt: team.updatedAt
      }))
    })
  } catch (error) {
    console.error('판매팀 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '판매팀 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 새로운 판매팀 생성
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // 판매자 권한 확인
    if (!user.isSeller) {
      return NextResponse.json(
        { error: '판매자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, memberIds } = body as {
      name: string
      description?: string
      memberIds?: string[]
    }

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: '판매팀 이름을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 판매팀 이름 중복 확인
    const existingTeam = await prisma.sellerTeam.findUnique({
      where: { name: name.trim() }
    })

    if (existingTeam) {
      return NextResponse.json(
        { error: '이미 존재하는 판매팀 이름입니다.' },
        { status: 400 }
      )
    }

    // 판매팀 생성 및 멤버 추가
    const team = await prisma.$transaction(async (tx) => {
      // 판매팀 생성
      const newTeam = await tx.sellerTeam.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null
        }
      })

      // 생성자를 멤버로 추가
      await tx.userSellerTeam.create({
        data: {
          userId: user.id,
          sellerTeamId: newTeam.id
        }
      })

      // 추가 멤버들 추가
      if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
        // 중복 제거 및 생성자 제외
        const uniqueMemberIds = [...new Set(memberIds)].filter(
          (id) => id !== user.id
        )

        if (uniqueMemberIds.length > 0) {
          // 사용자 존재 여부 확인
          const users = await tx.user.findMany({
            where: {
              id: { in: uniqueMemberIds },
              isSeller: true // 판매자만 추가 가능
            },
            select: { id: true }
          })

          const validUserIds = users.map((u) => u.id)

          if (validUserIds.length > 0) {
            await tx.userSellerTeam.createMany({
              data: validUserIds.map((userId) => ({
                userId,
                sellerTeamId: newTeam.id
              })),
              skipDuplicates: true
            })
          }
        }
      }

      // 생성된 팀 정보 반환
      return await tx.sellerTeam.findUnique({
        where: { id: newTeam.id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: '판매팀이 성공적으로 생성되었습니다.',
      data: {
        id: team!.id,
        name: team!.name,
        description: team!.description,
        members: team!.members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          joinedAt: member.joinedAt
        }))
      }
    })
  } catch (error: unknown) {
    console.error('판매팀 생성 오류:', error)

    if (error instanceof Error && error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: '판매팀 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

