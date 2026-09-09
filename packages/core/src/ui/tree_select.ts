import type { UiTreeFields } from './tree'
import type { UiProps } from './props'

export type UiTreeSelectDisplay = 'text' | 'chips' | 'delimiter' | 'custom'
export type UiTreeSelectLoadMode = 'full' | 'lazy'
export type UiTreeSelectValue = string | number | null | Array<string | number>

export interface UiTreeSelectProps<T = any, TNode = any> extends UiProps {
  data?: T[]
  fields?: UiTreeFields<T>
  value?: UiTreeSelectValue
  placeholder?: string
  disabled?: boolean
  /** 厂商弹层 filter bar。缺省 true */
  allowFiltering?: boolean
  selectionMode?: 'single' | 'checkbox'
  showClear?: boolean
  selectedDisplay?: UiTreeSelectDisplay
  delimiter?: string
  popupHeight?: string | number
  popupWidth?: string | number
  showSelectAll?: boolean
  selectAllLabel?: string
  header?: () => TNode
  item?: (node: T) => TNode
  selected?: (nodes: T[]) => TNode
  loadMode?: UiTreeSelectLoadMode
  onExpand?: (node: T) => void | Promise<void>
  loadRoots?: () => T[] | Promise<T[]>
  treeShape?: string
  shapeKey?: string
  onChange?: (value: UiTreeSelectValue) => void
}
