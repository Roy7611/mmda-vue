import type { UiAction } from "./action";

export interface UiMenuItem extends UiAction {
  url?: string;
  items?: UiMenuItem[];//子菜单
}