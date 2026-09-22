/*
 * Tempis 画布插件（React）：登记到 `UiPluginName.tempisTimeline`，
 * 由 `builder.buildTempisTimeline(ctx, props)` 取用（未装插件时 core 侧抛错，不回落列表时间轴）。
 *
 * 这里只做「插件名 + 宿主元素」两件事，映射与生命周期都在
 * `tempis_options.ts` / `tempis_items.ts` / `TempisTimelineView.tsx`。
 */
import { createElement, type ReactNode } from 'react'
import {
  UiPluginName,
  uiPlugin,
  type UiPlugin,
  type UiTempisTimelineProps,
} from '@mmda/core'
import { TempisTimelineView } from './TempisTimelineView'

export function createTempisTimelinePlugin(): UiPlugin<ReactNode> {
  return uiPlugin<ReactNode>(UiPluginName.tempisTimeline, (_context, props) =>
    createElement(TempisTimelineView, {
      source: props as UiTempisTimelineProps,
    }),
  )
}
