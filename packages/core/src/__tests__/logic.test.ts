import { describe, expect, it } from 'vitest'
import { SqlDataType } from '../metaui/datatype'
import { MetaUiField } from '../metaui/metaui_field'
import {
  defaultFieldOptions,
  defaultFieldSearchOptions,
  defineValidation,
  isDefaultFieldOptions,
  isDefaultFieldSearchOptions,
  MetaUiFieldLogic,
  required,
  requiredAny,
  requiredNonZero,
  validateField,
  validateNumber,
} from '../index'
import { createMockField, createMockMetaUi } from './helpers/metaui_mock'

const ctx = {
  translate: (key: string, param?: { it?: string }) =>
    `${key}:${param?.it ?? ''}`,
  t: (message: unknown) => {
    if (typeof message === 'string') return message
    if (message && typeof message === 'object' && 'message' in message) {
      return String((message as { message: string }).message)
    }
    return ''
  },
} as any

function numberField(rules: string, nullable = true) {
  const fld = new MetaUiField({
    fieldIdx: 0,
    fieldName: 'qty',
    displayLabel: '数量',
    dataType: SqlDataType.INT,
    nullable,
  })
  fld.validationRulesParseds = MetaUiField.parseValidationRules(rules)
  return fld
}

describe('FieldSearchOptions', () => {
  it('默认缓存带占位搜索词和无分页', () => {
    const options = defaultFieldSearchOptions()
    expect(options.searching).toBe(false)
    expect(options.selectOptions).toEqual([])
    expect(options.searchParam.searchWord).toBe('__')
    expect(options.pagination.pageSize).toBe(Infinity)
    expect(isDefaultFieldSearchOptions(options)).toBe(true)
  })

  it('传入当前选项时作为唯一候选项', () => {
    const option = { id: 'wh-1' }
    const options = defaultFieldSearchOptions(option)
    expect(options.selectOptions).toEqual([option])
  })

  it('搜索词改过后不再视为默认缓存', () => {
    const options = defaultFieldSearchOptions()
    options.searchParam.searchWord = '仓'
    expect(isDefaultFieldSearchOptions(options)).toBe(false)
  })

  it('旧工厂别名仍指向同一实现', () => {
    const option = { id: 1 }
    expect(defaultFieldOptions(option)).toEqual(defaultFieldSearchOptions(option))
    expect(isDefaultFieldOptions).toBe(isDefaultFieldSearchOptions)
  })
})

describe('validation', () => {
  it('required / requiredNonZero / requiredAny', () => {
    expect(required('', {})).toBe('invalid.required')
    expect(required('ok', {})).toBe('')
    expect(requiredNonZero(0, {})).toBe('invalid.required')
    expect(requiredNonZero('0', {})).toBe('invalid.required')
    expect(requiredNonZero(3, {})).toBe('')
    expect(requiredAny([], {})).toBe('invalid.requiredAny')
    expect(requiredAny(['a'], {})).toBe('')
  })

  it('parseValidationRules 解析 Max/Min/Range', () => {
    expect(MetaUiField.parseValidationRules('Max(10);Min(1);Range(0,100)')).toEqual([
      { key: 'max', value: '10' },
      { key: 'min', value: '1' },
      { key: 'range', value: '0,100' },
    ])
  })

  it('validateNumber 按规则拼接消息', () => {
    const rules = MetaUiField.parseValidationRules('Max(10);Min(2);Range(0,5)')
    expect(validateNumber(20, rules, ctx)).toContain('invalid.maxValue:10')
    expect(validateNumber(1, rules, ctx)).toContain('invalid.minValue:2')
    expect(validateNumber(9, rules, ctx)).toContain('invalid.rangeValue:0 到 5')
    expect(validateNumber(3, [{ key: 'max', value: '10' }], ctx)).toBe('')
  })

  it('可空字段无规则时通过', () => {
    const fld = createMockField({ nullable: true, validationRulesParseds: [] })
    expect(validateField(fld, '', {}, ctx)).toBe('')
  })

  it('必填字段空值返回 required', () => {
    const fld = createMockField({ nullable: false, validationRulesParseds: [] })
    expect(validateField(fld, '', {}, ctx)).toBe('invalid.required')
  })

  it('数值字段走规则校验', () => {
    const fld = numberField('Max(10)')
    expect(validateField(fld, 11, {}, ctx)).toContain('invalid.maxValue:10')
    expect(validateField(fld, 8, {}, ctx)).toBe('')
  })

  it('优先使用 FieldLogic.onValidateFn', () => {
    const fld = createMockField({ nullable: false })
    const customCtx = {
      ...ctx,
      getFieldLogic: () => ({
        onValidateFn: () => 'custom.invalid',
      }),
    }
    expect(validateField(fld, 'x', {}, customCtx)).toBe('custom.invalid')
  })

  it('defineValidation 按元数据铺出主表域和子表行', () => {
    const name = createMockField({ fieldName: 'whName' })
    const metaui = createMockMetaUi([name], {
      groupName: 'items',
      fields: [createMockField({ fieldName: 'qty' })],
    })
    const empty = defineValidation(metaui)
    expect(empty.whName).toEqual({ touched: false, message: '' })
    expect(empty.items).toEqual({})

    const withRows = defineValidation(metaui, {
      items: [{ rowNum: '1' }, { rowNum: '2' }],
    } as any)
    expect((withRows.items as any)['1'].rowNum).toBe('1')
    expect((withRows.items as any)['2'].summary).toEqual({ errorNum: 0 })
  })
})

describe('FieldLogic.filterFn', () => {
  it('两个 logic 实例的过滤器互不影响', () => {
    const fld = new MetaUiField({
      fieldIdx: 0,
      fieldName: 'whID',
      displayLabel: '仓库',
      dataType: SqlDataType.BIGINT,
      nullable: false,
      selectOptions: 'REF Warehouse(whID,whName)',
    })
    const l1 = new MetaUiFieldLogic(fld)
    const l2 = new MetaUiFieldLogic(fld)
    l1.refFilter(() => 'site=A')
    l2.refFilter(() => 'site=B')
    expect(l1.filterFn?.({}, {} as any, {})).toBe('site=A')
    expect(l2.filterFn?.({}, {} as any, {})).toBe('site=B')
    expect(
      fld.reference!.buildSearchFilter({}, {
        ctx: { _fieldOptions: {} },
        filterFn: l1.filterFn,
      } as any),
    ).toContain('site=A')
    expect(
      fld.reference!.buildSearchFilter({}, {
        ctx: { _fieldOptions: {} },
        filterFn: l2.filterFn,
      } as any),
    ).toContain('site=B')
  })
})
