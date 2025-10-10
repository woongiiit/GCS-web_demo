import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'

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
    const { items, shippingAddress, phone, notes } = body

    // 유효성 검사
    if (!items || items.length === 0) {
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
    const orderItems = []

    for (const item of items) {
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

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `재고가 부족합니다. (${product.name})` },
          { status: 400 }
        )
      }

      const itemTotal = product.price * item.quantity
      totalAmount += itemTotal

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      })
    }

    // 주문 생성
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        totalAmount,
        shippingAddress,
        phone,
        notes: notes || null,
        orderItems: {
          create: orderItems
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    // 재고 감소
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    return NextResponse.json(
      { 
        success: true, 
        message: '주문이 성공적으로 완료되었습니다.',
        data: order 
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

