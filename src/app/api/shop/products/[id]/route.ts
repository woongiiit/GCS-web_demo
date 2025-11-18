import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, getCurrentUser } from '@/lib/auth'
import { permissions, permissionErrors } from '@/lib/permissions'
import { invalidateCache } from '@/lib/cache'
import { normalizeProductType } from '@/lib/shop/product-types'
import { ProductType } from '@prisma/client'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const currentUser = await getCurrentUser()

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productDetails: true,
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 리뷰 통계 조회
    const reviewStats = await prisma.productReview.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true }
    })

    const averageRating = reviewStats._avg.rating || 0
    const reviewCount = reviewStats._count.rating || 0

    // 같은 카테고리의 관련 상품 조회 (최대 4개)
    const relatedProducts = await prisma.product.findMany({
      where: {
        type: product.type,
        id: { not: productId },
        isActive: true,
      },
      take: 4,
      orderBy: {
        createdAt: 'desc'
      }
    })

    let liked = false
    if (currentUser) {
      const existingLike = await prisma.productLike.findUnique({
        where: {
          productId_userId: {
            productId,
            userId: currentUser.id
          }
        }
      })
      liked = !!existingLike
    }

    return NextResponse.json(
      { 
        success: true, 
        data: {
          product: {
            ...product,
            averageRating: Math.round(averageRating * 10) / 10,
            reviewCount
          },
          relatedProducts,
          liked
        }
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('상품 상세 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const productId = params.id

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (!permissions.canEditProduct(user.role as any, user.isSeller, existingProduct.authorId, user.id)) {
      return NextResponse.json(
        { error: permissionErrors.insufficientPermission },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      shortDescription,
      price,
      originalPrice,
      discount,
      type,
      fundingGoalAmount,
      fundingCurrentAmount,
      fundingDeadline,
      brand,
      options,
      images,
      isActive,
      stock,
    } = body

    const updateData: any = {}

    if (typeof name === 'string') {
      updateData.name = name
    }

    if (typeof description === 'string') {
      updateData.description = description
    }

    if (shortDescription !== undefined) {
      updateData.shortDescription = shortDescription ? String(shortDescription) : null
    }

    if (price !== undefined) {
      const parsedPrice = typeof price === 'number' ? price : parseInt(String(price), 10)
      if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
        return NextResponse.json(
          { error: '유효한 판매가를 입력해주세요.' },
          { status: 400 }
        )
      }
      updateData.price = parsedPrice
    }

    if (originalPrice !== undefined) {
      const parsedOriginalPrice = originalPrice === null || originalPrice === ''
        ? null
        : typeof originalPrice === 'number'
          ? originalPrice
          : parseInt(String(originalPrice), 10)

      if (parsedOriginalPrice !== null && Number.isNaN(parsedOriginalPrice)) {
        return NextResponse.json(
          { error: '유효한 정가를 입력해주세요.' },
          { status: 400 }
        )
      }

      updateData.originalPrice = parsedOriginalPrice
    }

    if (discount !== undefined) {
      const parsedDiscount = discount === null || discount === ''
        ? null
        : typeof discount === 'number'
          ? discount
          : parseInt(String(discount), 10)

      if (parsedDiscount !== null && Number.isNaN(parsedDiscount)) {
        return NextResponse.json(
          { error: '유효한 할인율을 입력해주세요.' },
          { status: 400 }
        )
      }

      updateData.discount = parsedDiscount
    }

    let targetType: ProductType = existingProduct.type
    if (type !== undefined) {
      const normalizedType = normalizeProductType(type)
      if (!normalizedType) {
        return NextResponse.json(
          { error: '유효하지 않은 상품 유형입니다.' },
          { status: 400 }
        )
      }
      targetType = normalizedType
      updateData.type = targetType

      if (targetType === ProductType.FUND) {
        updateData.stock = 0
      }
    }

    if (fundingGoalAmount !== undefined) {
      const parsedFundingGoal = fundingGoalAmount === null || fundingGoalAmount === ''
        ? null
        : typeof fundingGoalAmount === 'number'
          ? fundingGoalAmount
          : parseInt(String(fundingGoalAmount).replace(/,/g, ''), 10)

      if (parsedFundingGoal !== null && (Number.isNaN(parsedFundingGoal) || parsedFundingGoal <= 0)) {
        return NextResponse.json(
          { error: '펀딩 목표 금액은 0보다 큰 숫자여야 합니다.' },
          { status: 400 }
        )
      }

      if (targetType === ProductType.FUND && parsedFundingGoal === null) {
        return NextResponse.json(
          { error: 'Fund 상품은 펀딩 목표 금액이 필요합니다.' },
          { status: 400 }
        )
      }

      updateData.fundingGoalAmount = parsedFundingGoal
    }

    if (fundingCurrentAmount !== undefined) {
      const parsedCurrent = typeof fundingCurrentAmount === 'number'
        ? fundingCurrentAmount
        : parseInt(String(fundingCurrentAmount).replace(/,/g, ''), 10)

      if (Number.isNaN(parsedCurrent) || parsedCurrent < 0) {
        return NextResponse.json(
          { error: '펀딩 누적 금액은 0 이상의 숫자여야 합니다.' },
          { status: 400 }
        )
      }

      updateData.fundingCurrentAmount = parsedCurrent
    }

    if (fundingDeadline !== undefined) {
      if (fundingDeadline === null || fundingDeadline === '') {
        updateData.fundingDeadline = null
      } else {
        const deadlineDate = new Date(fundingDeadline)
        if (Number.isNaN(deadlineDate.getTime())) {
          return NextResponse.json(
            { error: '유효한 펀딩 마감일을 입력해주세요.' },
            { status: 400 }
          )
        }
        updateData.fundingDeadline = deadlineDate
      }
    }

    if (brand !== undefined) {
      updateData.brand = typeof brand === 'string' && brand.trim().length > 0 ? brand.trim() : null
    }

    if (stock !== undefined) {
      const stockString = String(stock).trim()
      const parsedStock = stockString === ''
        ? NaN
        : typeof stock === 'number'
          ? stock
          : parseInt(stockString, 10)

      if (targetType === ProductType.PARTNER_UP) {
        if (Number.isNaN(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
          return NextResponse.json(
            { error: '재고 수량은 0 이상의 정수로 입력해주세요.' },
            { status: 400 }
          )
        }
        updateData.stock = parsedStock
      } else {
        updateData.stock = 0
      }
    }

    if (Array.isArray(options)) {
      const sanitizedOptions = options
        .map((option: any) => {
          if (!option || typeof option !== 'object') return null
          const optionName = typeof option.name === 'string' ? option.name.trim() : ''

          if (!Array.isArray(option.values)) return null

          const optionValues = option.values
            .map((value: any) => {
              if (typeof value === 'string') {
                const label = value.trim()
                if (!label) return null
                return { label, priceAdjustment: 0 }
              }

              if (!value || typeof value !== 'object') return null

              const label = typeof value.label === 'string' ? value.label.trim() : ''
              if (!label) return null

              const rawPrice = value.priceAdjustment
              let parsedPrice = 0

              if (rawPrice === undefined || rawPrice === null || rawPrice === '') {
                parsedPrice = 0
              } else if (typeof rawPrice === 'number') {
                parsedPrice = rawPrice
              } else if (typeof rawPrice === 'string') {
                const cleaned = rawPrice.trim().replace(/,/g, '')
                if (!cleaned) {
                  parsedPrice = 0
                } else {
                  parsedPrice = Number(cleaned)
                  if (Number.isNaN(parsedPrice)) return null
                }
              } else {
                return null
              }

              return { label, priceAdjustment: parsedPrice }
            })
            .filter((value: any) => value !== null)

          if (!optionName || optionValues.length === 0) {
            return null
          }

          return {
            name: optionName,
            values: optionValues
          }
        })
        .filter((option: any) => option !== null)

      updateData.options = sanitizedOptions.length > 0 ? sanitizedOptions : null
    }

    if (Array.isArray(images)) {
      updateData.images = images
        .filter((image: any) => typeof image === 'string' && image.trim().length > 0)
        .map((image: string) => image.trim())
    }

    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '수정할 항목이 없습니다.' },
        { status: 400 }
      )
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        productDetails: true,
      }
    })

    invalidateCache('products:.*')

    return NextResponse.json(
      {
        success: true,
        message: '상품이 성공적으로 수정되었습니다.',
        data: updatedProduct,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('상품 수정 오류:', error)

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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const productId = params.id

    // ADMIN 권한 확인
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 상품 존재 여부 확인
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Soft delete: isActive를 false로 설정
    // 연결된 데이터(orderItems, productDetails, likes, cartItems, reviews)는 유지
    await prisma.product.update({
      where: { id: productId },
      data: {
        isActive: false,
      },
    })

    // 캐시 무효화
    invalidateCache('products:.*')

    return NextResponse.json(
      {
        success: true,
        message: '상품이 성공적으로 삭제되었습니다.',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('상품 삭제 오류:', error)

    if (error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    if (error.message === '권한이 부족합니다') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

