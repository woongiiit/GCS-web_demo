import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyEmailCode } from '@/lib/email-verification'
import { updateUserPassword, resetUserPassword } from '@/lib/password-update'
import { rateLimiters, checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { validateRequest, createErrorResponse, createSuccessResponse } from '@/lib/security'
import { logger, logSecurityEvent } from '@/lib/logger'
import { validatePasswordResetToken } from '@/lib/token-validation'

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
    const rateLimit = await checkRateLimit(rateLimiters.resetPassword, clientIP)
    if (!rateLimit.success) {
      logSecurityEvent('rate_limit_exceeded', 'Rate limit exceeded for reset password', {
        ip: clientIP,
        userAgent
      })
      return createErrorResponse(rateLimit.error!, 429, {
        'Retry-After': Math.ceil((rateLimit.reset.getTime() - Date.now()) / 1000).toString()
      })
    }

    const { email, code, password, token } = await request.json()

    if (!password) {
      return createErrorResponse('비밀번호를 입력해주세요.')
    }

    // 토큰 기반 비밀번호 재설정 처리
    if (token) {
      const tokenValidation = await validatePasswordResetToken(token)

      if (!tokenValidation.isValid || !tokenValidation.user) {
        logSecurityEvent('password_reset_token_invalid', 'Invalid password reset token provided', {
          ip: clientIP,
          userAgent,
          error: tokenValidation.error
        })

        return createErrorResponse(tokenValidation.error || '유효하지 않은 토큰입니다.')
      }

      const result = await resetUserPassword(token, password)

      if (!result.success) {
        logSecurityEvent('password_reset_failed', 'Password reset failed', {
          ip: clientIP,
          userAgent,
          userId: tokenValidation.user.id,
          email: tokenValidation.user.email,
          error: result.error
        })

        return createErrorResponse(result.error || '비밀번호 재설정에 실패했습니다.', 400, {
          ...(result.validationResult ? { 'X-Validation-Result': JSON.stringify(result.validationResult) } : {})
        })
      }

      logSecurityEvent('password_reset_completed', 'Password reset completed successfully', {
        ip: clientIP,
        userAgent,
        userId: tokenValidation.user.id,
        email: tokenValidation.user.email
      })

      logger.info('비밀번호 재설정 완료', {
        userId: tokenValidation.user.id,
        email: tokenValidation.user.email,
        ip: clientIP
      })

      return createSuccessResponse({
        message: '비밀번호가 성공적으로 재설정되었습니다.',
        validationResult: result.validationResult
      })
    }

    if (!email || !code) {
      return createErrorResponse('이메일, 인증번호, 비밀번호가 모두 필요합니다.')
    }

    // 3. 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return createErrorResponse('올바른 이메일 형식을 입력해주세요.')
    }

    // 4. 인증번호 형식 검증 (6자리 숫자)
    if (!/^\d{6}$/.test(code)) {
      return createErrorResponse('인증번호는 6자리 숫자여야 합니다.')
    }

    // 5. 사용자 존재 여부 확인
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // 보안상 존재하지 않는 이메일에 대해서도 동일한 응답 시간 유지
      await new Promise(resolve => setTimeout(resolve, 1000))
      return createErrorResponse('해당 이메일로 등록된 사용자가 없습니다.', 404)
    }

    // 6. 인증번호 검증
    const verificationResult = await verifyEmailCode(email, code)
    
    if (!verificationResult.success) {
      logSecurityEvent('password_reset_verification_failed', 'Password reset verification code failed', {
        ip: clientIP,
        userAgent,
        email,
        remainingAttempts: verificationResult.remainingAttempts
      })
      return createErrorResponse(verificationResult.message, 400, {
        'X-Remaining-Attempts': verificationResult.remainingAttempts?.toString() || '0'
      })
    }

    // 7. 비밀번호 재설정
    const result = await updateUserPassword(user.id, password, user.password)
    
    if (!result.success) {
      logSecurityEvent('password_reset_failed', 'Password reset failed', {
        ip: clientIP,
        userAgent,
        userId: user.id,
        email: user.email,
        error: result.error
      })
      return createErrorResponse(result.error!, 400, {
        'X-Validation-Result': JSON.stringify(result.validationResult)
      })
    }
    
    // 성공 로깅
    logSecurityEvent('password_reset_completed', 'Password reset completed successfully', {
      ip: clientIP,
      userAgent,
      userId: user.id,
      email: user.email
    })
    
    logger.info('비밀번호 재설정 완료', {
      userId: user.id,
      email: user.email,
      ip: clientIP
    })
    
    return createSuccessResponse({
      message: '비밀번호가 성공적으로 재설정되었습니다.',
      validationResult: result.validationResult
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
