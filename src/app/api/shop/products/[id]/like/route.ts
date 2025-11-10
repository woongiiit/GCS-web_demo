import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissionErrors } from '@/lib/permissions'
import { invalidateCache } from '@/lib/cache'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const productId = params.id

    const existingLike = await prisma.productLike.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: user.id
        }
      }
    })

    const result = await prisma.$transaction(async (tx) => {
      if (existingLike) {
        await tx.productLike.delete({
          where: { id: existingLike.id }
        })

        const product = await tx.product.update({
          where: { id: productId },
          data: {
            likeCount: {
              decrement: 1
            }
          },
          select: {
            likeCount: true
          }
        })

        return { likeCount: product.likeCount, liked: false }
      } else {
        await tx.productLike.create({
          data: {
            productId,
            userId: user.id
          }
        })

        const product = await tx.product.update({
          where: { id: productId },
          data: {
            likeCount: {
              increment: 1
            }
          },
          select: {
            likeCount: true
          }
        })

        return { likeCount: product.likeCount, liked: true }
      }
    })

    invalidateCache('products:.*')

    return NextResponse.json(
      {
        success: true,
        data: result
      },
      { status: 200 }
    )
  } catch (error: any) {
    if (error?.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: permissionErrors.notLoggedIn },
        { status: 401 }
      )
    }

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.error('상품 좋아요 오류:', error)
    return NextResponse.json(
      { error: '좋아요 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

