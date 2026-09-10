/*
 * chrome 三栏壳走 factory.toolbar。对标 PrimeVue Toolbar 的 start / center / end。
 * 不是 EJ2 items 命令条。没有 fieldFactory。实现函数 createToolbar。
 */
import { h, type VNode } from 'vue'
import type {
  UiHorzAlign,
  UiToolbarLayout,
  UiToolbarProps,
  UiToolbarSlotName,
  UiToolbarSlots,
} from '@mmda/core'
import {
  toolbarModifierClasses,
  toolbarSlotModifierClasses,
} from '@mmda/core'
import { htmlAttributesOf } from '../layout/layout'

export type {
  UiToolbarLayout,
  UiToolbarProps,
  UiToolbarSlotName,
  UiToolbarSlots,
} from '@mmda/core'

export {
  toolbarModifierClasses,
  toolbarSlotModifierClasses,
} from '@mmda/core'

const ALIGN: Record<UiToolbarSlotName, UiHorzAlign> = {
  start: 'left',
  center: 'center',
  end: 'right',
}

export function toolbarLayoutOf(props: UiToolbarProps = {}): UiToolbarLayout {
  const layout = props.layout
  if (layout === 'medium' || layout === 'compact') return layout
  return 'full'
}

export function toolbarSlotAlignOf(
  props: UiToolbarProps = {},
  slot: UiToolbarSlotName,
): UiHorzAlign {
  const raw = props.align?.[slot]
  if (raw === 'left' || raw === 'center' || raw === 'right') return raw
  return ALIGN[slot]
}

export function toolbarSlotJustifyContent(align: UiHorzAlign): string {
  if (align === 'center') return 'center'
  if (align === 'right') return 'flex-end'
  return 'flex-start'
}

export function toolbarHasCenter(slots?: UiToolbarSlots<VNode>): boolean {
  return typeof slots?.center === 'function'
}

export function toolbarRootStyle(slots?: UiToolbarSlots<VNode>): Record<string, string> {
  // 无中栏时不要 1fr|1fr 均分：右侧动作一多就会被压窄，按钮内文字换行把整栏撑高。
  const columns = toolbarHasCenter(slots)
    ? "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)"
    : "minmax(0, 1fr) auto auto";
  return {
    display: "grid",
    gridTemplateColumns: columns,
    alignItems: "center",
    width: "100%",
    minWidth: "0",
  };
}

export function toolbarSlotStyle(
  props: UiToolbarProps = {},
  slot: UiToolbarSlotName,
): Record<string, string> {
  return {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: toolbarSlotJustifyContent(toolbarSlotAlignOf(props, slot)),
    minWidth: '0',
  }
}

export function toolbarSlotContent(
  slots: UiToolbarSlots<VNode> | undefined,
  slot: UiToolbarSlotName,
): VNode | undefined {
  return slots?.[slot]?.() as VNode | undefined
}

/** SF / Naive 共用三栏壳。Prime 用厂商 Toolbar 再套槽内 flex。 */
export function renderToolbarChrome(
  props: UiToolbarProps = {},
  slots?: UiToolbarSlots<VNode>,
): VNode {
  const {
    align: _align,
    layout: _layout,
    htmlAttributes,
    class: _className,
    ...rest
  } = props
  const names: UiToolbarSlotName[] = ['start', 'center', 'end']
  return h(
    'div',
    {
      ...rest,
      ...htmlAttributesOf(props),
      class: toolbarModifierClasses(props, slots),
      style: { ...toolbarRootStyle(slots), ...(props.style as object) },
      role: 'toolbar',
    },
    names.map((slot) => {
      if (slot === 'center' && !toolbarHasCenter(slots)) {
        return h('div', {
          class: toolbarSlotModifierClasses(props, slot),
          style: toolbarSlotStyle(props, slot),
        })
      }
      return h(
        'div',
        {
          class: toolbarSlotModifierClasses(props, slot),
          style: toolbarSlotStyle(props, slot),
        },
        toolbarSlotContent(slots, slot) as any,
      )
    }),
  )
}
