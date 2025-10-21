import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { validatePasswordStrength, isPasswordDifferent } from '@/lib/password-validation'

export interface PasswordUpdateResult {
  success: boolean
  error?: string
  validationResult?: {
    isValid: boolean
    score: number
    errors: string[]
    suggestions: string[]
  }
}

/**
 * 사용자의 비밀번호를 업데이트합니다.
 * @param userId 사용자 ID
 * @param newPassword 새 비밀번호
 * @param currentPasswordHash 현재 비밀번호 해시 (선택사항)
 * @returns 업데이트 결과
 */
export async function updateUserPassword(
  userId: string,
  newPassword: string,
  currentPasswordHash?: string
): Promise<PasswordUpdateResult> {
  try {
    // 1. 비밀번호 강도 검증
    const validation = validatePasswordStrength(newPassword)
    
    if (!validation.isValid) {
      return {
        success: false,
        error: '비밀번호가 보안 요구사항을 만족하지 않습니다.',
        validationResult: validation
      }
    }

    // 2. 현재 비밀번호와 다른지 확인 (제공된 경우)
    if (currentPasswordHash) {
      const isDifferent = await isPasswordDifferent(newPassword, currentPasswordHash)
      if (!isDifferent) {
        return {
          success: false,
          error: '새 비밀번호는 현재 비밀번호와 달라야 합니다.'
        }
      }
    }

    // 3. 비밀번호 해시화
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // 4. 데이터베이스 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    })

    return {
      success: true,
      validationResult: validation
    }

  } catch (error) {
    console.error('비밀번호 업데이트 오류:', error)
    return {
      success: false,
      error: '비밀번호 업데이트 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 비밀번호 재설정을 통해 비밀번호를 업데이트합니다.
 * @param token 재설정 토큰
 * @param newPassword 새 비밀번호
 * @returns 업데이트 결과
 */
export async function resetUserPassword(
  token: string,
  newPassword: string
): Promise<PasswordUpdateResult> {
  try {
    // 1. 토큰으로 사용자 정보 조회
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken || resetToken.used) {
      return {
        success: false,
        error: '유효하지 않은 토큰입니다.'
      }
    }

    // 2. 비밀번호 업데이트
    const result = await updateUserPassword(
      resetToken.userId,
      newPassword,
      resetToken.user.password
    )

    if (result.success) {
      // 3. 토큰을 사용 처리
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      })
    }

    return result

  } catch (error) {
    console.error('비밀번호 재설정 오류:', error)
    return {
      success: false,
      error: '비밀번호 재설정 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 사용자의 현재 비밀번호를 확인합니다.
 * @param userId 사용자 ID
 * @param password 확인할 비밀번호
 * @returns 비밀번호 일치 여부
 */
export async function verifyCurrentPassword(
  userId: string,
  password: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    })

    if (!user) {
      return false
    }

    return await bcrypt.compare(password, user.password)

  } catch (error) {
    console.error('현재 비밀번호 확인 오류:', error)
    return false
  }
}
