import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAndSendVerificationCode } from '@/lib/email-verification'
import { rateLimiters, checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { validateRequest, createErrorResponse, createSuccessResponse } from '@/lib/security'
import { logger, logSecurityEvent } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  try {
    // 1. 요청 검증
    const validation = validateRequest(request)
    if (!validation.isValid) {
      logSecurityEvent('suspicious_activity', 'Invalid request detected', {
        ip: clientIP,
        userAgent,
        error: validation.error
      })
      return createErrorResponse(validation.error!, 400)
    }

    // 2. Rate Limiting
    const rateLimit = await checkRateLimit(rateLimiters.forgotPassword, clientIP)
    if (!rateLimit.success) {
      logSecurityEvent('rate_limit_exceeded', 'Rate limit exceeded for forgot password', {
        ip: clientIP,
        userAgent
      })
      return createErrorResponse(rateLimit.error!, 429, {
        'Retry-After': Math.ceil((rateLimit.reset.getTime() - Date.now()) / 1000).toString()
      })
    }

    const { email } = await request.json()

    if (!email) {
      return createErrorResponse('이메일 주소를 입력해주세요.')
    }

    // 3. 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      logSecurityEvent('invalid_token_attempt', 'Invalid email format provided', {
        ip: clientIP,
        userAgent,
        email
      })
      return createErrorResponse('올바른 이메일 형식이 아닙니다.')
    }

    // 4. 사용자 존재 여부 확인
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // 보안상 존재하지 않는 이메일에 대해서도 동일한 응답 시간 유지
      await new Promise(resolve => setTimeout(resolve, 1000))
      return createErrorResponse('해당 이메일로 등록된 사용자가 없습니다.', 404)
    }

    // 5. 비밀번호 재설정용 인증번호 생성 및 전송
    try {
      await createAndSendVerificationCode(email)
      
      // 성공 로깅
      logSecurityEvent('password_reset_code_sent', 'Password reset verification code sent successfully', {
        ip: clientIP,
        userAgent,
        userId: user.id,
        email: user.email
      })
      
      logger.info('Password reset verification code sent', {
        userId: user.id,
        email: user.email,
        ip: clientIP
      })
      
    } catch (emailError) {
      logger.error('인증번호 전송 실패', {
        error: emailError,
        userId: user.id,
        email: user.email,
        ip: clientIP
      })
      
      return createErrorResponse('인증번호 전송에 실패했습니다. 잠시 후 다시 시도해주세요.', 500)
    }
    
    return createSuccessResponse({
      message: '비밀번호 재설정 인증번호가 전송되었습니다.',
      email: email
    })

  } catch (error) {
    logger.error('비밀번호 재설정 오류', {
      error: error,
      ip: clientIP,
      userAgent
    })
    
    return createErrorResponse('서버 오류가 발생했습니다. 다시 시도해주세요.', 500)
  }
}
