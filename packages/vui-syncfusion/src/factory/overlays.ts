import {
  renderSearchForRelativeField,
  type PropData,
  type SearchForRelativeProps,
  type UiSlots,
} from "@mmda/vui";
import { createDrawer, createSidebar } from "./sidebar";

export function overlayRenderers() {
  return {
    sidebar: createSidebar,
    drawer: createDrawer,
    searchForRelative: (props: SearchForRelativeProps | PropData, _slots?: UiSlots) =>
      renderSearchForRelativeField(props as SearchForRelativeProps),
  };
}
