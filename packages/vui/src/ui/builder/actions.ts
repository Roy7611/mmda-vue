import type { ActionCallback, EntityAction } from "@mmda/core";
import { entityActionFactory } from "@mmda/core";
import { UiContextAction, type IconResolver } from "../factory/action";
import type { VueUiBuilder, ImportOrExportParam } from "./builder";
import { deletableSelectedItems } from "../../contexts/build_context";
import type { UiContext } from "./helpers";

export class UiActionFactory {
  constructor(
    public readonly builder: VueUiBuilder,
    public readonly resolveIcon: IconResolver,
  ) {}

  fromEntity(context: UiContext, action: any) {
    return UiContextAction(context as any, action, this.resolveIcon);
  }

  private createAction(
    context: UiContext,
    name: keyof typeof entityActionFactory,
    callback: ActionCallback,
  ) {
    return this.fromEntity(context, entityActionFactory[name](callback));
  }

  back(context: UiContext) {
    return this.createAction(context, "back", () => {
      const router = (context as any).globalProps?.$router;
      router?.back?.();
    });
  }

  create(context: UiContext) {
    return this.createAction(context, "create", () =>
      (context as any).create?.(),
    );
  }

  confirm(context: UiContext) {
    return this.createAction(context, "confirm", () =>
      (context as any).confirmAction?.(),
    );
  }

  cancel(context: UiContext) {
    return this.createAction(context, "cancel", () =>
      (context as any).cancel?.(context),
    );
  }

  edit(context: UiContext) {
    return this.createAction(context, "edit", () => (context as any).edit?.());
  }

  save(context: UiContext) {
    return this.createAction(context, "save", async () => {
      const runtime = context as any;
      const result = await runtime.save?.();
      // 创建/编辑保存成功后进详情（对话框 confirm 走 confirmAction，不经此路径）
      if (result !== false && result != null && runtime.editing) {
        const key = runtime.metaui?.primaryKey as string | undefined;
        const id =
          result?.id ??
          runtime.model?.id ??
          (key ? (result?.[key] ?? runtime.model?.[key]) : undefined);
        if (id != null && id !== "") runtime.details?.(String(id));
      }
      return result;
    });
  }

  delete(context: UiContext) {
    return this.createAction(context, "delete", async () => {
      const runtime = context as any;
      const result = await this.builder.confirm(context, {
        message:
          runtime.translate?.("confirmation.delete", {
            it: runtime.getModelTitle?.(),
          }) ?? "Delete this item?",
        buttons: ["yes", "no"],
      });
      if (result) return runtime.delete?.();
    });
  }

  deleteAll(context: UiContext) {
    return this.createAction(context, "deleteAll", async () => {
      const runtime = context as any;
      const selected = runtime.selectedItems ?? [];
      if (selected.length === 0) {
        return this.builder.toast(context, {
          severity: "error",
          detail:
            runtime.translate?.("invalid.requiredSelectAny") ??
            "Select at least one item.",
        });
      }
      const deletable = deletableSelectedItems(selected);
      if (deletable.length === 0) {
        return this.builder.toast(context, {
          severity: "error",
          detail:
            runtime.translate?.("invalid.noDeletable") ??
            "Selected records cannot be deleted.",
        });
      }
      const result = await this.builder.confirm(context, {
        message:
          deletable.length === 1
            ? (runtime.translate?.("confirmation.delete", {
                it: runtime.metaui?.displayLabel,
              }) ?? "Delete this item?")
            : (runtime.translate?.("confirmation.deleteAll", {
                it: runtime.metaui?.displayLabel,
              }) ?? "Delete selected items?"),
        buttons: ["yes", "no"],
      });
      if (!result) return;
      const ids = deletable
        .map((item: any) => item?.id)
        .filter((id: unknown) => id != null)
        .map((id: unknown) => String(id));
      return runtime.deleteAll?.(ids);
    });
  }

  refresh(context: UiContext) {
    return this.createAction(context, "refresh", () =>
      (context as any).refresh?.(true),
    );
  }

  print(context: UiContext) {
    return this.createAction(context, "print", () =>
      (context as any).print?.(),
    );
  }

  import(context: UiContext, options?: ImportOrExportParam) {
    return this.createAction(context, "import", async () => {
      const runtime = context as any;
      runtime.currentTemplate = null;
      const result = await (runtime.many
        ? runtime.importFiles?.(options)
        : runtime.importFile?.(options));
      options?.handlerFn?.(context, result);
      return result;
    });
  }

  export(context: UiContext, options?: ImportOrExportParam) {
    return this.createAction(context, "export", () => {
      const runtime = context as any;
      runtime.currentTemplate = null;
      return runtime.many
        ? runtime.exportFiles?.(options)
        : runtime.exportFile?.(options);
    });
  }

  add(context: UiContext, onAdd: ActionCallback) {
    return this.createAction(context, "add", onAdd);
  }

  remove(context: UiContext, onRemove: ActionCallback) {
    return this.createAction(context, "remove", onRemove);
  }

  action(context: UiContext, action: EntityAction) {
    action.onAction = () => (context as any).doAction?.(action);
    const configured =
      (typeof action.role === "string" && action.role.trim()) ||
      action.param?.hint ||
      (action as { displayHint?: string }).displayHint;
    action.role = configured ? String(configured) : "warning";
    return this.fromEntity(context, action);
  }
}
