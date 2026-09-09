import { renderSearchForRelativeField, type UiProps, type SearchForRelativeProps, type UiSlots } from "@mmda/vui"
import { createDrawer, createSidebar } from "./sidebar";

export function overlayRenderers() {
  return {
    sidebar: createSidebar,
    drawer: createDrawer,
    searchForRelative: (props: SearchForRelativeProps | UiProps, _slots?: UiSlots) =>
      renderSearchForRelativeField(props as SearchForRelativeProps),
  };
}
