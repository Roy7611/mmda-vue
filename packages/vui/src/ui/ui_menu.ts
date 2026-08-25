import type { UiAction } from "./ui_action";

export interface UiMenuItem extends UiAction {
  url?: string;
  items?: UiMenuItem[];//子菜单
}