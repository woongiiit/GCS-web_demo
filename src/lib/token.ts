import crypto from 'crypto'

/**
 * 비밀번호 재설정을 위한 안전한 토큰을 생성합니다.
 * @returns 32바이트의 암호학적으로 안전한 랜덤 토큰 (hex 문자열)
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * 토큰의 만료 시간을 계산합니다.
 * @param hoursFromNow 몇 시간 후에 만료될지 (기본값: 1시간)
 * @returns 만료 시간
 */
export function getTokenExpirationTime(hoursFromNow: number = 1): Date {
  const now = new Date()
  const expirationTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000)
  return expirationTime
}

/**
 * 토큰이 만료되었는지 확인합니다.
 * @param expiresAt 토큰의 만료 시간
 * @returns 만료 여부
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

/**
 * 토큰 형식이 유효한지 확인합니다.
 * @param token 검증할 토큰
 * @returns 유효한 형식인지 여부
 */
export function isValidTokenFormat(token: string): boolean {
  // 32바이트 hex 문자열인지 확인 (64자)
  const hexRegex = /^[a-f0-9]{64}$/i
  return hexRegex.test(token)
}

/**
 * 토큰의 남은 유효 시간을 계산합니다.
 * @param expiresAt 토큰의 만료 시간
 * @returns 남은 시간 (밀리초)
 */
export function getTokenTimeRemaining(expiresAt: Date): number {
  const now = new Date()
  const remaining = expiresAt.getTime() - now.getTime()
  return Math.max(0, remaining)
}

/**
 * 토큰의 남은 유효 시간을 사람이 읽기 쉬운 형태로 반환합니다.
 * @param expiresAt 토큰의 만료 시간
 * @returns 남은 시간 문자열
 */
export function getTokenTimeRemainingText(expiresAt: Date): string {
  const remaining = getTokenTimeRemaining(expiresAt)
  
  if (remaining === 0) {
    return '만료됨'
  }
  
  const minutes = Math.floor(remaining / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}시간 ${minutes % 60}분 남음`
  } else {
    return `${minutes}분 남음`
  }
}

/**
 * 비밀번호 재설정 링크를 생성합니다.
 * @param token 재설정 토큰
 * @param baseUrl 기본 URL (환경변수에서 가져옴)
 * @returns 완전한 재설정 링크
 */
export function generatePasswordResetLink(token: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return `${base}/reset-password?token=${token}`
}
