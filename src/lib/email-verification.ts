import { PrismaClient } from '@prisma/client'
import { sendEmailVerificationCode } from './email'
import { logger } from './logger'

const prisma = new PrismaClient()

/**
 * 6자리 인증번호를 생성합니다.
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * 인증번호 만료 시간을 계산합니다 (5분 후).
 */
export function getVerificationCodeExpirationTime(): Date {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 5) // 5분 후 만료
  return now
}

/**
 * 인증번호가 만료되었는지 확인합니다.
 */
export function isVerificationCodeExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

/**
 * 이메일 인증번호를 생성하고 전송합니다.
 * @param email 이메일 주소
 * @returns 생성된 인증번호
 */
export async function createAndSendVerificationCode(email: string): Promise<string> {
  try {
    // 기존 인증번호들을 만료 처리
    await prisma.emailVerificationCode.updateMany({
      where: {
        email,
        used: false
      },
      data: {
        used: true
      }
    })

    // 새 인증번호 생성
    const code = generateVerificationCode()
    const expiresAt = getVerificationCodeExpirationTime()

    // 데이터베이스에 저장
    await prisma.emailVerificationCode.create({
      data: {
        email,
        code,
        expiresAt
      }
    })

    // 이메일 전송
    await sendEmailVerificationCode(email, code)

    logger.info('Email verification code created and sent', {
      email,
      code: code.substring(0, 2) + '****', // 보안을 위해 일부만 로깅
      expiresAt
    })

    return code
  } catch (error) {
    logger.error('Failed to create and send verification code', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw new Error('인증번호 생성 및 전송에 실패했습니다.')
  }
}

export interface VerifyEmailCodeOptions {
  consumeOnSuccess?: boolean
}

/**
 * 이메일 인증번호를 검증합니다.
 * @param email 이메일 주소
 * @param code 입력된 인증번호
 * @returns 검증 결과
 */
export async function verifyEmailCode(
  email: string,
  code: string,
  options: VerifyEmailCodeOptions = {}
): Promise<{
  success: boolean
  message: string
  remainingAttempts?: number
}> {
  const { consumeOnSuccess = true } = options

  try {
    // 인증번호 조회
    const verificationCode = await prisma.emailVerificationCode.findFirst({
      where: {
        email,
        code,
        used: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!verificationCode) {
      // 잘못된 인증번호인 경우 시도 횟수 증가
      const recentCodes = await prisma.emailVerificationCode.findMany({
        where: {
          email,
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000) // 최근 5분 내
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (recentCodes.length > 0) {
        const latestCode = recentCodes[0]
        await prisma.emailVerificationCode.update({
          where: { id: latestCode.id },
          data: { attempts: latestCode.attempts + 1 }
        })

        const remainingAttempts = Math.max(0, 3 - (latestCode.attempts + 1))
        
        if (remainingAttempts <= 0) {
          // 시도 횟수 초과 시 해당 이메일의 모든 인증번호 만료
          await prisma.emailVerificationCode.updateMany({
            where: { email },
            data: { used: true }
          })
          
          return {
            success: false,
            message: '인증번호 시도 횟수를 초과했습니다. 새로운 인증번호를 요청해주세요.',
            remainingAttempts: 0
          }
        }

        return {
          success: false,
          message: `인증번호가 올바르지 않습니다. (남은 시도 횟수: ${remainingAttempts}회)`,
          remainingAttempts
        }
      }

      return {
        success: false,
        message: '인증번호가 올바르지 않습니다.'
      }
    }

    // 만료 확인
    if (isVerificationCodeExpired(verificationCode.expiresAt)) {
      await prisma.emailVerificationCode.update({
        where: { id: verificationCode.id },
        data: { used: true }
      })

      return {
        success: false,
        message: '인증번호가 만료되었습니다. 새로운 인증번호를 요청해주세요.'
      }
    }

    if (consumeOnSuccess) {
      await prisma.emailVerificationCode.updateMany({
        where: { email },
        data: { used: true }
      })
    } else {
      await prisma.emailVerificationCode.updateMany({
        where: {
          email,
          id: {
            not: verificationCode.id
          }
        },
        data: { used: true }
      })
    }

    logger.info('Email verification code verified successfully', {
      email,
      codeId: verificationCode.id
    })

    return {
      success: true,
      message: '이메일 인증이 완료되었습니다.'
    }

  } catch (error) {
    logger.error('Failed to verify email code', {
      email,
      code: code.substring(0, 2) + '****',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw new Error('인증번호 검증에 실패했습니다.')
  }
}

/**
 * 만료된 인증번호들을 정리합니다.
 */
export async function cleanupExpiredVerificationCodes(): Promise<number> {
  try {
    const result = await prisma.emailVerificationCode.updateMany({
      where: {
        expiresAt: {
          lt: new Date()
        },
        used: false
      },
      data: {
        used: true
      }
    })

    logger.info('Expired verification codes cleaned up', {
      count: result.count
    })

    return result.count
  } catch (error) {
    logger.error('Failed to cleanup expired verification codes', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return 0
  }
}

/**
 * 이메일 인증 상태를 확인합니다.
 * @param email 이메일 주소
 * @returns 인증 상태 정보
 */
export async function getEmailVerificationStatus(email: string): Promise<{
  isVerified: boolean
  hasActiveCode: boolean
  remainingTime?: number
}> {
  try {
    // 최근 인증번호 조회
    const recentCode = await prisma.emailVerificationCode.findFirst({
      where: {
        email,
        used: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!recentCode) {
      return {
        isVerified: false,
        hasActiveCode: false
      }
    }

    const isExpired = isVerificationCodeExpired(recentCode.expiresAt)
    const remainingTime = isExpired ? 0 : Math.max(0, Math.floor((recentCode.expiresAt.getTime() - Date.now()) / 1000))

    return {
      isVerified: false, // 인증번호가 있더라도 아직 검증되지 않음
      hasActiveCode: !isExpired,
      remainingTime
    }
  } catch (error) {
    logger.error('Failed to get email verification status', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return {
      isVerified: false,
      hasActiveCode: false
    }
  }
}
