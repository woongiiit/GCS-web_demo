import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const newsId = params.id

    // 뉴스 존재 확인
    const news = await prisma.news.findUnique({
      where: { id: newsId }
    })

    if (!news) {
      return NextResponse.json(
        { error: '뉴스를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await prisma.newsLike.findUnique({
      where: {
        newsId_userId: {
          newsId,
          userId: user.id
        }
      }
    })

    if (existingLike) {
      // 좋아요 취소
      await prisma.newsLike.delete({
        where: {
          newsId_userId: {
            newsId,
            userId: user.id
          }
        }
      })

      return NextResponse.json({
        success: true,
        liked: false,
        message: '좋아요가 취소되었습니다.'
      })
    } else {
      // 좋아요 추가
      await prisma.newsLike.create({
        data: {
          newsId,
          userId: user.id
        }
      })

      return NextResponse.json({
        success: true,
        liked: true,
        message: '좋아요가 추가되었습니다.'
      })
    }
  } catch (error) {
    console.error('뉴스 좋아요 처리 오류:', error)
    return NextResponse.json(
      { error: '좋아요 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const newsId = params.id

    // 뉴스 존재 확인
    const news = await prisma.news.findUnique({
      where: { id: newsId }
    })

    if (!news) {
      return NextResponse.json(
        { error: '뉴스를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 좋아요 상태 확인
    const existingLike = await prisma.newsLike.findUnique({
      where: {
        newsId_userId: {
          newsId,
          userId: user.id
        }
      }
    })

    // 좋아요 수 조회
    const likeCount = await prisma.newsLike.count({
      where: { newsId }
    })

    return NextResponse.json({
      success: true,
      liked: !!existingLike,
      likeCount
    })
  } catch (error) {
    console.error('뉴스 좋아요 상태 조회 오류:', error)
    return NextResponse.json(
      { error: '좋아요 상태 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
