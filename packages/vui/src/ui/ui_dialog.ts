/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2024-09-18 19:15:16
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2024-12-04 21:06:59
 * @FilePath: /mmda-vue/packages/vui/src/ui/ui_dialog.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { MetaUiDialogButton } from "@mmda/core";
import type {
  MetaUiMessageBoxProps,
  MetaUiMessageBoxResult,
} from "@mmda/core";
import type { UiColorRole } from "./ui_material";
import type { ChildSlot } from "./ui_view";
import type { CSSProperties, Ref, VNode } from "vue";

//#region 对话框
// export enum UiDialogButton{
//   ok = 1,
//   yes = 2,
//   cancel = 4,
//   no = 8,
// }
export type UiDialogButtonType = MetaUiDialogButton;
export interface UiDialogProps {
  [index: string]: any;
  name: string;
  refInstance?: any;
  data?: any;
  title?: string;
  modal?: boolean;
  fullscreen?: boolean;
  width?: string | number;
  destroyOnClose?: boolean;
  appendToBody?: boolean;
  appendTo?: string;
  show?: boolean;
}
export interface UiDialogSlots {
  header?: ChildSlot;
  default?: ChildSlot;
  footer?: ChildSlot;
}
export interface UiDialogEmits {
  onOpen?: () => void;
  onConfirm?: (...args: any[]) => void;
  onClose?: () => void;
  accept?: () => Promise<boolean>;
  reject?: () => Promise<boolean>;
}
export type UiDialogPropsType = UiDialogProps & UiDialogSlots & UiDialogEmits;
export interface UiDialogInstance {
  instance: any;
  show: Ref<boolean>;
  // show: boolean
}
//#endregion of dialog

//#region 消息框 MessageBox
export type UiMessageBoxResult = MetaUiMessageBoxResult;
export interface UiMessageBoxProps extends MetaUiMessageBoxProps {
  draggable?: boolean;
  center?: boolean;
  customStyle?: CSSProperties;
  showCancelButton?: boolean;
  appendTo?: string | HTMLElement;
  header?: string;
  icon?: string;
  rejectProps?: object;
  acceptProps?: object;
  dlgName?: string;
  /**
   * Callback to execute when action is confirmed.
   * @todo Next release should be able to change
   */
  accept?: () => boolean;
  /**
   * Callback to execute when action is rejected.
   */
  reject?: () => boolean;
}

//#endregion

//#region 通知
export type MessageType = "" | "success" | "info" | "warning" | "error";
export interface UiNotificationProps {
  message: string | VNode;
  type: MessageType;
  title: string;
  icon?: UiColorRole;
}
//#endregion
