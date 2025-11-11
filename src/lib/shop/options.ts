export type SelectedOptionInput = {
  name: string
  label: string
  priceAdjustment?: number
}

export type NormalizedOptionValue = {
  label: string
  priceAdjustment: number
}

export type NormalizedProductOption = {
  name: string
  values: NormalizedOptionValue[]
}

export type NormalizedOptionValueWithName = {
  name: string
  label: string
  priceAdjustment: number
}

type RawOption = {
  name?: unknown
  values?: unknown
}

type RawOptionValue = unknown

export function normalizeProductOptions(options: unknown): NormalizedProductOption[] {
  if (!Array.isArray(options)) {
    return []
  }

  return options
    .map((option) => normalizeProductOption(option))
    .filter((option): option is NormalizedProductOption => option !== null)
}

export function validateSelectedOptions(
  normalizedOptions: NormalizedProductOption[],
  selectedOptions: SelectedOptionInput[] | undefined
) {
  if (!Array.isArray(selectedOptions)) {
    return {
      normalizedSelectedOptions: [],
      totalAdjustment: 0
    }
  }

  const normalizedSelectedOptions: NormalizedOptionValueWithName[] = []
  let totalAdjustment = 0

  normalizedOptions.forEach((option) => {
    const match = selectedOptions.find((selected) => selected.name === option.name)
    if (!match || !match.label) {
      return
    }

    const optionValue = option.values.find((value) => value.label === match.label)
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

export function calculateUnitPrice(
  basePrice: number,
  selectedOptions: NormalizedOptionValueWithName[]
) {
  const adjustment = selectedOptions.reduce((sum, option) => sum + option.priceAdjustment, 0)
  return basePrice + adjustment
}

function normalizeProductOption(option: RawOption): NormalizedProductOption | null {
  if (!option || typeof option !== 'object') return null

  const name =
    typeof option.name === 'string'
      ? option.name.trim()
      : ''

  if (!name) return null

  const rawValues = Array.isArray(option.values) ? option.values : []
  const values = rawValues
    .map((value) => normalizeOptionValue(value))
    .filter((value): value is NormalizedOptionValue => value !== null)

  if (values.length === 0) return null

  return {
    name,
    values
  }
}

function normalizeOptionValue(value: RawOptionValue): NormalizedOptionValue | null {
  if (typeof value === 'string') {
    const label = value.trim()
    if (!label) return null
    return {
      label,
      priceAdjustment: 0
    }
  }

  if (!value || typeof value !== 'object') {
    return null
  }

  const label =
    typeof (value as { label?: unknown }).label === 'string'
      ? ((value as { label: string }).label).trim()
      : ''

  if (!label) return null

  const rawPrice = (value as { priceAdjustment?: unknown }).priceAdjustment
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

  return {
    label,
    priceAdjustment
  }
}

