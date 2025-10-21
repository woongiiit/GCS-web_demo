/**
 * 비밀번호 강도 검증 결과
 */
export interface PasswordValidationResult {
  isValid: boolean
  score: number // 0-100
  errors: string[]
  suggestions: string[]
}

/**
 * 비밀번호 강도를 검증합니다.
 * @param password 검증할 비밀번호
 * @returns 비밀번호 검증 결과
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []
  const suggestions: string[] = []
  let score = 0

  // 최소 길이 검증
  if (password.length < 6) {
    errors.push('비밀번호는 최소 6자 이상이어야 합니다.')
  } else {
    score += 20
  }

  // 길이별 점수
  if (password.length >= 8) score += 10
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10

  // 대문자 포함 검증
  if (!/[A-Z]/.test(password)) {
    suggestions.push('대문자를 포함하면 보안이 강화됩니다.')
  } else {
    score += 10
  }

  // 소문자 포함 검증
  if (!/[a-z]/.test(password)) {
    suggestions.push('소문자를 포함하면 보안이 강화됩니다.')
  } else {
    score += 10
  }

  // 숫자 포함 검증
  if (!/\d/.test(password)) {
    suggestions.push('숫자를 포함하면 보안이 강화됩니다.')
  } else {
    score += 10
  }

  // 특수문자 포함 검증
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    suggestions.push('특수문자를 포함하면 보안이 강화됩니다.')
  } else {
    score += 10
  }

  // 연속된 문자 검증
  if (/(.)\1{2,}/.test(password)) {
    errors.push('연속된 동일한 문자는 사용할 수 없습니다.')
  }

  // 일반적인 패턴 검증
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /user/i,
    /test/i,
    /123123/,
    /111111/,
    /000000/
  ]

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('너무 일반적인 패턴입니다. 더 복잡한 비밀번호를 사용하세요.')
      break
    }
  }

  // 키보드 패턴 검증
  const keyboardPatterns = [
    /qwerty/i,
    /asdf/i,
    /zxcv/i,
    /qaz/i,
    /wsx/i
  ]

  for (const pattern of keyboardPatterns) {
    if (pattern.test(password)) {
      suggestions.push('키보드 패턴은 피하는 것이 좋습니다.')
      break
    }
  }

  const isValid = errors.length === 0 && score >= 50

  return {
    isValid,
    score: Math.min(100, score),
    errors,
    suggestions
  }
}

/**
 * 비밀번호가 이전 비밀번호와 다른지 확인합니다.
 * @param newPassword 새 비밀번호
 * @param oldPasswordHash 이전 비밀번호 해시
 * @returns 다른 비밀번호인지 여부
 */
export async function isPasswordDifferent(
  newPassword: string, 
  oldPasswordHash: string
): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  return !(await bcrypt.compare(newPassword, oldPasswordHash))
}

/**
 * 비밀번호 강도 레벨을 반환합니다.
 * @param score 점수 (0-100)
 * @returns 강도 레벨
 */
export function getPasswordStrengthLevel(score: number): {
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  label: string
  color: string
} {
  if (score < 30) {
    return { level: 'weak', label: '매우 약함', color: 'text-red-600' }
  } else if (score < 50) {
    return { level: 'fair', label: '약함', color: 'text-orange-600' }
  } else if (score < 70) {
    return { level: 'good', label: '보통', color: 'text-yellow-600' }
  } else if (score < 90) {
    return { level: 'strong', label: '강함', color: 'text-blue-600' }
  } else {
    return { level: 'very-strong', label: '매우 강함', color: 'text-green-600' }
  }
}
