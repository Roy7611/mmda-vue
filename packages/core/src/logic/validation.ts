import { isFunction, isNullObject } from '../utils/is';

import { MetaUi } from '../metaui/metaui_group';
import { MetaUiField, type OnValidateFn, type ValidationRulesParsed } from "../metaui/metaui_field";
import { Entity } from '../models/entity';
import { SqlDataType } from "../metaui/datatype";
import type { UiContext } from './ui_context';

export const required: OnValidateFn = (value: any, model: any) => value === '' || value === null || value === undefined || isNullObject(value) ? 'invalid.required' : '';
export const requiredNonZero: OnValidateFn = (val: any, model: any) => {
  if (val === '0' || (+val) === 0) return 'invalid.required'
  return required(val, model);
}
export const requiredAny: OnValidateFn = (value: any[], model: any) => value && value.length > 0 ? '' : 'invalid.requiredAny';
/**
 * 域校验
 */
export interface UiFieldValidation {
  /**
   * 是否已经进入过
   */
  touched: boolean;
  /**
   * 非法消息
   */
  message?: string | undefined;
}

export interface UiValidationSummary {
  errorNum: number;
  errorMessage?: string;
}

/**
 * 校验集，包含所有域和子对象集合的校验结果
 */
export interface UiValidation {
  [index: string]: UiFieldValidation | UiValidation | Array<UiValidation> | UiRowValidation | Array<UiRowValidation> | UiValidationSummary | string | number;
  summary?: UiValidationSummary
}
export interface UiRowValidation extends UiValidation {
  [index: string]: UiFieldValidation | UiValidationSummary | string | number;
  rowNum: string;
}

export const defineFieldValidation = (): UiFieldValidation => {
  return {
    touched: false,
    message: ''
  }
}
export const defineRowValidation = (rowNum: string): UiRowValidation => {
  return {
    rowNum,
    summary: { errorNum: 0 },
  }
}
export const defineGroupValidation = (groupName: string) => {

}
/**
 * 定义模型的校验状态
 * @param metaui 元界面
 * @param model 模型
 * @returns 返回一个与`model`一模一样形状的校验模型
 */
export const defineValidation = <E extends Entity>(metaui: MetaUi, model?: E): UiValidation => {
  const validation: UiValidation = {}
  metaui.groups.forEach(g => {
    if (g.many) {
      if (model && model[g.groupName] && model[g.groupName].length) {
        const children: UiValidation = {}
        for (const item of model[g.groupName]) {
          const rowNum = item.rowNum as string;
          children[rowNum] = defineRowValidation(rowNum);
        }
        validation[g.groupName] = children;
      }
      else {
        validation[g.groupName] = {}
      }
    }
    else {
      g.fields.forEach(f => {
        validation[f.fieldName] = defineFieldValidation()
      })
    }
  })
  return validation;
}

export const validateNumber = (value: number, rules: ValidationRulesParsed[], ctx: UiContext): string => {
  let message = '';
  rules.forEach(rule => {
    switch (rule.key) {
      case 'max':
        if (value > parseInt(rule.value)) {
          message += ctx.translate('invalid.maxValue', { it: rule.value });
        }
        break;
      case 'min':
        if (value < parseInt(rule.value)) {
          message += ctx.translate('invalid.minValue', { it: rule.value });
        }
        break;
      case 'range':
        const range = rule.value.split(',');
        if (value < parseInt(range[0]) || value > parseInt(range[1])) {
          message += ctx.translate('invalid.rangeValue', { it: `${range[0]} 到 ${range[1]}` });
        }
        break;

      default:
        break;
    }
  })

  return message;
};

export const validateFieldByRules = <P, E>(fld: MetaUiField, value: P, model: E, ctx: UiContext): string => {
  const rules = fld.validationRulesParseds;
  if (SqlDataType.isNum(fld.dataType) && rules?.length) {
    return validateNumber(value as number, rules, ctx);
  }
  return '';
}

/**
 * 校验域的值是否合法
 * @param fld 元域
 * @param value 当前值
 * @param model 模型上下文
 * @returns 返回非法消息，客户端可通过`t`函数本地化翻译
 */
export const validateField = <P = any, E = any>(fld: MetaUiField, value: P, model: E, ctx: UiContext<any>): string => {
  const onValidateFn = ctx.getFieldLogic?.(fld)?.onValidateFn
  if (isFunction(onValidateFn)) {
    return ctx.t(onValidateFn(value, model, ctx))
  }
  if (fld.validationRulesParseds?.length) {
    return validateFieldByRules<P, E>(fld, value, model, ctx)
  }
  if (fld.nullable) return ''
  return ctx.t(
    (fld.reference && !fld.reference.isEnum)
      ? requiredNonZero(value, model)
      : required(value, model),
  )
}
