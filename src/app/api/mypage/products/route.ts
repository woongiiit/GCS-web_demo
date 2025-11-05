import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 사용자가 등록한 상품 목록 조회
    const products = await prisma.product.findMany({
      where: {
        authorId: user.id
      },
      select: {
        id: true,
        name: true,
        description: true,
        shortDescription: true,
        price: true,
        originalPrice: true,
        discount: true,
        images: true,
        brand: true,
        isActive: true,
        isBestItem: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: products,
        count: products.length
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('내 상품 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

