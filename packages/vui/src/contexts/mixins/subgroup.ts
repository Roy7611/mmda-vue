import {
  type Entity,
  type MetaUiGroup,
  type MetaUiGroupLogic,
} from "@mmda/core";
import { computed } from "vue";
import { canDoFromExecutableExpression, type UiAction } from "../../ui/factory/action";
import type { UiColorRole } from "../../app/material";
import { UiViewOne } from "../view";
import type { Constructor } from "./types";

export function WithSubgroup<TBase extends Constructor>(Base: TBase) {
  return class Subgroup extends Base {
    /** 组动作缓存；重注册组逻辑时失效。内部字段（匿名混入类不能 private，否则声明无法发射）。 */
    _groupActions: Record<string, UiAction[]> = {};

    setupGroupLogic(logic: MetaUiGroupLogic<any, any>) {
      delete this._groupActions[logic.group.groupName];
      super.setupGroupLogic(logic);
    }

    getGroupActions(grp: MetaUiGroup): UiAction[] {
      this.setupGroupActions(grp);
      return (this._groupActions[grp.groupName] ?? []).filter(
        (a: UiAction) => {
          if (
            a.view &&
            a.view !== UiViewOne.Create &&
            a.view !== UiViewOne.Edit
          ) {
            return false;
          }
          const visible = a.visible;
          if (visible == null) return true;
          if (typeof visible === "function") return true;
          if (
            typeof visible === "object" &&
            visible !== null &&
            "value" in visible
          ) {
            return Boolean((visible as { value: boolean }).value);
          }
          return Boolean(visible);
        },
      );
    }

    setupGroupActions(grp: MetaUiGroup) {
      const name = grp.groupName;
      const actionsMap = this._groupActions;
      if (actionsMap[name]) return;

      const actions: UiAction[] = [];
      actionsMap[name] = actions;
      if (!this.editing) return;

      const grpLogic = this.getGroupLogic(grp);
      if (!grpLogic) return;

      const visibles = this.logic?.groupActionVisibles?.[name];
      const context = this;

      const liveCanDo = (action: any) => {
        return (model: unknown, ctx?: unknown) => {
          if (this.isGroupReadonly(grp)) return false;
          const pred = canDoFromExecutableExpression(this as any, action);
          return pred ? pred(model as Entity, ctx as any) !== false : true;
        };
      };

      const visibleOf = (actionName: string) =>
        visibles?.[actionName]
          ? computed(() => !!visibles[actionName]!(this.model, this))
          : undefined;

      for (const std of grpLogic.stdActions ?? []) {
        if (std.name === "clear") {
          actions.push({
            name: "clear",
            icon: std.icon ?? "clear",
            label: std.label ?? this.t("action.clear"),
            colorRole: "danger",
            onAction: () => this.removeSubGroupItems(grp),
            view: UiViewOne.Edit,
            canDo: liveCanDo(std),
            visible: visibleOf("clear"),
          });
        } else if (std.name === "add") {
          actions.push({
            name: "add",
            role: "secondary",
            icon: std.icon ?? "plus",
            label: std.label ?? this.t("action.add"),
            colorRole: "primary",
            onAction: () => this.runGroupAdd(grp, grpLogic),
            view: UiViewOne.Edit,
            canDo: liveCanDo(std),
            visible: visibleOf("add"),
          });
        }
      }

      if (grpLogic.customActions?.length) {
        for (const a of grpLogic.customActions) {
          const uiAction: UiAction = {
            name: a.name,
            icon: a.icon,
            label: a.label,
            colorRole: a.role as UiColorRole,
            onAction: () =>
              a.onAction!.apply(this.logic, [context, context.model]),
            tooltip: a.description,
            view: a.view ?? context.view,
            canDo: liveCanDo(a),
          };
          if (a.visible) {
            uiAction.visible = computed(() => !!a.visible!(context.model));
          }
          actions.push(uiAction);
        }
      }
    }

    async runGroupAdd(grp: MetaUiGroup, grpLogic: MetaUiGroupLogic<any, any>) {
      if (typeof grpLogic.defaultAddFn === "function") {
        return grpLogic.defaultAddFn.apply(this.logic, [this, this.model]);
      }
      const items = (this.model as Record<string, any>)[grp.groupName] ?? [];
      if (typeof grpLogic.beforeAddFn === "function") {
        const ok = await grpLogic.beforeAddFn(this as any, this.model, items);
        if (ok === false) return;
      }
      const created = await this.createSubGroupItems({
        group: grp,
        target: this.model as Entity,
      });
      const list = Array.isArray(created) ? created : [created];
      for (const item of list) this.addSubGroupItem(grp, item);
    }
  };
}
