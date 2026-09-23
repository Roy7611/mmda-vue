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
