import { h } from "vue";
import Drawer from "primevue/drawer";
import type { UiSidebarProps, UiSidebarSlots } from "@mmda/vui"
import { applyDrawerDefaults, emitSidebarChange, htmlAttributesOf, sidebarIsOpenOf, sidebarModifierClasses, sidebarPositionOf, sidebarShowBackdropOf, sidebarSlotsOf, sidebarWidthOf } from "@mmda/vui"

function widthStyle(width: string | number): Record<string, string> {
  const w = typeof width === "number" ? `${width}px` : String(width);
  return { width: w };
}

function renderSidebar(
  props: UiSidebarProps,
  slots: UiSidebarSlots | undefined,
  asDrawer: boolean,
) {
  const applied = asDrawer ? applyDrawerDefaults(props) : props;
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
    visible: _visible,
    show: _show,
    onUpdateVisible: _onUpdateVisible,
    ...rest
  } = applied;

  return h(
    Drawer,
    {
      ...rest,
      ...htmlAttributesOf(applied),
      visible: sidebarIsOpenOf(applied),
      position: sidebarPositionOf(applied).toLowerCase(),
      modal: sidebarShowBackdropOf(applied, asDrawer),
      class: sidebarModifierClasses(applied, asDrawer).flat(),
      style: widthStyle(sidebarWidthOf(applied)),
      "onUpdate:visible": (next: unknown) =>
        emitSidebarChange(applied, next),
    },
    sidebarSlotsOf(slots),
  );
}

export function createSidebar(
  props: UiSidebarProps,
  slots?: UiSidebarSlots,
) {
  return renderSidebar(props, slots, false);
}

export function createDrawer(
  props: UiSidebarProps,
  slots?: UiSidebarSlots,
) {
  return renderSidebar(props, slots, true);
}
