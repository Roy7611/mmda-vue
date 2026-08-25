import type { MetaUiFilter } from './metaui_filter'
import { isArray, isString } from './../utils/is'
import { SqlDataType } from './datatype'
import { MetaUiField } from './metaui_field'

/**
 * 搜索比较操作符
 */
export interface SearchOp {
  name: string
  toSQL: (v: any) => string
  parameters?: number
  symbol?: string
  label?: string
}

// const  ALL:         SearchOp = { name:'ALL',          toSQL: (v)=>undefined,         parameters: 0, label: '' }
const EQ: SearchOp = { name: 'EQ', toSQL: v => v, parameters: 1, symbol: '=' }
const NEQ: SearchOp = {
  name: 'NEQ',
  toSQL: v => `NEQ ${v}`,
  parameters: 1,
  symbol: '<>',
}
const GT: SearchOp = {
  name: 'GT',
  toSQL: v => `GT ${v}`,
  parameters: 1,
  symbol: '>',
}
const GTEQ: SearchOp = {
  name: 'GTEQ',
  toSQL: v => `GTEQ ${v}`,
  parameters: 1,
  symbol: '>=',
}
const LT: SearchOp = {
  name: 'LT',
  toSQL: v => `LT ${v}`,
  parameters: 1,
  symbol: '<',
}
const LTEQ: SearchOp = {
  name: 'LTEQ',
  toSQL: v => `LTEQ ${v}`,
  parameters: 1,
  symbol: '<=',
}
const STARTS_WITH: SearchOp = {
  name: 'STARTS_WITH',
  toSQL: v => `LIKE ${v}%`,
  parameters: 1,
  label: 'Starts with',
}
const ENDS_WITH: SearchOp = {
  name: 'ENDS_WITH',
  toSQL: v => `LIKE %${v}`,
  parameters: 1,
  label: 'Ends with',
}
const CONTAINS: SearchOp = {
  name: 'CONTAINS',
  toSQL: v => `LIKE %${v}%`,
  parameters: 1,
  label: 'Contains',
}
const NOT_CONTAINS: SearchOp = {
  name: 'NOT_CONTAINS',
  toSQL: v => `NOT LIKE %${v}%`,
  parameters: 1,
  label: 'Not contains',
}
const IS_NULL: SearchOp = {
  name: 'IS_NULL',
  toSQL: v => 'IS NULL',
  parameters: 0,
  label: 'Nil',
}
const IS_NOT_NULL: SearchOp = {
  name: 'IS_NOT_NULL',
  toSQL: v => 'IS NOT NULL',
  parameters: 0,
  label: 'Not nil',
}
const IS_ALL: SearchOp = {
  name: 'IS_ALL',
  toSQL: v => '',
  parameters: 0,
  label: 'All',
}
const IS_TRUE: SearchOp = {
  name: 'IS_TRUE',
  toSQL: v => '1',
  parameters: 0,
  label: 'Yes',
}
const IS_FALSE: SearchOp = {
  name: 'IS_FALSE',
  toSQL: v => '0',
  parameters: 0,
  label: 'No',
}
const IN: SearchOp = {
  name: 'IN',
  toSQL: (v: any[] | string) => `IN ${isString(v) ? v : v.join(',')}`,
  parameters: 3,
  label: 'In',
}
const NOT_IN: SearchOp = {
  name: 'NOT_IN',
  toSQL: (v: any[] | string) => `NOT IN ${isString(v) ? v : v.join(',')}`,
  parameters: 3,
  label: 'Not in',
}
const BETWEEN: SearchOp = {
  name: 'BETWEEN',
  toSQL: (v: any[]) => `BETWEEN ${v[0]} AND ${v[1]}`,
  parameters: 2,
  label: 'Between',
}

export const defaultSearchOps = {
  NullableSearchOps: [IS_NULL, IS_NOT_NULL],
  BoolFieldSearchOps: [IS_ALL, IS_TRUE, IS_FALSE],
  StringFieldSearchOps: [
    STARTS_WITH,
    ENDS_WITH,
    CONTAINS,
    NOT_CONTAINS,
    EQ,
    NEQ,
    IN,
    NOT_IN,
  ],
  NumberFieldSearchOps: [EQ, NEQ, GT, GTEQ, LT, LTEQ, BETWEEN],
  DateFieldSearchOps: [BETWEEN, EQ, NEQ, GT, GTEQ, LT, LTEQ],
  EnumFieldSearchOps: [IN, NOT_IN, EQ, NEQ],
  RefFieldSearchOps: [EQ, NEQ],
}

export const SearchOpNameList = [
  'EQ', 'NEQ', 'GT', 'GTEQ', 'LT', 'LTEQ',
  'STARTS_WITH', 'ENDS_WITH', 'CONTAINS', 'NOT_CONTAINS',
  'IS_NULL', 'IS_NOT_NULL', 'IS_ALL', 'IS_TRUE', 'IS_FALSE',
  'IN', 'NOT_IN', 'BETWEEN'
] as const

export type SearchOpName = typeof SearchOpNameList[number]

/**
 * 根据操作符名称获取搜索操作符
 * @param op - 操作符名称，可选值:
 *             'EQ' | 'NEQ' | 'GT' | 'GTEQ' | 'LT' | 'LTEQ' |
 *             'STARTS_WITH' | 'ENDS_WITH' | 'CONTAINS' | 'NOT_CONTAINS' |
 *             'IS_NULL' | 'IS_NOT_NULL' | 'IS_ALL' | 'IS_TRUE' | 'IS_FALSE' |
 *             'IN' | 'NOT_IN' | 'BETWEEN'
 * @returns 对应的 SearchOp 对象，如果未找到则返回 undefined
 * @example
 * ```typescript
 * const op = getSearchOp('EQ');
 * const op2 = getSearchOp('CONTAINS');
 * ```
 */
export const getSearchOp = (op: SearchOpName): SearchOp | undefined => {
  const searchOps = [].concat(...Object.values(defaultSearchOps)) as SearchOp[]
  return searchOps.find(s => s.name === op)
}

/**
 * 获取元域可选搜索操作符，用于构建搜索视图
 * @param field 元域
 * @returns
 */
export const getFieldSearchOps = (field: MetaUiField) => {
  let ops: SearchOp[] = []
  if (SqlDataType.isBool(field.dataType))
    ops = ops.concat(defaultSearchOps.BoolFieldSearchOps)
  else if (field.reference) {
    if (field.reference.isEnum)
      ops = ops.concat(defaultSearchOps.EnumFieldSearchOps)
    else ops = ops.concat(defaultSearchOps.RefFieldSearchOps)
  } else if (SqlDataType.isDate(field.dataType))
    ops = ops.concat(defaultSearchOps.DateFieldSearchOps)
  else if (SqlDataType.isNum(field.dataType))
    ops = ops.concat(defaultSearchOps.NumberFieldSearchOps)
  else ops = ops.concat(defaultSearchOps.StringFieldSearchOps)
  if (field.nullable) ops = ops.concat(defaultSearchOps.NullableSearchOps)
  return ops
}

type SearchLogicOp = 'AND' | 'OR'
export function sqlAnd(a?: string, b?: string) {
  if (!a) return b
  else if (!b) return a
  return `(${a}) AND (${b})`
}
export function sqlOr(a?: string, b?: string) {
  if (!a) return b
  else if (!b) return a
  return `(${a}) OR (${b})`
}

/**
 * 搜索域
 *
 * @remarks
 *
 * 包含元界面域、可用操作符`SearchOp`以及值。`fixed`表示是否固定在列表页面头部
 */
// export class MetaUiSearchField {
//   readonly availableOps: SearchOp[];
//   readonly defaultOp: SearchOp;
//   constructor(public readonly field: MetaUiField, public readonly fixed:boolean = false){
//     this.availableOps = getFieldSearchOps(field);
//     this.defaultOp = this.availableOps[0];
//   }
//   get fieldName(){ return this.field.fieldName }
//   get displayLabel(){ return this.field.displayLabel }
// }

/**
 * 元搜索
 *
 * @remarks
 *
 * 用于构建搜索界面，其中元界面域成员在加入时应设为非响应数据
 */
// export class MetaUiSearch {
//   fixedFilter?: MetaUiFilter;
//   criteria: MetaUiSearchField[];
//   constructor(public readonly filters: MetaUiFilter[]){
//     this.criteria = [];
//     this.fixedFilter = filters ? filters.find(f=>f.fixed) : undefined;
//   }

//   addField(fld: MetaUiField){
//     this.criteria.push(new MetaUiSearchField(fld));
//   }
//   removeField(fldName: string){
//     const index = this.criteria.findIndex(fld=>fld.fieldName == fldName)
//     if(index!=-1) return this.criteria.splice(index,1)
//   }
//   clearFields(){
//     this.criteria=[];
//   }
//   computeDisplayLabel(logicSep: string){
//     let labels: string[] = [];
//     this.criteria.forEach(fld=>{
//       const fldValue =  isArray(fld.value)
//         ? fld.value.join(',')
//         : fld.value
//       labels.push(`(${fld.displayLabel} ${fld.op.symbol} ${fldValue})`)
//     })
//     return labels.join(logicSep);
//   }
//   toQueryParams(){
//     const queryParams:Record<string,any>={};
//     this.criteria
//       .filter(fld=>fld.value)
//       .forEach(fld=>queryParams[fld.fieldName] = fld.op.toSQL(fld.value));
//     return queryParams;
//   }
// }
