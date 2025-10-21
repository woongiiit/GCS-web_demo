import { NextRequest, NextResponse } from 'next/server'
import { getClientIP } from './rate-limit'
import { logSecurityEvent } from './logger'

/**
 * 보안 헤더를 추가합니다.
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // XSS 보호
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy (기본)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
  )
  
  // HSTS (HTTPS 환경에서만)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
  return response
}

/**
 * 의심스러운 요청을 감지합니다.
 */
export function detectSuspiciousActivity(request: NextRequest): {
  isSuspicious: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  const userAgent = request.headers.get('user-agent') || ''
  const ip = getClientIP(request)
  
  // 1. 봇/크롤러 감지
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /java/i
  ]
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    reasons.push('Bot-like user agent detected')
  }
  
  // 2. 의심스러운 User-Agent
  if (userAgent.length < 10 || userAgent.length > 500) {
    reasons.push('Suspicious user agent length')
  }
  
  // 3. 빈 User-Agent
  if (!userAgent) {
    reasons.push('Missing user agent')
  }
  
  // 4. SQL Injection 시도 감지 (기본적인 패턴)
  const url = request.url
  const sqlPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /update\s+set/i,
    /or\s+1=1/i,
    /and\s+1=1/i
  ]
  
  if (sqlPatterns.some(pattern => pattern.test(url))) {
    reasons.push('Potential SQL injection attempt')
  }
  
  // 5. XSS 시도 감지
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i
  ]
  
  if (xssPatterns.some(pattern => pattern.test(url))) {
    reasons.push('Potential XSS attempt')
  }
  
  // 6. 디렉토리 탐색 시도
  if (url.includes('../') || url.includes('..\\')) {
    reasons.push('Potential directory traversal attempt')
  }
  
  const isSuspicious = reasons.length > 0
  
  if (isSuspicious) {
    logSecurityEvent('suspicious_activity', 'Suspicious request detected', {
      ip,
      userAgent,
      url,
      reasons
    })
  }
  
  return { isSuspicious, reasons }
}

/**
 * 요청을 검증합니다.
 */
export function validateRequest(request: NextRequest): {
  isValid: boolean
  error?: string
} {
  // 1. Content-Type 검증 (POST/PUT 요청)
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return {
        isValid: false,
        error: 'Invalid content type'
      }
    }
  }
  
  // 2. 요청 크기 제한 (1MB)
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 1024 * 1024) {
    return {
      isValid: false,
      error: 'Request too large'
    }
  }
  
  // 3. 의심스러운 활동 감지
  const { isSuspicious, reasons } = detectSuspiciousActivity(request)
  if (isSuspicious) {
    return {
      isValid: false,
      error: 'Suspicious request detected'
    }
  }
  
  return { isValid: true }
}

/**
 * 에러 응답을 생성합니다.
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  additionalHeaders: Record<string, string> = {}
): NextResponse {
  const response = NextResponse.json(
    { error: message },
    { status }
  )
  
  // 보안 헤더 추가
  addSecurityHeaders(response)
  
  // 추가 헤더 설정
  Object.entries(additionalHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

/**
 * 성공 응답을 생성합니다.
 */
export function createSuccessResponse(
  data: any,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): NextResponse {
  const response = NextResponse.json(data, { status })
  
  // 보안 헤더 추가
  addSecurityHeaders(response)
  
  // 추가 헤더 설정
  Object.entries(additionalHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}
