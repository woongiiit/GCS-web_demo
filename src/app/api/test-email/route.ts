import { NextRequest, NextResponse } from 'next/server'
import { testEmailConnection } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const isConnected = await testEmailConnection()
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: '이메일 서버 연결 성공'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '이메일 서버 연결 실패'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('이메일 테스트 오류:', error)
    return NextResponse.json({
      success: false,
      message: '이메일 테스트 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
}
