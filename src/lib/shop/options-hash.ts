import { createHash } from 'crypto'
import type { NormalizedOptionValueWithName } from './options'

export function createOptionsHash(options: NormalizedOptionValueWithName[]) {
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

