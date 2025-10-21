import { prisma } from '@/lib/prisma'
import { isValidTokenFormat, isTokenExpired, getTokenTimeRemainingText } from '@/lib/token'

export interface TokenValidationResult {
  isValid: boolean
  isExpired: boolean
  isUsed: boolean
  user?: {
    id: string
    email: string
    name: string
  }
  timeRemaining?: string
  error?: string
}

/**
 * 비밀번호 재설정 토큰을 검증합니다.
 * @param token 검증할 토큰
 * @returns 토큰 검증 결과
 */
export async function validatePasswordResetToken(token: string): Promise<TokenValidationResult> {
  try {
    // 1. 토큰 형식 검증
    if (!token || !isValidTokenFormat(token)) {
      return {
        isValid: false,
        isExpired: false,
        isUsed: false,
        error: '유효하지 않은 토큰 형식입니다.'
      }
    }

    // 2. 데이터베이스에서 토큰 조회
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken) {
      return {
        isValid: false,
        isExpired: false,
        isUsed: false,
        error: '유효하지 않은 토큰입니다.'
      }
    }

    // 3. 토큰 사용 여부 확인
    if (resetToken.used) {
      return {
        isValid: false,
        isExpired: false,
        isUsed: true,
        error: '이미 사용된 토큰입니다.'
      }
    }

    // 4. 토큰 만료 여부 확인
    const isExpired = isTokenExpired(resetToken.expiresAt)
    if (isExpired) {
      return {
        isValid: false,
        isExpired: true,
        isUsed: false,
        error: '만료된 토큰입니다. 새로운 재설정 링크를 요청해주세요.'
      }
    }

    // 5. 유효한 토큰
    return {
      isValid: true,
      isExpired: false,
      isUsed: false,
      user: {
        id: resetToken.user.id,
        email: resetToken.user.email,
        name: resetToken.user.name
      },
      timeRemaining: getTokenTimeRemainingText(resetToken.expiresAt)
    }

  } catch (error) {
    console.error('토큰 검증 오류:', error)
    return {
      isValid: false,
      isExpired: false,
      isUsed: false,
      error: '토큰 검증 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 토큰을 사용 처리합니다.
 * @param token 사용할 토큰
 * @returns 성공 여부
 */
export async function markTokenAsUsed(token: string): Promise<boolean> {
  try {
    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true }
    })
    return true
  } catch (error) {
    console.error('토큰 사용 처리 오류:', error)
    return false
  }
}

/**
 * 사용자의 모든 미사용 토큰을 무효화합니다.
 * @param userId 사용자 ID
 * @returns 무효화된 토큰 수
 */
export async function invalidateUserTokens(userId: string): Promise<number> {
  try {
    const result = await prisma.passwordResetToken.updateMany({
      where: {
        userId,
        used: false
      },
      data: {
        used: true
      }
    })
    return result.count
  } catch (error) {
    console.error('사용자 토큰 무효화 오류:', error)
    return 0
  }
}

/**
 * 만료된 토큰들을 정리합니다.
 * @returns 정리된 토큰 수
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const now = new Date()
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    })
    return result.count
  } catch (error) {
    console.error('만료된 토큰 정리 오류:', error)
    return 0
  }
}
