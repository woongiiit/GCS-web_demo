import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'
import { withCache, generateCacheKey, invalidateCache } from '@/lib/cache'
import { normalizeProductType } from '@/lib/shop/product-types'
import { ProductType } from '@prisma/client'

// 동적 렌더링 강제 설정
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // 인증 확인 및 사용자 정보 가져오기
    const user = await requireAuth()

    // 상품 등록 권한 확인 (관리자 또는 판매자 권한 보유자만 가능)
    if (!permissions.canAddProduct(user.role as any, user.isSeller)) {
      return NextResponse.json(
        { error: permissionErrors.adminOnly },
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
      sellerTeamId,
      fundingGoalAmount,
      fundingDeadline,
      images,
      brand,
      options,
      stock
    } = body

    // 유효성 검사
    if (!name || !description || !price) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      )
    }

    const normalizedType = normalizeProductType(type ?? 'FUND')
    const productType: ProductType = normalizedType ?? ProductType.FUND

    const parsedPrice = typeof price === 'number' ? price : parseInt(price, 10)
    const parsedOriginalPrice = typeof originalPrice === 'number'
      ? originalPrice
      : originalPrice
        ? parseInt(originalPrice, 10)
        : null
    const parsedDiscount = typeof discount === 'number'
      ? discount
      : discount
        ? parseInt(discount, 10)
        : null

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: '유효한 판매가를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (parsedOriginalPrice !== null && Number.isNaN(parsedOriginalPrice)) {
      return NextResponse.json(
        { error: '유효한 정가를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (parsedDiscount !== null && Number.isNaN(parsedDiscount)) {
      return NextResponse.json(
        { error: '유효한 할인율을 입력해주세요.' },
        { status: 400 }
      )
    }

    let parsedStock = 0
    if (productType === ProductType.PARTNER_UP) {
      parsedStock = typeof stock === 'number'
        ? stock
        : stock !== undefined && stock !== null && `${stock}`.trim() !== ''
          ? parseInt(`${stock}`.trim(), 10)
          : Number.NaN

      if (Number.isNaN(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
        return NextResponse.json(
          { error: '재고 수량은 0 이상의 정수로 입력해주세요.' },
          { status: 400 }
        )
      }
    }

    const parsedFundingGoal = fundingGoalAmount === undefined || fundingGoalAmount === null || `${fundingGoalAmount}`.trim() === ''
      ? null
      : typeof fundingGoalAmount === 'number'
        ? fundingGoalAmount
        : parseInt(`${fundingGoalAmount}`.trim().replace(/,/g, ''), 10)

    if (parsedFundingGoal !== null && (Number.isNaN(parsedFundingGoal) || parsedFundingGoal <= 0)) {
      return NextResponse.json(
        { error: '펀딩 목표 금액은 0보다 큰 숫자여야 합니다.' },
        { status: 400 }
      )
    }

    if (productType === ProductType.FUND && parsedFundingGoal === null) {
      return NextResponse.json(
        { error: 'Fund 상품은 펀딩 목표 금액이 필요합니다.' },
        { status: 400 }
      )
    }

    let parsedFundingDeadline: Date | null = null
    if (fundingDeadline) {
      const deadlineDate = new Date(fundingDeadline)
      if (Number.isNaN(deadlineDate.getTime())) {
        return NextResponse.json(
          { error: '유효한 펀딩 마감일을 입력해주세요.' },
          { status: 400 }
        )
      }
      parsedFundingDeadline = deadlineDate
    }

    const parsedOptions = Array.isArray(options)
      ? options
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
      : []

    // 상품 생성
    const productData: any = {
      name,
      description,
      shortDescription: shortDescription || null,
      price: parsedPrice,
      originalPrice: parsedOriginalPrice,
      discount: parsedDiscount,
      stock: productType === ProductType.PARTNER_UP ? parsedStock : 0,
      type: productType,
      fundingGoalAmount: parsedFundingGoal,
      fundingDeadline: parsedFundingDeadline ?? undefined,
      images: Array.isArray(images) ? images : [], // 상품 대표 이미지들 저장
      brand: typeof brand === 'string' && brand.trim().length > 0 ? brand.trim() : null,
      isActive: true,
      authorId: user.id, // 상품 등록자 ID 저장
      sellerTeamId: sellerTeamId && sellerTeamId.trim() !== '' ? sellerTeamId : null,
    }

    if (parsedOptions.length > 0) {
      productData.options = parsedOptions
    }

    const product = await prisma.product.create({
      data: productData
    })

    // 상품 등록 후 관련 캐시 무효화
    invalidateCache('products:.*');

    return NextResponse.json(
      { 
        success: true, 
        message: '상품이 성공적으로 등록되었습니다.',
        data: product 
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('상품 등록 오류:', error)
    
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

// 상품 목록 조회 (모든 사용자 가능)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const typeParam = searchParams.get('type')
    const sortParam = (searchParams.get('sort') || 'recent').toLowerCase()
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Math.max(1, Math.min(parseInt(limitParam, 10) || 0, 100)) : (sortParam === 'likes' ? 10 : 100)

    const normalizedType = typeParam ? normalizeProductType(typeParam) : null

    // 캐시 키 생성
    const cacheKey = generateCacheKey(
      'products',
      normalizedType || 'all',
      `sort:${sortParam}:limit:${limit}`
    )

    // 캐시와 함께 데이터 가져오기
    const result = await withCache(cacheKey, async () => {
      const whereClause: any = {
        isActive: true,
      }

      if (normalizedType) {
        whereClause.type = normalizedType
      }
      const orderBy = sortParam === 'likes'
        ? [{ likeCount: 'desc' as const }, { createdAt: 'desc' as const }]
        : [{ createdAt: 'desc' as const }]

      const products = await prisma.product.findMany({
        where: whereClause,
        orderBy,
        take: limit
      })

      return {
        success: true,
        data: products,
        count: products.length
      }
    }, 300000) // 5분 캐시

    return NextResponse.json(
      result,
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'max-age=300',
          'Vercel-CDN-Cache-Control': 'max-age=300'
        }
      }
    )

  } catch (error: any) {
    console.error('상품 목록 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

