import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'

export async function POST(request: Request) {
  try {
    // 인증 확인 및 사용자 정보 가져오기
    const user = await requireAuth()

    // 학생 인증 승인 권한 확인 (ADMIN만 가능)
    if (!permissions.canApproveVerification(user.role as any)) {
      return NextResponse.json(
        { error: permissionErrors.adminOnly },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, action, note } = body

    // 유효성 검사
    if (!userId || !action) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      )
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: '잘못된 액션입니다.' },
        { status: 400 }
      )
    }

    // 대상 사용자 조회
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verificationStatus: true,
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 인증 요청 상태가 아닌 경우
    if (targetUser.verificationStatus !== 'REQUESTED') {
      return NextResponse.json(
        { error: '인증 요청 상태가 아닙니다.' },
        { status: 400 }
      )
    }

    // 승인 처리
    if (action === 'approve') {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          role: 'MAJOR', // 전공회원으로 전환
          verificationStatus: 'APPROVED',
          verificationApprovedAt: new Date(),
          verificationRejectedAt: null,
          verificationNote: note || null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          verificationStatus: true,
          verificationApprovedAt: true,
        }
      })

      return NextResponse.json(
        { 
          success: true, 
          message: `${targetUser.name}님의 학생 인증이 승인되었습니다.`,
          data: updatedUser 
        },
        { status: 200 }
      )
    } 
    // 거부 처리
    else {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          verificationStatus: 'REJECTED',
          verificationRejectedAt: new Date(),
          verificationApprovedAt: null,
          verificationNote: note || '인증이 거부되었습니다.',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          verificationStatus: true,
          verificationRejectedAt: true,
          verificationNote: true,
        }
      })

      return NextResponse.json(
        { 
          success: true, 
          message: `${targetUser.name}님의 학생 인증이 거부되었습니다.`,
          data: updatedUser 
        },
        { status: 200 }
      )
    }

  } catch (error: any) {
    console.error('학생 인증 승인/거부 오류:', error)
    
    if (error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: permissionErrors.notLoggedIn },
        { status: 401 }
      )
    }
    
    if (error.message === '권한이 부족합니다') {
      return NextResponse.json(
        { error: permissionErrors.insufficientPermission },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

