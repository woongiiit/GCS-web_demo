import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const user = await requireAuth()

    if (!user.isSeller && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '판매자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('q')?.trim() ?? ''

    const productFilter: Record<string, unknown> = {
      authorId: user.id
    }

    if (search.length > 0) {
      productFilter.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const orders = await prisma.order.findMany({
      where: {
        orderItems: {
          some: {
            product: productFilter
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        orderItems: {
          where: {
            product: productFilter
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        },
        paymentRecords: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: orders
    })
  } catch (error) {
    console.error('판매자 주문 내역 조회 오류:', error)
    return NextResponse.json(
      {
        error: '주문 내역을 불러오는 중 오류가 발생했습니다.'
      },
      { status: 500 }
    )
  }
}


