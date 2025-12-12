import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * 알림 수와 좋아요 수를 조회합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 사용자가 작성한 게시글에 달린 댓글 수 (최근 30일 내)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const notificationCount = await prisma.comment.count({
      where: {
        post: {
          authorId: user.id
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // 사용자가 누른 모든 좋아요 수
    const [postLikes, productLikes, projectLikes, newsLikes] = await Promise.all([
      prisma.postLike.count({
        where: { userId: user.id }
      }),
      prisma.productLike.count({
        where: { userId: user.id }
      }),
      prisma.projectLike.count({
        where: { userId: user.id }
      }),
      prisma.newsLike.count({
        where: { userId: user.id }
      })
    ])

    const likeCount = postLikes + productLikes + projectLikes + newsLikes

    return NextResponse.json({
      success: true,
      data: {
        notificationCount,
        likeCount
      }
    }, { status: 200 })
  } catch (error) {
    console.error('알림/좋아요 수 조회 오류:', error)
    return NextResponse.json(
      { error: '알림/좋아요 수 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
