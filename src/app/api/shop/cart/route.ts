import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

type SelectedOptionInput = {
  name: string
  label: string
  priceAdjustment?: number
}

type NormalizedOptionValue = {
  label: string
  priceAdjustment: number
}

type NormalizedProductOption = {
  name: string
  values: NormalizedOptionValue[]
}

export async function GET() {
  try {
    const user = await requireAuth()

    if (!user) {
      return NextResponse.json(
        { error: permissionErrors.notLoggedIn },
        { status: 401 }
      )
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        productId: true,
        quantity: true,
        unitPrice: true,
        selectedOptions: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            brand: true,
            isActive: true
          }
        },
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: cartItems
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('장바구니 조회 오류:', error)
    return NextResponse.json(
      { error: '장바구니를 불러오지 못했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!user) {
      return NextResponse.json(
        { error: permissionErrors.notLoggedIn },
        { status: 401 }
      )
    }

    if (!permissions.canPurchaseProduct(user.role as any)) {
      return NextResponse.json(
        { error: permissionErrors.cannotPurchase },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { productId, quantity = 1, selectedOptions = [] } = body as {
      productId?: string
      quantity?: number
      selectedOptions?: SelectedOptionInput[]
    }

    if (!productId) {
      return NextResponse.json(
        { error: '상품 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    if (typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json(
        { error: '수량은 1 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: '판매 중인 상품이 아닙니다.' },
        { status: 404 }
      )
    }

    if (product.stock <= 0) {
      return NextResponse.json(
        { error: '품절된 상품입니다.' },
        { status: 400 }
      )
    }

    const normalizedOptions = normalizeProductOptions(product.options)
    const { normalizedSelectedOptions, totalAdjustment } = validateSelectedOptions(
      normalizedOptions,
      selectedOptions
    )

    if (normalizedOptions.length > 0 && normalizedSelectedOptions.length !== normalizedOptions.length) {
      return NextResponse.json(
        { error: '모든 옵션을 선택해주세요.' },
        { status: 400 }
      )
    }

    const unitPrice = product.price + totalAdjustment
    if (unitPrice < 0) {
      return NextResponse.json(
        { error: '잘못된 옵션 가격이 계산되었습니다.' },
        { status: 400 }
      )
    }

    const optionsHash = createOptionsHash(normalizedSelectedOptions)

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        productId,
        optionsHash
      }
    })

    if (existingItem) {
      const updatedQuantity = existingItem.quantity + quantity

      if (updatedQuantity > product.stock) {
        return NextResponse.json(
          { error: '재고를 초과하여 담을 수 없습니다.' },
          { status: 400 }
        )
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: updatedQuantity,
          unitPrice,
          selectedOptions: normalizedSelectedOptions
        }
      })

      return NextResponse.json(
        {
          success: true,
          message: '장바구니에 수량이 업데이트되었습니다.',
          data: updatedItem
        },
        { status: 200 }
      )
    }

    if (quantity > product.stock) {
      return NextResponse.json(
        { error: '재고를 초과하여 담을 수 없습니다.' },
        { status: 400 }
      )
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        userId: user.id,
        productId,
        quantity,
        unitPrice,
        selectedOptions: normalizedSelectedOptions,
        optionsHash
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: '장바구니에 담았습니다.',
        data: cartItem
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('장바구니 추가 오류:', error)
    return NextResponse.json(
      { error: '장바구니에 담지 못했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!user) {
      return NextResponse.json(
        { error: permissionErrors.notLoggedIn },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { cartItemIds } = body as { cartItemIds?: string[] }

    if (!Array.isArray(cartItemIds) || cartItemIds.length === 0) {
      return NextResponse.json(
        { error: '삭제할 장바구니 항목을 선택해주세요.' },
        { status: 400 }
      )
    }

    await prisma.cartItem.deleteMany({
      where: {
        id: {
          in: cartItemIds
        },
        userId: user.id
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: '선택한 상품을 삭제했습니다.'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('장바구니 삭제 오류:', error)
    return NextResponse.json(
      { error: '장바구니 항목을 삭제하지 못했습니다.' },
      { status: 500 }
    )
  }
}

function normalizeProductOptions(options: unknown): NormalizedProductOption[] {
  if (!Array.isArray(options)) {
    return []
  }

  return options
    .map((option) => {
      if (!option || typeof option !== 'object') return null

      const name = typeof (option as { name?: string }).name === 'string'
        ? (option as { name: string }).name.trim()
        : ''

      if (!name) return null

      const rawValues = Array.isArray((option as { values?: unknown[] }).values)
        ? ((option as { values: unknown[] }).values)
        : []

      const values = rawValues
        .map((value) => normalizeOptionValue(value))
        .filter((value): value is NormalizedOptionValue => value !== null)

      if (values.length === 0) return null

      return {
        name,
        values
      }
    })
    .filter((option): option is NormalizedProductOption => option !== null)
}

function normalizeOptionValue(value: unknown): NormalizedOptionValue | null {
  if (typeof value === 'string') {
    const label = value.trim()
    if (!label) return null
    return { label, priceAdjustment: 0 }
  }

  if (!value || typeof value !== 'object') {
    return null
  }

  const label = typeof (value as { label?: string }).label === 'string'
    ? (value as { label: string }).label.trim()
    : ''

  if (!label) return null

  const rawPrice = (value as { priceAdjustment?: number | string }).priceAdjustment
  let priceAdjustment = 0

  if (typeof rawPrice === 'number') {
    priceAdjustment = rawPrice
  } else if (typeof rawPrice === 'string') {
    const cleaned = rawPrice.trim().replace(/,/g, '')
    if (cleaned) {
      const parsed = Number(cleaned)
      if (!Number.isNaN(parsed)) {
        priceAdjustment = parsed
      }
    }
  }

  return { label, priceAdjustment }
}

function validateSelectedOptions(
  normalizedOptions: NormalizedProductOption[],
  selectedOptions: SelectedOptionInput[] | undefined
) {
  if (!Array.isArray(selectedOptions)) {
    if (normalizedOptions.length === 0) {
      return {
        normalizedSelectedOptions: [],
        totalAdjustment: 0
      }
    }
    return {
      normalizedSelectedOptions: [],
      totalAdjustment: 0
    }
  }

  const normalizedSelectedOptions: NormalizedOptionValueWithName[] = []
  let totalAdjustment = 0

  normalizedOptions.forEach((option) => {
    const match = selectedOptions.find(
      (selected) => selected.name === option.name
    )

    if (!match || !match.label) {
      return
    }

    const optionValue = option.values.find(
      (value) => value.label === match.label
    )

    if (!optionValue) {
      return
    }

    normalizedSelectedOptions.push({
      name: option.name,
      label: optionValue.label,
      priceAdjustment: optionValue.priceAdjustment
    })
    totalAdjustment += optionValue.priceAdjustment
  })

  return {
    normalizedSelectedOptions,
    totalAdjustment
  }
}

type NormalizedOptionValueWithName = {
  name: string
  label: string
  priceAdjustment: number
}

function createOptionsHash(options: NormalizedOptionValueWithName[]) {
  const payload =
    options.length === 0
      ? 'NO_OPTIONS'
      : JSON.stringify(
          options
            .map((option) => ({
              name: option.name,
              label: option.label,
              priceAdjustment: option.priceAdjustment
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
        )

  return createHash('sha256').update(payload).digest('hex')
}

