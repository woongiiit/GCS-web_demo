import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const orderId = params.id

    if (!permissions.canPurchaseProduct(user.role as any)) {
      return NextResponse.json({ error: permissionErrors.cannotPurchase }, { status: 403 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                type: true,
                brand: true,
                authorId: true,
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                },
                sellerTeam: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        paymentRecords: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 소비자는 자신의 주문만 조회 가능
    if (order.userId !== user.id) {
      return NextResponse.json(
        { error: '주문 조회 권한이 없습니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('주문 상세 조회 오류:', error)
    return NextResponse.json(
      { error: '주문 상세 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

