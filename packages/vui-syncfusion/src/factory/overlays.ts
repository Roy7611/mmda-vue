import { renderSearchForRelativeField, type UiProps, type SearchForRelativeProps, type VuiTileSlots } from "@mmda/vui"
import { createDrawer, createSidebar } from "./sidebar";

export function overlayRenderers() {
  return {
    sidebar: createSidebar,
    drawer: createDrawer,
    searchRelative: (props: SearchForRelativeProps | UiProps, _slots?: VuiTileSlots) =>
      renderSearchForRelativeField(props as SearchForRelativeProps),
  };
}
