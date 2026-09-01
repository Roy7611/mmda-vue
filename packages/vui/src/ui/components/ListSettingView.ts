import { defineComponent, h, reactive, ref, type PropType } from "vue";
import {
  MetaUiFieldFrozen,
  type ListSettingsField,
  type MetaUiPack,
} from "@mmda/core";
import type { UiFactory } from "../ui_factory";
import type { UiViewContext } from "../ui_context";
import type { UiDialogPropsType } from "../ui_dialog";
import {
  applyCachedSorts,
  applyListSettingsFields,
  bumpListLayout,
  collectListSettingsFields,
  layoutRowsByBand,
  listServiceName,
  persistListPack,
  reindexListPos,
  snapshotListLayoutRows,
} from "../list_layout";

export type ListSettingRow = {
  fieldName: string;
  displayLabel: string;
  listed: boolean;
  frozen: MetaUiFieldFrozen;
  listPos: number;
  listSize?: number;
};

interface ListSettingHost {
  factory: UiFactory;
  dialog(
    content: ReturnType<typeof h>,
    context: UiViewContext<any>,
    props: UiDialogPropsType,
  ): Promise<boolean>;
}

const iconButton = (
  factory: UiFactory,
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

export const ListSettingView = defineComponent({
  name: "ListSettingView",
  props: {
    factory: { type: Object as PropType<UiFactory>, required: true },
    t: { type: Function as PropType<(key: string) => string>, required: true },
    rows: { type: Array as PropType<ListSettingRow[]>, required: true },
    persistForever: { type: Object as PropType<{ value: boolean }>, required: true },
    restoring: { type: Object as PropType<{ value: boolean }>, required: true },
    saving: { type: Object as PropType<{ value: boolean }>, required: true },
  },
  emits: {
    restore: (_reloadFromDb?: boolean) => true,
    save: () => true,
    cancel: () => true,
    confirm: () => true,
  },
  setup(props, { emit }) {
    const dragName = ref<string | null>(null);

    const moveBefore = (from: ListSettingRow, target: ListSettingRow) => {
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

    const setFrozen = (row: ListSettingRow, frozen: MetaUiFieldFrozen) => {
      row.frozen = frozen;
      if (frozen !== MetaUiFieldFrozen.None) row.listed = true;
      reindexListPos(props.rows);
    };

    const renderRow = (row: ListSettingRow, index: number) => {
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
              title: t("listSettings.drag"),
              "aria-hidden": "true",
            }),
            h("span", { class: "mmda-list-setting__index" }, String(index + 1)),
            h("span", { class: "mmda-list-setting__title" }, row.displayLabel),
          ]),
          h("div", { class: "mmda-list-setting__actions" }, [
            iconButton(
              factory,
              row.listed ? "eye" : "eye-slash",
              row.listed ? t("listSettings.hide") : t("listSettings.show"),
              () => {
                row.listed = !row.listed;
              },
              frozen,
              "mmda-list-setting__visibility",
            ),
            iconButton(
              factory,
              row.frozen === MetaUiFieldFrozen.Left ? "unlock" : "freeze-column-left",
              row.frozen === MetaUiFieldFrozen.Left
                ? t("listSettings.unfreeze")
                : t("listSettings.freezeLeft"),
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
              row.frozen === MetaUiFieldFrozen.Right ? "unlock" : "freeze-column-right",
              row.frozen === MetaUiFieldFrozen.Right
                ? t("listSettings.unfreeze")
                : t("listSettings.freezeRight"),
              () =>
                setFrozen(
                  row,
                  row.frozen === MetaUiFieldFrozen.Right
                    ? MetaUiFieldFrozen.None
                    : MetaUiFieldFrozen.Right,
                ),
            ),
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
                factory.toggleSwitch
                  ? factory.toggleSwitch(props.persistForever.value, {
                      modelValue: props.persistForever.value,
                      onUpdate: (checked: boolean) => {
                        props.persistForever.value = checked;
                      },
                    })
                  : h("input", {
                      type: "checkbox",
                      checked: props.persistForever.value,
                      onChange: (event: Event) => {
                        props.persistForever.value = (
                          event.target as HTMLInputElement
                        ).checked;
                      },
                    }),
                h("span", t("listSettings.persistForever")),
              ],
            ),
            factory.button({
              label: t("listSettings.save"),
              buttonType: "text",
              colorRole: "secondary",
              disabled: props.saving.value || props.restoring.value,
              onClick: () => emit("save"),
            }),
            factory.splitButton({
              label: t("listSettings.restoreDefault"),
              class: "mmda-list-setting__restore",
              actions: [
                {
                  name: "reloadFromDatabase",
                  label: t("listSettings.reloadFromDatabase"),
                  command: () => emit("restore", true),
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

export async function openListSettingDialog(
  host: ListSettingHost,
  context: UiViewContext<any>,
) {
  const t = (key: string) => context.t(key);
  const rows = reactive(snapshotListLayoutRows(context.metaui));
  const persistForever = reactive({ value: false });
  const restoring = reactive({ value: false });
  const saving = reactive({ value: false });

  const applyRows = () => {
    applyListSettingsFields(
      context.metaui,
      rows.map((row) => ({
        fieldName: row.fieldName,
        listed: row.listed,
        frozen: row.frozen,
        listPos: row.listPos,
        listSize: row.listSize,
      })),
    );
    bumpListLayout(context);
  };

  const restoreDefault = async (reloadFromDb = false) => {
    const logic = context.logic as {
      repository?: string;
      meta?: MetaUiPack;
      metaUiService?: {
        fetchPackFromServer: (
          params: object,
          reload?: boolean,
        ) => Promise<MetaUiPack>;
      };
      beforeSearch?: () => any;
    };
    if (!logic?.repository || !logic.metaUiService) return;
    restoring.value = true;
    try {
      const pack = await logic.metaUiService.fetchPackFromServer(
        {
          repository: logic.repository,
          service: listServiceName(context),
        },
        reloadFromDb,
      );
      logic.meta = pack;
      context.metaui = pack.metaui;
      context.configureSearch(pack.filters ?? [], logic.beforeSearch?.());
      applyCachedSorts(context);
      rows.splice(0, rows.length, ...snapshotListLayoutRows(pack.metaui));
      bumpListLayout(context);
      await (context as any).search?.();
    } catch {
      await context.app?.ui?.toast?.(context as any, {
        severity: "error",
        detail: t("listSettings.restoreFailed"),
      });
    } finally {
      restoring.value = false;
    }
  };

  const saveSettings = async (refresh = false) => {
    saving.value = true;
    try {
      applyRows();
      await persistListPack(context);
      if (persistForever.value) {
        const logic = context.logic as {
          repository?: string;
          metaUiService?: {
            saveListSettings: (payload: {
              service: string;
              repository: string;
              fields: ListSettingsField[];
            }) => Promise<unknown>;
          };
        };
        try {
          await logic.metaUiService?.saveListSettings({
            service: listServiceName(context) ?? "",
            repository: logic.repository ?? "",
            fields: collectListSettingsFields(context.metaui),
          });
        } catch {
          await context.app?.ui?.toast?.(context as any, {
            severity: "error",
            detail: t("listSettings.saveFailed"),
          });
        }
      }
      if (refresh) await (context as any).search?.();
    } finally {
      saving.value = false;
    }
  };

  const settleDialog = (accepted: boolean) =>
    (context.app?.ui as any)?.overlay?.settleTopDialog?.(accepted);

  const content = () =>
    h(ListSettingView, {
      factory: host.factory,
      t,
      rows,
      persistForever,
      restoring,
      saving,
      onRestore: (reloadFromDb?: boolean) =>
        void restoreDefault(reloadFromDb === true),
      onSave: () => void saveSettings(),
      onCancel: () => void settleDialog(false),
      onConfirm: () => void settleDialog(true),
    });

  return host.dialog(content() as any, context, {
    name: "list-settings",
    title: t("listSettings.title"),
    header: t("listSettings.title"),
    modal: false,
    width: "min(92vw, 30rem)",
    maxHeight: "80vh",
    showFooter: false,
    cssClass: "mmda-list-setting-dialog",
    accept: async () => {
      await saveSettings(true);
      return true;
    },
  });
}
