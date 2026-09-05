import type { Translatable } from '../../metaui/metaui_field'
import type { UiContext } from '../ui_context'

export type ValidatorSeverity = 'error' | 'warning'

export type ValidatorFn = (
  value: unknown,
  model: unknown,
  ctx?: UiContext,
) => string | Translatable | undefined

export interface FieldValidator {
  name: string
  severity: ValidatorSeverity
  validate: ValidatorFn
}

export interface FieldValidationResult {
  errors: string[]
  warnings: string[]
}
