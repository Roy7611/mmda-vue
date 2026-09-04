import { h, type VNode } from "vue";
import { pluralize } from "@mmda/core";
import type { ImportAndExportActionProps } from "@mmda/vui";
import type { AbstractUiBuilder } from "@mmda/vui";
import type { UiContext } from "./utils";

export function buildImportOrExportAction(
  this: AbstractUiBuilder & { toolbarActionButton?: Function },
  context: UiContext,
  props: ImportAndExportActionProps,
): VNode {
  const runtime = context as any;
  const repository = runtime.isRoot
    ? runtime.logic.repository
    : pluralize(context.metaui.objName);
  const { role, handlerFn, importFn, exportFn } = props;
  const action =
    role === "import"
      ? this.actionFactory.import(context, {
          repository,
          handlerFn,
          importFn,
        })
      : this.actionFactory.export(context, {
          repository,
          handlerFn,
          exportFn,
        });
  const templates = runtime.templates ?? [];
  if (templates.length > 0) {
    return this.factory.splitButton({
      label: action.label,
      icon: this.factory.resolveIcon(action.icon ?? role ?? ""),
      severity: action.colorRole === "danger" ? "danger" : undefined,
      size: "small",
      onClick: action.onAction,
      actions: templates.map((template: any) => ({
        label: template.templateName,
        icon: this.factory.resolveIcon("file"),
        command: () => {
          runtime.currentTemplate = template;
          if (role === "import") {
            void (runtime.many
              ? runtime.importFiles?.({ repository, importFn })
              : runtime.importFile?.({ repository, importFn }));
          } else {
            void (runtime.many
              ? runtime.exportFiles?.({ repository, exportFn })
              : runtime.exportFile?.({ repository, exportFn }));
          }
        },
      })),
    });
  }
  return this.toolbarActionButton!(context, action);
}
