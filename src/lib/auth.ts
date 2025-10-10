import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { UserRole } from './permissions'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface JWTPayload {
  userId: string
  email: string
  role: UserRole
}

/**
 * 서버 사이드에서 현재 로그인한 사용자 정보를 가져옵니다
 */
export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as JWTPayload

    // DB에서 최신 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        studentId: true,
        major: true,
        phone: true,
        role: true,
        verificationStatus: true,
        verificationImageUrl: true,
        verificationRequestedAt: true,
        verificationApprovedAt: true,
        verificationRejectedAt: true,
        verificationNote: true,
      }
    })

    return user
  } catch (error) {
    console.error('인증 오류:', error)
    return null
  }
}

/**
 * 서버 사이드에서 사용자 권한을 검증합니다
 */
export async function requireAuth(requiredRoles?: UserRole[]) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('로그인이 필요합니다')
  }

  if (requiredRoles && !requiredRoles.includes(user.role as UserRole)) {
    throw new Error('권한이 부족합니다')
  }

  return user
}

/**
 * JWT 토큰을 생성합니다
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

/**
 * JWT 토큰을 검증합니다
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}
