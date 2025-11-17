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
    console.log('[Webhook] 수신된 webhook payload:', JSON.stringify(payload, null, 2))
    
    const paymentIdFromPayload =
      payload.payment_id ?? payload.paymentId ?? payload.imp_uid ?? payload.impUid ?? null

    if (!paymentIdFromPayload) {
      console.error('[Webhook] paymentId를 찾을 수 없습니다:', payload)
      return NextResponse.json(
        { success: false, error: '잘못된 웹훅 요청입니다.' },
        { status: 400 }
      )
    }

    console.log('[Webhook] 처리할 paymentId:', paymentIdFromPayload)

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

    // billing schedule 찾기 - 여러 방법으로 시도
    // 1. paymentId로 찾기 (예약 시 생성한 paymentId)
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

    // 2. scheduleId로 찾기 (webhook payload에 scheduleId가 있을 수 있음)
    if (!schedule && (payload as any).scheduleId) {
      schedule = await prisma.billingSchedule.findFirst({
        where: { scheduleId: (payload as any).scheduleId },
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
    }

    // 3. order의 billingScheduleId로 찾기
    if (!schedule) {
      const orderWithSchedule = await prisma.order.findFirst({
        where: {
          billingScheduleId: (payload as any).scheduleId ?? undefined,
          billingStatus: { in: ['SCHEDULED', 'EXECUTED'] }
        },
        include: {
          billingSchedule: {
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
          }
        }
      })

      if (orderWithSchedule?.billingSchedule) {
        schedule = orderWithSchedule.billingSchedule
      }
    }

    // 4. order의 billingPaymentId로 찾기
    if (!schedule) {
      const orderWithSchedule = await prisma.order.findFirst({
        where: {
          billingPaymentId: paymentIdFromPayload,
          billingStatus: { in: ['SCHEDULED', 'EXECUTED'] }
        },
        include: {
          billingSchedule: {
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
          }
        }
      })

      if (orderWithSchedule?.billingSchedule) {
        schedule = orderWithSchedule.billingSchedule
        console.log('[Webhook] order의 billingScheduleId로 billing schedule 찾음:', schedule.id)
      }
    }

    // billing schedule을 찾지 못한 경우 로깅
    if (!schedule) {
      console.warn('[Webhook] billing schedule을 찾을 수 없습니다. paymentId:', paymentIdFromPayload)
    } else {
      console.log('[Webhook] billing schedule 찾음:', {
        scheduleId: schedule.id,
        orderId: schedule.orderId,
        status: schedule.status,
        paymentId: schedule.paymentId
      })
    }

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
        // billing schedule이 없는 경우 = 즉시 결제 완료된 경우
        // 하지만 예약 결제의 경우 billing schedule이 있어야 하므로,
        // billing schedule이 없는 경우에만 RAISED 증가 처리
        
        // 예약 결제인지 확인 (billingScheduleId가 있으면 예약 결제)
        if (order.billingScheduleId) {
          console.log('[Webhook] 예약 결제인데 billing schedule을 찾지 못함. billingScheduleId로 다시 찾기 시도:', order.billingScheduleId)
          
          // billingScheduleId로 다시 찾기
          const scheduleByOrderId = await prisma.billingSchedule.findUnique({
            where: { orderId: order.id },
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
          
          if (scheduleByOrderId) {
            console.log('[Webhook] orderId로 billing schedule 찾음:', scheduleByOrderId.id)
            // schedule을 찾았으므로 변수에 할당하고 아래의 예약 결제 처리 로직으로 진행
            schedule = scheduleByOrderId
          } else {
            console.warn('[Webhook] billingScheduleId가 있지만 billing schedule을 찾을 수 없음:', order.billingScheduleId)
            // 예약 결제인데 schedule을 찾지 못한 경우, RAISED 증가하지 않음
            // (예약 완료 시점에 이미 증가했을 수 있으므로)
            return NextResponse.json({ success: true, message: '예약 결제인데 schedule을 찾을 수 없습니다.' }, { status: 200 })
          }
        } else {
          // 즉시 결제 완료된 경우 (billing schedule이 없는 경우)
          // 이 경우에만 RAISED 증가 처리
          console.log('[Webhook] 즉시 결제 완료 - RAISED 값 증가:', {
            orderId: order.id,
            billingKey: order.billingKey
          })
          
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

              // Funding amount 증가 (RAISED 값 증가) - 즉시 결제인 경우에만
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
      // 예약 완료 시점에 증가한 RAISED 값을 감소시켜야 함
      const fundingEntries: FundingPayloadEntry[] = Array.isArray(schedule.payload)
        ? (schedule.payload as FundingPayloadEntry[])
        : []

      await prisma.$transaction(async (tx) => {
        await tx.billingSchedule.update({
          where: { id: schedule.id },
          data: {
            status: 'FAILED',
            failureReason: reason,
            responseData: serializedPayment,
            updatedAt: new Date()
          }
        })

        await tx.order.update({
          where: { id: schedule.orderId },
          data: {
            status: 'CANCELLED',
            billingStatus: 'FAILED',
            billingFailureReason: reason
          }
        })

        // 예약 완료 시점에 증가한 RAISED 값 감소
        for (const entry of fundingEntries) {
          if (!entry?.productId) continue
          
          console.log('[Webhook] 결제 실패 - RAISED 값 감소:', {
            productId: entry.productId,
            amount: entry.amount
          })

          await tx.product.update({
            where: { id: entry.productId },
            data: {
              fundingCurrentAmount: {
                decrement: entry.amount ?? 0
              },
              fundingSupporterCount: {
                decrement: entry.supporterIncrement ?? 0
              }
            }
          })
        }
      })
    }

    if (paymentData.status === 'PAID') {
      console.log('[Webhook] 결제 완료 처리 시작:', {
        paymentId: paymentIdFromPayload,
        scheduleId: schedule.id,
        orderId: schedule.orderId,
        aggregatedFunding: Array.from(aggregatedFunding.entries())
      })

      // 펀딩 목표 미달 체크는 제거 (결제가 완료되면 항상 RAISED 증가)
      // 펀딩 목표는 마감일까지의 목표이므로, 중간에 목표 미달로 취소하는 것은 적절하지 않음

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

        // 주의: 예약 완료 시점에 이미 RAISED 값이 증가했을 수 있으므로,
        // 실제 결제 실행 시에는 중복 증가를 방지하기 위해 확인 필요
        // 하지만 예약 결제가 취소되거나 실패할 수 있으므로, 
        // webhook에서는 결제 상태만 업데이트하고 RAISED는 증가시키지 않음
        // (예약 완료 시점에 이미 증가했으므로)
        
        console.log('[Webhook] 실제 결제 실행 완료 - RAISED는 예약 완료 시점에 이미 증가됨:', {
          scheduleId: schedule.id,
          orderId: schedule.orderId,
          aggregatedFunding: Array.from(aggregatedFunding.entries())
        })
        
        // RAISED 값은 예약 완료 시점에 이미 증가했으므로, 
        // webhook에서는 결제 상태만 업데이트
        // (실제 결제 실행은 예약된 시간에 발생하므로, RAISED는 예약 시점에 증가하는 것이 맞음)
      })

      console.log('[Webhook] 자동결제 처리 완료')
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

