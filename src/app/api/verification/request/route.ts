import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'

export async function POST(request: Request) {
  try {
    // 인증 확인 및 사용자 정보 가져오기
    const user = await requireAuth()

    // 학생 인증 요청 권한 확인 (GENERAL만 가능)
    if (!permissions.canRequestVerification(user.role as any, user.verificationStatus as any)) {
      return NextResponse.json(
        { 
          error: user.role !== 'GENERAL' 
            ? '일반회원만 학생 인증을 요청할 수 있습니다.' 
            : permissionErrors.alreadyRequested 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { imageUrl } = body

    // 유효성 검사
    if (!imageUrl) {
      return NextResponse.json(
        { error: '인증 이미지를 업로드해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationStatus: 'REQUESTED',
        verificationImageUrl: imageUrl,
        verificationRequestedAt: new Date(),
        verificationApprovedAt: null,
        verificationRejectedAt: null,
        verificationNote: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        verificationStatus: true,
        verificationRequestedAt: true,
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        message: '학생 인증 요청이 제출되었습니다. 운영자 승인을 기다려주세요.',
        data: updatedUser 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('학생 인증 요청 오류:', error)
    
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

