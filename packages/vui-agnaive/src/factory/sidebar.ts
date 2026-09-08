import { h } from 'vue'
import { NDrawer } from 'naive-ui'
import type { UiSidebarProps, UiSidebarSlots } from '@mmda/vui'
import {
  applyDrawerDefaults,
  emitSidebarChange,
  htmlAttributesOf,
  sidebarIsOpenOf,
  sidebarModifierClasses,
  sidebarPositionOf,
  sidebarShowBackdropOf,
  sidebarSlotsOf,
  sidebarWidthOf,
} from '@mmda/vui'

function renderSidebar(
  props: UiSidebarProps,
  slots: UiSidebarSlots | undefined,
  asDrawer: boolean,
) {
  const applied = asDrawer ? applyDrawerDefaults(props) : props
  const {
    isOpen: _isOpen,
    modelValue: _modelValue,
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
    visible: _visible,
    show: _show,
    onUpdateVisible: _onUpdateVisible,
    ...rest
  } = applied

  const width = sidebarWidthOf(applied)

  return h(
    NDrawer,
    {
      ...rest,
      ...htmlAttributesOf(applied),
      show: sidebarIsOpenOf(applied),
      placement: sidebarPositionOf(applied).toLowerCase(),
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
  slots?: UiSidebarSlots,
) {
  return renderSidebar(props, slots, false)
}

export function createDrawer(
  props: UiSidebarProps,
  slots?: UiSidebarSlots,
) {
  return renderSidebar(props, slots, true)
}
