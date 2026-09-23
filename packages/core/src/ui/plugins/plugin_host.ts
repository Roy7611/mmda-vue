import { GANTT_PLUGIN_NOT_INSTALLED } from './gantt'
import { SCHEDULER_PLUGIN_NOT_INSTALLED } from './scheduler'
import { KANBAN_PLUGIN_NOT_INSTALLED } from './kanban'
import { DIAGRAM_PLUGIN_NOT_INSTALLED } from './diagram'
import { TEMPIS_TIMELINE_PLUGIN_NOT_INSTALLED } from './tempis_timeline'
import { MARKDOWN_EDITOR_PLUGIN_NOT_INSTALLED } from './markdown_editor'
import { IMAGE_EDITOR_PLUGIN_NOT_INSTALLED } from './image_editor'
import { PIVOT_TABLE_PLUGIN_NOT_INSTALLED } from './pivot_table'
import { RIBBON_PLUGIN_NOT_INSTALLED } from './ribbon'
import { AI_ASSISTANT_PLUGIN_NOT_INSTALLED } from './ai_assistant'
import { CHARTS_PLUGIN_NOT_INSTALLED } from './chart'

import type { UiPlugin } from './plugin'
import type { UiBuilder } from '../builder'
import type { UiContext } from '../context'
import type { UiDiagramProps } from './diagram'
import type { UiGanttProps } from './gantt'
import type { UiKanbanProps } from './kanban'
import type { UiSchedulerProps } from './scheduler'
import type { UiTempisTimelineProps } from './tempis_timeline'

const NOT_INSTALLED: Record<string, string> = {
  gantt: GANTT_PLUGIN_NOT_INSTALLED,
  scheduler: SCHEDULER_PLUGIN_NOT_INSTALLED,
  kanban: KANBAN_PLUGIN_NOT_INSTALLED,
  diagram: DIAGRAM_PLUGIN_NOT_INSTALLED,
  'tempis-timeline': TEMPIS_TIMELINE_PLUGIN_NOT_INSTALLED,
  'markdown-editor': MARKDOWN_EDITOR_PLUGIN_NOT_INSTALLED,
  'image-editor': IMAGE_EDITOR_PLUGIN_NOT_INSTALLED,
  'pivot-table': PIVOT_TABLE_PLUGIN_NOT_INSTALLED,
  ribbon: RIBBON_PLUGIN_NOT_INSTALLED,
  'ai-assistant': AI_ASSISTANT_PLUGIN_NOT_INSTALLED,
  charts: CHARTS_PLUGIN_NOT_INSTALLED,
}

const PLUGIN_HOST_METHODS = [
  'use',
  'plugin',
  'hasPlugin',
  'requirePlugin',
  'buildGantt',
  'buildScheduler',
  'buildKanban',
  'buildDiagram',
  'buildTempisTimeline',
] as const

/** 插件宿主基类。无 Vue / React。 */
export class PluginHost<TNode = any> {
  private readonly plugins = new Map<string, UiPlugin>()

  use(plugin: UiPlugin): this {
    this.plugins.set(plugin.name, plugin)
    plugin.install?.(this as unknown as UiBuilder)
    return this
  }

  plugin(name: string): UiPlugin | undefined {
    return this.plugins.get(name)
  }

  hasPlugin(name: string): boolean {
    return this.plugins.has(name)
  }

  requirePlugin(name: string): UiPlugin {
    const found = this.plugin(name)
    if (!found) {
      throw new Error(NOT_INSTALLED[name] ?? `${name} plugin not installed`)
    }
    return found
  }

  buildGantt(context: UiContext, props?: UiGanttProps): TNode {
    return this.requirePlugin('gantt').buildUi(context, props)
  }

  buildScheduler(context: UiContext, props?: UiSchedulerProps): TNode {
    return this.requirePlugin('scheduler').buildUi(context, props)
  }

  buildKanban(context: UiContext, props?: UiKanbanProps): TNode {
    return this.requirePlugin('kanban').buildUi(context, props)
  }

  buildDiagram(context: UiContext, props?: UiDiagramProps): TNode {
    return this.requirePlugin('diagram').buildUi(context, props)
  }

  /**
   * Tempis 二维时间轴画布（时间 × 泳道 + 依赖）。
   * **不回落**列表时间轴：调用点要的就是二维画布，回落成事件列表是语义错误；
   * 未装插件 → 抛 {@link TEMPIS_TIMELINE_PLUGIN_NOT_INSTALLED}。
   */
  buildTempisTimeline(
    context: UiContext,
    props?: UiTempisTimelineProps,
  ): TNode {
    return this.requirePlugin('tempis-timeline').buildUi(context, props)
  }

  /** 把本宿主的 use / plugin / build 方法绑定到裸对象上（插件混入）。 */
  mixInto<T extends object>(
    target: T,
    extraMethods: readonly string[] = [],
  ): T {
    const assign = [...PLUGIN_HOST_METHODS, ...extraMethods] as const
    for (const key of assign) {
      const fn = (this as unknown as Record<string, unknown>)[key]
      if (typeof fn === 'function') {
        ;(target as Record<string, unknown>)[key] = (fn as Function).bind(this)
      }
    }
    return target
  }
}
