import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'
import type { PartnerUpOrderStatus, FundOrderStatus } from '@prisma/client'

// 판매자가 자신의 상품 주문 목록 조회
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(50, Math.max(5, Number.parseInt(searchParams.get('limit') || '10', 10) || 10))
    const skip = (page - 1) * limit

    // 판매자 권한 확인
    if (!user.isSeller) {
      return NextResponse.json(
        { error: '판매자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 판매자의 Partner up 및 Fund 상품 주문 조회
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: {
          orderItems: {
            some: {
              product: {
                authorId: user.id,
                type: { in: ['PARTNER_UP', 'FUND'] }
              }
            }
          },
          status: {
            not: 'CANCELLED'
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          orderItems: {
            where: {
              product: {
                authorId: user.id,
                type: { in: ['PARTNER_UP', 'FUND'] }
              }
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  images: true
                }
              }
            }
          }
        }
      }),
      prisma.order.count({
        where: {
          orderItems: {
            some: {
              product: {
                authorId: user.id,
                type: 'PARTNER_UP'
              }
            }
          },
          status: {
            not: 'CANCELLED'
          }
        }
      })
    ])

    const totalPages = Math.max(1, Math.ceil(totalCount / limit))

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map((order) => ({
          id: order.id,
          buyer: {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email,
            phone: order.user.phone
          },
          totalAmount: order.totalAmount,
          shippingAddress: order.shippingAddress,
          phone: order.phone,
          buyerName: order.buyerName,
          buyerEmail: order.buyerEmail,
          notes: order.notes,
          partnerUpStatus: order.partnerUpStatus,
          partnerUpStatusUpdatedAt: order.partnerUpStatusUpdatedAt,
          partnerUpStatusNote: order.partnerUpStatusNote,
          fundStatus: order.fundStatus,
          fundStatusUpdatedAt: order.fundStatusUpdatedAt,
          fundStatusNote: order.fundStatusNote,
          orderItems: order.orderItems,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        })),
        pagination: {
          page,
          limit,
          totalPages,
          totalCount
        }
      }
    })
  } catch (error) {
    console.error('판매자 주문 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '주문 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 판매자가 주문 단계 업데이트
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()

    // 판매자 권한 확인
    if (!user.isSeller) {
      return NextResponse.json(
        { error: '판매자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { orderId, status, note, productType } = body as {
      orderId: string
      status: PartnerUpOrderStatus | FundOrderStatus
      note?: string
      productType: 'PARTNER_UP' | 'FUND'
    }

    if (!orderId || !status || !productType) {
      return NextResponse.json(
        { error: '주문 ID, 상태, 상품 타입을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 유효한 상태인지 확인
    const validPartnerUpStatuses: PartnerUpOrderStatus[] = [
      'ORDERED',
      'CONFIRMED',
      'PRODUCTION_STARTED',
      'SHIPPED_OUT',
      'SHIPPING',
      'ARRIVED',
      'RECEIVED'
    ]

    const validFundStatuses: FundOrderStatus[] = [
      'ORDERED',
      'BILLING_COMPLETED',
      'CONFIRMED',
      'PRODUCTION_STARTED',
      'SHIPPED_OUT',
      'SHIPPING',
      'ARRIVED',
      'RECEIVED'
    ]

    if (
      (productType === 'PARTNER_UP' && !validPartnerUpStatuses.includes(status as PartnerUpOrderStatus)) ||
      (productType === 'FUND' && !validFundStatuses.includes(status as FundOrderStatus))
    ) {
      return NextResponse.json(
        { error: '유효하지 않은 주문 상태입니다.' },
        { status: 400 }
      )
    }

    // 주문 조회 및 권한 확인
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                authorId: true,
                type: true
              }
            }
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

    // 해당 타입의 상품이 포함되어 있는지 확인
    const hasTargetTypeItems = order.orderItems.some(
      (item) => item.product.type === productType
    )

    if (!hasTargetTypeItems) {
      return NextResponse.json(
        { error: `이 주문에는 ${productType === 'PARTNER_UP' ? 'Partner up' : 'Fund'} 상품이 포함되어 있지 않습니다.` },
        { status: 400 }
      )
    }

    // 판매자가 이 주문의 상품을 판매하는지 확인
    const isSellerOfOrder = order.orderItems.some(
      (item) => item.product.type === productType && item.product.authorId === user.id
    )

    if (!isSellerOfOrder) {
      return NextResponse.json(
        { error: '이 주문의 상품을 판매할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 주문 단계 업데이트
    const updateData: any = {
      partnerUpStatusUpdatedAt: new Date(),
      partnerUpStatusNote: null,
      fundStatusUpdatedAt: new Date(),
      fundStatusNote: null
    }

    if (productType === 'PARTNER_UP') {
      updateData.partnerUpStatus = status as PartnerUpOrderStatus
      updateData.partnerUpStatusNote = note || null
    } else {
      updateData.fundStatus = status as FundOrderStatus
      updateData.fundStatusNote = note || null
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true,
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: '주문 단계가 업데이트되었습니다.',
      data: {
        orderId: updatedOrder.id,
        partnerUpStatus: updatedOrder.partnerUpStatus,
        partnerUpStatusUpdatedAt: updatedOrder.partnerUpStatusUpdatedAt,
        partnerUpStatusNote: updatedOrder.partnerUpStatusNote,
        fundStatus: updatedOrder.fundStatus,
        fundStatusUpdatedAt: updatedOrder.fundStatusUpdatedAt,
        fundStatusNote: updatedOrder.fundStatusNote
      }
    })
  } catch (error) {
    console.error('주문 단계 업데이트 오류:', error)
    return NextResponse.json(
      { error: '주문 단계 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

