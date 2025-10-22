import { NextRequest, NextResponse } from 'next/server'
import { createAndSendVerificationCode } from '@/lib/email-verification'
import { rateLimiters, checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { validateRequest, createErrorResponse, createSuccessResponse } from '@/lib/security'
import { logger, logSecurityEvent } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    // 요청 유효성 검사
    const validation = validateRequest(request)
    if (!validation.isValid) {
      logSecurityEvent('suspicious_activity', 'Invalid verification code request detected', {
        ip: clientIP,
        userAgent,
        error: validation.error
      })
      return createErrorResponse(validation.error!, 400)
    }

    // Rate Limit 확인
    const rateLimit = await checkRateLimit(rateLimiters.general, clientIP)
    if (!rateLimit.success) {
      logSecurityEvent('rate_limit_exceeded', 'Rate limit exceeded for verification code request', {
        ip: clientIP,
        userAgent
      })
      return createErrorResponse(rateLimit.error!, 429, {
        'Retry-After': Math.ceil((rateLimit.reset.getTime() - Date.now()) / 1000).toString()
      })
    }

    const { email } = await request.json()

    // 입력값 검증
    if (!email) {
      return createErrorResponse('이메일 주소를 입력해주세요.')
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return createErrorResponse('올바른 이메일 형식을 입력해주세요.')
    }

    // 인증번호 생성 및 전송
    await createAndSendVerificationCode(email)

    logger.info('Email verification code sent', {
      ip: clientIP,
      userAgent,
      email
    })

    logSecurityEvent('email_verification_requested', 'Email verification code sent', {
      ip: clientIP,
      userAgent,
      email
    })

    return createSuccessResponse({
      message: '인증번호가 전송되었습니다. 이메일을 확인해주세요.'
    })

  } catch (error) {
    logger.error('Send verification code error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: clientIP,
      userAgent
    })

    return createErrorResponse('인증번호 전송에 실패했습니다. 다시 시도해주세요.', 500)
  }
}
