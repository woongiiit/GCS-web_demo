import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, getCurrentUser } from '@/lib/auth'
import { permissions, permissionErrors } from '@/lib/permissions'
import { invalidateCache } from '@/lib/cache'

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
        category: true,
        productDetails: true,
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 같은 카테고리의 관련 상품 조회 (최대 4개)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
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
          product,
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
      categoryId,
      brand,
      options,
      images,
      isActive,
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

    if (typeof categoryId === 'string' && categoryId !== existingProduct.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { error: '존재하지 않는 카테고리입니다.' },
          { status: 404 }
        )
      }

      updateData.categoryId = categoryId
    }

    if (brand !== undefined) {
      updateData.brand = typeof brand === 'string' && brand.trim().length > 0 ? brand.trim() : null
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
        category: true,
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

