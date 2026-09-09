/*
 * Ribbon 是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setRibbonPlugin(createSfRibbonPlugin())。
 * 与 factory.toolbar（三栏壳）无关。
 */
import type { VNode } from 'vue'
import type {UiProps} from '../layout/layout'

export type UiRibbonItemType =
  | 'button'
  | 'dropDown'
  | 'splitButton'
  | 'checkBox'

export interface UiRibbonMenuItem {
  label: string
  icon?: string
  disabled?: boolean
  onClick?: () => void
}

export interface UiRibbonItem {
  type?: UiRibbonItemType
  id?: string
  label?: string
  icon?: string
  disabled?: boolean
  checked?: boolean
  items?: UiRibbonMenuItem[]
  onClick?: () => void
}

export interface UiRibbonCollection {
  items: UiRibbonItem[]
}

export interface UiRibbonGroup {
  header?: string
  collections: UiRibbonCollection[]
}

export interface UiRibbonTab {
  header: string
  groups: UiRibbonGroup[]
}

export type UiRibbonLayout = 'classic' | 'simplified'

export interface UiRibbonProps extends UiProps {
  tabs: UiRibbonTab[]
  layout?: UiRibbonLayout
  activeTab?: number
  options?: Record<string, unknown>
}

export interface UiRibbonPlugin {
  ribbon: (props: UiRibbonProps) => VNode
}

export const RIBBON_PLUGIN_NOT_INSTALLED = 'ribbon plugin not installed'

function notInstalled(): never {
  throw new Error(RIBBON_PLUGIN_NOT_INSTALLED)
}

export function unimplementedRibbonPlugin(): UiRibbonPlugin {
  return { ribbon: notInstalled }
}

export function ribbonHookClass(extra?: unknown): unknown[] {
  return ['mmda-ribbon', extra]
}
