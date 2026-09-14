import { h, reactive, render } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import {
  MetaUi,
  MetaUiField,
  MetaUiFieldAlignment,
  MetaUiFieldFrozen,
  SqlDataType,
} from "@mmda/core";
import { TableSettingView } from "./TableSettingView";
import {
  applyListSettingsFields,
  collectListSettingsFields,
  snapshotListLayoutRows,
} from "../ui/builder/list_layout";

const hosts: HTMLElement[] = [];

afterEach(() => {
  for (const host of hosts.splice(0)) {
    render(null, host);
    host.remove();
  }
});

const mountView = () => {
  const host = document.createElement("div");
  document.body.append(host);
  hosts.push(host);
  const factory = {
    resolveIcon: (name: string) => `icon-${name}`,
    icon: (name: string, props: Record<string, unknown>) =>
      h("i", { ...props, "data-icon": name }),
    button: (props: Record<string, any>) =>
      h(
        "button",
        {
          disabled: props.disabled,
          "data-icon": props.icon,
          "data-button-type": props.buttonType,
          "data-color-role": props.colorRole,
          onClick: props.onClick,
        },
        props.label,
      ),
    selectButtonGroup: (value: unknown, props: Record<string, any>) =>
      h(
        "div",
        {
          class: ["mmda-select-button-group", props.class],
          "data-align": String(value ?? ""),
        },
        (props.options ?? []).map((option: Record<string, any>) =>
          h(
            "button",
            {
              "data-icon": option.icon,
              "data-selected": option.value === value ? "true" : undefined,
              onClick: () => props.onUpdate?.(option.value),
            },
            option.label,
          ),
        ),
      ),
    splitButton: (props: Record<string, any>) =>
      h("div", { class: "test-split-button" }, [
        h("button", { onClick: props.onAction }, props.label),
        ...(props.actions ?? []).map((action: Record<string, any>) =>
          h(
            "button",
            { onClick: action.onAction ?? action.command },
            action.label,
          ),
        ),
      ]),
    switch: (props: Record<string, any>) =>
      h("input", {
        type: "checkbox",
        checked: props.checked,
      }),
  };
  const rows = reactive([
    {
      fieldName: "hidden",
      displayLabel: "创建部门",
      listed: false,
      frozen: MetaUiFieldFrozen.None,
      listPos: 0,
      align: MetaUiFieldAlignment.LEFT,
    },
    {
      fieldName: "left",
      displayLabel: "修改人",
      listed: true,
      frozen: MetaUiFieldFrozen.Left,
      listPos: 1,
      align: MetaUiFieldAlignment.CENTER,
    },
    {
      fieldName: "right",
      displayLabel: "系统",
      listed: true,
      frozen: MetaUiFieldFrozen.Right,
      listPos: 2,
      align: MetaUiFieldAlignment.RIGHT,
    },
  ]);
  render(
    h(TableSettingView, {
      factory: factory as any,
      t: (key: string) => key,
      rows,
      showActionsColumn: reactive({ value: true }),
      restoring: reactive({ value: false }),
      saving: reactive({ value: false }),
    }),
    host,
  );
  return { host, rows };
};

describe("TableSettingView", () => {
  it("keeps every row draggable and renders aligned visibility/freeze controls", () => {
    const { host } = mountView();
    const rows = [...host.querySelectorAll(".mmda-list-setting__row")];
    expect(rows).toHaveLength(3);
    expect(rows.every((row) => row.getAttribute("draggable") === "true")).toBe(
      true,
    );
    expect(host.querySelectorAll(".mmda-list-setting__drag-handle")).toHaveLength(3);
    expect(
      host.querySelector('[data-icon="icon-eye-slash"]'),
    ).not.toBeNull();
    expect(
      rows.every(
        (row) => row.querySelectorAll(".mmda-list-setting__actions button").length === 3,
      ),
    ).toBe(true);
    expect(host.textContent).not.toContain("tableSettings.moveUp");
    expect(host.textContent).not.toContain("tableSettings.moveDown");
  });

  it("renders a single-select align group before visibility/freeze", () => {
    const { host, rows } = mountView();
    const hidden = host.querySelector(".mmda-list-setting__row.is-hidden")!;
    expect(hidden.querySelector(".mmda-list-setting__align")).not.toBeNull();
    expect(hidden.querySelector('[data-icon="align-left"]')).not.toBeNull();
    expect(hidden.querySelector('[data-icon="align-center"]')).not.toBeNull();
    expect(hidden.querySelector('[data-icon="align-right"]')).not.toBeNull();
    expect(
      hidden
        .querySelector('[data-icon="align-left"]')
        ?.getAttribute("data-selected"),
    ).toBe("true");
    const center = hidden.querySelector(
      '[data-icon="align-center"]',
    ) as HTMLButtonElement;
    center.click();
    expect(rows[0]!.align).toBe(MetaUiFieldAlignment.CENTER);
  });

  it("renders save and restore on the left, cancel and confirm on the right", () => {
    const { host } = mountView();
    const footer = host.querySelector(".mmda-list-setting__footer")!;
    const start = footer.querySelector(".mmda-list-setting__footer-start")!;
    const end = footer.querySelector(".mmda-list-setting__footer-end")!;
    expect(start.textContent).toContain("tableSettings.showActionsColumn");
    expect(start.textContent).toContain("tableSettings.save");
    expect(start.textContent).toContain("tableSettings.persistForever");
    expect(start.textContent).toContain("tableSettings.restoreDefault");
    expect(end.textContent).toContain("dialog.cancel");
    expect(end.textContent).toContain("dialog.ok");
    expect(
      end.querySelector('[data-button-type="filled"][data-color-role="primary"]'),
    ).not.toBeNull();
  });

  it("grays out hidden rows and splits frozen bands from the scroll area", () => {
    const { host } = mountView();
    expect(host.querySelector(".mmda-list-setting__row.is-hidden")).not.toBeNull();
    expect(host.querySelector(".mmda-list-setting__band--frozen-left")).not.toBeNull();
    expect(host.querySelector(".mmda-list-setting__band--scroll")).not.toBeNull();
    expect(host.querySelector(".mmda-list-setting__band--frozen-right")).not.toBeNull();
  });
});

describe("list settings align", () => {
  const field = (name: string, init: Partial<MetaUiField> = {}) =>
    new MetaUiField({
      fieldName: name,
      displayLabel: name,
      fieldIdx: 0,
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
      listed: true,
      ...init,
    } as any);

  const metaOf = (...fields: MetaUiField[]) =>
    new MetaUi({
      objName: "Thing",
      displayLabel: "物",
      groups: [
        {
          groupName: "a1",
          groupLabel: "主",
          many: false,
          fields,
        },
      ],
    });

  it("snapshots inferred align and writes it back on apply/collect", () => {
    const qty = field("qty", { dataType: SqlDataType.INT });
    const name = field("name", { align: MetaUiFieldAlignment.CENTER });
    const metaUi = metaOf(qty, name);
    const rows = snapshotListLayoutRows(metaUi);
    expect(rows.find((row) => row.fieldName === "qty")?.align).toBe(
      MetaUiFieldAlignment.RIGHT,
    );
    expect(rows.find((row) => row.fieldName === "name")?.align).toBe(
      MetaUiFieldAlignment.CENTER,
    );
    applyListSettingsFields(metaUi, [
      { fieldName: "qty", align: MetaUiFieldAlignment.LEFT },
    ]);
    expect(metaUi.getField("qty")?.align).toBe(MetaUiFieldAlignment.LEFT);
    expect(
      collectListSettingsFields(metaUi).find((item) => item.fieldName === "qty")
        ?.align,
    ).toBe(MetaUiFieldAlignment.LEFT);
  });
});
