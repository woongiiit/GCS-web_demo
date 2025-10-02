import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '이메일 주소를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      )
    }

    // 사용자 존재 여부 확인
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: '해당 이메일로 등록된 사용자가 없습니다.' },
        { status: 404 }
      )
    }

    // TODO: 실제 이메일 전송 로직 구현
    // 1. 비밀번호 재설정 토큰 생성
    // 2. 토큰을 데이터베이스에 저장 (만료 시간 포함)
    // 3. 이메일 전송 서비스 사용하여 링크 전송
    
    // 임시로 성공 응답 반환
    console.log(`비밀번호 재설정 요청: ${email}`)
    
    return NextResponse.json({
      message: '비밀번호 재설정 링크가 전송되었습니다.',
      email: email
    })

  } catch (error) {
    console.error('비밀번호 재설정 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
