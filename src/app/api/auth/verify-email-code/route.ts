import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailCode } from '@/lib/email-verification'
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
      logSecurityEvent('suspicious_activity', 'Invalid email verification request detected', {
        ip: clientIP,
        userAgent,
        error: validation.error
      })
      return createErrorResponse(validation.error!, 400)
    }

    // Rate Limit 확인
    const rateLimit = await checkRateLimit(rateLimiters.general, clientIP)
    if (!rateLimit.success) {
      logSecurityEvent('rate_limit_exceeded', 'Rate limit exceeded for email verification', {
        ip: clientIP,
        userAgent
      })
      return createErrorResponse(rateLimit.error!, 429, {
        'Retry-After': Math.ceil((rateLimit.reset.getTime() - Date.now()) / 1000).toString()
      })
    }

    const { email, code, purpose } = await request.json()

    // 입력값 검증
    if (!email || !code) {
      return createErrorResponse('이메일과 인증번호를 입력해주세요.')
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return createErrorResponse('올바른 이메일 형식을 입력해주세요.')
    }

    // 인증번호 형식 검증 (6자리 숫자)
    if (!/^\d{6}$/.test(code)) {
      return createErrorResponse('인증번호는 6자리 숫자여야 합니다.')
    }

    // 인증번호 검증
    const consumeOnSuccess = purpose !== 'password_reset'
    const verificationResult = await verifyEmailCode(email, code, { consumeOnSuccess })

    if (verificationResult.success) {
      logger.info('Email verification successful', {
        ip: clientIP,
        userAgent,
        email
      })

      logSecurityEvent('email_verification_success', 'Email verification successful', {
        ip: clientIP,
        userAgent,
        email
      })

      return createSuccessResponse({
        message: verificationResult.message,
        verified: true
      })
    } else {
      logger.warn('Email verification failed', {
        ip: clientIP,
        userAgent,
        email,
        code: code.substring(0, 2) + '****',
        remainingAttempts: verificationResult.remainingAttempts
      })

      logSecurityEvent('email_verification_failed', 'Email verification failed', {
        ip: clientIP,
        userAgent,
        email,
        remainingAttempts: verificationResult.remainingAttempts
      })

      return createErrorResponse(verificationResult.message, 400, {
        'X-Remaining-Attempts': verificationResult.remainingAttempts?.toString() || '0'
      })
    }

  } catch (error) {
    logger.error('Verify email code error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: clientIP,
      userAgent
    })

    return createErrorResponse('인증번호 검증에 실패했습니다. 다시 시도해주세요.', 500)
  }
}
