/*
 * chrome 三栏壳走 factory.toolbar。对标 PrimeVue Toolbar 的 start / center / end。
 * 不是 EJ2 items 命令条。没有 fldFactory。实现函数 createToolbar。
 */
import { h, type VNode, type VNodeChild } from 'vue'
import {
  htmlAttributesOf,
  type PropData,
  type UiHorzAlign,
} from '../layout/layout'

export type UiToolbarLayout = 'full' | 'medium' | 'compact'

export type UiToolbarSlotName = 'start' | 'center' | 'end'

export interface UiToolbarProps extends PropData {
  align?: {
    start?: UiHorzAlign
    center?: UiHorzAlign
    end?: UiHorzAlign
  }
  layout?: UiToolbarLayout
}

export interface UiToolbarSlots {
  start?: () => VNodeChild
  center?: () => VNodeChild
  end?: () => VNodeChild
}

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

export function toolbarHasCenter(slots?: UiToolbarSlots): boolean {
  return typeof slots?.center === 'function'
}

export function toolbarModifierClasses(
  props: UiToolbarProps = {},
  slots?: UiToolbarSlots,
): unknown[] {
  const layout = toolbarLayoutOf(props)
  return [
    'mmda-toolbar',
    `mmda-toolbar--${layout}`,
    toolbarHasCenter(slots) && 'mmda-toolbar--with-center',
    props.class,
  ]
}

export function toolbarSlotModifierClasses(
  props: UiToolbarProps = {},
  slot: UiToolbarSlotName,
): unknown[] {
  const align = toolbarSlotAlignOf(props, slot)
  return [`mmda-toolbar__${slot}`, `mmda-toolbar__${slot}--${align}`]
}

export function toolbarRootStyle(slots?: UiToolbarSlots): Record<string, string> {
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
  slots: UiToolbarSlots | undefined,
  slot: UiToolbarSlotName,
): VNodeChild {
  return slots?.[slot]?.()
}

/** SF / Naive 共用三栏壳。Prime 用厂商 Toolbar 再套槽内 flex。 */
export function renderToolbarChrome(
  props: UiToolbarProps = {},
  slots?: UiToolbarSlots,
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
