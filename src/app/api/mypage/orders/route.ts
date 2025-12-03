import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'

export async function GET() {
  try {
    const user = await requireAuth()

    if (!permissions.canPurchaseProduct(user.role as any)) {
      return NextResponse.json({ error: permissionErrors.cannotPurchase }, { status: 403 })
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        userId: true,
        status: true,
        totalAmount: true,
        shippingAddress: true,
        phone: true,
        buyerName: true,
        buyerEmail: true,
        notes: true,
        paymentInfo: true,
        paymentVerifiedAt: true,
        billingStatus: true,
        billingKey: true,
        billingPaymentId: true,
        billingScheduleId: true,
        billingScheduledAt: true,
        billingExecutedAt: true,
        billingFailureReason: true,
        partnerUpStatus: true,
        partnerUpStatusUpdatedAt: true,
        partnerUpStatusNote: true,
        fundStatus: true,
        fundStatusUpdatedAt: true,
        fundStatusNote: true,
        createdAt: true,
        updatedAt: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
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
    console.error('내 주문 내역 조회 오류:', error)
    return NextResponse.json(
      {
        error: '주문 내역을 불러오는 중 오류가 발생했습니다.'
      },
      { status: 500 }
    )
  }
}

