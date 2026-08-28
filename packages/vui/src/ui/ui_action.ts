import { computed, unref, type ComputedRef } from "vue";
import type { UiColorRole } from "./ui_material";
import type {
  EntityAction,
  TranslateFn,
  ActionCallback,
  UiContext,
} from "@mmda/core";
import { isPromise } from "@mmda/core";

export type IconResolver = (icon: string) => string;

export interface UiActionContext extends UiContext {
  readonly model: Record<string, any>
  actionLoadings: Record<string, boolean>
  readonly executing: boolean
  uiBuilder: {
    toast(
      context: UiContext,
      props: Record<string, any>,
    ): unknown
  }
}

/**
 * action操作动作，包括详情、编辑、查询
 */
export enum ActionCommand {
  Details = "details",
  Edit = "edit",
  Search = "search",
  Delete = "delete",
  ForgotPassword = "forgotPassword",
  LoginOut = "loginOut",
  Upload = "upload",
  ImportTemple = "importTemple",
  Xml = 'Xml',
  Svg = 'Svg'
}

export interface ActionItem {
  name?: ActionCommand | string,
  role?: ActionCommand | string,
  command?: () => void,
  icon?: ActionCommand | string,
  label?: string,
  divider?: boolean
}

/**
 * 界面动作，用于构建交互元素，如菜单、按钮
 *
 * @remarks {@link EntityAction}是针对实体{@link Entity}的操作，将转为`UiAction`在UI层展现
 */
export interface UiAction {
  id?: string;
  name?: string;
  role?: string;
  icon?: string;
  label?: string;
  onAction?: ActionCallback;
  command?: ActionCallback;
  divider?: boolean;
  colorRole?: UiColorRole;
  tooltip?: string;
  disabled?: boolean | "true" | "false";
  visible?: ComputedRef<boolean>;
  group?: string;
  loading?: boolean; // 是否正在加载
  view?: string; //显示在那几个视图，比如details,edit，若为空则全部显示
}

/**
 * 界面动作构造函数，从实体动作行为创建（废弃）
 * @param callback 回调函数
 * @param t 翻译函数
 * @param i 图标函数
 * @param action 实体动作行为{@link EntityAction}
 * @returns
 */
export const UiActionCtor = (
  {
    name,
    label,
    icon,
    role,
    onAction,
    description,
    visible,
    group,
  }: EntityAction,
  t: TranslateFn,
  i: IconResolver
): UiAction => {
  return {
    name: name,
    label: label ?? t(`action.${name}`),
    icon: i(icon ?? name),
    colorRole: role as UiColorRole,
    onAction,
    // visible,
    tooltip: description,
    group,
  };
};
export const UiContextAction = (
  context: UiActionContext,
  {
    id,
    name,
    label,
    icon,
    role,
    onAction,
    description,
    disabled,
    visible,
    group,
    view,
  }: EntityAction,
  i: IconResolver
): UiAction => {
  return {
    name,
    id,
    label: label ?? context.t(`action.${name}`),
    icon: i(icon ?? name),
    colorRole: role as UiColorRole,
    loading: unref(context.actionLoadings[name]),
    onAction: () => {
      if (context.executing) {
        context.uiBuilder
          .toast(context, {
            severity: "warn",
            group: "br",
            summary: context.translate("dialog.title.warning"),
            detail: context.translate("failure.executing"),
            life: 3000,
          })
        return Promise.reject({ cause: "executing" })
      };
      context.actionLoadings[name] = true;

      // 判断 onAction 的类型
      if (isPromise(onAction)) {
        return onAction(context).finally(() => {
          context.actionLoadings[name] = false;
        })
      } else {
        try {
          const res = onAction(context);
          if (isPromise(res)) {
            return res.finally(() => {
              context.actionLoadings[name] = false;
            })
          } else {
            context.actionLoadings[name] = false;
            return res;
          }
        } catch (error) {
          context.actionLoadings[name] = false;
        }
      }
    },
    disabled,
    visible: visible
      ? computed(visible.bind(context, context.model))
      : undefined,
    tooltip: description,
    group,
    view,
  };
};
/**
 * 界面动作分隔符
 * @returns
 */
export const UiActionDivider = (): UiAction => {
  return {
    divider: true,
  };
};

export interface FlowToModel {
  ownerID: string
  ownerName: string | object
  ownerDeptID: string
  ownerDeptName: string
  importance: string //重要性
  urgency: string //紧急性
  notification: string //待办事宜
  copyTo: Array<any> //通知给
}