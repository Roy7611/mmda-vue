import { isFunction } from '../utils/is'

import { MetaUi, type MetaUiGroup } from '../metaui/metaui_group'
import { MetaUiField, type Translatable } from '../metaui/metaui_field'
import type { OnValidateFn } from './logic_functions'
import { Entity } from '../models/entity'
import type { UiContext } from '../ui/context'
import {
  customValidator,
  descriptorsToValidators,
  requiredAnyValidate,
  requiredNonZeroValidate,
  requiredValidate,
  type FieldValidationResult,
  type FieldValidator,
} from './validators'

export type { FieldValidationResult, FieldValidator } from './validators'

export const required: OnValidateFn = requiredValidate
export const requiredNonZero: OnValidateFn = requiredNonZeroValidate
export const requiredAny: OnValidateFn<unknown[]> = requiredAnyValidate

/**
 * 域校验
 */
export interface FieldValidation {
  /**
   * 是否已经进入过
   */
  touched: boolean
  /**
   * 非法消息
   */
  message?: string | undefined
  warning?: string | undefined
}

export interface ValidationSummary {
  errorNum: number
  errorMessage?: string
}

/**
 * 校验集，包含所有域和子对象集合的校验结果
 */
export interface Validation {
  [index: string]:
    | FieldValidation
    | Validation
    | Array<Validation>
    | RowValidation
    | Array<RowValidation>
    | ValidationSummary
    | undefined
  summary?: ValidationSummary
}

export interface RowValidation {
  rowNum: string
  summary?: ValidationSummary
}

export const defineFieldValidation = (): FieldValidation => {
  return {
    touched: false,
    message: '',
    warning: '',
  }
}
export const defineRowValidation = (rowNum: string): RowValidation => {
  return {
    rowNum,
    summary: { errorNum: 0 },
  }
}
/**
 * 定义子表分组校验状态。
 * - `readOnly` 子表不生成校验节点。
 * - `requiredAny` 且没有行时，写入 `summary.errorMessage`。
 */
export const defineGroupValidation = (
  group: MetaUiGroup,
  rows: Entity[] = [],
): Validation => {
  const state: Validation = {}
  if (group.readOnly) return state

  for (const row of rows) {
    const rowNum = String(row.rowNum ?? '')
    state[rowNum] = defineRowValidation(rowNum)
  }

  if (group.requiredAny && rows.length === 0) {
    state.summary = { errorNum: 1, errorMessage: 'invalid.requiredAny' }
  }
  return state
}
/**
 * 定义模型的校验状态
 * @param metaUi 元界面
 * @param model 模型
 * @returns 返回一个与`model`一模一样形状的校验模型
 */
export const defineValidation = <E extends Entity>(
  metaUi: MetaUi,
  model?: E,
): Validation => {
  const validation: Validation = {}
  metaUi.groups.forEach((g) => {
    if (g.many) {
      validation[g.groupName] = defineGroupValidation(
        g,
        model?.[g.groupName] ?? [],
      )
    } else {
      (g.fields ?? []).forEach((f) => {
        validation[f.fieldName] = defineFieldValidation()
      })
    }
  })
  return validation
}

const JOIN = '；'

function translateMsg(
  ctx: UiContext | undefined,
  msg: string | Translatable | undefined,
): string {
  if (!msg) return ''
  if (ctx?.t) {
    const out = ctx.t(msg)
    return out ?? ''
  }
  if (typeof msg === 'string') {
    return ctx?.translate?.(msg) ?? msg
  }
  return (
    ctx?.translate?.(msg.message, msg.param as Record<string, unknown>) ??
    msg.message
  )
}

function isFieldRequired(
  fld: MetaUiField,
  model: unknown,
  ctx: UiContext<any> | undefined,
): boolean {
  if (ctx?.isFieldRequired) return ctx.isFieldRequired(fld)
  const requiredFn = ctx?.getFieldLogic?.(fld)?.requiredFn
  if (requiredFn) return !!requiredFn(model, ctx)
  return !fld.nullable
}

function collectValidators(
  fld: MetaUiField,
  ctx: UiContext<any> | undefined,
): FieldValidator[] {
  const logic = ctx?.getFieldLogic?.(fld)
  const list = [
    ...(logic?.validators ?? descriptorsToValidators(fld.validatorDescriptors)),
  ]
  if (isFunction(logic?.onValidateFn) && !list.some((v) => v.validate === logic.onValidateFn)) {
    list.push(customValidator(logic.onValidateFn, 'error'))
  }
  return list
}

export const validateFieldResult = <P = unknown, E = unknown>(
  fld: MetaUiField,
  value: P,
  model: E,
  ctx: UiContext<any>,
): FieldValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  if (isFieldRequired(fld, model, ctx)) {
    const req =
      fld.reference && !fld.reference.isEnum
        ? requiredNonZero(value, model as Entity, ctx)
        : required(value, model as Entity, ctx)
    const msg = translateMsg(ctx, req)
    if (msg) errors.push(msg)
  }
  for (const validator of collectValidators(fld, ctx)) {
    const msg = translateMsg(ctx, validator.validate(value, model, ctx))
    if (!msg) continue
    if (validator.severity === 'warning') warnings.push(msg)
    else errors.push(msg)
  }
  return { errors, warnings }
}

/**
 * 校验域的值是否合法
 * @returns 返回非法消息（仅 error），客户端可通过`t`函数本地化翻译
 */
export const validateField = <P = unknown, E = unknown>(
  fld: MetaUiField,
  value: P,
  model: E,
  ctx: UiContext<any>,
): string => validateFieldResult(fld, value, model, ctx).errors.join(JOIN)

export const joinValidationMessages = (parts: string[]) => parts.join(JOIN)
