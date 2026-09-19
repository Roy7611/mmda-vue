import { defineComponent, h, reactive, ref, type PropType } from "vue";
import {
  MetaUiFieldAlignment,
  MetaUiFieldFrozen,
  type TableColumnSettings,
  type MetaUi,
} from "@mmda/core";
import type { VueUiFactory } from "../ui/factory";
import type { VueUiContext } from "../contexts/vue_ui_context";
import type { UiDialogProps } from "@mmda/core";
import {
  applyTableColumnSettings,
  bumpListLayout,
  collectTableColumnSettings,
  layoutRowsByBand,
  listServiceName,
  persistListPack,
  reindexListPos,
  snapshotListLayoutRows,
} from "../ui/builder/list_layout";
import { indexTableMetaUi } from "../ui/builder/join_list_mode";
import {
  readStoredShowActionsColumn,
  writeStoredShowActionsColumn,
} from "../app/theme";

export type TableSettingRow = {
  fieldName: string;
  displayLabel: string;
  listed: boolean;
  frozen: MetaUiFieldFrozen;
  listPos: number;
  listSize?: number;
  align: MetaUiFieldAlignment;
};

interface TableSettingHost {
  factory: VueUiFactory;
  dialog(
    content: ReturnType<typeof h>,
    context: VueUiContext<any>,
    props: UiDialogProps,
  ): Promise<boolean>;
}

const iconButton = (
  factory: VueUiFactory,
  icon: string,
  title: string,
  onClick: () => void,
  disabled = false,
  extraClass?: string,
) =>
  factory.button({
    icon: factory.resolveIcon(icon),
    tooltip: title,
    "aria-label": title,
    buttonType: "text",
    shape: "circle",
    class: ["mmda-list-setting__icon", extraClass].filter(Boolean).join(" "),
    disabled,
    onClick,
  });

export const TableSettingView = defineComponent({
  name: "TableSettingView",
  props: {
    factory: { type: Object as PropType<VueUiFactory>, required: true },
    t: { type: Function as PropType<(key: string) => string>, required: true },
    rows: { type: Array as PropType<TableSettingRow[]>, required: true },
    showActionsColumn: { type: Object as PropType<{ value: boolean }>, required: true },
    restoring: { type: Object as PropType<{ value: boolean }>, required: true },
    saving: { type: Object as PropType<{ value: boolean }>, required: true },
  },
  emits: {
    restore: (_reloadFromDb?: boolean) => true,
    save: (_forever?: boolean) => true,
    cancel: () => true,
    confirm: () => true,
  },
  setup(props, { emit }) {
    const dragName = ref<string | null>(null);

    const moveBefore = (from: TableSettingRow, target: TableSettingRow) => {
      if (from.frozen !== target.frozen) return;
      const band = props.rows
        .filter((item) => item.frozen === from.frozen)
        .sort((a, b) => a.listPos - b.listPos);
      const fromIndex = band.indexOf(from);
      const targetIndex = band.indexOf(target);
      if (fromIndex < 0 || targetIndex < 0 || fromIndex === targetIndex) return;
      band.splice(fromIndex, 1);
      band.splice(targetIndex, 0, from);
      const positions = band
        .map((item) => item.listPos)
        .sort((a, b) => a - b);
      band.forEach((item, index) => {
        item.listPos = positions[index]!;
      });
      reindexListPos(props.rows);
    };

    const setFrozen = (row: TableSettingRow, frozen: MetaUiFieldFrozen) => {
      row.frozen = frozen;
      if (frozen !== MetaUiFieldFrozen.None) row.listed = true;
      reindexListPos(props.rows);
    };

    const renderRow = (row: TableSettingRow, index: number) => {
      const factory = props.factory;
      const t = props.t;
      const frozen = row.frozen !== MetaUiFieldFrozen.None;
      const hidden = !row.listed && !frozen;
      return h(
        "li",
        {
          key: row.fieldName,
          class: [
            "mmda-list-setting__row",
            frozen ? "is-frozen" : null,
            row.frozen === MetaUiFieldFrozen.Left ? "is-frozen-left" : null,
            row.frozen === MetaUiFieldFrozen.Right ? "is-frozen-right" : null,
            hidden ? "is-hidden" : null,
          ],
          draggable: true,
          onDragstart: (event: DragEvent) => {
            dragName.value = row.fieldName;
            event.dataTransfer?.setData("text/plain", row.fieldName);
            if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
          },
          onDragend: () => {
            dragName.value = null;
          },
          onDragover: (event: DragEvent) => {
            const from = props.rows.find(
              (item) => item.fieldName === dragName.value,
            );
            if (from?.frozen === row.frozen) event.preventDefault();
          },
          onDrop: (event: DragEvent) => {
            event.preventDefault();
            const fromName =
              dragName.value ?? event.dataTransfer?.getData("text/plain");
            const from = props.rows.find((item) => item.fieldName === fromName);
            if (from && from.fieldName !== row.fieldName) {
              moveBefore(from, row);
            }
            dragName.value = null;
          },
        },
        [
          h("div", { class: "mmda-list-setting__lead" }, [
            factory.icon("dnd-vert", {
              class: "mmda-list-setting__drag-handle",
              title: t("tableSettings.drag"),
              "aria-hidden": "true",
            }),
            h("span", { class: "mmda-list-setting__index" }, String(index + 1)),
            h("span", { class: "mmda-list-setting__title" }, row.displayLabel),
          ]),
          h("div", { class: "mmda-list-setting__tools" }, [
            factory.selectButtonGroup(row.align, {
              class: "mmda-list-setting__align",
              options: [
                {
                  value: MetaUiFieldAlignment.LEFT,
                  icon: "align-left",
                  label: t("tableSettings.alignLeft"),
                },
                {
                  value: MetaUiFieldAlignment.CENTER,
                  icon: "align-center",
                  label: t("tableSettings.alignCenter"),
                },
                {
                  value: MetaUiFieldAlignment.RIGHT,
                  icon: "align-right",
                  label: t("tableSettings.alignRight"),
                },
              ],
              optionValue: "value",
              onUpdate: (value: MetaUiFieldAlignment) => {
                row.align = value;
              },
            }),
            h("div", { class: "mmda-list-setting__actions" }, [
              iconButton(
                factory,
                row.listed ? "eye" : "eye-slash",
                row.listed ? t("tableSettings.hide") : t("tableSettings.show"),
                () => {
                  row.listed = !row.listed;
                },
                frozen,
                "mmda-list-setting__visibility",
              ),
              iconButton(
                factory,
                row.frozen === MetaUiFieldFrozen.Left
                  ? "unlock"
                  : "freeze-column-left",
                row.frozen === MetaUiFieldFrozen.Left
                  ? t("tableSettings.unfreeze")
                  : t("tableSettings.freezeLeft"),
                () =>
                  setFrozen(
                    row,
                    row.frozen === MetaUiFieldFrozen.Left
                      ? MetaUiFieldFrozen.None
                      : MetaUiFieldFrozen.Left,
                  ),
              ),
              iconButton(
                factory,
                row.frozen === MetaUiFieldFrozen.Right
                  ? "unlock"
                  : "freeze-column-right",
                row.frozen === MetaUiFieldFrozen.Right
                  ? t("tableSettings.unfreeze")
                  : t("tableSettings.freezeRight"),
                () =>
                  setFrozen(
                    row,
                    row.frozen === MetaUiFieldFrozen.Right
                      ? MetaUiFieldFrozen.None
                      : MetaUiFieldFrozen.Right,
                  ),
              ),
            ]),
          ]),
        ],
      );
    };

    return () => {
      const factory = props.factory;
      const t = props.t;
      const ordered = layoutRowsByBand(props.rows);
      const leftRows = ordered.filter(
        (row) => row.frozen === MetaUiFieldFrozen.Left,
      );
      const scrollRows = ordered.filter(
        (row) => row.frozen === MetaUiFieldFrozen.None,
      );
      const rightRows = ordered.filter(
        (row) => row.frozen === MetaUiFieldFrozen.Right,
      );
      const bands = [
        {
          key: "left",
          className: "mmda-list-setting__band--frozen-left",
          rows: leftRows,
          startIndex: 0,
        },
        {
          key: "scroll",
          className: "mmda-list-setting__band--scroll",
          rows: scrollRows,
          startIndex: leftRows.length,
        },
        {
          key: "right",
          className: "mmda-list-setting__band--frozen-right",
          rows: rightRows,
          startIndex: leftRows.length + scrollRows.length,
        },
      ].filter((band) => band.rows.length > 0);

      return h("div", { class: "mmda-list-setting" }, [
        h(
          "div",
          { class: "mmda-list-setting__list" },
          bands.map((band) =>
            h(
              "ul",
              {
                key: band.key,
                class: ["mmda-list-setting__band", band.className],
              },
              band.rows.map((row, index) =>
                renderRow(row, band.startIndex + index),
              ),
            ),
          ),
        ),
        h("footer", { class: "mmda-list-setting__footer" }, [
          h("div", { class: "mmda-list-setting__footer-start" }, [
            h(
              "label",
              { class: "mmda-list-setting__persist" },
              [
                factory.switch({
                  checked: props.showActionsColumn.value,
                  onChange: (checked: boolean) => {
                    props.showActionsColumn.value = checked;
                  },
                }),
                h("span", t("tableSettings.showActionsColumn")),
              ],
            ),
            factory.splitButton({
              label: t("tableSettings.save"),
              class: "mmda-list-setting__save",
              actions: [
                {
                  name: "persistForever",
                  label: t("tableSettings.persistForever"),
                  onAction: () => emit("save", true),
                },
              ],
              buttonType: "text",
              colorRole: "secondary",
              disabled: props.saving.value || props.restoring.value,
              onAction: () => emit("save", false),
            }),
            factory.splitButton({
              label: t("tableSettings.restoreDefault"),
              class: "mmda-list-setting__restore",
              actions: [
                {
                  name: "reloadFromDatabase",
                  label: t("tableSettings.reloadFromDatabase"),
                  onAction: () => emit("restore", true),
                },
              ],
              buttonType: "text",
              colorRole: "secondary",
              disabled: props.restoring.value,
              onAction: () => emit("restore", false),
            }),
          ]),
          h("div", { class: "mmda-list-setting__footer-end" }, [
            factory.button({
              label: t("dialog.cancel"),
              buttonType: "text",
              colorRole: "secondary",
              disabled: props.saving.value || props.restoring.value,
              onClick: () => emit("cancel"),
            }),
            factory.button({
              label: t("dialog.ok"),
              buttonType: "filled",
              colorRole: "primary",
              disabled: props.saving.value || props.restoring.value,
              onClick: () => emit("confirm"),
            }),
          ]),
        ]),
      ]);
    };
  },
});

export async function openTableSettingDialog(
  host: TableSettingHost,
  context: VueUiContext<any>,
) {
  const t = (key: string) => context.t(key);
  const tableMeta = () => indexTableMetaUi(context);
  const rows = reactive(snapshotListLayoutRows(tableMeta()));
  const showActionsColumn = reactive({
    value: readStoredShowActionsColumn(),
  });
  const restoring = reactive({ value: false });
  const saving = reactive({ value: false });

  const applyRows = () => {
    applyTableColumnSettings(
      tableMeta(),
      rows.map((row) => ({
        fieldName: row.fieldName,
        listed: row.listed,
        frozen: row.frozen,
        listPos: row.listPos,
        listSize: row.listSize,
        align: row.align,
      })),
    );
    bumpListLayout(context);
  };

  const restoreDefault = async (reloadFromDb = false) => {
    const logic = context.logic as {
      repository?: string;
      metaUi?: MetaUi;
      viewUi?: MetaUi;
      metaUiService?: {
        get: (
          repository: string,
          service?: string,
          reload?: boolean,
        ) => Promise<MetaUi>;
        getViewUi?: (
          params: object,
          reload?: boolean,
        ) => Promise<MetaUi>;
      };
      beforeSearch?: () => any;
    };
    if (!logic?.repository || !logic.metaUiService) return;
    restoring.value = true;
    try {
      if (context.joinListMode && logic.metaUiService.getViewUi) {
        const viewUi = await logic.metaUiService.getViewUi(
          {
            repository: logic.repository,
            service: listServiceName(context),
          },
          reloadFromDb,
        );
        logic.viewUi = viewUi;
        rows.splice(0, rows.length, ...snapshotListLayoutRows(viewUi));
        bumpListLayout(context);
        await (context as any).search?.();
        return;
      }
      const metaUi = await logic.metaUiService.get(
        logic.repository,
        listServiceName(context),
        reloadFromDb,
      );
      logic.metaUi = metaUi;
      context.metaUi = metaUi;
      context.configureSearch(undefined, logic.beforeSearch?.());
      rows.splice(0, rows.length, ...snapshotListLayoutRows(metaUi));
      bumpListLayout(context);
      await (context as any).search?.();
    } catch {
      await context.app?.ui?.toast?.(context as any, {
        severity: "error",
        message: t("tableSettings.restoreFailed"),
      });
    } finally {
      restoring.value = false;
    }
  };

  const saveSettings = async (refresh = false, forever = false) => {
    saving.value = true;
    try {
      writeStoredShowActionsColumn(showActionsColumn.value);
      applyRows();
      await persistListPack(context);
      if (forever) {
        const logic = context.logic as {
          repository?: string;
          saveListSettings?: (payload: {
            service: string;
            repository: string;
            fields: TableColumnSettings[];
          }) => Promise<unknown>;
        };
        try {
          await logic.saveListSettings?.({
            service: listServiceName(context) ?? "",
            repository: logic.repository ?? "",
            fields: collectTableColumnSettings(tableMeta()),
          });
        } catch {
          await context.app?.ui?.toast?.(context as any, {
            severity: "error",
            message: t("tableSettings.saveFailed"),
          });
        }
      }
      if (refresh) await (context as any).search?.();
    } finally {
      saving.value = false;
    }
  };

  const settleDialog = (button: 'ok' | 'cancel') =>
    (context.app?.ui as any)?.overlay?.closeTopDialog?.(button);

  const content = () =>
    h(TableSettingView, {
      factory: host.factory,
      t,
      rows,
      showActionsColumn,
      restoring,
      saving,
      onRestore: (reloadFromDb?: boolean) =>
        void restoreDefault(reloadFromDb === true),
      onSave: (forever?: boolean) => void saveSettings(false, forever === true),
      onCancel: () => void settleDialog('cancel'),
      onConfirm: () => void settleDialog('ok'),
    });

  return host.dialog(content() as any, context, {
    title: t("tableSettings.title"),
    modal: true,
    width: "min(92vw, 42rem)",
    maxHeight: "90vh",
    showFooter: false,
    onAccept: async (button) => {
      await saveSettings(true);
      return true;
    },
  });
}
