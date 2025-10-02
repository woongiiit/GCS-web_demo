import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: '토큰과 비밀번호가 필요합니다.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    // TODO: 실제 토큰 검증 로직 구현
    // 1. 토큰이 유효한지 확인
    // 2. 토큰이 만료되지 않았는지 확인
    // 3. 토큰에 해당하는 사용자 찾기
    
    // 임시로 토큰 검증 (실제 구현에서는 데이터베이스에서 토큰 확인)
    if (token === 'invalid-token') {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 400 }
      )
    }

    // 임시로 첫 번째 사용자의 비밀번호를 업데이트 (실제 구현에서는 토큰으로 사용자 찾기)
    const user = await prisma.user.findFirst()
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12)

    // 사용자 비밀번호 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // TODO: 사용된 토큰을 무효화 (데이터베이스에서 삭제 또는 만료 처리)
    
    console.log(`비밀번호 재설정 완료: ${user.email}`)
    
    return NextResponse.json({
      message: '비밀번호가 성공적으로 재설정되었습니다.'
    })

  } catch (error) {
    console.error('비밀번호 재설정 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
