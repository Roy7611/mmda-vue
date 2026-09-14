import type { ValidatorDescriptor } from '../../metaui/validator_parse'
import { collectionValidators } from './collection'
import { datetimeValidators } from './datetime'
import { numberValidators } from './number'
import { stringValidators } from './string'
import type { FieldValidator, ValidatorFn, ValidatorSeverity } from './types'

const validators: Record<string, (args: string[]) => FieldValidator> = {
  ...numberValidators,
  ...datetimeValidators,
  ...stringValidators,
  ...collectionValidators,
}

const validatorsByLower = new Map(
  Object.keys(validators).map((name) => [name.toLowerCase(), validators[name]]),
)

export function lookupValidatorFactory(name: string) {
  return validators[name] ?? validatorsByLower.get(name.toLowerCase())
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
