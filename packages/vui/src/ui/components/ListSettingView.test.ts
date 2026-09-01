import { h, reactive, render } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { MetaUiFieldFrozen } from "@mmda/core";
import { ListSettingView } from "./ListSettingView";

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
    splitButton: (props: Record<string, any>) =>
      h("div", { class: "test-split-button" }, [
        h("button", { onClick: props.onAction }, props.label),
        h(
          "button",
          { onClick: props.actions[0].command },
          props.actions[0].label,
        ),
      ]),
    toggleSwitch: (value: boolean, props: Record<string, any>) =>
      h("input", {
        type: "checkbox",
        checked: props.modelValue ?? value,
      }),
  };
  const rows = reactive([
    {
      fieldName: "hidden",
      displayLabel: "创建部门",
      listed: false,
      frozen: MetaUiFieldFrozen.None,
      listPos: 0,
    },
    {
      fieldName: "left",
      displayLabel: "修改人",
      listed: true,
      frozen: MetaUiFieldFrozen.Left,
      listPos: 1,
    },
    {
      fieldName: "right",
      displayLabel: "系统",
      listed: true,
      frozen: MetaUiFieldFrozen.Right,
      listPos: 2,
    },
  ]);
  render(
    h(ListSettingView, {
      factory: factory as any,
      t: (key: string) => key,
      rows,
      persistForever: reactive({ value: false }),
      restoring: reactive({ value: false }),
      saving: reactive({ value: false }),
    }),
    host,
  );
  return host;
};

describe("ListSettingView", () => {
  it("keeps every row draggable and renders aligned visibility/freeze controls", () => {
    const host = mountView();
    const rows = [...host.querySelectorAll(".mmda-list-setting__row")];
    expect(rows).toHaveLength(3);
    expect(rows.every((row) => row.getAttribute("draggable") === "true")).toBe(
      true,
    );
    expect(host.querySelectorAll(".mmda-list-setting__drag-handle")).toHaveLength(3);
    expect(
      host.querySelector('[data-icon="icon-eye-slash"]'),
    ).not.toBeNull();
    expect(rows.every((row) => row.querySelectorAll("button").length === 3)).toBe(
      true,
    );
    expect(host.textContent).not.toContain("listSettings.moveUp");
    expect(host.textContent).not.toContain("listSettings.moveDown");
  });

  it("renders save and restore on the left, cancel and confirm on the right", () => {
    const host = mountView();
    const footer = host.querySelector(".mmda-list-setting__footer")!;
    const start = footer.querySelector(".mmda-list-setting__footer-start")!;
    const end = footer.querySelector(".mmda-list-setting__footer-end")!;
    expect(start.textContent).toContain("listSettings.persistForever");
    expect(start.textContent).toContain("listSettings.save");
    expect(start.textContent).toContain("listSettings.restoreDefault");
    expect(end.textContent).toContain("dialog.cancel");
    expect(end.textContent).toContain("dialog.ok");
    expect(
      end.querySelector('[data-button-type="filled"][data-color-role="primary"]'),
    ).not.toBeNull();
  });

  it("grays out hidden rows and splits frozen bands from the scroll area", () => {
    const host = mountView();
    expect(host.querySelector(".mmda-list-setting__row.is-hidden")).not.toBeNull();
    expect(host.querySelector(".mmda-list-setting__band--frozen-left")).not.toBeNull();
    expect(host.querySelector(".mmda-list-setting__band--scroll")).not.toBeNull();
    expect(host.querySelector(".mmda-list-setting__band--frozen-right")).not.toBeNull();
  });
});
