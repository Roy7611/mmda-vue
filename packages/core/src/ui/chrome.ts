import type { MetaUiField } from '../metaui/metaui_field'
import type { UiMenuItem } from './action'
import type { UiHorzAlign, UiOrientation } from './layout'
import type { UiFieldBindContext } from './field_factory'
import type {
  UiColorRole,
  UiPosition,
  UiProps,
} from './props'
import { uiCssClass } from './css'

export type { UiPosition } from './props'

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

export type UiTabsHeaderPlacement = 'Top' | 'Bottom' | 'Left' | 'Right'
export type UiTabsHeightAdjustMode = 'None' | 'Auto' | 'Content' | 'Fill'

export interface UiTabHeader {
  text?: string
  iconCss?: string
}

export interface UiTabItem<TNode = any> {
  header: string | UiTabHeader
  content?: TNode | (() => TNode)
  disabled?: boolean
}

export interface UiTabsProps<TNode = any> extends UiProps {
  items?: UiTabItem<TNode>[]
  value?: number
  headerPlacement?: UiTabsHeaderPlacement
  scrollable?: boolean
  heightAdjustMode?: UiTabsHeightAdjustMode
  onChange?: (value: number) => void
}

export function tabsModifierClasses(props: UiTabsProps): unknown[] {
  const p = props.headerPlacement
  const placement: UiTabsHeaderPlacement =
    p === 'Bottom' || p === 'Left' || p === 'Right' ? p : 'Top'
  const m = props.heightAdjustMode
  const height: UiTabsHeightAdjustMode =
    m === 'None' || m === 'Auto' || m === 'Content' || m === 'Fill'
      ? m
      : 'Fill'
  const scrollable = props.scrollable !== false
  return [
    uiCssClass('tabs'),
    uiCssClass('tabs', placement.toLowerCase()),
    scrollable
      ? uiCssClass('tabs', 'scrollable')
      : uiCssClass('tabs', 'popup'),
    uiCssClass('tabs', height.toLowerCase()),
    props.class,
  ]
}

export type UiToolbarLayout = 'full' | 'medium' | 'compact'
export type UiToolbarSlotName = 'start' | 'center' | 'end'

export interface UiToolbarProps extends UiProps {
  align?: {
    start?: UiHorzAlign
    center?: UiHorzAlign
    end?: UiHorzAlign
  }
  layout?: UiToolbarLayout
}

export interface UiToolbarSlots<TNode = any> {
  start?: () => unknown
  center?: () => unknown
  end?: () => unknown
}

const TOOLBAR_SLOT_ALIGN: Record<UiToolbarSlotName, UiHorzAlign> = {
  start: 'left',
  center: 'center',
  end: 'right',
}

export function toolbarModifierClasses(
  props: UiToolbarProps = {},
  slots?: UiToolbarSlots,
): unknown[] {
  const layout =
    props.layout === 'medium' || props.layout === 'compact'
      ? props.layout
      : 'full'
  const hasCenter = typeof slots?.center === 'function'
  return [
    uiCssClass('toolbar'),
    uiCssClass('toolbar', layout),
    hasCenter ? uiCssClass('toolbar', 'with-center') : undefined,
    props.class,
  ]
}

export function toolbarSlotModifierClasses(
  props: UiToolbarProps = {},
  slot: UiToolbarSlotName,
): unknown[] {
  const raw = props.align?.[slot]
  const align =
    raw === 'left' || raw === 'center' || raw === 'right'
      ? raw
      : TOOLBAR_SLOT_ALIGN[slot]
  return [
    uiCssClass(`toolbar__${slot}`),
    uiCssClass(`toolbar__${slot}`, align),
  ]
}

/** @deprecated 用 UiOrientation */
export type UiDividerOrientation = UiOrientation

export interface UiDividerProps extends UiProps {
  orientation?: UiOrientation
  label?: string
}

export function dividerModifierClasses(
  props: UiDividerProps = {},
): unknown[] {
  const orientation =
    props.orientation && props.orientation !== 'horizontal'
      ? uiCssClass('divider', 'vertical')
      : undefined
  const labeled = props.label ? uiCssClass('divider', 'labeled') : undefined
  return [uiCssClass('divider'), orientation, labeled, props.class]
}

export type UiTooltipOpensOn =
  | 'auto'
  | 'hover'
  | 'click'
  | 'focus'
  | 'custom'

export interface UiTooltipController {
  open: (element?: any) => void
  close: () => void
  refresh: () => void
}

export interface UiTooltipProps extends UiProps {
  content?: string
  position?: UiPosition
  opensOn?: UiTooltipOpensOn
  showPointer?: boolean
  openDelay?: number
  closeDelay?: number
  disabled?: boolean
  onReady?: (controller: UiTooltipController) => void
}

export interface UiTooltipSlots<TNode = any> {
  default?: () => TNode
  content?: () => TNode
}

export function tooltipModifierClasses(props: UiTooltipProps): unknown[] {
  const pos = props.position
  const position: UiPosition =
    pos === 'bottom' || pos === 'left' || pos === 'right' ? pos : 'top'
  return [
    uiCssClass('tooltip'),
    uiCssClass('tooltip', position),
    props.disabled === true
      ? uiCssClass('tooltip', 'disabled')
      : undefined,
    props.class,
  ]
}

export type UiSplitterOrientation = 'Horizontal' | 'Vertical'

export interface UiSplitterPane<TNode = any> {
  content: TNode
  size?: string
  min?: string
  max?: string
  collapsible?: boolean
  collapsed?: boolean
  resizable?: boolean
  cssClass?: string
}

export interface UiSplitterCollapseEvent {
  index: number
  collapsed: boolean
}

export interface UiSplitterResizeEvent {
  index: number
  paneSize?: number[]
}

export interface UiSplitterProps {
  orientation?: UiSplitterOrientation
  class?: string
  width?: string
  height?: string
  separatorSize?: number
  enabled?: boolean
  enableReversePanes?: boolean
  collapseTick?: number
  onCollapsed?: (event: UiSplitterCollapseEvent) => void
  onExpanded?: (event: UiSplitterCollapseEvent) => void
  onResizeStart?: (event: UiSplitterResizeEvent) => void
  onResizing?: (event: UiSplitterResizeEvent) => void
  onResizeStop?: (event: UiSplitterResizeEvent) => void
}

export function splitterModifierClasses(props: UiSplitterProps = {}): unknown[] {
  const orientation =
    props.orientation === 'Vertical' ? 'Vertical' : 'Horizontal'
  const reverse = props.enableReversePanes === true
  return [
    uiCssClass('splitter'),
    orientation === 'Vertical'
      ? uiCssClass('splitter', 'vertical')
      : uiCssClass('splitter', 'horizontal'),
    reverse ? uiCssClass('splitter', 'reverse') : undefined,
    props.class,
  ]
}

export type UiSidebarPosition = 'Left' | 'Right'
export type UiSidebarType = 'Over' | 'Push' | 'Slide' | 'Auto'

export interface UiSidebarProps extends UiProps {
  isOpen?: boolean
  position?: UiSidebarPosition
  type?: UiSidebarType
  width?: string | number
  showBackdrop?: boolean
  enableDock?: boolean
  dockSize?: string | number
  target?: string | unknown
  mediaQuery?: string | unknown
  enableGestures?: boolean
  onChange?: (isOpen: boolean) => void
}

export type UiDrawerProps = Omit<UiSidebarProps, 'type'>

export function sidebarModifierClasses(
  props: UiSidebarProps,
  asDrawer = false,
): unknown[] {
  const type: UiSidebarType = asDrawer
    ? 'Over'
    : props.type === 'Over' ||
        props.type === 'Push' ||
        props.type === 'Slide' ||
        props.type === 'Auto'
      ? props.type
      : 'Auto'
  const dock = props.enableDock === true
  return [
    uiCssClass('sidebar'),
    asDrawer ? uiCssClass('sidebar', 'drawer') : undefined,
    uiCssClass('sidebar', type.toLowerCase()),
    dock ? uiCssClass('sidebar', 'dock') : undefined,
    props.class,
  ]
}

export interface UiContextMenuProps extends UiProps {
  items?: UiMenuItem[]
  /** CSS 选择器。对应 EJ2 `target`。 */
  target?: string
  disabled?: boolean
  onSelect?: (item: UiMenuItem) => void
  onBeforeOpen?: (args: { event?: Event }) => void | boolean
}

export function contextMenuModifierClasses(props: UiProps = {}): unknown[] {
  return [uiCssClass('context-menu'), props.class]
}

export type UiCarouselAnimation = 'slide' | 'fade'

export interface UiCarouselItem<TNode = any> {
  key?: string
  src?: string
  alt?: string
  title?: string
  description?: string
  content?: TNode
}

export interface UiCarouselProps<TNode = any> extends UiProps {
  items: UiCarouselItem<TNode>[]
  selectedIndex?: number
  autoPlay?: boolean
  interval?: number
  loop?: boolean
  animation?: UiCarouselAnimation
  itemRenderer?: (item: UiCarouselItem<TNode>, index: number) => TNode
  onChange?: (index: number) => void
}

export function carouselModifierClasses(props: {
  animation?: UiCarouselAnimation
  class?: unknown
}): unknown[] {
  const animation = props.animation
    ? uiCssClass('carousel', props.animation)
    : undefined
  return [uiCssClass('carousel'), animation, props.class]
}

export interface UiImageGalleryItem {
  src: string
  thumbnail?: string
  alt?: string
  title?: string
  description?: string
  data?: unknown
}

/** 形状，对齐 UiButtonShape；overlay（角标）不是形状。 */
export type UiBadgeShape = 'default' | 'circle' | 'pill' | 'dot'

/** 角标相对父元素的角落。MD3 默认 top-end（LTR 即右上）。 */
export type UiBadgePosition = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'

/** MD3 语义色 + Syncfusion light/dark */
export type UiBadgeColor = UiColorRole | 'light' | 'dark'

export interface UiBadgeProps extends UiProps {
  value?: string | number
  colorRole?: UiBadgeColor
  shape?: UiBadgeShape
  overlay?: boolean
  position?: UiBadgePosition
}

export function badgePositionClass(
  position?: UiBadgePosition,
): string | undefined {
  if (!position || position === 'topRight') return undefined
  return uiCssClass(
    'badge',
    position.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`),
  )
}

/** Prime / Naive 用的修饰 class；Syncfusion 形状走 e-badge-*。 */
export function badgeModifierClasses(props: UiBadgeProps): unknown[] {
  const shape =
    props.shape && props.shape !== 'default'
      ? uiCssClass('badge', props.shape)
      : undefined
  const overlay = props.overlay ? uiCssClass('badge', 'overlay') : undefined
  const position = props.overlay
    ? badgePositionClass(props.position)
    : undefined
  return [shape, overlay, position, props.class]
}

/** default = 方（EJ2 默认轮廓）；circle = e-avatar-circle */
export type UiAvatarShape = 'default' | 'circle'

/** medium = EJ2 不加尺寸类的默认档 */
export type UiAvatarSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'

export interface UiAvatarProps extends UiProps {
  src?: string
  icon?: string
  label?: string
  shape?: UiAvatarShape
  size?: UiAvatarSize
  colorRole?: UiColorRole
}

export function avatarModifierClasses(props: UiAvatarProps): unknown[] {
  const shape =
    (props.shape ?? 'circle') === 'circle'
      ? uiCssClass('avatar', 'circle')
      : uiCssClass('avatar', 'square')
  const size =
    props.size && props.size !== 'medium'
      ? uiCssClass('avatar', props.size)
      : undefined
  const color =
    !props.src && props.colorRole
      ? uiCssClass('avatar', props.colorRole)
      : undefined
  return [shape, size, color, props.class]
}

export type UiSkeletonShape = 'text' | 'circle' | 'square' | 'rectangle'
export type UiSkeletonShimmer = 'wave' | 'pulse' | 'fade' | 'none'

export interface UiSkeletonProps extends UiProps {
  /** 缺省 text */
  shape?: UiSkeletonShape
  width?: string | number
  height?: string | number
  /** 缺省 wave。对应 EJ2 shimmerEffect */
  shimmer?: UiSkeletonShimmer
  visible?: boolean
}

export function skeletonModifierClasses(
  props: UiSkeletonProps = {},
): unknown[] {
  const shape = props.shape ?? 'text'
  const shimmer = props.shimmer ?? 'wave'
  return [
    uiCssClass('skeleton'),
    uiCssClass('skeleton', shape),
    uiCssClass('skeleton', shimmer),
    props.class,
  ]
}

export type UiLoadingSize = 'small' | 'large'

export interface UiLoadingProps extends UiProps {
  /** 框旁/下说明。可选 */
  label?: string
  /** small / large。省略 = 中档 */
  size?: UiLoadingSize
}

export interface UiBreadcrumbItem {
  key?: string
  label: string
  icon?: string
  /** 可点则有；末级通常省略。路由 path，不是厂商 url */
  to?: string
}

export interface UiBreadcrumbProps extends UiProps {
  items: UiBreadcrumbItem[]
  /** 分隔符；默认交给厂商 */
  separator?: string
}

export type UiProgressBarKind = 'linear' | 'circular'
export type UiProgressBarSize = 'small' | 'large'

export interface UiProgressBarProps extends UiProps {
  value?: number
  min?: number
  max?: number
  kind?: UiProgressBarKind
  /** 粗细。省略 = 中档。不要写 EJ2 height:'4px' */
  size?: UiProgressBarSize
  /** 不确定进度。对应 EJ2 isIndeterminate */
  indeterminate?: boolean
  /** 是否显示数值。对应 EJ2 showProgressValue */
  showValue?: boolean
  colorRole?: UiColorRole
}

export function progressBarModifierClasses(
  props: UiProgressBarProps,
): unknown[] {
  return [
    uiCssClass('progressbar'),
    props.kind === 'circular'
      ? uiCssClass('progressbar', 'circular')
      : undefined,
    props.size ? uiCssClass('progressbar', props.size) : undefined,
    props.colorRole
      ? uiCssClass('progressbar', props.colorRole)
      : undefined,
    props.indeterminate
      ? uiCssClass('progressbar', 'indeterminate')
      : undefined,
    props.class,
  ]
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

export function loadingModifierClasses(props: UiLoadingProps = {}): unknown[] {
  const size =
    props.size === 'small' || props.size === 'large' ? props.size : undefined
  const labeled =
    props.label != null && props.label !== ''
      ? uiCssClass('loading', 'labeled')
      : undefined
  return [
    uiCssClass('loading'),
    size ? uiCssClass('loading', size) : undefined,
    labeled,
    props.class,
  ]
}

export const LOADING_WIDTH_SMALL = 24
export const LOADING_WIDTH_MEDIUM = 48
export const LOADING_WIDTH_LARGE = 64

export function loadingLabelOf(props: UiLoadingProps = {}): string | undefined {
  if (props.label == null || props.label === '') return undefined
  return String(props.label)
}

export function loadingSizeOf(
  props: UiLoadingProps = {},
): UiLoadingSize | undefined {
  if (props.size === 'small' || props.size === 'large') return props.size
  return undefined
}

export function loadingWidthOf(props: UiLoadingProps = {}): number {
  const size = loadingSizeOf(props)
  if (size === 'small') return LOADING_WIDTH_SMALL
  if (size === 'large') return LOADING_WIDTH_LARGE
  return LOADING_WIDTH_MEDIUM
}

function progressNumberOf(raw: unknown): number {
  if (raw == null || raw === '') return 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export function progressBarPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiProgressBarProps {
  return {
    value: progressNumberOf(context.getFieldValue(field, extra.row)),
    min: extra.min as number | undefined,
    max: extra.max as number | undefined,
    kind: extra.kind as UiProgressBarKind | undefined,
    size: extra.size as UiProgressBarSize | undefined,
    indeterminate: extra.indeterminate as boolean | undefined,
    showValue: extra.showValue as boolean | undefined,
    colorRole: extra.colorRole as UiColorRole | undefined,
    class: extra.class,
    htmlAttributes: extra.htmlAttributes as UiProgressBarProps['htmlAttributes'],
  }
}
