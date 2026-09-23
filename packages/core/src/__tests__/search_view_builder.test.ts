import { describe, expect, it } from 'vitest'
import { SqlDataType } from '../metaui/datatype'
import { MetaUiFilterType } from '../metaui/metaui_filter'
import { MetaUiField } from '../metaui/metaui_field'
import { MetaUi } from '../metaui/metaui_group'
import { FieldFilter, type FilterModel } from '../models/entity_search'
import type { UiContext } from '../ui/context'
import type { UiFactory } from '../ui/factory'
import type { UiFieldFactory } from '../ui/field_factory'
import type { UiLayout, UiNodeProps } from '../ui/layout'
import type { UiRenderer } from '../ui/renderer'
import { AbstractUiBuilder } from '../ui/builder_base'

/** 用字符串拼节点，断言「默认实现拼了什么」。 */
type N = string

function field(fieldName: string, patch: Partial<MetaUiField> = {}) {
  return new MetaUiField({
    fieldName,
    displayLabel: `L:${fieldName}`,
    fieldIdx: 0,
    dataType: SqlDataType.NVARCHAR,
    nullable: true,
    listed: true,
    ...patch,
  })
}

function builderOf(overrides: Partial<UiFactory<N>> = {}) {
  const renderer: UiRenderer<N, UiNodeProps> = {
    render: (tag, props, children) => {
      const attrs = Object.entries(props?.attributes ?? {})
        .filter(([key]) => key.startsWith('data-'))
        .map(([key, value]) => ` ${key}="${String(value)}"`)
        .join('')
      return `<${tag}${props?.class ? ` class="${props.class}"` : ''}${attrs}>${(
        children ?? []
      ).join('')}</${tag}>`
    },
  }
  const factory = {
    dropDownList: (props: any) =>
      `<ddl value="${props.value ?? ''}" options="${(props.options ?? [])
        .map((item: any) => item.value)
        .join('|')}">`,
    textSpan: (props: any) => `<span>${props.text}</span>`,
    textInput: (props: any) => `<input type="${props.type ?? 'Text'}" value="${props.value ?? ''}">`,
    numberInput: () => '<numberinput>',
    datePicker: () => '<datepicker>',
    multiSelect: (props: any) =>
      `<multiselect values="${(props.value ?? []).join(',')}">`,
    button: (props: any) => `<button>${props.label ?? ''}</button>`,
    buttonGroup: (_props: any, slots: any) =>
      `<buttonGroup>${slots.default().join('')}</buttonGroup>`,
    actionButton: (action: any) => `<icon name="${action.name}">`,
    ...overrides,
  } as unknown as UiFactory<N>
  const layout = {
    column: (children: N[]) => `<column>${children.join('')}</column>`,
  } as unknown as UiLayout<N>
  class TestBuilder extends AbstractUiBuilder<N> {
    constructor() {
      super(factory, {} as UiFieldFactory<N>, layout, renderer)
    }
  }
  return new TestBuilder()
}

/** 会话假体：只带 buildSearchView / buildSearchField 会碰的成员。 */
function contextOf(options: {
  fields: MetaUiField[]
  rows?: Array<{ fieldName: string; filter?: FilterModel[string] }>
  searchWord?: string
}) {
  const metaUi = new MetaUi({
    objName: 'Test',
    displayLabel: '测试',
    groups: [
      {
        groupName: 'a1',
        groupLabel: '主表组',
        many: false,
        fields: options.fields,
      },
    ],
  })
  return {
    metaUi,
    searchRows: options.rows ?? [],
    searchParam: {
      pager: { pageNo: 1, pageSize: 20 },
      searchWord: options.searchWord ?? '',
    },
    t: (message: string) => `t:${message}`,
  } as unknown as UiContext
}

const enumField = () =>
  field('status', {
    dataType: SqlDataType.INT,
    filterTypes: MetaUiFilterType.SET,
    selectOptions: 'ENUM Status(1,New|2,Done)',
  })
const textField = () => field('code', { filterTypes: MetaUiFilterType.TEXT })
const dateField = () =>
  field('createdAt', {
    dataType: SqlDataType.TIMESTAMP,
    filterTypes: MetaUiFilterType.DATE,
  })

describe('core 默认搜索页拼屏（buildSearchView）', () => {
  it('行来自 context.searchRows：列布局 + 动作行 + 添加字段候选', () => {
    const context = contextOf({
      fields: [textField(), enumField(), field('remark')],
      rows: [
        { fieldName: 'code', filter: FieldFilter.eq('A', 'text') },
        { fieldName: 'status' },
      ],
    })
    const html = builderOf().buildSearchView(context, { placement: 'drawer' })
    expect(html).toContain('data-field="code"')
    expect(html).toContain('data-field="status"')
    // 没在列上的字段不进行；它是「添加字段」候选
    expect(html).not.toContain('data-field="remark"')
    expect(html).toContain('options="remark"')
    expect(html).toContain('<column>')
    expect(html).toContain('t:action.reset')
    expect(html).toContain('t:action.confirm')
  })

  it('抽屉承载不画模糊搜框，页面承载画；显式开关生效', () => {
    const context = contextOf({ fields: [textField()], rows: [{ fieldName: 'code' }] })
    const drawer = builderOf().buildSearchView(context, { placement: 'drawer' })
    expect(drawer).not.toContain('type="Search"')
    expect(drawer).toContain('data-placement="drawer"')
    const page = builderOf().buildSearchView(context, { placement: 'page' })
    expect(page).toContain('type="Search"')
    expect(
      builderOf().buildSearchView(context, { placement: 'page', showSearchWord: false }),
    ).not.toContain('type="Search"')
  })

  it('改成对字段写回：onFilterChange 里落行状态', () => {
    const context = contextOf({ fields: [textField()], rows: [{ fieldName: 'code' }] })
    const builderOfAny = builderOf()
    let captured: any
    const withCapture = builderOf({
      dropDownList: (props: any) => {
        captured = props
        return `<ddl options="${(props.options ?? []).map((i: any) => i.value).join('|')}">`
      },
    })
    withCapture.buildSearchView(context, { placement: 'drawer' })
    // 文本列算子表没有 IN / BETWEEN
    expect(captured.options.map((item: any) => item.value)).toEqual([
      'CONTAINS',
      'NOT_CONTAINS',
      'EQ',
      'NEQ',
      'STARTS_WITH',
      'ENDS_WITH',
      'IS_BLANK',
      'IS_NOT_BLANK',
    ])
    expect(captured.options[0].label).toBe('t:matcher.CONTAINS')
    void builderOfAny
  })

  it('行内改算子 / 改值都按叶子回写（BETWEEN 双值、IN 多值、无值）', () => {
    const context = contextOf({ fields: [dateField(), enumField()] })
    const builder = builderOf()
    let next: unknown = 'unset'

    // 算子下拉：捕获后手动触发 onChange
    let captured: any
    const capturing = builderOf({
      dropDownList: (props: any) => {
        captured = props
        return '<ddl>'
      },
    })
    capturing.buildSearchField(dateField(), context, {
      filter: FieldFilter.eq('2026-01-01', 'date'),
      onFilterChange: (value) => {
        next = value
      },
    })
    captured.onChange('BETWEEN')
    expect(next).toEqual({
      filterType: 'date',
      operator: 'BETWEEN',
      value: '2026-01-01',
      valueTo: undefined,
    })

    // BETWEEN → 两个输入
    const between = builder.buildSearchField(dateField(), context, {
      filter: { filterType: 'date', operator: 'BETWEEN', value: '2026-01-01' },
    })
    expect((between.match(/<datepicker>/g) ?? []).length).toBe(2)

    // IN → 多选，带当前值
    const setRow = builder.buildSearchField(enumField(), context, {
      filter: FieldFilter.in([1, 2]),
    })
    expect(setRow).toContain('<multiselect values="1,2">')

    // 无值算子 → 不给值控件，只画算子文案
    const blank = builder.buildSearchField(dateField(), context, {
      filter: { filterType: 'date', operator: 'IS_NULL' },
    })
    expect(blank).not.toContain('<datepicker>')
    expect(blank).toContain('<ddl value="IS_NULL"')
  })

  it('WITHIN 给周期下拉；行尾清除按钮在', () => {
    const context = contextOf({ fields: [dateField()] })
    const builder = builderOf({
      actionButton: (action: any) => `<icon name="${action.name}">`,
    })
    const row = builder.buildSearchField(dateField(), context, {
      filter: { filterType: 'date', operator: 'WITHIN', value: 'THIS_MONTH' },
    })
    expect(row).toContain('value="THIS_MONTH"')
    expect(row).toContain('<icon name="clear">')
    expect(row).toContain('<ddl value="WITHIN"')
  })
})
