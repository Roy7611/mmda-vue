import { describe, expect, it } from 'vitest'
import { SqlDataType } from '../metaui/datatype'
import { MetaUiField } from '../metaui/metaui_field'
import {
  defaultFieldSearchOptions,
  defineValidation,
  getFieldFilterOps,
  isDefaultFieldSearchOptions,
  MetaUiFieldLogic,
  parseValidatorDescriptors,
  required,
  requiredAny,
  requiredNonZero,
  validateField,
  validateFieldResult,
} from '../index'
import { createMockField, createMockMetaUi } from './helpers/metaui_mock'

const ctx = {
  translate: (key: string, param?: { it?: string }) =>
    `${key}:${param?.it ?? ''}`,
  t: (message: unknown) => {
    if (typeof message === 'string') return message
    if (message && typeof message === 'object' && 'message' in message) {
      const m = message as { message: string; param?: { it?: string } }
      return `${m.message}:${m.param?.it ?? ''}`
    }
    return ''
  },
} as any

function numberField(rules: string, nullable = true) {
  return new MetaUiField({
    fieldIdx: 0,
    fieldName: 'qty',
    displayLabel: '数量',
    dataType: SqlDataType.INT,
    nullable,
    validationRules: rules,
  })
}

describe('FieldSearchOptions', () => {
  it('默认缓存带占位搜索词和无分页', () => {
    const options = defaultFieldSearchOptions()
    expect(options.searching).toBe(false)
    expect(options.selectOptions).toEqual([])
    expect(options.searchParam.searchWord).toBe('__')
    expect(options.pagination.pageSize).toBe(Infinity)
    expect(options.isComposing).toBe(false)
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
})

describe('SqlOperator', () => {
  it('getFieldFilterOps 按字段给出 EntityFilterOperator', () => {
    const field = new MetaUiField({
      fieldIdx: 0,
      fieldName: 'name',
      displayLabel: '名',
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
    })
    const ops = getFieldFilterOps(field)
    expect(ops).toContain('CONTAINS')
    expect(ops).toContain('IS_NULL')
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

  it('parseValidatorDescriptors 解析 Max/Min/Range 且 Pattern 内部分号/括号', () => {
    expect(parseValidatorDescriptors('Max(10);Min(1);Range(0,100)')).toEqual([
      { name: 'Max', args: ['10'] },
      { name: 'Min', args: ['1'] },
      { name: 'Range', args: ['0', '100'] },
    ])
    expect(parseValidatorDescriptors('Pattern(a;b);Min(1)')).toEqual([
      { name: 'Pattern', args: ['a;b'] },
      { name: 'Min', args: ['1'] },
    ])
    expect(parseValidatorDescriptors('Pattern("x)y")')).toEqual([
      { name: 'Pattern', args: ['x)y'] },
    ])
    expect(parseValidatorDescriptors('Pattern((a|b))')).toEqual([
      { name: 'Pattern', args: ['(a|b)'] },
    ])
  })

  it('可空 + Min：空通过，非法值失败', () => {
    const fld = numberField('Min(0)', true)
    expect(validateField(fld, '', {}, ctx)).toBe('')
    expect(validateField(fld, -1, {}, ctx)).toContain('invalid.minValue:0')
  })

  it('必填与 Max 叠加', () => {
    const fld = numberField('Max(10)', false)
    expect(validateField(fld, '', {}, ctx)).toBe('invalid.required')
    expect(validateField(fld, 11, {}, ctx)).toContain('invalid.maxValue:10')
  })

  it('数值字段走规则校验', () => {
    const fld = numberField('Max(10);Min(2);Range(0,5)')
    expect(validateField(fld, 20, {}, ctx)).toContain('invalid.maxValue:10')
    expect(validateField(fld, 1, {}, ctx)).toContain('invalid.minValue:2')
    expect(validateField(fld, 9, {}, ctx)).toContain('invalid.rangeValue:0 到 5')
    expect(validateField(numberField('Max(10)'), 3, {}, ctx)).toBe('')
    expect(validateField(numberField('Max(10)'), 11, {}, ctx)).toContain(
      'invalid.maxValue:10',
    )
    expect(validateField(numberField('Max(10)'), 8, {}, ctx)).toBe('')
  })

  it('可空字段无规则时通过', () => {
    const fld = createMockField({ nullable: true })
    expect(validateField(fld, '', {}, ctx)).toBe('')
  })

  it('必填字段空值返回 required', () => {
    const fld = createMockField({ nullable: false })
    expect(validateField(fld, '', {}, ctx)).toBe('invalid.required')
  })

  it('onValidate 与元数据规则叠加', () => {
    const fld = numberField('Max(10)', true)
    const logic = new MetaUiFieldLogic(fld).onValidate(() => 'custom.invalid')
    const customCtx = { ...ctx, getFieldLogic: () => logic }
    const msg = validateField(fld, 11, {}, customCtx)
    expect(msg).toContain('invalid.maxValue:10')
    expect(msg).toContain('custom.invalid')
  })

  it('onValidate warning 不进入 error 串', () => {
    const fld = createMockField({ nullable: true })
    const logic = new MetaUiFieldLogic(fld).onValidate(
      () => 'warn.msg',
      'warning',
    )
    const customCtx = { ...ctx, getFieldLogic: () => logic }
    expect(validateField(fld, 'x', {}, customCtx)).toBe('')
    expect(validateFieldResult(fld, 'x', {}, customCtx).warnings).toEqual([
      'warn.msg',
    ])
  })

  it('子表字段同样能 parse', () => {
    const metaui = createMockMetaUi([], {
      groupName: 'items',
      fields: [
        createMockField({
          fieldName: 'qty',
          validationRules: 'Min(0)',
          dataType: SqlDataType.INT,
        }),
      ],
    })
    const qty = metaui.groups
      .find((g) => g.many)
      ?.groupUi?.getField('qty')
    expect(qty?.validatorDescriptors).toEqual([{ name: 'Min', args: ['0'] }])
  })

  it('仅有列 maxLength 时不因超长失败', () => {
    const fld = new MetaUiField({
      fieldIdx: 0,
      fieldName: 'code',
      displayLabel: '编码',
      dataType: SqlDataType.VARCHAR,
      nullable: true,
      maxLength: 3,
    })
    expect(validateField(fld, 'abcd', {}, ctx)).toBe('')
  })

  it('defineValidation 按元数据铺出主表域和子表行', () => {
    const name = createMockField({ fieldName: 'whName' })
    const metaui = createMockMetaUi([name], {
      groupName: 'items',
      fields: [createMockField({ fieldName: 'qty' })],
    })
    const empty = defineValidation(metaui)
    expect(empty.whName).toEqual({ touched: false, message: '', warning: '' })
    expect(empty.items).toEqual({})

    const withRows = defineValidation(metaui, {
      items: [{ rowNum: '1' }, { rowNum: '2' }],
    } as any)
    expect((withRows.items as any)['1'].rowNum).toBe('1')
    expect((withRows.items as any)['2'].summary).toEqual({ errorNum: 0 })
  })
})

describe('FieldLogic.refFilter', () => {
  it('叠加 logic SQL，并保留元数据 where', () => {
    const fld = new MetaUiField({
      fieldIdx: 0,
      fieldName: 'whID',
      displayLabel: '仓库',
      dataType: SqlDataType.BIGINT,
      nullable: false,
      selectOptions: 'REF Warehouse(whID,whName) WHERE (siteID=1)',
    })
    const where = fld.reference!.where
    expect(where).toBeTruthy()

    const l1 = new MetaUiFieldLogic(fld)
    const l2 = new MetaUiFieldLogic(fld)
    l1.refFilter(() => 'site=A')
    l1.refFilter(() => 'plant=P1')
    l2.refFilter(() => 'site=B')

    const f1 = l1.buildRefFilter({}, {} as any)
    const f2 = l2.buildRefFilter({}, {} as any)
    expect(f1).toContain(where!)
    expect(f1).toContain('site=A')
    expect(f1).toContain('plant=P1')
    expect(f2).toContain(where!)
    expect(f2).toContain('site=B')
    expect(f2).not.toContain('site=A')

    expect(l1.buildRefSearchFilter({}, {} as any)).toContain('site=A')
    expect(l2.buildRefSearchFilter({}, {} as any)).toContain('site=B')
  })

  it('buildRefSearchFilter 叠加 searchWord 与 @param', () => {
    const fld = new MetaUiField({
      fieldIdx: 0,
      fieldName: 'whID',
      displayLabel: '仓库',
      dataType: SqlDataType.BIGINT,
      nullable: false,
      selectOptions: 'REF Warehouse(whID,whName) WHERE (siteID=@siteID)',
    })
    const logic = new MetaUiFieldLogic(fld)
    const filter = logic.buildRefSearchFilter(
      { siteID: 9 } as any,
      {} as any,
      'abc',
    )
    expect(filter).toContain('siteID=9')
    expect(filter).toContain('whName LIKE %abc%')
  })

  it('无 logic 过滤器时只用元数据 where', () => {
    const fld = new MetaUiField({
      fieldIdx: 0,
      fieldName: 'whID',
      displayLabel: '仓库',
      dataType: SqlDataType.BIGINT,
      nullable: false,
      selectOptions: 'REF Warehouse(whID,whName) WHERE (siteID=1)',
    })
    const logic = new MetaUiFieldLogic(fld)
    expect(logic.buildRefFilter({}, {} as any)).toBe(fld.reference!.where)
  })
})
