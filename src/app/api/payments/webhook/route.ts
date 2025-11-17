import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cancelPortOnePayment, getPortOnePayment } from '@/lib/shop/payment'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

type PortOneWebhookPayload = {
  payment_id?: string
  paymentId?: string
  imp_uid?: string
  impUid?: string
  merchant_uid?: string
  merchantUid?: string
  status?: string
}

type FundingPayloadEntry = {
  productId: string
  amount: number
  supporterIncrement?: number
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as PortOneWebhookPayload
    const paymentIdFromPayload =
      payload.payment_id ?? payload.paymentId ?? payload.imp_uid ?? payload.impUid ?? null

    if (!paymentIdFromPayload) {
      return NextResponse.json(
        { success: false, error: '잘못된 웹훅 요청입니다.' },
        { status: 400 }
      )
    }

    // 결제 정보 먼저 가져오기
    const paymentData = await getPortOnePayment({
      paymentId: paymentIdFromPayload,
      impUid: payload.imp_uid ?? payload.impUid
    })

    if (!('status' in paymentData)) {
      return NextResponse.json({ success: true, message: '알 수 없는 결제 상태입니다.' }, { status: 200 })
    }

    const serializedPayment = JSON.parse(JSON.stringify(paymentData)) as Prisma.InputJsonValue
    const now = new Date()

    // billing schedule에서 찾기
    let schedule = await prisma.billingSchedule.findFirst({
      where: { paymentId: paymentIdFromPayload },
      include: {
        order: {
          include: {
            orderItems: {
              include: {
                product: true
              }
            },
            user: true
          }
        }
      }
    })

    // billing schedule을 찾지 못한 경우, order에서 직접 찾기 (billing key로 즉시 결제 완료된 경우)
    if (!schedule) {
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { billingPaymentId: paymentIdFromPayload },
            { paymentInfo: { path: ['paymentId'], equals: paymentIdFromPayload } }
          ],
          orderItems: {
            some: {
              product: {
                type: 'FUND'
              }
            }
          }
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          user: true
        }
      })

      if (order && order.billingKey && paymentData.status === 'PAID') {
        // billing key로 결제 완료된 경우, funding amount 증가 처리
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

        if (fundingEntries.length > 0) {
          await prisma.$transaction(async (tx) => {
            // Order 상태 업데이트
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: 'CONFIRMED',
                billingStatus: 'EXECUTED',
                billingExecutedAt: now,
                billingFailureReason: null,
                billingPaymentId: paymentIdFromPayload,
                paymentInfo: serializedPayment,
                paymentVerifiedAt: now
              }
            })

            // Funding amount 증가 (RAISED 값 증가)
            for (const entry of fundingEntries) {
              await tx.product.update({
                where: { id: entry.productId },
                data: {
                  fundingCurrentAmount: {
                    increment: entry.amount
                  },
                  fundingSupporterCount: {
                    increment: entry.supporterIncrement ?? 1
                  }
                }
              })
            }
          })

          return NextResponse.json({ success: true, message: '펀딩 결제가 완료되었습니다.' }, { status: 200 })
        }
      }

      return NextResponse.json({ success: true, message: '처리할 예약이 없습니다.' }, { status: 200 })
    }

    if (schedule.status === 'EXECUTED') {
      return NextResponse.json({ success: true, message: '이미 처리된 예약입니다.' }, { status: 200 })
    }

    const fundingEntries: FundingPayloadEntry[] = Array.isArray(schedule.payload)
      ? (schedule.payload as FundingPayloadEntry[])
      : []

    const aggregatedFunding = new Map<string, { amount: number; supporter: number }>()
    for (const entry of fundingEntries) {
      if (!entry?.productId) continue
      const existing = aggregatedFunding.get(entry.productId) ?? { amount: 0, supporter: 0 }
      existing.amount += entry.amount ?? 0
      existing.supporter += entry.supporterIncrement ?? 0
      aggregatedFunding.set(entry.productId, existing)
    }

    const handleFailure = async (reason: string) => {
      await prisma.billingSchedule.update({
        where: { id: schedule.id },
        data: {
          status: 'FAILED',
          failureReason: reason,
          responseData: serializedPayment,
          updatedAt: new Date()
        }
      })

      await prisma.order.update({
        where: { id: schedule.orderId },
        data: {
          status: 'CANCELLED',
          billingStatus: 'FAILED',
          billingFailureReason: reason
        }
      })
    }

    if (paymentData.status === 'PAID') {
      for (const [productId, info] of aggregatedFunding.entries()) {
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: {
            fundingGoalAmount: true,
            fundingCurrentAmount: true
          }
        })

        if (!product) {
          continue
        }

        if (
          typeof product.fundingGoalAmount === 'number' &&
          product.fundingGoalAmount > 0 &&
          product.fundingCurrentAmount + info.amount < product.fundingGoalAmount
        ) {
          await cancelPortOnePayment({
            paymentId: paymentData.id,
            amount: paymentData.amount.total,
            reason: '펀딩 목표 미달로 자동결제를 취소했습니다.'
          })
          await handleFailure('펀딩 목표 미달로 결제가 취소되었습니다.')
          return NextResponse.json({ success: true, message: '펀딩 목표 미달' }, { status: 200 })
        }
      }

      await prisma.$transaction(async (tx) => {
        await tx.billingSchedule.update({
          where: { id: schedule.id },
          data: {
            status: 'EXECUTED',
            executedAt: now,
            responseData: serializedPayment,
            failureReason: null
          }
        })

        const paymentInfoForOrder: Prisma.InputJsonValue = {
          paymentId: paymentData.id,
          transactionId: 'transactionId' in paymentData ? paymentData.transactionId : null,
          amount: paymentData.amount.total,
          currency: paymentData.currency,
          payMethod:
            'method' in paymentData && paymentData.method && 'type' in paymentData.method
              ? (paymentData.method as any).type ?? null
              : null,
          status: paymentData.status,
          cardName:
            'method' in paymentData && paymentData.method && 'card' in paymentData.method
              ? (paymentData.method as any)?.card?.issuer?.name ?? null
              : null,
          buyerName: paymentData.customer?.name ?? schedule.order.user.name,
          buyerEmail: paymentData.customer?.email ?? schedule.order.user.email,
          buyerTel: paymentData.customer?.phoneNumber ?? schedule.order.phone,
          receiptUrl: 'receiptUrl' in paymentData ? paymentData.receiptUrl ?? null : null,
          paidAt: 'paidAt' in paymentData ? paymentData.paidAt : null,
          raw: serializedPayment
        }

        await tx.order.update({
          where: { id: schedule.orderId },
          data: {
            status: 'CONFIRMED',
            billingStatus: 'EXECUTED',
            billingExecutedAt: now,
            billingFailureReason: null,
            billingPaymentId: paymentData.id,
            paymentInfo: paymentInfoForOrder,
            paymentVerifiedAt: new Date()
          }
        })

        await tx.paymentRecord.create({
          data: {
            orderId: schedule.orderId,
            userId: schedule.userId,
            impUid: paymentData.transactionId ?? null,
            merchantUid: paymentData.id,
            amount: paymentData.amount.total,
            method:
              'method' in paymentData && paymentData.method && 'type' in paymentData.method
                ? (paymentData.method as any).type ?? null
                : null,
            status: paymentData.status,
            paymentData: serializedPayment
          }
        })

        for (const [productId, info] of aggregatedFunding.entries()) {
          await tx.product.update({
            where: { id: productId },
            data: {
              fundingCurrentAmount: {
                increment: info.amount
              },
              fundingSupporterCount: {
                increment: Math.max(info.supporter, 0)
              }
            }
          })
        }
      })

      return NextResponse.json({ success: true, message: '자동결제가 완료되었습니다.' }, { status: 200 })
    }

    const failureReason =
      ('failure' in paymentData && paymentData.failure && 'message' in paymentData.failure
        ? (paymentData.failure as any)?.message
        : null) ?? '자동결제가 실패했습니다.'

    await handleFailure(failureReason)

    return NextResponse.json({ success: true, message: failureReason }, { status: 200 })
  } catch (error) {
    console.error('PortOne 자동결제 웹훅 처리 오류:', error)
    return NextResponse.json(
      { success: false, error: '웹훅 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

