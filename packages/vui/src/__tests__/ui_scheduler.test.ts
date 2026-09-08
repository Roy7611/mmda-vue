import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { MetaUi, MetaUiField, SqlDataType } from '@mmda/core'
import { VueUiContext } from '../contexts/vue_ui_context'
import { UiViewManyKind } from '../contexts/view'
import {
  SCHEDULER_PLUGIN_NOT_INSTALLED,
  createNoopSchedulerController,
  isSchedulerTimelineView,
  schedulerEventsToCsv,
  schedulerHiddenDaysOf,
  schedulerHookClass,
  schedulerSlotDurationHms,
  schedulerSlotDurationOf,
  schedulerWorkDaysOf,
  unimplementedSchedulerPlugin,
  type UiSchedulerPlugin,
} from '../ui/factory/scheduler'
import { createStubUiBuilder } from '../ui/builder/builder'
import { TestUiBuilder } from './test_builder'

describe('ui scheduler contract', () => {
  it('throws until setSchedulerPlugin', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.schedulerPlugin.schedulerView({})).toThrow(
      SCHEDULER_PLUGIN_NOT_INSTALLED,
    )
    expect(() =>
      ui.buildSchedulerView({} as any, { events: [{ id: 1, start: '2026-01-01' }] }),
    ).toThrow(SCHEDULER_PLUGIN_NOT_INSTALLED)
    expect(unimplementedSchedulerPlugin().schedulerView).toBeTypeOf('function')
  })

  it('uses the plugin after setSchedulerPlugin', () => {
    const ui = new TestUiBuilder()
    const plugin: UiSchedulerPlugin = {
      schedulerView: (props) =>
        h('div', {
          class: 'mmda-scheduler',
          'data-count': props.events?.length ?? 0,
        }),
    }
    ui.setSchedulerPlugin(plugin)
    const node = ui.buildSchedulerView({} as any, {
      events: [{ id: 1, start: '2026-01-01', title: 'Cut' }],
    })
    expect(node.props?.['data-count']).toBe(1)
  })

  it('dispatches viewKind scheduler', () => {
    const metaUi = new MetaUi({
      objName: 'Shift',
      displayLabel: '班次',
      primaryKey: 'id',
      groups: [
        {
          groupName: 'a1',
          groupLabel: '基本',
          many: false,
          fields: [
            new MetaUiField({
              fieldName: 'title',
              displayLabel: '标题',
              fieldIdx: 0,
              dataType: SqlDataType.NVARCHAR,
              listed: true,
            }),
          ],
        },
      ],
    })
    const context = new VueUiContext({
      model: { list: [] },
      metaUi,
      view: 'index',
    })
    ;(context as any).logic = {
      viewOptions: {
        index: () => ({ viewKind: UiViewManyKind.scheduler }),
      },
    }
    const builder = new TestUiBuilder()
    builder.setSchedulerPlugin({
      schedulerView: () => h('div', { class: 'mmda-scheduler' }),
    })
    const node = builder.build(context)
    expect(node.props?.class).toBe('mmda-scheduler')
  })

  it('exposes helpers, csv and noop controller', () => {
    const stub = createStubUiBuilder()
    expect(() => stub.buildSchedulerView({} as any, {})).toThrow(
      SCHEDULER_PLUGIN_NOT_INSTALLED,
    )
    stub.setSchedulerPlugin({
      schedulerView: () => h('div', { class: 'mmda-scheduler' }),
    })
    expect(stub.buildSchedulerView({} as any, {}).props?.class).toBe(
      'mmda-scheduler',
    )
    expect(schedulerWorkDaysOf()).toEqual([1, 2, 3, 4, 5])
    expect(schedulerSlotDurationOf()).toBe(30)
    expect(schedulerSlotDurationHms(30)).toBe('00:30:00')
    expect(schedulerHiddenDaysOf({ view: 'workWeek' })).toEqual([0, 6])
    expect(isSchedulerTimelineView('timelineWeek')).toBe(true)
    expect(isSchedulerTimelineView('week')).toBe(false)
    const csv = schedulerEventsToCsv([
      {
        id: 1,
        title: 'Cut, A',
        start: '2026-01-01T08:00:00Z',
        location: 'Line 1',
      },
    ])
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('"Cut, A"')
    const controller = createNoopSchedulerController()
    controller.refresh()
    controller.setView('week')
    expect(controller.getVisibleRange()).toBeNull()
    expect(schedulerHookClass(undefined, true)).toEqual([
      'mmda-scheduler',
      'mmda-scheduler--readonly',
      undefined,
    ])
  })
})
