import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'

export async function GET(request: Request) {
  try {
    // 인증 확인 및 사용자 정보 가져오기
    const user = await requireAuth()

    // 관리자만 전체 목록 조회 가능
    if (!permissions.canApproveVerification(user.role as any)) {
      return NextResponse.json(
        { error: permissionErrors.adminOnly },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // REQUESTED, APPROVED, REJECTED

    // 인증 요청 목록 조회
    const whereClause: any = {}
    
    if (status && ['REQUESTED', 'APPROVED', 'REJECTED'].includes(status)) {
      whereClause.verificationStatus = status
    }

    const verifications = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        studentId: true,
        major: true,
        role: true,
        verificationStatus: true,
        verificationImageUrl: true,
        verificationRequestedAt: true,
        verificationApprovedAt: true,
        verificationRejectedAt: true,
        verificationNote: true,
        createdAt: true,
      },
      orderBy: {
        verificationRequestedAt: 'desc',
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        data: verifications,
        count: verifications.length 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('학생 인증 목록 조회 오류:', error)
    
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

