import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * 프로필 사진 업로드
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: '이미지 파일이 필요합니다.' },
        { status: 400 }
      )
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      )
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 5MB를 초과할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 파일을 Base64로 변환하여 반환 (실제 프로덕션에서는 클라우드 스토리지 사용 권장)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // 프로필 이미지 URL 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImageUrl: dataUrl }
    })

    return NextResponse.json({
      success: true,
      url: dataUrl,
      message: '프로필 사진이 업로드되었습니다.'
    })
  } catch (error) {
    console.error('프로필 사진 업로드 오류:', error)
    return NextResponse.json(
      { error: '프로필 사진 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * 프로필 사진 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 프로필 이미지 URL 삭제
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImageUrl: null }
    })

    return NextResponse.json({
      success: true,
      message: '프로필 사진이 삭제되었습니다.'
    })
  } catch (error) {
    console.error('프로필 사진 삭제 오류:', error)
    return NextResponse.json(
      { error: '프로필 사진 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
