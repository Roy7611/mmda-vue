import { isFunction } from '../utils/is'

import { MetaUi } from '../metaui/metaui_group'
import { MetaUiField } from '../metaui/metaui_field'
import type { OnValidateFn } from './logic_functions'
import { Entity } from '../models/entity'
import type { UiContext } from './ui_context'
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
export const requiredAny: OnValidateFn<any[]> = requiredAnyValidate

/**
 * 域校验
 */
export interface UiFieldValidation {
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

export interface UiValidationSummary {
  errorNum: number
  errorMessage?: string
}

/**
 * 校验集，包含所有域和子对象集合的校验结果
 */
export interface UiValidation {
  [index: string]:
    | UiFieldValidation
    | UiValidation
    | Array<UiValidation>
    | UiRowValidation
    | Array<UiRowValidation>
    | UiValidationSummary
    | string
    | number
  summary?: UiValidationSummary
}
export interface UiRowValidation extends UiValidation {
  [index: string]: UiFieldValidation | UiValidationSummary | string | number
  rowNum: string
}

export const defineFieldValidation = (): UiFieldValidation => {
  return {
    touched: false,
    message: '',
    warning: '',
  }
}
export const defineRowValidation = (rowNum: string): UiRowValidation => {
  return {
    rowNum,
    summary: { errorNum: 0 },
  }
}
export const defineGroupValidation = (groupName: string) => {}
/**
 * 定义模型的校验状态
 * @param metaui 元界面
 * @param model 模型
 * @returns 返回一个与`model`一模一样形状的校验模型
 */
export const defineValidation = <E extends Entity>(
  metaui: MetaUi,
  model?: E,
): UiValidation => {
  const validation: UiValidation = {}
  metaui.groups.forEach((g) => {
    if (g.many) {
      if (model && model[g.groupName] && model[g.groupName].length) {
        const children: UiValidation = {}
        for (const item of model[g.groupName]) {
          const rowNum = item.rowNum as string
          children[rowNum] = defineRowValidation(rowNum)
        }
        validation[g.groupName] = children
      } else {
        validation[g.groupName] = {}
      }
    } else {
      g.fields.forEach((f) => {
        validation[f.fieldName] = defineFieldValidation()
      })
    }
  })
  return validation
}

const JOIN = '；'

function translateMsg(
  ctx: UiContext<any> | undefined,
  msg: string | { message: string; param?: any } | undefined,
): string {
  if (!msg) return ''
  if (ctx?.t) {
    const out = ctx.t(msg)
    return out ?? ''
  }
  if (typeof msg === 'string') {
    return ctx?.translate?.(msg) ?? msg
  }
  return ctx?.translate?.(msg.message, msg.param) ?? msg.message
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

export const validateFieldResult = <P = any, E = any>(
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
        ? requiredNonZero(value, model, ctx)
        : required(value, model, ctx)
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
export const validateField = <P = any, E = any>(
  fld: MetaUiField,
  value: P,
  model: E,
  ctx: UiContext<any>,
): string => validateFieldResult(fld, value, model, ctx).errors.join(JOIN)

export const joinValidationMessages = (parts: string[]) => parts.join(JOIN)
