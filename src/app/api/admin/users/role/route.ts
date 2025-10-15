import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const adminUser = await requireAuth(request)
    if (adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { userId, role } = await request.json()

    // 입력값 검증
    if (!userId || !role) {
      return NextResponse.json(
        { error: '사용자 ID와 역할을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 유효한 역할인지 확인
    const validRoles = ['GENERAL', 'STUDENT', 'ADMIN']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: '유효하지 않은 역할입니다.' },
        { status: 400 }
      )
    }

    // 자신의 역할을 변경하려는 경우 방지
    if (adminUser.id === userId && role !== 'ADMIN') {
      return NextResponse.json(
        { error: '자신의 관리자 권한을 제거할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 사용자 존재 확인
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 역할 변경
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        role,
        // 역할이 STUDENT로 변경되면 인증 상태를 APPROVED로 설정
        ...(role === 'STUDENT' && { 
          verificationStatus: 'APPROVED',
          verificationApprovedAt: new Date()
        }),
        // 역할이 STUDENT가 아닌 다른 역할로 변경되면 인증 상태를 PENDING으로 설정
        ...(role !== 'STUDENT' && { 
          verificationStatus: 'PENDING',
          verificationApprovedAt: null
        })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verificationStatus: true
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: '사용자 역할이 성공적으로 변경되었습니다.',
        data: updatedUser
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('사용자 역할 변경 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
