import { describe, expect, it } from 'vitest'
import { RuiContext, type RuiContextOptions } from '../contexts/react_ui_context'
import { useRuiContext } from '../reactivity'
import { renderHook, act } from '@testing-library/react'
import type { MetaUi, MetaUiField, Entity, UiBuilder } from '@mmda/core'
import type { MmdaReactApp } from '../app/app'

/** 构造一个可用的 MetaUi stub */
function stubMetaUi(): MetaUi {
  return {
    getField(name: string): MetaUiField | undefined {
      return { fieldName: name, header: name } as unknown as MetaUiField
    },
    getGroup() { return undefined },
    groups: [],
    displayLabel: 'Test',
    primaryKey: 'id',
    locale: 'zh',
    objName: 'Test',
  } as unknown as MetaUi
}

function stubOptions(overrides?: Partial<RuiContextOptions>): RuiContextOptions {
  return {
    model: { id: '1', name: 'Alice' } as any,
    metaUi: stubMetaUi(),
    logic: undefined,
    ...overrides,
  }
}

describe('RuiContext', () => {
  it('构造后可以读写字段值', () => {
    const ctx = new RuiContext(stubOptions())
    expect(ctx.getFieldValue('name')).toBe('Alice')
    ctx.setFieldValue('name', 'Bob')
    expect(ctx.getFieldValue('name')).toBe('Bob')
  })

  it('getModelTitle 返回 MetaUi.displayLabel + 主键值', () => {
    const ctx = new RuiContext(stubOptions({ model: { id: '42' } as any }))
    expect(ctx.getModelTitle()).toBe('Test【42】')
  })

  it('with 创建子 context，读写互不影响', () => {
    const ctx = new RuiContext(stubOptions({ model: { id: '1', qty: 10 } as any }))
    const child = ctx.with({ id: '2', qty: 99 } as any)

    expect(child.getFieldValue('qty')).toBe(99)
    expect(ctx.getFieldValue('qty')).toBe(10)

    child.setFieldValue('qty', 5)
    expect(child.getFieldValue('qty')).toBe(5)
    expect(ctx.getFieldValue('qty')).toBe(10)
  })

  it('load 调用 loader 并 setModel', async () => {
    const ctx = new RuiContext(stubOptions({
      model: [] as any[],
      loader: async () => [{ id: 'x', name: 'X' }] as any,
    }))
    expect(ctx.initialized).toBe(false)
    await ctx.load()
    expect(ctx.initialized).toBe(true)
    expect((ctx.model as any[])[0]?.name).toBe('X')
  })

  it('useRuiContext 在 setFieldValue 后触发重渲染', async () => {
    const ctx = new RuiContext(stubOptions({ model: { id: '1', name: 'Old' } as any }))

    const { result } = renderHook(() => {
      const snap = useRuiContext(ctx)
      return (snap.model as { name?: string } | undefined)?.name
    })

    expect(result.current).toBe('Old')

    // valtio 默认把变更通知批进微任务，await act 刷新后再断言
    await act(async () => {
      ctx.setFieldValue('name', 'New')
    })

    expect(result.current).toBe('New')
  })

  it('宿主注入 app 后，context.app / uiBuilder 通到会话', () => {
    const ui = { buildEditView: () => 'x' } as unknown as UiBuilder
    const app = { ui } as unknown as MmdaReactApp
    const ctx = new RuiContext(stubOptions({ app }))

    expect(ctx.app).toBe(app)
    expect(ctx.uiBuilder).toBe(ui)
  })

  it('子 context（with / 子表）继承 app，不丢 uiBuilder', () => {
    const ui = { buildEditView: () => 'x' } as unknown as UiBuilder
    const app = { ui } as unknown as MmdaReactApp
    const ctx = new RuiContext(stubOptions({ app, model: { id: '1' } as any }))

    expect(ctx.with({ id: '2' } as any).uiBuilder).toBe(ui)
  })
})
