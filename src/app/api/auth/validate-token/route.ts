import { NextRequest, NextResponse } from 'next/server'
import { validatePasswordResetToken } from '@/lib/token-validation'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: '토큰이 필요합니다.' },
        { status: 400 }
      )
    }

    const validation = await validatePasswordResetToken(token)

    if (!validation.isValid) {
      return NextResponse.json({
        valid: false,
        error: validation.error,
        isExpired: validation.isExpired,
        isUsed: validation.isUsed
      }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      user: {
        email: validation.user!.email,
        name: validation.user!.name
      },
      timeRemaining: validation.timeRemaining
    })

  } catch (error) {
    console.error('토큰 검증 API 오류:', error)
    return NextResponse.json(
      { error: '토큰 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
