import {
  GANTT_PLUGIN_NOT_INSTALLED,
  KANBAN_PLUGIN_NOT_INSTALLED,
  SCHEDULER_PLUGIN_NOT_INSTALLED,
  DIAGRAM_PLUGIN_NOT_INSTALLED,
  MARKDOWN_EDITOR_PLUGIN_NOT_INSTALLED,
  IMAGE_EDITOR_PLUGIN_NOT_INSTALLED,
  PIVOT_PLUGIN_NOT_INSTALLED,
  RIBBON_PLUGIN_NOT_INSTALLED,
  AI_ASSISTANT_PLUGIN_NOT_INSTALLED,
  CHART_PLUGIN_NOT_INSTALLED,
  type UiBuilder,
  type UiContext,
  type UiPlugin,
  type UiProps,
} from '@mmda/core'

const NOT_INSTALLED: Record<string, string> = {
  gantt: GANTT_PLUGIN_NOT_INSTALLED,
  scheduler: SCHEDULER_PLUGIN_NOT_INSTALLED,
  kanban: KANBAN_PLUGIN_NOT_INSTALLED,
  diagram: DIAGRAM_PLUGIN_NOT_INSTALLED,
  timeline: 'timeline plugin not installed',
  'markdown-editor': MARKDOWN_EDITOR_PLUGIN_NOT_INSTALLED,
  'image-editor': IMAGE_EDITOR_PLUGIN_NOT_INSTALLED,
  'pivot-table': PIVOT_PLUGIN_NOT_INSTALLED,
  ribbon: RIBBON_PLUGIN_NOT_INSTALLED,
  'ai-assistant': AI_ASSISTANT_PLUGIN_NOT_INSTALLED,
  chart: CHART_PLUGIN_NOT_INSTALLED,
}

export class VuePluginHost {
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

  buildGantt(context: UiContext, props?: UiProps) {
    return this.requirePlugin('gantt').buildUi(context, props)
  }

  buildGanttChart(context: UiContext, props?: UiProps) {
    return this.buildGantt(context, props)
  }

  buildScheduler(context: UiContext, props?: UiProps) {
    return this.requirePlugin('scheduler').buildUi(context, props)
  }

  buildKanban(context: UiContext, props?: UiProps) {
    return this.requirePlugin('kanban').buildUi(context, props)
  }

  buildDiagram(context: UiContext, props?: UiProps) {
    return this.requirePlugin('diagram').buildUi(context, props)
  }

  buildTimeline(context: UiContext, props?: UiProps) {
    const installed = this.plugin('timeline')
    if (installed) return installed.buildUi(context, props)
    const timeline = (
      this as unknown as { factory?: { timeline?: (p?: UiProps) => unknown } }
    ).factory?.timeline
    if (typeof timeline === 'function') return timeline(props)
    throw new Error(NOT_INSTALLED.timeline)
  }
}

/** 给 createStubUiBuilder 这种裸对象挂上同一套 use / plugin / buildGantt。 */
export function mixPluginHost<T extends object>(target: T): T {
  const host = new VuePluginHost()
  const assign = [
    'use',
    'plugin',
    'hasPlugin',
    'requirePlugin',
    'buildGantt',
    'buildGanttChart',
    'buildScheduler',
    'buildKanban',
    'buildDiagram',
    'buildTimeline',
  ] as const
  for (const key of assign) {
    ;(target as any)[key] = (host as any)[key].bind(host)
  }
  return target
}
