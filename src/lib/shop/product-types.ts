export const PRODUCT_TYPES = [
  {
    id: 'FUND',
    name: 'Fund',
    slug: 'fund',
    description: '펀딩을 통해 제작을 준비하는 상품입니다. 목표 달성 시 자동 결제가 진행됩니다.'
  },
  {
    id: 'PARTNER_UP',
    name: 'Partner up',
    slug: 'partner-up',
    description: '재고를 보유하고 즉시 구매 가능한 협업 상품입니다.'
  }
] as const

export type ProductTypeId = typeof PRODUCT_TYPES[number]['id']

export function isProductType(value: unknown): value is ProductTypeId {
  return typeof value === 'string' && PRODUCT_TYPES.some((type) => type.id === value.toUpperCase())
}

export function normalizeProductType(value: unknown): ProductTypeId | null {
  if (typeof value !== 'string') {
    return null
  }

  const upperValue = value.replace(/[-\s]/g, '_').toUpperCase()
  return PRODUCT_TYPES.find((type) => type.id === upperValue)?.id ?? null
}

export function getProductTypeMeta(type: ProductTypeId) {
  return PRODUCT_TYPES.find((item) => item.id === type)
}


