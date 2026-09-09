import type { UiColorRole, UiProps } from '../props'
import { uiCssClass } from '../css'

export type UiCardSurface = 'filled' | 'outlined' | 'elevated'

export interface UiCardProps extends UiProps {
  title?: string
  subtitle?: string
  colorRole?: UiColorRole
  surface?: UiCardSurface
  image?: string
  imageAlt?: string
  imageTitle?: string
  headerImage?: string
  divider?: boolean
}

export interface UiCardSlots<TNode = any> {
  default?: () => TNode[]
  header?: () => TNode[]
  image?: () => TNode[]
  footer?: () => TNode[]
  actions?: () => TNode[]
}

export function cardModifierClasses(props: UiCardProps): unknown[] {
  const role = props.colorRole
    ? uiCssClass('card', props.colorRole)
    : undefined
  const surface =
    props.surface && props.surface !== 'filled'
      ? uiCssClass('card', props.surface)
      : undefined
  return [uiCssClass('card'), role, surface, props.class]
}
