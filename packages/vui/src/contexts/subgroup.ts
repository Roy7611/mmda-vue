// @ts-nocheck
import {
  MetaModel,
  isPromise,
  type Entity,
  type MetaUiGroup,
  type SubGroupItemTransformParam,
  type UiSubGroupView,
} from "@mmda/core";
import type { MetaUiFieldLogic } from "@mmda/core";
import type { UiViewContext } from "./view_context";

type FieldLogicMap = Record<string, MetaUiFieldLogic<any>>;
type Host = UiViewContext<any>;

export function attachContextSubgroup(ctor: { prototype: Host }) {
  Object.assign(ctor.prototype, {
    getSelectedGroupItems(group: MetaUiGroup | string) {
      return this.subGroupContext(group).selectedItems;
    },
    subGroupContext(group: MetaUiGroup | string) {
      const grp = this.resolveGroup(group);
      if (!grp.groupUi)
        throw new Error(`Group "${grp.groupName}" has no groupUi.`);
      const path = `${this.cachePath}/${grp.groupName}`;
      const cached = this.cache.get(path);
      if (cached) return cached;
      const rows =
        ((this.model as Record<string, any>)[grp.groupName] as
          object[] | undefined) ?? [];
      const fieldLogics: FieldLogicMap = {};
      const groupLogic = this.getGroupLogic(grp);
      for (const fieldLogic of groupLogic?.fields ?? []) {
        fieldLogics[fieldLogic.field.fieldName] = fieldLogic;
      }
      return this.createChild(rows, grp.groupUi, path, this.view, fieldLogics);
    },

    subGroupItemContext<G extends Entity>(
      group: MetaUiGroup | string,
      item: G,
      groupMode: UiSubGroupView = this.editing ? "edit" : "details",
      cacheKey = "id",
    ) {
      const grp = this.resolveGroup(group);
      if (!grp.groupUi)
        throw new Error(`Group "${grp.groupName}" has no groupUi.`);
      const rowKey = this.rowCacheKey(item, cacheKey, grp.groupUi.primaryKey);
      const path = `${this.cachePath}/${grp.groupName}/${rowKey}`;
      const cached = this.cache.get(path);
      if (cached) return cached as UiViewContext<G>;
      const fieldLogics: FieldLogicMap = {};
      const groupLogic = this.getGroupLogic(grp);
      for (const fieldLogic of groupLogic?.fields ?? []) {
        fieldLogics[fieldLogic.field.fieldName] = fieldLogic;
      }
      return this.createChild(
        item,
        grp.groupUi,
        path,
        groupMode as UiViewOneType,
        fieldLogics,
        this.logic?.createRelativeLogic?.(grp.groupName, this.model as Entity) ??
          this.logic,
      ) as UiViewContext<G>;
    },
    addSubGroupItem<G extends Entity>(group: MetaUiGroup | string, item: G) {
      const grp = this.resolveGroup(group);
      const items = ((this.model as Record<string, any>)[grp.groupName] ??= []);
      // 已在集合中则跳过（newSubGroupItem 会先入集，调用方 .then 里再 add 也不会重复）
      if (items.includes(item)) return;
      items.push(item);
      MetaModel.modify(this.model as Entity);
      this.getGroupLogic(grp)?.onChangeFn?.(
        this,
        this.model,
        items,
      );
    },

    addSubGroupItems<G extends Entity>(param: SubGroupItemTransformParam<G>) {
      MetaModel.addSubGroupItems(this.resolveSubGroupTransform(param));
      MetaModel.modify(this.model as Entity);
      const group = this.resolveGroup(param.group);
      this.getGroupLogic(group)?.onChangeFn?.(
        this,
        this.model,
        (this.model as Record<string, any>)[group.groupName],
      );
    },

    createSubGroupItems<G extends Entity>(
      param: SubGroupItemTransformParam<G>,
    ): Promise<G | G[]> {
      return Promise.resolve(
        MetaModel.createSubGroupItems(this.resolveSubGroupTransform(param)),
      );
    },

    removeSubGroupItem<G extends Entity>(group: MetaUiGroup | string, item: G) {
      const grp = this.resolveGroup(group);
      const logic = this.getGroupLogic(grp);
      const items = (this.model as Record<string, any>)[grp.groupName] ?? [];
      const commit = () => {
        MetaModel.deleteItem(items, item);
        logic?.onChangeFn?.(this, this.model, items);
      };
      const intercept = logic?.beforeItemRemoveFunc;
      if (!intercept) {
        commit();
        return;
      }
      const master = ((this.root ?? this).model ?? {}) as Record<string, any>;
      const result = intercept(item, master, this);
      if (isPromise(result)) {
        return result.then((ok) => {
          if (ok !== false) commit();
        });
      }
      if (result !== false) commit();
    },

    removeSubGroupItems<G extends Entity>(group: MetaUiGroup | string) {
      const grp = this.resolveGroup(group);
      const items = (this.model as Record<string, any>)[grp.groupName] ?? [];
      MetaModel.clearItems(items);
      this.getGroupLogic(grp)?.onChangeFn?.(
        this,
        this.model,
        items,
      );
    },
    async subGroupItem<G>(
      group: MetaUiGroup | string,
      item: G,
      props: { groupMode?: UiSubGroupView } = {},
    ): Promise<false | G> {
      const ctx = this.subGroupItemContext(
        group,
        item as Entity,
        props.groupMode,
      );
      if (!this.app) return item;
      this.root.showDialog = ctx.isEditDialog = true;
      try {
        const accepted = await this.app.ui.dialog(
          this.app.ui.buildView(ctx),
          ctx,
          { name: this.resolveGroup(group).groupName },
        );
        return accepted ? (ctx.model as G) : false;
      } finally {
        this.root.showDialog = ctx.isEditDialog = false;
      }
    },

    /**
     * 创建子表行并打开对话框。
     * 先写入数据源，确定保留；取消则移除该行（与表格原位添加一样直接操作集合）。
     */
    async newSubGroupItem<G extends Entity>(
      param: SubGroupItemTransformParam<G>,
    ) {
      const created = (await this.createSubGroupItems(param)) as G;
      this.addSubGroupItem(param.group, created);
      const accepted = await this.subGroupItem(param.group, created, {
        groupMode: "create",
      });
      if (!accepted) {
        this.removeSubGroupItem(param.group, created);
        return false;
      }
      return accepted;
    },
  });
}
