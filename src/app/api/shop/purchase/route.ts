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
  cancelPortOnePayment,
  getPortOnePayment,
  schedulePortOnePayment
} from '@/lib/shop/payment'
import type { Prisma } from '@prisma/client'
import { sendOrderNotificationEmail } from '@/lib/email'

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
      notes?: string
      payment?: {
        impUid: string
        merchantUid: string
        amount: number
        payMethod?: string
        cardName?: string
        buyerName?: string
        buyerEmail?: string
        buyerTel?: string
        receiptUrl?: string
      }
      billing?: {
        impUid: string
        customerUid: string
        merchantUid?: string
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
    let billingCustomerUid: string | null = null
    let billingMerchantUidForSchedule: string | null = null
    let billingScheduledAt: Date | null = hasFundProducts ? fundProductDeadline ?? null : null
    let billingIssuanceData: Prisma.InputJsonValue | null = null
    let billingImpUid: string | null = null

    if (hasFundProducts) {
      if (!billing?.impUid || !billing.customerUid) {
        return NextResponse.json(
          { error: '자동결제 정보를 확인할 수 없습니다. 다시 시도해주세요.' },
          { status: 400 }
        )
      }

      try {
        const billingData: any = await getPortOnePayment(billing.impUid)
        const customerUidFromPortOne: string =
          (billingData?.customer_uid as string | undefined) ?? billing.customerUid

        if (customerUidFromPortOne !== billing.customerUid) {
          return NextResponse.json(
            { error: '자동결제 정보가 일치하지 않습니다. (customerUid 불일치)' },
            { status: 400 }
          )
        }

        const billingStatus = billingData?.status as string | undefined
        if (billingStatus && billingStatus !== 'ready' && billingStatus !== 'paid') {
          return NextResponse.json(
            { error: '자동결제 등록이 완료되지 않았습니다. 다시 시도해주세요.' },
            { status: 400 }
          )
        }

        billingCustomerUid = customerUidFromPortOne
        billingImpUid = billing.impUid
        billingMerchantUidForSchedule = `${customerUidFromPortOne}-${Date.now()}`
        billingIssuanceData = JSON.parse(JSON.stringify(billingData)) as Prisma.InputJsonValue

        const issuedAt =
          typeof billingData?.paid_at === 'number'
            ? new Date(billingData.paid_at * 1000)
            : new Date()

        await prisma.billingCustomer.upsert({
          where: { userId: user.id },
          update: {
            customerUid: customerUidFromPortOne,
            pgProvider: (billingData?.pg_provider as string | undefined) ?? null,
            cardName: (billingData?.card_name as string | undefined) ?? null,
            cardNumber: (billingData?.card_number as string | undefined) ?? null,
            cardType: (billingData?.card_type as string | undefined) ?? null,
            cardOwner: (billingData?.card_owner as string | undefined) ?? null,
            issuedAt,
            raw: billingIssuanceData ?? undefined
          },
          create: {
            userId: user.id,
            customerUid: customerUidFromPortOne,
            pgProvider: (billingData?.pg_provider as string | undefined) ?? null,
            cardName: (billingData?.card_name as string | undefined) ?? null,
            cardNumber: (billingData?.card_number as string | undefined) ?? null,
            cardType: (billingData?.card_type as string | undefined) ?? null,
            cardOwner: (billingData?.card_owner as string | undefined) ?? null,
            issuedAt,
            raw: billingIssuanceData ?? undefined
          }
        })
      } catch (verificationError) {
        console.error('PortOne 빌링키 검증 오류:', verificationError)
        return NextResponse.json(
          { error: '자동결제 정보 확인에 실패했습니다. 다시 시도해주세요.' },
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

      try {
        const paymentData = await getPortOnePayment(payment.impUid)

        if (paymentData.merchant_uid !== payment.merchantUid) {
          await cancelPortOnePayment(payment.impUid, '주문 정보와 일치하지 않는 주문 번호')
          return NextResponse.json(
            { error: '결제 정보가 일치하지 않습니다. (주문 번호 불일치)' },
            { status: 400 }
          )
        }

        if (paymentData.status !== 'paid') {
          return NextResponse.json(
            { error: '결제가 완료되지 않았습니다.' },
            { status: 400 }
          )
        }

        if (Math.round(paymentData.amount) !== Math.round(totalAmount)) {
          await cancelPortOnePayment(payment.impUid, '결제 금액 불일치', paymentData.amount)
          return NextResponse.json(
            { error: '결제 금액이 주문 금액과 일치하지 않습니다.' },
            { status: 400 }
          )
        }

        orderStatus = 'CONFIRMED'
        const serializedPaymentData = JSON.parse(JSON.stringify(paymentData)) as Prisma.InputJsonValue
        paymentInfo = {
          impUid: payment.impUid,
          merchantUid: payment.merchantUid,
          amount: paymentData.amount,
          currency: paymentData.currency ?? 'KRW',
          payMethod: paymentData.pay_method,
          status: paymentData.status,
          cardName: payment.cardName ?? paymentData.card_name ?? null,
          buyerName: payment.buyerName ?? paymentData.buyer_name ?? null,
          buyerEmail: payment.buyerEmail ?? paymentData.buyer_email ?? null,
          buyerTel: payment.buyerTel ?? paymentData.buyer_tel ?? null,
          receiptUrl: payment.receiptUrl ?? paymentData.receipt_url ?? null,
          paidAt: paymentData.paid_at ? new Date(paymentData.paid_at * 1000).toISOString() : null,
          raw: serializedPaymentData as Prisma.JsonValue
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
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: orderStatus,
        totalAmount,
        shippingAddress,
        phone,
        notes: notes || null,
        paymentInfo: paymentInfo ?? undefined,
        paymentVerifiedAt: paymentInfo ? new Date() : null,
        billingStatus: hasFundProducts ? 'SCHEDULED' : null,
        billingCustomerUid: billingCustomerUid,
        billingMerchantUid: billingMerchantUidForSchedule,
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
      if (!billingCustomerUid || !billingMerchantUidForSchedule || !billingScheduledAt) {
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

      try {
        const scheduleResponse = await schedulePortOnePayment({
          customerUid: billingCustomerUid,
          merchantUid: billingMerchantUidForSchedule,
          amount: totalAmount,
          scheduleAt: billingScheduledAt,
          name: fundProductName ? `Fund 자동결제 - ${fundProductName}` : 'Fund 자동결제',
          buyerName: user.name,
          buyerEmail: user.email,
          buyerTel: phone
        })

        await prisma.billingSchedule.create({
          data: {
            orderId: order.id,
            userId: user.id,
            customerUid: billingCustomerUid,
            merchantUid: billingMerchantUidForSchedule,
            scheduleAt: billingScheduledAt,
            amount: totalAmount,
            status: 'SCHEDULED',
            fundingPayload: JSON.parse(JSON.stringify(productsToIncrementFunding)) as Prisma.InputJsonValue,
            responseData: JSON.parse(JSON.stringify(scheduleResponse)) as Prisma.InputJsonValue,
            impUid: billingImpUid,
            failureReason: null
          }
        })

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
      } catch (scheduleError) {
        console.error('포트원 자동결제 예약 오류:', scheduleError)
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            billingStatus: 'FAILED',
            billingFailureReason:
              scheduleError instanceof Error
                ? scheduleError.message
                : '자동결제 예약 중 알 수 없는 오류가 발생했습니다.'
          }
        })

        return NextResponse.json(
          { error: '자동결제 예약에 실패했습니다. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        )
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

      void notifySellersOfOrder(order, {
        buyerName: user.name,
        buyerEmail: user.email,
        buyerPhone: phone,
        shippingAddress,
        notes: notes ?? null,
        totalAmount
      })
    }

    const responsePayload = {
      id: order.id,
      status: order.status,
      billingStatus: order.billingStatus,
      billingScheduledAt: order.billingScheduledAt,
      billingMerchantUid: order.billingMerchantUid,
      totalAmount: order.totalAmount
    }

    return NextResponse.json(
      {
        success: true,
        message: hasFundProducts ? '펀딩 자동결제 예약이 완료되었습니다.' : '주문이 성공적으로 완료되었습니다.',
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

