import type { EntityCtor } from '../models/entity'
import type { MetaUiGroup } from '../metaui/metaui_group'
import type { UiContext } from './ui_context'

export type UiSelectionMode = 'single' | 'multiple' | 'none' | undefined | ''
export type UiSubGroupMode = 'create' | 'edit' | 'details'

export type PropsMapper = Record<string, string | ((it: any) => any)>

export interface SubGroupItemTransformParam<G> {
  group: string | MetaUiGroup
  source?: any
  target?: any
  creator?: EntityCtor<G>
  propsMapper?: PropsMapper
  ignoreMapper?: Record<string, string>
  sequenceKey?: string
}

export interface Watermark {
  label: string
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

export type UiGroupWatermark = (
  grp: any,
  ctx: UiContext<any>,
  props?: Record<string, any>,
) => Watermark
