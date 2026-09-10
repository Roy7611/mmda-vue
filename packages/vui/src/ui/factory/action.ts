import { computed, unref } from "vue";
import type { UiColorRole, UiAction, Predicate } from "@mmda/core";
import {
  parseEntityBoolExpression,
  isPromise,
  type EntityAction,
  type TranslateFn,
  type ActionCallback,
  type UiContext,
} from "@mmda/core";

export type { UiColorRole, UiAction } from "@mmda/core";
export type IconResolver = (icon: string) => string;

/**
 * 动作按钮图标：优先 name / 已映射的 icon；未映射语义名（会发明假 e-/pi-/fa- class）回落 execute（播放/执行）。
 * dense 工具栏去文字后若无真图标，高度会塌成色块。
 */
export function resolveActionButtonIcon(
  resolveIcon: IconResolver,
  actionIcons: Record<string, string> | undefined,
  action: { name?: string; icon?: string },
): string {
  const icons = actionIcons ?? {}
  const execute = icons.execute ?? resolveIcon("execute")
  if (action.name && icons[action.name]) return icons[action.name]
  const raw = action.icon?.trim()
  const inventedFrom = (name: string, css: string) =>
    css === `e-icons e-${name}` ||
    css === `e-${name}` ||
    css === `pi pi-${name}` ||
    css === `fas fa-${name}`
  if (raw) {
    if (Object.values(icons).includes(raw)) return raw
    if (action.name && inventedFrom(action.name, raw)) return execute
    return raw
  }
  if (action.name) {
    const resolved = resolveIcon(action.name)
    if (resolved && !inventedFrom(action.name, resolved)) return resolved
  }
  return execute
}

export interface UiActionContext extends UiContext {
  readonly model: Record<string, any>
  actionLoadings: Record<string, boolean>
  readonly executing: boolean
}

/** Normalize backend action roles before passing them to a UI skin. */
export const normalizeActionColorRole = (
  role?: string,
): UiColorRole | undefined => {
  const normalized = role?.trim().toLowerCase()
  if (!normalized) return undefined
  if (normalized === "warn") return "warning"
  if (normalized === "error") return "danger"
  if (
    normalized === "primary" ||
    normalized === "secondary" ||
    normalized === "success" ||
    normalized === "info" ||
    normalized === "warning" ||
    normalized === "danger"
  ) {
    return normalized
  }
  return undefined
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
    colorRole: normalizeActionColorRole(role),
    onAction,
    // visible,
    tooltip: description,
    group,
  };
};

/** EntityAction.executableExpression → UiAction.canDo（字符串或函数）。 */
export function canDoFromExecutableExpression(
  _context: UiActionContext,
  action: EntityAction,
): Predicate | undefined {
  const expr = action.executableExpression;
  if (typeof expr === "function") return expr as Predicate;
  if (typeof expr === "string" && expr.trim()) {
    return parseEntityBoolExpression(expr);
  }
  return undefined;
}

export const UiContextAction = (
  context: UiActionContext,
  action: EntityAction,
  i: IconResolver,
): UiAction => {
  const {
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
  } = action;
  return {
    name,
    id,
    label: label ?? context.t(`action.${name}`),
    icon: i(icon ?? name),
    colorRole: normalizeActionColorRole(role),
    loading: unref(context.actionLoadings[name]),
    onAction: () => {
      if (context.executing) {
        context.uiBuilder
          .toast(context, {
            severity: "warning",
            title: context.translate("dialog.title.warning"),
            message: context.translate("failure.executing"),
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
    canDo: canDoFromExecutableExpression(context, action),
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

/** 是否渲染此项。`target` 为行或页 model；Predicate 时传入。 */
export function isActionVisible(
  action: UiAction,
  target?: unknown,
  ctx?: unknown,
): boolean {
  const visible = action.visible;
  if (visible == null) return true;
  if (typeof visible === "boolean") return visible;
  if (typeof visible === "function") return visible(target, ctx as any) !== false;
  if (typeof visible === "object" && visible !== null && "value" in visible) {
    return (visible as { value: boolean }).value !== false;
  }
  return true;
}

/** 是否可点。先看静态 `disabled`，再看 `canDo`。 */
export function isActionEnabled(
  action: UiAction,
  target?: unknown,
  ctx?: unknown,
): boolean {
  if (action.disabled === true) return false;
  const canDo = action.canDo;
  if (canDo == null) return true;
  if (typeof canDo === "boolean") return canDo;
  return canDo(target, ctx as any) !== false;
}
