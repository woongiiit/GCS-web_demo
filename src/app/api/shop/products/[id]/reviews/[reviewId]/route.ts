import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// 리뷰 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const user = await requireAuth()
    const { id: productId, reviewId } = params

    // 리뷰 존재 확인
    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
      include: {
        product: true
      }
    })

    if (!review) {
      return NextResponse.json(
        { error: '리뷰를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인 (본인이 작성한 리뷰만 삭제 가능)
    if (review.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '리뷰를 삭제할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 리뷰 삭제
    await prisma.productReview.delete({
      where: { id: reviewId }
    })

    return NextResponse.json({
      success: true,
      message: '리뷰가 삭제되었습니다.'
    })
  } catch (error: any) {
    console.error('리뷰 삭제 오류:', error)

    if (error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

