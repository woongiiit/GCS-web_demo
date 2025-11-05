import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 사용자의 participatedProjectIds 배열에서 프로젝트 ID 목록 가져오기
    const userWithProjects = await prisma.user.findUnique({
      where: { id: user.id },
      select: { participatedProjectIds: true }
    })

    if (!userWithProjects || !userWithProjects.participatedProjectIds || userWithProjects.participatedProjectIds.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          count: 0
        },
        { status: 200 }
      )
    }

    // 프로젝트 목록 조회
    const projects = await prisma.project.findMany({
      where: {
        id: { in: userWithProjects.participatedProjectIds }
      },
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
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: projects,
        count: projects.length
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('내 프로젝트 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

