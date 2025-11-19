import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'
import {
  calculateUnitPrice,
  normalizeProductOptions,
  validateSelectedOptions,
  type SelectedOptionInput
} from '@/lib/shop/options'
import {
  getPortOnePayment,
  createPortOnePaymentSchedule,
  preRegisterPortOnePayment,
  getPortOneBillingKeyInfo
} from '@/lib/shop/payment'
import type { BillingKeyPaymentInput } from '@portone/server-sdk/common'
import type { CreatePaymentScheduleResponse } from '@portone/server-sdk/payment/paymentSchedule'
import type { Prisma } from '@prisma/client'
import { sendOrderNotificationEmail, sendFundingGoalReachedEmail } from '@/lib/email'

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    orderItems: {
      include: {
        product: {
          include: {
            author: true
          }
        }
      }
    }
    user: true
  }
}>

export async function POST(request: Request) {
  try {
    // 인증 확인 및 사용자 정보 가져오기
    const user = await requireAuth()

    // 상품 구매 권한 확인 (로그인한 모든 사용자 가능)
    if (!permissions.canPurchaseProduct(user.role as any)) {
      return NextResponse.json(
        { error: permissionErrors.cannotPurchase },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      items,
      cartItemIds,
      shippingAddress,
      phone,
      buyerName,
      buyerEmail,
      notes,
      payment,
      billing
    } = body as {
      items?: Array<{
        productId: string
        quantity: number
        selectedOptions?: SelectedOptionInput[]
      }>
      cartItemIds?: string[]
      shippingAddress?: string
      phone?: string
      buyerName?: string
      buyerEmail?: string
      notes?: string
      payment?: {
        paymentId?: string
        impUid?: string
        merchantUid?: string
        amount: number
        payMethod?: string
        cardName?: string
        buyerName?: string
        buyerEmail?: string
        buyerTel?: string
        receiptUrl?: string
        paymentToken?: string
        txId?: string | null
      }
      billing?: {
        billingKey?: string
        paymentId?: string
        channelKey?: string
      }
    }

    // 유효성 검사
    const hasCartItems = Array.isArray(cartItemIds) && cartItemIds.length > 0
    const hasDirectItems = Array.isArray(items) && items.length > 0

    if (!hasCartItems && !hasDirectItems) {
      return NextResponse.json(
        { error: '구매할 상품을 선택해주세요.' },
        { status: 400 }
      )
    }

    if (!shippingAddress || !phone) {
      return NextResponse.json(
        { error: '배송 정보를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 상품 정보 조회 및 재고 확인
    let totalAmount = 0
    const orderItems: Array<{
      productId: string
      quantity: number
      price: number
      selectedOptions?: unknown
    }> = []
    const productsToUpdate: Array<{ productId: string; quantity: number }> = []

    const productsToIncrementFunding: Array<{ productId: string; amount: number; supporterIncrement: number }> = []
    const fundProductIds = new Set<string>()
    let fundProductDeadline: Date | null = null
    let fundProductName: string | null = null

    if (hasCartItems) {
      const cartItems = await prisma.cartItem.findMany({
        where: {
          id: {
            in: cartItemIds!
          },
          userId: user.id
        },
        include: {
          product: true
        }
      })

      if (cartItems.length === 0) {
        return NextResponse.json(
          { error: '선택한 장바구니 상품을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      if (cartItems.length !== cartItemIds!.length) {
        return NextResponse.json(
          { error: '일부 장바구니 상품을 찾을 수 없습니다.' },
          { status: 400 }
        )
      }

      for (const cartItem of cartItems) {
        const { product } = cartItem

        if (!product || !product.isActive) {
          return NextResponse.json(
            { error: `판매 중단된 상품이 포함되어 있습니다. (${product?.name ?? '알 수 없음'})` },
            { status: 400 }
          )
        }

        if (product.type !== 'FUND' && product.stock < cartItem.quantity) {
          return NextResponse.json(
            { error: `재고가 부족합니다. (${product.name})` },
            { status: 400 }
          )
        }

        const unitPrice = cartItem.unitPrice
        const itemTotal = unitPrice * cartItem.quantity
        totalAmount += itemTotal

        orderItems.push({
          productId: product.id,
          quantity: cartItem.quantity,
          price: unitPrice,
          selectedOptions: cartItem.selectedOptions ?? undefined
        })

        const contributionAmount = itemTotal
        if (product.type === 'FUND') {
          if (!product.fundingDeadline) {
            return NextResponse.json(
              { error: `펀딩 마감일이 설정되지 않은 상품입니다. (${product.name})` },
              { status: 400 }
            )
          }

          const deadline = new Date(product.fundingDeadline)
          if (Number.isNaN(deadline.getTime())) {
            return NextResponse.json(
              { error: `잘못된 펀딩 마감일이 설정된 상품입니다. (${product.name})` },
              { status: 400 }
            )
          }

          if (!fundProductDeadline) {
            fundProductDeadline = deadline
          } else if (fundProductDeadline.getTime() !== deadline.getTime()) {
            return NextResponse.json(
              { error: '서로 다른 펀딩 마감일을 가진 상품은 동시에 결제할 수 없습니다.' },
              { status: 400 }
            )
          }

          fundProductIds.add(product.id)
          fundProductName = product.name

          productsToIncrementFunding.push({
            productId: product.id,
            amount: contributionAmount,
            supporterIncrement: 1
          })
        } else {
          productsToUpdate.push({
            productId: product.id,
            quantity: cartItem.quantity
          })
        }
      }
    } else if (hasDirectItems) {
      for (const item of items!) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        })

        if (!product) {
          return NextResponse.json(
            { error: `상품을 찾을 수 없습니다. (ID: ${item.productId})` },
            { status: 404 }
          )
        }

        if (!product.isActive) {
          return NextResponse.json(
            { error: `판매 중단된 상품입니다. (${product.name})` },
            { status: 400 }
          )
        }

        if (product.type !== 'FUND' && product.stock < item.quantity) {
          return NextResponse.json(
            { error: `재고가 부족합니다. (${product.name})` },
            { status: 400 }
          )
        }

        const normalizedOptions = normalizeProductOptions(product.options)
        const { normalizedSelectedOptions } = validateSelectedOptions(
          normalizedOptions,
          item.selectedOptions
        )

        if (
          normalizedOptions.length > 0 &&
          normalizedSelectedOptions.length !== normalizedOptions.length
        ) {
          return NextResponse.json(
            { error: `모든 옵션을 선택해주세요. (${product.name})` },
            { status: 400 }
          )
        }

        const unitPrice = calculateUnitPrice(product.price, normalizedSelectedOptions)
        if (unitPrice < 0) {
          return NextResponse.json(
            { error: `잘못된 옵션 가격이 계산되었습니다. (${product.name})` },
            { status: 400 }
          )
        }

        const itemTotal = unitPrice * item.quantity
        totalAmount += itemTotal

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: unitPrice,
          selectedOptions:
            normalizedSelectedOptions.length > 0 ? normalizedSelectedOptions : undefined
        })

        if (product.type === 'FUND') {
          if (!product.fundingDeadline) {
            return NextResponse.json(
              { error: `펀딩 마감일이 설정되지 않은 상품입니다. (${product.name})` },
              { status: 400 }
            )
          }

          const deadline = new Date(product.fundingDeadline)
          if (Number.isNaN(deadline.getTime())) {
            return NextResponse.json(
              { error: `잘못된 펀딩 마감일이 설정된 상품입니다. (${product.name})` },
              { status: 400 }
            )
          }

          if (!fundProductDeadline) {
            fundProductDeadline = deadline
          } else if (fundProductDeadline.getTime() !== deadline.getTime()) {
            return NextResponse.json(
              { error: '서로 다른 펀딩 마감일을 가진 상품은 동시에 결제할 수 없습니다.' },
              { status: 400 }
            )
          }

          fundProductIds.add(product.id)
          fundProductName = product.name

          productsToIncrementFunding.push({
            productId: product.id,
            amount: itemTotal,
            supporterIncrement: 1
          })
        } else {
          productsToUpdate.push({
            productId: product.id,
            quantity: item.quantity
          })
        }
      }
    }

    const hasFundProducts = productsToIncrementFunding.length > 0
    const hasNonFundProducts = productsToUpdate.length > 0

    if (hasFundProducts && hasNonFundProducts) {
      return NextResponse.json(
        { error: '펀딩 상품과 일반 상품은 동시에 결제할 수 없습니다. 각각 별도로 결제해주세요.' },
        { status: 400 }
      )
    }

    if (hasFundProducts && fundProductIds.size > 1) {
      return NextResponse.json(
        { error: '동시에 여러 개의 펀딩 상품을 신청할 수 없습니다.' },
        { status: 400 }
      )
    }

    if (hasFundProducts && !fundProductDeadline) {
      return NextResponse.json(
        { error: '펀딩 마감일을 확인할 수 없어 결제를 진행할 수 없습니다.' },
        { status: 400 }
      )
    }

    if (hasFundProducts && fundProductDeadline && fundProductDeadline.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: '이미 마감된 펀딩에 대해서는 결제를 진행할 수 없습니다.' },
        { status: 400 }
      )
    }

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: '결제 금액이 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    let paymentInfo: Prisma.JsonObject | null = null
    let orderStatus: 'PENDING' | 'CONFIRMED' = 'PENDING'
    let billingCustomerKey: string | null = null
    let billingScheduleId: string | null = null
    let billingPaymentId: string | null = null
    let billingChannelKey: string | null = null
    let billingScheduledAt: Date | null = hasFundProducts ? fundProductDeadline ?? null : null
    let billingScheduleResponse: CreatePaymentScheduleResponse | null = null

    if (hasFundProducts) {
      const resolvedBillingKey = billing?.billingKey?.trim()
      if (!resolvedBillingKey) {
        return NextResponse.json(
          { error: '자동결제용 빌링키 정보를 확인할 수 없습니다. 다시 시도해주세요.' },
          { status: 400 }
        )
      }

      try {
        // 빌링키 정보 조회 시도 (방금 발급된 빌링키는 서버에 동기화되지 않았을 수 있음)
        let billingInfo: any = null
        try {
          billingInfo = await getPortOneBillingKeyInfo(resolvedBillingKey)
          console.log('Fetched PortOne billing info:', {
            billingKey: billingInfo.billingKey,
            channels: billingInfo.channels?.map((ch: any) => ({
              key: ch.key,
              provider: ch.pgProvider
            })),
            merchantId: 'merchantId' in billingInfo ? billingInfo.merchantId : undefined,
            storeId: 'storeId' in billingInfo ? billingInfo.storeId : undefined
          })

          if ('status' in billingInfo && billingInfo.status !== 'ISSUED') {
            console.warn('빌링키 상태가 ISSUED가 아닙니다:', billingInfo.status)
          }

          if (!('billingKey' in billingInfo)) {
            console.warn('빌링키 정보에 billingKey가 없습니다. 클라이언트에서 받은 빌링키를 사용합니다.')
            billingInfo = null
          }
        } catch (billingInfoError: any) {
          console.warn('빌링키 정보 조회 실패 (방금 발급된 빌링키일 수 있음):', {
            error: billingInfoError?.message || billingInfoError,
            billingKey: resolvedBillingKey
          })
          // 빌링키 정보 조회 실패 시 클라이언트에서 받은 빌링키를 직접 사용
          billingInfo = null
        }

        // 빌링키 정보가 있으면 사용, 없으면 클라이언트에서 받은 빌링키 직접 사용
        billingCustomerKey = billingInfo?.billingKey ?? resolvedBillingKey
        billingChannelKey =
          billing?.channelKey ??
          billingInfo?.channels?.[0]?.key ??
          process.env.PORTONE_BILLING_CHANNEL_KEY ??
          process.env.PORTONE_CHANNEL_KEY ??
          null

        const paymentIdForSchedule =
          billing?.paymentId?.trim() || `fund-${user.id}-${Date.now()}`

        if (!billingScheduledAt) {
          return NextResponse.json(
            { error: '펀딩 결제 예약 시간을 확인할 수 없습니다.' },
            { status: 400 }
          )
        }

        try {
          await preRegisterPortOnePayment({
            paymentId: paymentIdForSchedule,
            totalAmount,
            currency: 'KRW'
          })
        } catch (preRegisterError: any) {
          console.error('preRegisterPortOnePayment 오류:', {
            error: preRegisterError?.message || preRegisterError,
            data: preRegisterError?.data,
            paymentId: paymentIdForSchedule,
            totalAmount
          })
          // preRegisterPayment는 선택적이므로 실패해도 계속 진행
          console.warn('preRegisterPayment 실패했지만 계속 진행합니다.')
        }

        if (!billingCustomerKey) {
          throw new Error('빌링키가 없습니다.')
        }

        let scheduleResponse
        try {
          scheduleResponse = await createPortOnePaymentSchedule({
            paymentId: paymentIdForSchedule,
            schedule: {
              billingKey: billingCustomerKey,
              channelKey: billingChannelKey ?? undefined,
              orderName: fundProductName ?? 'Fund Order',
              amount: {
                total: totalAmount
              },
              currency: 'KRW',
              customer: {
                id: user.id,
                name: user.name ? { full: user.name } : undefined,
                email: user.email ?? undefined,
                phoneNumber: phone ?? undefined
              }
            },
            scheduledAt: billingScheduledAt
          })
        } catch (scheduleError: any) {
          console.error('createPortOnePaymentSchedule 오류:', {
            error: scheduleError?.message || scheduleError,
            data: scheduleError?.data,
            billingKey: billingCustomerKey,
            channelKey: billingChannelKey,
            paymentId: paymentIdForSchedule
          })
          throw scheduleError
        }

        billingPaymentId = paymentIdForSchedule
        billingScheduleId = scheduleResponse.schedule.id
        billingScheduleResponse = scheduleResponse

        await prisma.billingCustomer.upsert({
          where: { userId: user.id },
          update: {
            billingKey: billingCustomerKey, // null 체크는 위에서 수행됨
            channelKey: billingChannelKey ?? undefined,
            pgProvider: billingInfo?.channels?.[0]?.pgProvider ?? null,
            issuedAt: billingInfo?.issuedAt ? new Date(billingInfo.issuedAt) : new Date(),
            raw: (billingInfo ?? { billingKey: billingCustomerKey }) as unknown as Prisma.InputJsonValue
          },
          create: {
            userId: user.id,
            billingKey: billingCustomerKey, // null 체크는 위에서 수행됨
            channelKey: billingChannelKey ?? undefined,
            pgProvider: billingInfo?.channels?.[0]?.pgProvider ?? null,
            issuedAt: billingInfo?.issuedAt ? new Date(billingInfo.issuedAt) : new Date(),
            raw: (billingInfo ?? { billingKey: billingCustomerKey }) as unknown as Prisma.InputJsonValue
          }
        })
      } catch (error) {
        console.error('PortOne 빌링키 처리 오류:', error)

        if (
          error &&
          typeof error === 'object' &&
          'data' in error &&
          (error as any).data?.type === 'BILLING_KEY_NOT_FOUND'
        ) {
          console.error('BILLING_KEY_NOT_FOUND: resolvedBillingKey', resolvedBillingKey)
          console.error('billing?.channelKey', billing?.channelKey)
          return NextResponse.json(
            { error: '발급된 빌링키를 찾을 수 없습니다. 다시 등록해주세요.' },
            { status: 400 }
          )
        }

        return NextResponse.json(
          { error: '자동결제 정보를 확인하는 중 오류가 발생했습니다. 다시 시도해주세요.' },
          { status: 500 }
        )
      }
    } else {
      if (!payment) {
        return NextResponse.json(
          { error: '결제 정보가 필요합니다.' },
          { status: 400 }
        )
      }

      const paymentId = payment.paymentId ?? payment.impUid

      if (!paymentId) {
        return NextResponse.json(
          { error: '결제 식별자를 확인할 수 없습니다.' },
          { status: 400 }
        )
      }

      try {
        const fetchedPayment = await getPortOnePayment({
          paymentId: payment.paymentId,
          impUid: payment.impUid
        })

        if ('status' in fetchedPayment && fetchedPayment.status !== 'PAID') {
          return NextResponse.json(
            { error: '결제가 완료되지 않았습니다.' },
            { status: 400 }
          )
        }

        if (!('amount' in fetchedPayment) || fetchedPayment.amount.total !== totalAmount) {
          return NextResponse.json(
            { error: '결제 금액이 주문 금액과 일치하지 않습니다.' },
            { status: 400 }
          )
        }

        orderStatus = 'CONFIRMED'
        paymentInfo = {
          paymentId,
          transactionId: 'transactionId' in fetchedPayment ? fetchedPayment.transactionId : null,
          amount: fetchedPayment.amount.total,
          currency: fetchedPayment.currency ?? 'KRW',
          status: fetchedPayment.status,
          cardName:
            payment.cardName ??
            ('method' in fetchedPayment && fetchedPayment.method && 'card' in fetchedPayment.method
              ? (fetchedPayment.method as any)?.card?.issuer?.name ?? null
              : null),
          buyerName: payment.buyerName ?? fetchedPayment.customer?.name ?? null,
          buyerEmail: payment.buyerEmail ?? fetchedPayment.customer?.email ?? null,
          buyerTel: payment.buyerTel ?? fetchedPayment.customer?.phoneNumber ?? null,
          receiptUrl:
            payment.receiptUrl ??
            ('receiptUrl' in fetchedPayment ? fetchedPayment.receiptUrl ?? null : null),
          paidAt: 'paidAt' in fetchedPayment ? fetchedPayment.paidAt : null,
          raw: JSON.parse(JSON.stringify(fetchedPayment)) as Prisma.JsonValue
        }
      } catch (verificationError) {
        console.error('PortOne 결제 검증 오류:', verificationError)
        return NextResponse.json(
          { error: '결제 검증에 실패했습니다. 관리자에게 문의해주세요.' },
          { status: 500 }
        )
      }
    }

    // 주문 생성
    // buyerName과 buyerEmail은 payment 객체에서 우선 가져오고, 없으면 body에서 직접 가져옴
    const resolvedBuyerName = payment?.buyerName ?? buyerName ?? null
    const resolvedBuyerEmail = payment?.buyerEmail ?? buyerEmail ?? null

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: orderStatus,
        totalAmount,
        shippingAddress,
        phone,
        buyerName: resolvedBuyerName,
        buyerEmail: resolvedBuyerEmail,
        notes: notes || null,
        paymentInfo: paymentInfo ?? undefined,
        paymentVerifiedAt: paymentInfo ? new Date() : null,
        billingStatus: hasFundProducts ? 'SCHEDULED' : null,
        billingKey: billingCustomerKey,
        billingPaymentId,
        billingScheduleId,
        billingScheduledAt: billingScheduledAt ?? null,
        billingExecutedAt: null,
        billingFailureReason: null,
        orderItems: {
          create: orderItems.map((item) => ({
            product: {
              connect: { id: item.productId }
            },
            quantity: item.quantity,
            price: item.price,
            selectedOptions: item.selectedOptions ?? undefined
          }))
        }
      },
      include: {
        user: true,
        orderItems: {
          include: {
            product: {
              include: {
                author: true
              }
            }
          }
        }
      }
    })

    if (hasFundProducts) {
      if (
        !billingCustomerKey ||
        !billingPaymentId ||
        !billingScheduledAt ||
        !billingScheduleResponse
      ) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            billingStatus: 'FAILED',
            billingFailureReason: '자동결제 예약 정보가 누락되었습니다.'
          }
        })
        return NextResponse.json(
          { error: '자동결제 예약 정보가 올바르지 않습니다. 다시 시도해주세요.' },
          { status: 500 }
        )
      }

      const scheduleSummary = billingScheduleResponse.schedule

      await prisma.billingSchedule.create({
        data: {
          orderId: order.id,
          userId: user.id,
          billingKey: billingCustomerKey!, // null 체크는 위에서 수행됨
          paymentId: billingPaymentId!,
          scheduleId: scheduleSummary?.id,
          channelKey: billingChannelKey ?? null,
          amount: totalAmount,
          currency: 'KRW',
          status: 'SCHEDULED',
          scheduledAt: billingScheduledAt,
          payload: JSON.parse(JSON.stringify(productsToIncrementFunding)) as Prisma.InputJsonValue,
          responseData: JSON.parse(JSON.stringify(billingScheduleResponse)) as Prisma.InputJsonValue
        }
      })

      // 펀딩 상품의 경우, 결제 예약 완료 시점에 RAISED 값 증가
      // (실제 결제는 예약된 시간에 실행되지만, 예약 완료 = 참여 의사 표현으로 간주)
      console.log('[Purchase] 펀딩 결제 예약 완료 - RAISED 값 증가 시작:', {
        productsToIncrementFunding,
        orderId: order.id
      })

      for (const item of productsToIncrementFunding) {
        // 업데이트 전 상품 정보 조회 (Goal 값 확인용)
        const productBeforeUpdate = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            author: true
          }
        })

        if (!productBeforeUpdate) {
          console.error(`[Purchase] 상품을 찾을 수 없습니다: ${item.productId}`)
          continue
        }

        const wasBelowGoal = productBeforeUpdate.fundingGoalAmount !== null &&
          productBeforeUpdate.fundingCurrentAmount < productBeforeUpdate.fundingGoalAmount

        const updatedProduct = await prisma.product.update({
          where: { id: item.productId },
          data: {
            fundingCurrentAmount: {
              increment: item.amount
            },
            fundingSupporterCount: {
              increment: item.supporterIncrement
            }
          },
          include: {
            author: true
          }
        })

        console.log('[Purchase] 펀딩 상품 RAISED 값 증가 완료:', {
          productId: item.productId,
          amount: item.amount,
          newFundingCurrentAmount: updatedProduct.fundingCurrentAmount,
          newFundingSupporterCount: updatedProduct.fundingSupporterCount
        })

        // 목표 달성 여부 확인 및 이메일 전송
        if (
          wasBelowGoal &&
          updatedProduct.fundingGoalAmount !== null &&
          updatedProduct.fundingCurrentAmount >= updatedProduct.fundingGoalAmount &&
          updatedProduct.author?.email
        ) {
          console.log('[Purchase] 펀딩 목표 달성 감지 - 이메일 전송 시작:', {
            productId: item.productId,
            goalAmount: updatedProduct.fundingGoalAmount,
            currentAmount: updatedProduct.fundingCurrentAmount
          })

          void sendFundingGoalReachedEmail({
            to: updatedProduct.author.email,
            sellerName: updatedProduct.author.name,
            productName: updatedProduct.name,
            productId: updatedProduct.id,
            goalAmount: updatedProduct.fundingGoalAmount,
            currentAmount: updatedProduct.fundingCurrentAmount,
            supporterCount: updatedProduct.fundingSupporterCount,
            reachedAt: new Date()
          }).catch((error) => {
            console.error('[Purchase] 펀딩 목표 달성 이메일 전송 실패:', error)
          })
        }
      }

      if (hasCartItems) {
        await prisma.cartItem.deleteMany({
          where: {
            id: {
              in: cartItemIds!
            },
            userId: user.id
          }
        })
      }
    }

    // 재고 감소
    for (const item of productsToUpdate) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    if (hasCartItems && !hasFundProducts) {
      await prisma.cartItem.deleteMany({
        where: {
          id: {
            in: cartItemIds!
          },
          userId: user.id
        }
      })
    }

    if (orderStatus === 'CONFIRMED' && paymentInfo) {
      await prisma.paymentRecord.create({
        data: {
          orderId: order.id,
          userId: user.id,
          impUid: payment?.impUid ?? null,
          merchantUid: payment?.merchantUid ?? null,
          amount: totalAmount,
          method: payment?.payMethod ?? (paymentInfo.payMethod as string | undefined) ?? null,
          status: (paymentInfo.status as string | undefined) ?? 'paid',
          paymentData: paymentInfo
        }
      })
    }

    if (orderStatus === 'CONFIRMED') {
      for (const item of productsToIncrementFunding) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            fundingCurrentAmount: {
              increment: item.amount
            },
            fundingSupporterCount: {
              increment: item.supporterIncrement
            }
          }
        })
      }

      // PARTNER_UP 아이템이 있는 경우에만 판매자에게 이메일 전송
      const hasPartnerUpItems = order.orderItems.some(
        (orderItem) => orderItem.product.type === 'PARTNER_UP'
      )

      if (hasPartnerUpItems) {
        void notifySellersOfOrder(order, {
          buyerName: user.name,
          buyerEmail: user.email,
          buyerPhone: phone,
          shippingAddress,
          notes: notes ?? null,
          totalAmount
        })
      }
    }

    const responsePayload = {
      id: order.id,
      status: order.status,
      billingStatus: order.billingStatus,
      billingScheduledAt: order.billingScheduledAt,
      billingPaymentId: order.billingPaymentId,
      billingScheduleId: order.billingScheduleId,
      totalAmount: order.totalAmount
    }

    return NextResponse.json(
      {
        success: true,
        message: hasFundProducts
          ? '펀딩 자동결제 예약이 완료되었습니다.'
          : '주문이 성공적으로 완료되었습니다.',
        data: responsePayload
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('상품 구매 오류:', error)
    
    if (error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: permissionErrors.notLoggedIn },
        { status: 401 }
      )
    }
    
    if (error.message === '권한이 부족합니다') {
      return NextResponse.json(
        { error: permissionErrors.insufficientPermission },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

type SellerNotificationContext = {
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  shippingAddress: string
  notes: string | null
  totalAmount: number
}

async function notifySellersOfOrder(order: OrderWithRelations, context: SellerNotificationContext) {
  try {
    const sellerMap = new Map<
      string,
      {
        sellerName: string
        sellerEmail: string
        items: Array<{
          name: string
          quantity: number
          unitPrice: number
          selectedOptions: string[]
        }>
        subtotal: number
      }
    >()

    for (const item of order.orderItems) {
      const product = item.product
      
      // PARTNER_UP 타입의 상품에 대해서만 이메일 전송
      if (product.type !== 'PARTNER_UP') {
        continue
      }

      const seller = product.author
      const sellerEmail = seller?.email
      if (!sellerEmail) {
        continue
      }

      const existing = sellerMap.get(sellerEmail) ?? {
        sellerName: seller?.name ?? '판매자',
        sellerEmail,
        items: [],
        subtotal: 0
      }

      const optionLabels: string[] = []
      if (Array.isArray(item.selectedOptions)) {
        for (const option of item.selectedOptions as Array<{ name?: string; label?: string }>) {
          if (option?.name && option?.label) {
            optionLabels.push(`${option.name}: ${option.label}`)
          }
        }
      } else if (item.selectedOptions) {
        try {
          const parsed = JSON.parse(JSON.stringify(item.selectedOptions))
          if (Array.isArray(parsed)) {
            for (const option of parsed) {
              if (option?.name && option?.label) {
                optionLabels.push(`${option.name}: ${option.label}`)
              }
            }
          }
        } catch (error) {
          console.error('주문 옵션 파싱 오류:', error)
        }
      }

      existing.items.push({
        name: product.name,
        quantity: item.quantity,
        unitPrice: item.price,
        selectedOptions: optionLabels
      })
      existing.subtotal += item.price * item.quantity
      sellerMap.set(sellerEmail, existing)
    }

    if (sellerMap.size === 0) {
      return
    }

    await Promise.allSettled(
      Array.from(sellerMap.values()).map((entry) =>
        sendOrderNotificationEmail({
          to: entry.sellerEmail,
          sellerName: entry.sellerName,
          orderId: order.id,
          orderStatus: order.status,
          buyerName: context.buyerName,
          buyerEmail: context.buyerEmail,
          buyerPhone: context.buyerPhone,
          shippingAddress: context.shippingAddress,
          notes: context.notes ?? undefined,
          items: entry.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            selectedOptions: item.selectedOptions
          })),
          orderTotalAmount: context.totalAmount,
          sellerSubtotal: entry.subtotal,
          orderedAt: order.createdAt
        })
      )
    )
  } catch (notificationError) {
    console.error('판매자 주문 알림 이메일 전송 오류:', notificationError)
  }
}

