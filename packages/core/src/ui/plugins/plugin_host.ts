import { GANTT_PLUGIN_NOT_INSTALLED } from './gantt'
import { SCHEDULER_PLUGIN_NOT_INSTALLED } from './scheduler'
import { KANBAN_PLUGIN_NOT_INSTALLED } from './kanban'
import { DIAGRAM_PLUGIN_NOT_INSTALLED } from './diagram'
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
import type { UiTimelineProps } from './timeline'

const NOT_INSTALLED: Record<string, string> = {
  gantt: GANTT_PLUGIN_NOT_INSTALLED,
  scheduler: SCHEDULER_PLUGIN_NOT_INSTALLED,
  kanban: KANBAN_PLUGIN_NOT_INSTALLED,
  diagram: DIAGRAM_PLUGIN_NOT_INSTALLED,
  timeline: 'timeline plugin not installed',
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
  'buildTimeline',
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

  buildTimeline(context: UiContext, props?: UiTimelineProps): TNode {
    const found = this.plugin('timeline')
    if (found) return found.buildUi(context, props)
    // timeline 是标准控件：未装插件时回退皮肤 factory.timeline
    const factory = (this as unknown as UiBuilder).factory
    if (factory?.timeline) return factory.timeline(props ?? {})
    return this.requirePlugin('timeline').buildUi(context, props)
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

/** 给裸对象挂上同一套 use / plugin / build 方法链。 */
export function mixPluginHost<T extends object>(target: T): T {
  return new PluginHost().mixInto(target)
}
