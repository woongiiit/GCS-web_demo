import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Redis 연결 (개발 환경에서는 메모리 기반 fallback)
const redis = process.env.UPSTASH_REDIS_REST_URL 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Rate Limiting 설정
export const rateLimiters = {
  // 비밀번호 재설정 요청: 5분에 3회
  forgotPassword: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(3, '5 m'),
    analytics: true,
    prefix: 'forgot-password',
  }),
  
  // 비밀번호 재설정 시도: 10분에 5회
  resetPassword: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    analytics: true,
    prefix: 'reset-password',
  }),
  
  // 토큰 검증: 1분에 10회
  validateToken: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'validate-token',
  }),
  
  // 일반 API 요청: 1분에 30회
  general: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'general',
  }),

  // 계정별 로그인 실패: 10분에 5회 (5회 실패 시 10분 벤)
  accountLoginFailure: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    analytics: true,
    prefix: 'account-login-failure',
  }),
}

/**
 * Rate Limiting을 적용합니다.
 * @param limiter 사용할 rate limiter
 * @param identifier 식별자 (IP 주소, 사용자 ID 등)
 * @returns Rate limiting 결과
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: Date
  error?: string
}> {
  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)
    
    return {
      success,
      limit,
      remaining,
      reset: new Date(reset),
      error: success ? undefined : '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
    }
  } catch (error) {
    console.error('Rate limiting 오류:', error)
    // Rate limiting 실패 시 허용 (서비스 가용성 우선)
    return {
      success: true,
      limit: 100,
      remaining: 99,
      reset: new Date(Date.now() + 60000),
    }
  }
}

/**
 * 계정별 Rate Limiting을 적용합니다.
 * @param email 사용자 이메일
 * @returns Rate limiting 결과
 */
export async function checkAccountRateLimit(email: string): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: Date
  error?: string
  isBlocked?: boolean
}> {
  try {
    const { success, limit, remaining, reset } = await rateLimiters.accountLoginFailure.limit(email)
    
    return {
      success,
      limit,
      remaining,
      reset: new Date(reset),
      isBlocked: !success,
      error: success ? undefined : `계정이 일시적으로 잠겼습니다. ${Math.ceil((new Date(reset).getTime() - Date.now()) / 60000)}분 후에 다시 시도해주세요.`
    }
  } catch (error) {
    console.error('Account rate limiting 오류:', error)
    // Rate limiting 실패 시 허용 (서비스 가용성 우선)
    return {
      success: true,
      limit: 5,
      remaining: 4,
      reset: new Date(Date.now() + 600000),
      isBlocked: false,
    }
  }
}

/**
 * IP 주소를 추출합니다.
 * @param request NextRequest 객체
 * @returns IP 주소
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  
  return 'unknown'
}
