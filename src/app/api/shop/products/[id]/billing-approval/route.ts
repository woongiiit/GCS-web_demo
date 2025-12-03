import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'

// 관리자가 Fund 상품의 빌링키 결제를 승인
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const productId = params.id

    // 관리자 권한 확인
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 상품 조회
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        type: true,
        fundingGoalAmount: true,
        fundingCurrentAmount: true,
        fundingDeadline: true,
        billingPaymentApproved: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Fund 상품인지 확인
    if (product.type !== 'FUND') {
      return NextResponse.json(
        { error: 'Fund 상품만 빌링키 결제 승인이 가능합니다.' },
        { status: 400 }
      )
    }

    // 이미 승인된 경우
    if (product.billingPaymentApproved) {
      return NextResponse.json(
        { error: '이미 빌링키 결제가 승인된 상품입니다.' },
        { status: 400 }
      )
    }

    // 펀딩 마감일 확인
    if (!product.fundingDeadline) {
      return NextResponse.json(
        { error: '펀딩 마감일이 설정되지 않은 상품입니다.' },
        { status: 400 }
      )
    }

    const deadline = new Date(product.fundingDeadline)
    const now = new Date()
    if (deadline.getTime() > now.getTime()) {
      return NextResponse.json(
        { error: '펀딩 기간이 아직 도래하지 않았습니다.' },
        { status: 400 }
      )
    }

    // 달성률 확인
    if (product.fundingGoalAmount !== null) {
      const achievementRate = (product.fundingCurrentAmount / product.fundingGoalAmount) * 100
      if (achievementRate < 100) {
        return NextResponse.json(
          { 
            error: `펀딩 달성률이 100% 미만입니다. (현재: ${achievementRate.toFixed(2)}%)`,
            achievementRate: achievementRate
          },
          { status: 400 }
        )
      }
    }

    // 빌링키 결제 승인
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        billingPaymentApproved: true,
        billingPaymentApprovedAt: new Date(),
        billingPaymentApprovedBy: user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: '빌링키 결제가 승인되었습니다.',
      data: {
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        billingPaymentApproved: updatedProduct.billingPaymentApproved,
        billingPaymentApprovedAt: updatedProduct.billingPaymentApprovedAt,
        approvedBy: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    })
  } catch (error: any) {
    console.error('빌링키 결제 승인 오류:', error)

    if (error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: '빌링키 결제 승인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 빌링키 결제 승인 취소 (관리자용)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const productId = params.id

    // 관리자 권한 확인
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 상품 조회
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        type: true,
        billingPaymentApproved: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Fund 상품인지 확인
    if (product.type !== 'FUND') {
      return NextResponse.json(
        { error: 'Fund 상품만 빌링키 결제 승인 취소가 가능합니다.' },
        { status: 400 }
      )
    }

    // 승인되지 않은 경우
    if (!product.billingPaymentApproved) {
      return NextResponse.json(
        { error: '승인되지 않은 상품입니다.' },
        { status: 400 }
      )
    }

    // 빌링키 결제 승인 취소
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        billingPaymentApproved: false,
        billingPaymentApprovedAt: null,
        billingPaymentApprovedBy: null
      }
    })

    return NextResponse.json({
      success: true,
      message: '빌링키 결제 승인이 취소되었습니다.',
      data: {
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        billingPaymentApproved: updatedProduct.billingPaymentApproved
      }
    })
  } catch (error: any) {
    console.error('빌링키 결제 승인 취소 오류:', error)

    if (error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: '빌링키 결제 승인 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

