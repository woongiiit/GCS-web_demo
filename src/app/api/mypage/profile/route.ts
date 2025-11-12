import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await requireAuth()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        studentId: true,
        major: true,
        phone: true,
        role: true,
        isSeller: true,
        verificationStatus: true,
        verificationImageUrl: true,
        verificationRequestedAt: true,
        verificationApprovedAt: true,
        verificationRejectedAt: true,
        verificationNote: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!profile) {
      return NextResponse.json({ error: '사용자 정보를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: profile }, { status: 200 })
  } catch (error) {
    console.error('마이페이지 프로필 조회 오류:', error)
    return NextResponse.json({ error: '프로필 정보를 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
