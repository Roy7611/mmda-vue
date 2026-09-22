import { h } from 'vue'
import { NDrawer } from 'naive-ui'
import type { UiSidebarProps, VuiTileSlots } from '@mmda/vui'
import { applyDrawerDefaults, emitSidebarChange, sidebarIsOpenOf, sidebarModifierClasses, sidebarPositionOf, sidebarShowBackdropOf, sidebarSlotsOf, sidebarWidthOf } from '@mmda/vui'
import { uiRenderProps } from '@mmda/core'

function renderSidebar(
  props: UiSidebarProps,
  slots: VuiTileSlots | undefined,
  asDrawer: boolean,
) {
  const applied = asDrawer ? applyDrawerDefaults(props) : props
  const {
    isOpen: _isOpen,
    position: _position,
    type: _type,
    width: _width,
    showBackdrop: _showBackdrop,
    enableDock: _enableDock,
    dockSize: _dockSize,
    target: _target,
    mediaQuery: _mediaQuery,
    enableGestures: _enableGestures,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = applied

  const width = sidebarWidthOf(applied)

  return h(
    NDrawer as any,
    {
      ...rest,
      ...uiRenderProps(applied).attributes,
      show: sidebarIsOpenOf(applied),
      placement: sidebarPositionOf(applied).toLowerCase() as
        | 'left'
        | 'right'
        | 'top'
        | 'bottom',
      width,
      mask: sidebarShowBackdropOf(applied, asDrawer),
      class: sidebarModifierClasses(applied, asDrawer).flat(),
      'onUpdate:show': (next: unknown) => emitSidebarChange(applied, next),
    },
    sidebarSlotsOf(slots),
  )
}

export function createSidebar(
  props: UiSidebarProps,
  slots?: VuiTileSlots,
) {
  return renderSidebar(props, slots, false)
}

export function createDrawer(
  props: UiSidebarProps,
  slots?: VuiTileSlots,
) {
  return renderSidebar(props, slots, true)
}
