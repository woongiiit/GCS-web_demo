import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, getCurrentUser } from '@/lib/auth'

// 리뷰 목록 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    // 상품 존재 확인
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 리뷰 목록 조회
    const [reviews, total] = await Promise.all([
      prisma.productReview.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.productReview.count({
        where: { productId }
      })
    ])

    // 평균 별점 계산
    const ratingStats = await prisma.productReview.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true }
    })

    const averageRating = ratingStats._avg.rating || 0
    const reviewCount = ratingStats._count.rating || 0

    // 별점 분포 계산
    const ratingDistribution = await prisma.productReview.groupBy({
      by: ['rating'],
      where: { productId },
      _count: { rating: true }
    })

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingDistribution.forEach((item) => {
      distribution[item.rating] = item._count.rating
    })

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: {
          averageRating: Math.round(averageRating * 10) / 10, // 소수점 첫째자리까지
          reviewCount,
          distribution
        }
      }
    })
  } catch (error: any) {
    console.error('리뷰 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 리뷰 작성
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const productId = params.id
    const body = await request.json()
    const { rating, content } = body

    // 입력 검증
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '별점은 1부터 5까지의 숫자여야 합니다.' },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: '리뷰 내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { error: '리뷰 내용은 1000자 이하여야 합니다.' },
        { status: 400 }
      )
    }

    // 상품 존재 확인
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이미 리뷰를 작성했는지 확인
    const existingReview = await prisma.productReview.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: user.id
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: '이미 리뷰를 작성하셨습니다. 리뷰는 수정할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 주문 이력 확인 (실제 구매한 사용자만 리뷰 작성 가능)
    const hasOrdered = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
        orderItems: {
          some: {
            productId
          }
        }
      }
    })

    if (!hasOrdered) {
      return NextResponse.json(
        { error: '구매한 상품에만 리뷰를 작성할 수 있습니다.' },
        { status: 403 }
      )
    }

    // 리뷰 생성
    const review = await prisma.productReview.create({
      data: {
        productId,
        userId: user.id,
        rating,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: '리뷰가 작성되었습니다.',
      data: review
    }, { status: 201 })
  } catch (error: any) {
    console.error('리뷰 작성 오류:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '이미 리뷰를 작성하셨습니다.' },
        { status: 400 }
      )
    }

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

