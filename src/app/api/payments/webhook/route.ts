import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cancelPortOnePayment, getPortOnePayment } from '@/lib/shop/payment'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

type PortOneWebhookPayload = {
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
    const impUid = payload.imp_uid ?? payload.impUid
    const merchantUid = payload.merchant_uid ?? payload.merchantUid

    if (!impUid || !merchantUid) {
      return NextResponse.json(
        { success: false, error: '잘못된 웹훅 요청입니다.' },
        { status: 400 }
      )
    }

    const schedule = await prisma.billingSchedule.findUnique({
      where: { merchantUid },
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

    if (!schedule) {
      return NextResponse.json({ success: true, message: '처리할 예약이 없습니다.' }, { status: 200 })
    }

    if (schedule.status === 'EXECUTED') {
      return NextResponse.json({ success: true, message: '이미 처리된 예약입니다.' }, { status: 200 })
    }

    const paymentData = await getPortOnePayment(impUid)
    const paymentStatus = paymentData.status
    const serializedPayment = JSON.parse(JSON.stringify(paymentData)) as Prisma.InputJsonValue
    const now = new Date()

    const fundingEntries: FundingPayloadEntry[] = Array.isArray(schedule.fundingPayload)
      ? (schedule.fundingPayload as FundingPayloadEntry[])
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

    if (paymentStatus === 'paid') {
      // 목표 금액 충족 여부 확인
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
          await cancelPortOnePayment(
            impUid,
            '펀딩 목표 미달로 자동결제를 취소했습니다.',
            paymentData.amount
          )
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
          impUid: paymentData.imp_uid,
          merchantUid: paymentData.merchant_uid,
          amount: paymentData.amount,
          currency: paymentData.currency ?? 'KRW',
          payMethod: paymentData.pay_method,
          status: paymentData.status,
          cardName: paymentData.card_name ?? null,
          buyerName: paymentData.buyer_name ?? schedule.order.user.name,
          buyerEmail: paymentData.buyer_email ?? schedule.order.user.email,
          buyerTel: paymentData.buyer_tel ?? schedule.order.phone,
          receiptUrl: paymentData.receipt_url ?? null,
          paidAt: paymentData.paid_at
            ? new Date(paymentData.paid_at * 1000).toISOString()
            : null,
          raw: serializedPayment
        }

        await tx.order.update({
          where: { id: schedule.orderId },
          data: {
            status: 'CONFIRMED',
            billingStatus: 'EXECUTED',
            billingExecutedAt: now,
            billingFailureReason: null,
            paymentInfo: paymentInfoForOrder,
            paymentVerifiedAt: new Date()
          }
        })

        await tx.paymentRecord.create({
          data: {
            orderId: schedule.orderId,
            userId: schedule.userId,
            impUid: paymentData.imp_uid,
            merchantUid: paymentData.merchant_uid,
            amount: paymentData.amount,
            method: paymentData.pay_method ?? null,
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
      (paymentData as unknown as { fail_reason?: string })?.fail_reason ??
      '자동결제가 실패했습니다.'

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

