import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { rateLimiters, checkRateLimit, checkAccountRateLimit, getClientIP } from '@/lib/rate-limit'
import { validateRequest, createErrorResponse, createSuccessResponse } from '@/lib/security'
import { logger, logSecurityEvent } from '@/lib/logger'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    // 요청 유효성 검사
    const validation = validateRequest(request)
    if (!validation.isValid) {
      logSecurityEvent('suspicious_activity', 'Invalid login request detected', {
        ip: clientIP,
        userAgent,
        error: validation.error
      })
      return createErrorResponse(validation.error!, 400)
    }

    // Rate Limit 확인
    const rateLimit = await checkRateLimit(rateLimiters.general, clientIP)
    if (!rateLimit.success) {
      logSecurityEvent('rate_limit_exceeded', 'Rate limit exceeded for login', {
        ip: clientIP,
        userAgent
      })
      return createErrorResponse(rateLimit.error!, 429, {
        'Retry-After': Math.ceil((rateLimit.reset.getTime() - Date.now()) / 1000).toString()
      })
    }

    const { email, password } = await request.json()

    // 입력값 검증
    if (!email || !password) {
      logSecurityEvent('invalid_login_attempt', 'Missing email or password', {
        ip: clientIP,
        userAgent,
        email: email || 'missing'
      })
      return createErrorResponse('이메일과 비밀번호를 입력해주세요.')
    }

    // 계정별 Rate Limit 확인 (비밀번호 실패 횟수 체크)
    const accountRateLimit = await checkAccountRateLimit(email)
    if (accountRateLimit.isBlocked) {
      logSecurityEvent('account_blocked', 'Account temporarily blocked due to too many failed attempts', {
        ip: clientIP,
        userAgent,
        email,
        remainingTime: Math.ceil((accountRateLimit.reset.getTime() - Date.now()) / 60000)
      })
      return createErrorResponse(accountRateLimit.error!, 423) // 423 Locked
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      logSecurityEvent('invalid_login_attempt', 'User not found', {
        ip: clientIP,
        userAgent,
        email
      })
      return createErrorResponse('이메일 또는 비밀번호가 올바르지 않습니다.', 401)
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      logSecurityEvent('invalid_login_attempt', 'Invalid password', {
        ip: clientIP,
        userAgent,
        email,
        userId: user.id
      })
      return createErrorResponse('이메일 또는 비밀번호가 올바르지 않습니다.', 401)
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        isSeller: user.isSeller
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    // 성공적인 로그인 로깅
    logger.info('User login successful', {
      ip: clientIP,
      userAgent,
      userId: user.id,
      email: user.email,
      role: user.role,
      isSeller: user.isSeller
    })

    logSecurityEvent('login_success', 'User logged in successfully', {
      ip: clientIP,
      userAgent,
      userId: user.id,
      email: user.email,
      role: user.role,
      isSeller: user.isSeller
    })

    // 응답 생성
    const response = createSuccessResponse({
      message: '로그인 성공',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        studentId: user.studentId,
        major: user.major,
        phone: user.phone,
        role: user.role,
        isSeller: user.isSeller,
        verificationStatus: user.verificationStatus
      }
    })

    // 쿠키에 토큰 설정
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24시간
    })

    return response

  } catch (error) {
    logger.error('Login error', {
      error: error,
      ip: clientIP,
      userAgent
    })
    
    logSecurityEvent('login_error', 'Login system error', {
      ip: clientIP,
      userAgent,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return createErrorResponse('서버 오류가 발생했습니다. 다시 시도해주세요.', 500)
  } finally {
    await prisma.$disconnect()
  }
}