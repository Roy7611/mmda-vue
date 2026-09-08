/*
 * Syncfusion Card Image: https://ej2.syncfusion.com/vue/documentation/card/card-image
 *
 * chrome 内容面板走 factory.card。不是表单分组 GroupCard / buildGroupCard。
 */
import type { VNode } from 'vue'
import type { UiColorRole } from '../../app/material'
import type { PropData } from '../layout/layout'

export type UiCardSurface = 'filled' | 'outlined' | 'elevated'

export interface UiCardProps extends PropData {
  title?: string
  subtitle?: string
  /** 语义色钩子 mmda-card--{role}；厂商无映射则只挂 class */
  colorRole?: UiColorRole
  /** 表面：filled 默认；outlined / elevated */
  surface?: UiCardSurface
  /**
   * 封面图 URL。对齐 EJ2 Card Image（e-card-image）：铺在内容区上方，
   * 可叠 title（见 imageTitle）。
   */
  image?: string
  imageAlt?: string
  /** 叠在封面上的标题；无 image / slots.image 时忽略 */
  imageTitle?: string
  /** 标题行左侧小图。对齐 EJ2 e-card-header-image（圆图），不是封面 */
  headerImage?: string
  /**
   * 标题与内容之间画分隔线。对齐 EJ2 e-card-separator。
   * SF 用 `.e-card-separator`；Prime/Naive 在卡内嵌 factory.divider。
   */
  divider?: boolean
}

export interface UiCardSlots {
  default?: () => VNode[]
  /** 覆盖 title/subtitle 块 */
  header?: () => VNode[]
  /** 覆盖封面；优先于 props.image */
  image?: () => VNode[]
  footer?: () => VNode[]
  /** 标题栏右侧工具区 */
  actions?: () => VNode[]
}

export function cardModifierClasses(props: UiCardProps): unknown[] {
  const role = props.colorRole ? `mmda-card--${props.colorRole}` : undefined
  const surface =
    props.surface && props.surface !== 'filled'
      ? `mmda-card--${props.surface}`
      : undefined
  return ['mmda-card', role, surface, props.class]
}
