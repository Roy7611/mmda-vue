/**
 * 组拼屏（`buildFieldGroup` / `buildSubGroup`）的 React 侧冒烟测试：
 * 证明字段组能拼出「组壳 + 字段行 + 前后插片」，且与 vui 同一套 core 布局 / 装箱工具。
 */
import { describe, expect, it } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { render } from '@testing-library/react'
import {
  MetaUiGroupLogic,
  type Entity,
  type MetaUi,
  type MetaUiField,
  type MetaUiGroup,
  type UiCardProps,
  type UiCardSlots,
  type UiContext,
  type UiDialogAction,
  type UiGridProps,
} from '@mmda/core'
import { RuiBuilder } from '../ui/builder'
import { RuiFactory } from '../ui/factory'
import { RuiFieldFactory } from '../ui/field_factory'
import { RuiLayout } from '../ui/layout'
import { RuiContext } from '../contexts/react_ui_context'

function stubField(name: string): MetaUiField {
  return {
    fieldName: name,
    displayLabel: name,
    dataType: 'nvarchar',
    nullable: true,
  } as unknown as MetaUiField
}

const baseFields = [stubField('code'), stubField('name')]

function stubMetaUi(): MetaUi {
  const group = {
    groupName: 'base',
    groupLabel: '基本信息',
    many: false,
    fields: baseFields,
    isPrimary: () => true,
    isSecondary: () => false,
    isTails: () => false,
  } as unknown as MetaUiGroup
  return {
    groups: [group],
    getGroup: (name: string) => (name === 'base' ? group : undefined),
    getField: (name: string) =>
      baseFields.find((field) => field.fieldName === name),
    displayLabel: 'Test',
    primaryKey: 'id',
    locale: 'zh',
    objName: 'Test',
  } as unknown as MetaUi
}

/** 子表元数据：一个 many 组 + 它的 groupUi（子表自己的 MetaUi）。 */
const itemFields = [stubField('qty')]

function subGroupMetaUi(): MetaUi {
  const groupUi = {
    groups: [
      { groupName: 'a1', groupLabel: '行', many: false, fields: itemFields },
    ],
    getListedFields: () => itemFields,
    getField: (name: string) =>
      itemFields.find((field) => field.fieldName === name),
    displayLabel: '明细',
    primaryKey: 'id',
    locale: 'zh',
    objName: 'OrderItem',
  } as unknown as MetaUi
  const group = {
    groupName: 'items',
    groupLabel: '明细',
    many: true,
    groupUi,
    fields: [],
    isSecondary: () => false,
  } as unknown as MetaUiGroup
  return {
    groups: [group],
    getGroup: (name: string) => (name === 'items' ? group : undefined),
    getField: () => undefined,
    displayLabel: 'Order',
    primaryKey: 'id',
    locale: 'zh',
    objName: 'Order',
  } as unknown as MetaUi
}

/** 只实现拼屏用得上的那几项，其余走 `RuiFactory` 自带的存根。 */
class TestFactory extends RuiFactory {
  constructor() {
    // core 的 factory 抽象类靠 renderer 造 HTML 壳（textSpan / label / icon…），必须给。
    super(new RuiLayout())
  }
  actionIcons: Record<string, string> = {}
  viewIcons: Record<string, string> = {}
  dialogIcons: Record<string, string> = {}
  resolveIcon() {
    return null
  }
  actionButton() {
    return createElement('button', null, 'action')
  }
  toast() {}
  confirm() {
    return Promise.resolve(true)
  }
  dialog() {
    return Promise.resolve('cancel' as UiDialogAction)
  }
  override grid<T>(props: UiGridProps<T, ReactNode>): ReactNode {
    const rows = (props.rows as unknown[] | undefined) ?? []
    return createElement(
      'div',
      { className: `mmda-grid ${props.class ?? ''}`.trim() },
      ...rows.map((_row, index) =>
        createElement('div', { className: 'mmda-grid-row', key: index }),
      ),
    )
  }

  override card(props: UiCardProps, slots?: UiCardSlots<ReactNode>): ReactNode {
    return createElement(
      'div',
      { className: `mmda-card ${props.class ?? ''}`.trim() },
      createElement('div', { className: 'mmda-card-title' }, props.title),
      ...(slots?.default?.() ?? []),
    )
  }
}

function testBuilder() {
  const factory = new TestFactory()
  return new RuiBuilder(factory, new RuiFieldFactory(factory))
}

/** 单测不带壳，把 React 会话按 core 契约接进 builder 拼屏入口。 */
function asView(context: RuiContext<Entity>): UiContext<Entity> {
  return context as unknown as UiContext<Entity>
}

function fieldGroup(metaUi: MetaUi): MetaUiGroup {
  return metaUi.getGroup('base')!
}

describe('RuiBuilder.buildFieldGroup', () => {
  it('拼出组壳 + 字段行（字段名可见，坐标为 grid 排法）', () => {
    const metaUi = stubMetaUi()
    const context = new RuiContext({
      model: { id: '1', code: 'A-1', name: 'Alice' } as unknown as Entity,
      metaUi,
      logic: undefined,
    })
    const host = document.createElement('div')
    render(
      createElement(
        'div',
        null,
        testBuilder().buildFieldGroup(fieldGroup(metaUi), asView(context)),
      ),
      { container: host },
    )

    expect(host.querySelector('.mmda-card-title')?.textContent).toBe('基本信息')
    expect(host.textContent).toContain('code')
    expect(host.textContent).toContain('name')
    expect(host.querySelectorAll('.mmda-field').length).toBe(2)
  })

  it('customPrepend / customAppend 只写插片也生效（组级三位置正交）', () => {
    const metaUi = stubMetaUi()
    const context = new RuiContext({
      model: { id: '1', code: 'A-1' } as unknown as Entity,
      metaUi,
      logic: undefined,
    })
    const logic = new MetaUiGroupLogic(fieldGroup(metaUi))
    logic.customPrepend = () =>
      createElement('div', { className: 'mmda-prepend' }, '扫码输入')
    logic.customAppend = () =>
      createElement('div', { className: 'mmda-append' }, '编辑动态')
    context.setupGroupLogic(logic)

    const host = document.createElement('div')
    render(
      createElement(
        'div',
        null,
        testBuilder().buildFieldGroup(fieldGroup(metaUi), asView(context)),
      ),
      { container: host },
    )

    expect(host.querySelector('.mmda-prepend')?.textContent).toBe('扫码输入')
    expect(host.querySelector('.mmda-append')?.textContent).toBe('编辑动态')
    // 标准内容照旧在中间（插片不吃掉它）
    expect(host.querySelectorAll('.mmda-field').length).toBe(2)
  })

  it('customRenderer 换掉中间那块，插片仍在外层', () => {
    const metaUi = stubMetaUi()
    const context = new RuiContext({
      model: { id: '1' } as unknown as Entity,
      metaUi,
      logic: undefined,
    })
    const logic = new MetaUiGroupLogic(fieldGroup(metaUi))
    logic.customRenderer = () =>
      createElement('div', { className: 'mmda-custom' }, '自造组内容')
    logic.customAppend = () =>
      createElement('div', { className: 'mmda-append' }, '尾注')
    context.setupGroupLogic(logic)

    const host = document.createElement('div')
    render(
      createElement(
        'div',
        null,
        testBuilder().buildFieldGroup(fieldGroup(metaUi), asView(context)),
      ),
      { container: host },
    )

    expect(host.querySelector('.mmda-custom')?.textContent).toBe('自造组内容')
    expect(host.querySelector('.mmda-append')?.textContent).toBe('尾注')
    // 被换掉后不再渲染默认字段行
    expect(host.querySelectorAll('.mmda-field').length).toBe(0)
  })
})

/** 两个组：primary + secondary，用来验证详情页分区。 */
function twoGroupMetaUi(): MetaUi {
  const primaryGroup = {
    groupName: 'base',
    groupLabel: '基本信息',
    many: false,
    fields: baseFields,
    isPrimary: () => true,
    isSecondary: () => false,
    isTails: () => false,
  } as unknown as MetaUiGroup
  const secondaryGroup = {
    groupName: 'memo',
    groupLabel: '备注',
    many: false,
    fields: [stubField('remark')],
    isPrimary: () => false,
    isSecondary: () => true,
    isTails: () => false,
  } as unknown as MetaUiGroup
  const groups = [primaryGroup, secondaryGroup]
  return {
    groups,
    getGroup: (name: string) => groups.find((g) => g.groupName === name),
    getField: (name: string) =>
      [...baseFields, stubField('remark')].find(
        (field) => field.fieldName === name,
      ),
    displayLabel: 'Test',
    primaryKey: 'id',
    locale: 'zh',
    objName: 'Test',
  } as unknown as MetaUi
}

describe('RuiBuilder.buildDetailsView', () => {
  it('按 primary / secondary 分区拼壳，showSecondaryGroup:false 可关掉右栏', () => {
    const metaUi = twoGroupMetaUi()
    const context = new RuiContext({
      model: { id: '1', code: 'A-1', name: 'Alice', remark: 'x' } as unknown as Entity,
      metaUi,
      logic: undefined,
    })
    const builder = testBuilder()

    const host = document.createElement('div')
    render(createElement('div', null, builder.buildDetailsView(asView(context))), {
      container: host,
    })
    expect(host.querySelectorAll('.mmda-card-title').length).toBe(2)
    expect(host.textContent).toContain('基本信息')
    expect(host.textContent).toContain('备注')
    expect(host.textContent).toContain('remark')

    const host2 = document.createElement('div')
    render(
      createElement(
        'div',
        null,
        builder.buildDetailsView(asView(context), { showSecondaryGroup: false }),
      ),
      { container: host2 },
    )
    expect(host2.querySelectorAll('.mmda-card-title').length).toBe(1)
    expect(host2.textContent).not.toContain('备注')
  })

  it('buildEditView 走同一套（编辑态由会话决定，字段行自动换编辑器）', () => {
    const metaUi = twoGroupMetaUi()
    const context = new RuiContext({
      model: { id: '1', code: 'A-1', name: 'Alice' } as unknown as Entity,
      metaUi,
      logic: undefined,
    })
    const host = document.createElement('div')
    render(createElement('div', null, testBuilder().buildEditView(asView(context))), {
      container: host,
    })
    expect(host.textContent).toContain('基本信息')
    // primary 组 2 个字段 + secondary 组 1 个字段，两组都画
    expect(host.querySelectorAll('.mmda-field').length).toBe(3)
  })
})

describe('页级插槽（core UiViewSlots，vui / rui 共用）', () => {
  it('content 接管主区，header / toolbar 各就各位，组不再画一遍', () => {
    const context = new RuiContext({
      model: { id: '1', code: 'A-1', name: 'Alice' } as unknown as Entity,
      metaUi: twoGroupMetaUi(),
      logic: undefined,
    })
    const host = document.createElement('div')
    render(
      createElement(
        'div',
        null,
        testBuilder().buildDetailsView(asView(context), {
          toolbar: () => createElement('span', null, 'TOOLBAR'),
          header: () => createElement('span', null, 'HEADER'),
          content: () => createElement('span', null, 'CUSTOM-CONTENT'),
        }),
      ),
      { container: host },
    )
    expect(host.textContent).toContain('TOOLBAR')
    expect(host.textContent).toContain('HEADER')
    expect(host.textContent).toContain('CUSTOM-CONTENT')
    // content 接管后不再按组拼
    expect(host.querySelectorAll('.mmda-card-title').length).toBe(0)
  })

  it('只给 toolbar 时按组拼，插槽只顶掉顶栏', () => {
    const context = new RuiContext({
      model: { id: '1', code: 'A-1', name: 'Alice' } as unknown as Entity,
      metaUi: twoGroupMetaUi(),
      logic: undefined,
    })
    const host = document.createElement('div')
    render(
      createElement(
        'div',
        null,
        testBuilder().buildDetailsView(asView(context), {
          toolbar: () => createElement('span', null, 'TOOLBAR'),
        }),
      ),
      { container: host },
    )
    expect(host.textContent).toContain('TOOLBAR')
    expect(host.querySelectorAll('.mmda-card-title').length).toBe(2)
  })
})

describe('RuiBuilder.buildSubGroup', () => {
  it('子表组走 factory.grid，行来自 context.model[groupName]，前后插片照样生效', () => {
    const metaUi = subGroupMetaUi()
    const context = new RuiContext({
      model: { id: '1', items: [{ qty: 1 }, { qty: 2 }] } as unknown as Entity,
      metaUi,
      logic: undefined,
    })
    const logic = new MetaUiGroupLogic(metaUi.getGroup('items')!)
    // 只读态走 customPrepend（编辑态才取 customEditPrepend）
    logic.customPrepend = () =>
      createElement('div', { className: 'mmda-prepend' }, '扫码输入')
    context.setupGroupLogic(logic)

    const host = document.createElement('div')
    render(
      createElement(
        'div',
        null,
        testBuilder().buildSubGroup(metaUi.getGroup('items')!, asView(context)),
      ),
      { container: host },
    )

    expect(host.querySelectorAll('.mmda-grid-row').length).toBe(2)
    expect(host.querySelector('.mmda-prepend')?.textContent).toBe('扫码输入')
  })
})
