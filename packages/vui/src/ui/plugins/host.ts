import {
  PluginHost,
  type UiContext,
  type UiGanttProps,
} from '@mmda/core'
import type { VNode } from 'vue'

export class VuePluginHost extends PluginHost<VNode> {
  /** {@link buildGantt} 的别名，兼容旧调用。 */
  buildGanttChart(context: UiContext, props?: UiGanttProps): VNode {
    return this.buildGantt(context, props)
  }
}

/** 给裸对象挂上同一套 use / plugin / buildGantt。 */
export function mixPluginHost<T extends object>(target: T): T {
  return new VuePluginHost().mixInto(target, ['buildGanttChart'])
}
