import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { name, userType, studentId, major, email, phone, password } = await request.json()

    // 입력값 검증
    if (!name || !userType || !major || !email || !phone || !password) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 회원 유형 검증
    if (!['GENERAL', 'MAJOR'].includes(userType)) {
      return NextResponse.json(
        { error: '올바른 회원 유형을 선택해주세요.' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 학번 형식 검증 (전공 회원만)
    if (userType === 'MAJOR') {
      if (!studentId) {
        return NextResponse.json(
          { error: '전공 회원은 학번을 입력해주세요.' },
          { status: 400 }
        )
      }
      if (!/^\d{10}$/.test(studentId)) {
        return NextResponse.json(
          { error: '학번은 10자리 숫자여야 합니다.' },
          { status: 400 }
        )
      }
    }

    // 전화번호 형식 검증 (010-XXXX-XXXX)
    if (!/^010-\d{4}-\d{4}$/.test(phone)) {
      return NextResponse.json(
        { error: '전화번호는 010-XXXX-XXXX 형식으로 입력해주세요.' },
        { status: 400 }
      )
    }

    // 비밀번호 강도 검증
    if (password.length < 8) {
      return NextResponse.json(
        { error: '비밀번호는 8자리 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: '비밀번호는 영문과 숫자를 포함해야 합니다.' },
        { status: 400 }
      )
    }

    // 이메일 중복 검사
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      )
    }

    // 학번 중복 검사 (전공 회원만)
    if (userType === 'MAJOR' && studentId) {
      const existingUserByStudentId = await prisma.user.findUnique({
        where: { studentId }
      })

      if (existingUserByStudentId) {
        return NextResponse.json(
          { error: '이미 사용 중인 학번입니다.' },
          { status: 409 }
        )
      }
    }

    // 비밀번호 해싱
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        studentId: userType === 'MAJOR' ? studentId?.trim() : null,
        major: major.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: hashedPassword,
        role: userType === 'MAJOR' ? 'MAJOR' : 'GENERAL',
        verificationStatus: 'PENDING' // 기본값: 인증 대기
      }
    })

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    // 응답 생성
    const response = NextResponse.json(
      { 
        success: true,
        message: '회원가입이 완료되었습니다.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          studentId: user.studentId,
          major: user.major,
          phone: user.phone,
          role: user.role,
          verificationStatus: user.verificationStatus
        }
      },
      { status: 201 }
    )

    // 쿠키에 토큰 설정
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24시간
    })

    return response

  } catch (error: any) {
    console.error('회원가입 오류:', error)
    
    // Prisma 에러 처리
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      if (field === 'email') {
        return NextResponse.json(
          { error: '이미 사용 중인 이메일입니다.' },
          { status: 409 }
        )
      }
      if (field === 'studentId') {
        return NextResponse.json(
          { error: '이미 사용 중인 학번입니다.' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 다시 시도해주세요.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
