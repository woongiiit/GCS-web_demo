import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 판매팀에 멤버 추가
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const teamId = params.id

    // 판매팀 조회
    const team = await prisma.sellerTeam.findUnique({
      where: { id: teamId },
      include: {
        members: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json(
        { error: '판매팀을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 판매팀 멤버인지 확인
    const isMember = team.members.some((member) => member.userId === user.id)

    if (!isMember) {
      return NextResponse.json(
        { error: '판매팀 멤버만 멤버를 추가할 수 있습니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userIds } = body as { userIds: string[] }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: '추가할 멤버를 선택해주세요.' },
        { status: 400 }
      )
    }

    // 중복 제거 및 이미 멤버인 사용자 제외
    const existingMemberIds = team.members.map((m) => m.userId)
    const newMemberIds = [...new Set(userIds)].filter(
      (id) => !existingMemberIds.includes(id)
    )

    if (newMemberIds.length === 0) {
      return NextResponse.json(
        { error: '추가할 새로운 멤버가 없습니다.' },
        { status: 400 }
      )
    }

    // 사용자 존재 여부 및 판매자 권한 확인
    const users = await prisma.user.findMany({
      where: {
        id: { in: newMemberIds },
        isSeller: true // 판매자만 추가 가능
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (users.length === 0) {
      return NextResponse.json(
        { error: '추가할 수 있는 판매자 멤버가 없습니다.' },
        { status: 400 }
      )
    }

    // 멤버 추가
    await prisma.userSellerTeam.createMany({
      data: users.map((user) => ({
        userId: user.id,
        sellerTeamId: teamId
      })),
      skipDuplicates: true
    })

    return NextResponse.json({
      success: true,
      message: `${users.length}명의 멤버가 추가되었습니다.`,
      data: {
        addedMembers: users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email
        }))
      }
    })
  } catch (error: unknown) {
    console.error('판매팀 멤버 추가 오류:', error)

    if (error instanceof Error && error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: '판매팀 멤버 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 판매팀에서 멤버 제거
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const teamId = params.id

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '제거할 멤버 ID를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 판매팀 조회
    const team = await prisma.sellerTeam.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true
              }
            }
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json(
        { error: '판매팀을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 판매팀 멤버인지 확인
    const isMember = team.members.some((member) => member.userId === user.id)

    if (!isMember) {
      return NextResponse.json(
        { error: '판매팀 멤버만 멤버를 제거할 수 있습니다.' },
        { status: 403 }
      )
    }

    // 자기 자신은 제거할 수 없음 (최소 1명은 남아야 함)
    if (userId === user.id && team.members.length === 1) {
      return NextResponse.json(
        { error: '판매팀에는 최소 1명의 멤버가 필요합니다.' },
        { status: 400 }
      )
    }

    // 멤버 제거
    await prisma.userSellerTeam.deleteMany({
      where: {
        sellerTeamId: teamId,
        userId: userId
      }
    })

    return NextResponse.json({
      success: true,
      message: '멤버가 제거되었습니다.'
    })
  } catch (error: unknown) {
    console.error('판매팀 멤버 제거 오류:', error)

    if (error instanceof Error && error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: '판매팀 멤버 제거 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

