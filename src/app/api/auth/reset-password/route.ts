import { NextRequest, NextResponse } from 'next/server'
import { validatePasswordResetToken } from '@/lib/token-validation'
import { resetUserPassword } from '@/lib/password-update'
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

    const { token, password } = await request.json()

    if (!token || !password) {
      return createErrorResponse('토큰과 비밀번호가 필요합니다.')
    }

    // 3. 토큰 검증
    const tokenValidation = await validatePasswordResetToken(token)
    
    if (!tokenValidation.isValid) {
      logSecurityEvent('invalid_token_attempt', 'Invalid token used for password reset', {
        ip: clientIP,
        userAgent,
        token: token.substring(0, 8) + '...', // 토큰 일부만 로깅
        error: tokenValidation.error
      })
      return createErrorResponse(tokenValidation.error!)
    }

    // 4. 비밀번호 재설정
    const result = await resetUserPassword(token, password)
    
    if (!result.success) {
      logSecurityEvent('password_reset_failed', 'Password reset failed', {
        ip: clientIP,
        userAgent,
        userId: tokenValidation.user?.id,
        email: tokenValidation.user?.email,
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
      userId: tokenValidation.user!.id,
      email: tokenValidation.user!.email
    })
    
    logger.info('비밀번호 재설정 완료', {
      userId: tokenValidation.user!.id,
      email: tokenValidation.user!.email,
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
