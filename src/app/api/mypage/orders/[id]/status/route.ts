import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'
import type { PartnerUpOrderStatus } from '@prisma/client'

// Partner up 주문 단계 조회 (소비자용)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const orderId = params.id

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true,
                authorId: true,
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true
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
            email: true
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

    // Partner up 상품이 포함되어 있는지 확인
    const hasPartnerUpItems = order.orderItems.some(
      (item) => item.product.type === 'PARTNER_UP'
    )

    if (!hasPartnerUpItems) {
      return NextResponse.json(
        { error: '이 주문에는 Partner up 상품이 포함되어 있지 않습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        partnerUpStatus: order.partnerUpStatus,
        partnerUpStatusUpdatedAt: order.partnerUpStatusUpdatedAt,
        partnerUpStatusNote: order.partnerUpStatusNote,
        orderItems: order.orderItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productType: item.product.type,
          seller: item.product.author
            ? {
                id: item.product.author.id,
                name: item.product.author.name,
                email: item.product.author.email
              }
            : null
        }))
      }
    })
  } catch (error) {
    console.error('주문 단계 조회 오류:', error)
    return NextResponse.json(
      { error: '주문 단계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

