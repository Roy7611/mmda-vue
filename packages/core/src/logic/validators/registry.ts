import type { ValidatorDescriptor } from '../../metaui/validator_parse'
import { collectionFactories } from './collection'
import { datetimeFactories } from './datetime'
import { numberFactories } from './number'
import { stringFactories } from './string'
import type { FieldValidator, ValidatorFn, ValidatorSeverity } from './types'

const factories: Record<string, (args: string[]) => FieldValidator> = {
  ...numberFactories,
  ...datetimeFactories,
  ...stringFactories,
  ...collectionFactories,
}

const factoriesByLower = new Map(
  Object.keys(factories).map((name) => [name.toLowerCase(), factories[name]]),
)

export function lookupValidatorFactory(name: string) {
  return factories[name] ?? factoriesByLower.get(name.toLowerCase())
}

export function descriptorsToValidators(
  descriptors: ValidatorDescriptor[] | undefined,
): FieldValidator[] {
  if (!descriptors?.length) return []
  const out: FieldValidator[] = []
  for (const d of descriptors) {
    const factory = lookupValidatorFactory(d.name)
    if (!factory) {
      console.warn(`Unknown validator: ${d.name}`)
      continue
    }
    out.push(factory(d.args))
  }
  return out
}

export function customValidator(
  fn: ValidatorFn,
  severity: ValidatorSeverity = 'error',
): FieldValidator {
  return {
    name: 'Custom',
    severity,
    validate: fn,
  }
}
