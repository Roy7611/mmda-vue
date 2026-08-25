/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2024-09-18 19:15:16
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2026-06-03 10:24:43
 * @FilePath: /mmda-vue/packages/vui/src/ui/ui_button.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ButtonHTMLAttributes, LinkHTMLAttributes, VNode } from "vue";
import type { UiAction } from "./ui_action";
import type { UiColorRole } from "./ui_material";
import type { ChildSlot } from "./ui_view";
import type { PropData, UiSlots } from "./ui_layout";

export type UiButtonShape = "square" | "round" | "circle";
export type UiButtonType = "filled" | "outlined" | "elevated" | "link" | "text";
export type UiButtonSize = "small" | "large";

export interface UiButtonProps extends ButtonHTMLAttributes, UiAction {
  [index: string]: unknown;
  id?: string;
  label?: string;
  tooltip?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  buttonType?: UiButtonType;
  size?: UiButtonSize;
  shape?: UiButtonShape;
  colorRole?: UiColorRole;
}

export interface UiButtonSlots {
  default: () => VNode[];
}

export interface UiSplitButtonProps extends UiButtonProps {
  actions: UiAction[];
  menuitemiconSlot?: ChildSlot;
  splitSlot?: UiSlots;
  splitProps?: PropData
}

export interface UiLinkProps extends LinkHTMLAttributes {
  [index: string]: unknown;
  text?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  colorRole?: UiColorRole;
}
export interface UiLinkSlots {
  default: () => VNode[];
}

export type UiLinkType = UiLinkProps & UiLinkSlots;
