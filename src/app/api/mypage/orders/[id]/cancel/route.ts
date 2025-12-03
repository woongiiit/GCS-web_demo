import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'
import { revokePortOnePaymentSchedules } from '@/lib/shop/payment'

type FundingPayloadEntry = {
  productId: string
  amount: number
  supporterIncrement?: number
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const orderId = params.id

    if (!permissions.canPurchaseProduct(user.role as 'GENERAL' | 'MAJOR' | 'ADMIN')) {
      return NextResponse.json(
        { error: permissionErrors.cannotPurchase },
        { status: 403 }
      )
    }

    // 주문 조회
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        billingSchedule: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 소비자는 자신의 주문만 취소 가능
    if (order.userId !== user.id) {
      return NextResponse.json(
        { error: '주문 취소 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 이미 취소된 주문인지 확인
    if (order.status === 'CANCELLED') {
      return NextResponse.json(
        { error: '이미 취소된 주문입니다.' },
        { status: 400 }
      )
    }

    // Fund 상품이 포함되어 있는지 확인
    const hasFundProducts = order.orderItems.some(
      (item) => item.product.type === 'FUND'
    )

    if (!hasFundProducts) {
      return NextResponse.json(
        { error: 'Fund 상품 주문만 취소할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 취소 가능 조건 확인
    // 1. fundStatus가 ORDERED여야 함
    // 2. billingExecutedAt가 null이어야 함 (빌링키 결제가 실행되지 않음)
    if (order.fundStatus !== 'ORDERED') {
      return NextResponse.json(
        { error: '주문 취소는 "상품 주문" 단계에서만 가능합니다.' },
        { status: 400 }
      )
    }

    if (order.billingExecutedAt !== null) {
      return NextResponse.json(
        { error: '이미 빌링키 결제가 완료된 주문은 취소할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 펀딩 금액 감소를 위한 데이터 준비
    const fundingEntries: FundingPayloadEntry[] = []
    for (const orderItem of order.orderItems) {
      if (orderItem.product.type === 'FUND') {
        fundingEntries.push({
          productId: orderItem.product.id,
          amount: orderItem.price * orderItem.quantity,
          supporterIncrement: 1
        })
      }
    }

    // 트랜잭션으로 취소 처리
    await prisma.$transaction(async (tx) => {
      // 1. billingSchedule이 있으면 PortOne에서 예약 취소
      if (order.billingSchedule) {
        try {
          const scheduleIds = order.billingSchedule.scheduleId
            ? [order.billingSchedule.scheduleId]
            : undefined

          await revokePortOnePaymentSchedules({
            billingKey: order.billingKey ?? undefined,
            scheduleIds
          })

          // billingSchedule 상태를 CANCELLED로 변경
          await tx.billingSchedule.update({
            where: { id: order.billingSchedule.id },
            data: {
              status: 'CANCELLED',
              updatedAt: new Date()
            }
          })
        } catch (error) {
          console.error('[Cancel Order] PortOne 예약 취소 실패:', error)
          // PortOne 취소 실패해도 주문 취소는 진행 (이미 실행되지 않은 예약이므로)
        }
      }

      // 2. 주문 상태를 CANCELLED로 변경
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          billingStatus: 'CANCELLED',
          billingFailureReason: '고객 요청에 의한 주문 취소'
        }
      })

      // 3. 펀딩 금액 감소 (예약 완료 시점에 증가했던 RAISED 값)
      for (const entry of fundingEntries) {
        console.log('[Cancel Order] 펀딩 금액 감소:', {
          productId: entry.productId,
          amount: entry.amount
        })

        await tx.product.update({
          where: { id: entry.productId },
          data: {
            fundingCurrentAmount: {
              decrement: entry.amount
            },
            fundingSupporterCount: {
              decrement: entry.supporterIncrement ?? 1
            }
          }
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: '주문이 성공적으로 취소되었습니다.'
    })
  } catch (error: unknown) {
    console.error('주문 취소 오류:', error)

    if (error instanceof Error && error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: '주문 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

