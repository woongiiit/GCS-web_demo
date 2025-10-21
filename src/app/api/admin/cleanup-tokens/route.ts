import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredTokens } from '@/lib/token-validation'

export async function POST(request: NextRequest) {
  try {
    const cleanedCount = await cleanupExpiredTokens()
    
    return NextResponse.json({
      success: true,
      message: `${cleanedCount}개의 만료된 토큰이 정리되었습니다.`,
      cleanedCount
    })

  } catch (error) {
    console.error('토큰 정리 오류:', error)
    return NextResponse.json(
      { error: '토큰 정리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
