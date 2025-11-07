import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

interface FindIdPayload {
  name?: string
  phone?: string
}

function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '')

  if (!digits.startsWith('010') || digits.length !== 11) {
    return null
  }

  const middle = digits.slice(3, 7)
  const last = digits.slice(7)

  return `010-${middle}-${last}`
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')

  if (!domain) {
    return email
  }

  if (local.length === 0) {
    return `*@${domain}`
  }

  const maskCount = Math.ceil(local.length * 0.5)
  const visibleCount = Math.max(local.length - maskCount, 0)

  const visiblePart = local.slice(0, visibleCount)
  const maskedPart = '*'.repeat(local.length - visiblePart.length)

  return `${visiblePart}${maskedPart}@${domain}`
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FindIdPayload
    const name = body.name?.trim()
    const phone = body.phone?.trim()

    if (!name || !phone) {
      return NextResponse.json(
        {
          success: false,
          error: '이름과 전화번호를 모두 입력해주세요.',
        },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone) {
      return NextResponse.json(
        {
          success: false,
          error: '전화번호는 010-XXXX-XXXX 형식으로 입력해주세요.',
        },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        name,
        phone: normalizedPhone,
      },
      select: {
        id: true,
        email: true,
      },
    })

    if (!user) {
      logger.warn('아이디 찾기 실패 - 일치하는 사용자 없음', {
        action: 'find_id',
        name,
        phone: normalizedPhone,
      })

      return NextResponse.json(
        {
          success: false,
          error: '일치하는 계정을 찾을 수 없습니다.',
        },
        { status: 404 }
      )
    }

    logger.info('아이디 찾기 성공', {
      action: 'find_id',
      userId: user.id,
    })

    return NextResponse.json({
      success: true,
      data: {
        email: maskEmail(user.email),
      },
    })
  } catch (error) {
    logger.error('아이디 찾기 처리 중 오류 발생', {
      action: 'find_id',
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      },
      { status: 500 }
    )
  }
}

