import { h } from "vue";
import { SidebarComponent } from "@syncfusion/ej2-vue-navigations";
import type { UiSidebarProps, UiSidebarSlots } from "@mmda/vui"
import { applyDrawerDefaults, emitSidebarChange, htmlAttributesOf, sidebarEnableDockOf, sidebarEnableGesturesOf, sidebarIsOpenOf, sidebarModifierClasses, sidebarPositionOf, sidebarShowBackdropOf, sidebarSlotsOf, sidebarTypeOf, sidebarWidthOf } from "@mmda/vui"

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
    dockSize,
    target,
    mediaQuery,
    enableGestures: _enableGestures,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    visible: _visible,
    show: _show,
    onUpdateVisible: _onUpdateVisible,
    ...rest
  } = applied;

  const cssClass = sidebarModifierClasses(applied, asDrawer)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(
    SidebarComponent as any,
    {
      ...rest,
      ...htmlAttributesOf(applied),
      isOpen: sidebarIsOpenOf(applied),
      position: sidebarPositionOf(applied),
      type: sidebarTypeOf(applied, asDrawer),
      width: sidebarWidthOf(applied),
      showBackdrop: sidebarShowBackdropOf(applied, asDrawer),
      enableDock: sidebarEnableDockOf(applied),
      dockSize,
      target,
      mediaQuery,
      enableGestures: sidebarEnableGesturesOf(applied),
      cssClass,
      open: () => emitSidebarChange(applied, true),
      close: () => emitSidebarChange(applied, false),
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
