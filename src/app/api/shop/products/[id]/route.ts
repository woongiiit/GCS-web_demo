import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        productDetails: true,
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 같은 카테고리의 관련 상품 조회 (최대 4개)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        isActive: true,
      },
      take: 4,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        data: {
          product,
          relatedProducts
        }
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('상품 상세 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

