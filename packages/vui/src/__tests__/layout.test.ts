import { afterEach, describe, expect, it } from "vitest";
import { h, render } from "vue";
import { MetaUi, MetaUiField, SqlDataType } from "@mmda/core";
import {
  AppLayout,
  layoutField,
  layoutFieldGroup,
  layoutPage,
} from "../ui/ui_layout";
import { HtmlUiBuilder } from "../ui/ui_html";
import { UiViewContext } from "../ui/ui_context";

const hosts: HTMLElement[] = [];

function mount(node: ReturnType<typeof h>) {
  const host = document.createElement("div");
  hosts.push(host);
  document.body.append(host);
  render(node, host);
  return host;
}

afterEach(() => {
  for (const host of hosts) {
    render(null, host);
    host.remove();
  }
  hosts.length = 0;
});

describe("default VUI layouts", () => {
  it("支持字段横纵方向和可选校验消息", () => {
    const host = mount(
      h("div", [
        layoutField({
          label: h("label", "名称"),
          control: h("input"),
          direction: "horizontal",
          message: h("small", "必填"),
        }),
        layoutField({
          label: h("label", "编码"),
          control: h("output", "A01"),
          direction: "vertical",
        }),
      ]),
    );

    const fields = host.querySelectorAll<HTMLElement>(".mmda-field-layout");
    expect(fields[0].dataset.direction).toBe("horizontal");
    expect(fields[0].style.gridTemplateColumns).toContain("5.25rem");
    expect(fields[0].querySelector(".mmda-field-message")?.textContent).toBe(
      "必填",
    );
    expect(fields[1].style.flexDirection).toBe("column");
    expect(fields[1].querySelector(".mmda-field-message")).toBeNull();
  });

  it("控制分组内部列数，概要分组可固定为一列", () => {
    const host = mount(
      h("div", [
        layoutFieldGroup({
          fields: [h("span", "A"), h("span", "B"), h("span", "C")],
          cols: 3,
        }),
        layoutFieldGroup({
          fields: [h("span", "S1"), h("span", "S2")],
          direction: "column",
          cols: 1,
        }),
      ]),
    );

    const groups = host.querySelectorAll<HTMLElement>(
      ".mmda-field-group-layout",
    );
    expect(groups[0].dataset.cols).toBe("3");
    expect(groups[0].style.gridTemplateColumns).toContain("repeat(3");
    expect(groups[1].dataset.cols).toBe("1");
    expect(groups[1].style.flexDirection).toBe("column");
  });

  it("页面工具栏置顶，三区正文独立滚动", () => {
    const host = mount(
      layoutPage({
        toolbar: h("button", "保存"),
        primary: [h("section", "主信息")],
        summary: [h("section", "概要")],
        tails: [h("section", "明细")],
      }),
    );

    const page = host.querySelector<HTMLElement>(".mmda-page-layout")!;
    const toolbar = host.querySelector<HTMLElement>(".mmda-page-toolbar")!;
    const scroll = host.querySelector<HTMLElement>(".mmda-page-scroll")!;
    const regions = host.querySelector<HTMLElement>(".mmda-page-regions")!;
    expect(page.style.overflow).toBe("hidden");
    expect(toolbar.style.position).toBe("sticky");
    expect(scroll.style.overflow).toBe("auto");
    expect(regions.style.gridTemplateColumns).toContain("3fr");
    expect(host.querySelector(".mmda-page-tails")?.textContent).toBe("明细");
  });

  it("AppLayout 提供侧栏通高和顶栏通栏两种 grid", () => {
    const left = mount(
      new AppLayout().render({
        topBar: h("span", "Top"),
        nav: h("span", "Nav"),
        page: h("span", "Page"),
      }),
    );
    const full = mount(
      new AppLayout("topBarFull").render({
        topBar: h("span", "Top"),
        nav: h("span", "Nav"),
        page: h("span", "Page"),
      }),
    );

    const leftApp = left.querySelector<HTMLElement>(".mmda-app-layout")!;
    const fullApp = full.querySelector<HTMLElement>(".mmda-app-layout")!;
    expect(leftApp.dataset.layout).toBe("sidebarLeft");
    expect(leftApp.style.gridTemplateAreas).toContain('"nav top"');
    expect(leftApp.style.overflow).toBe("hidden");
    expect(
      left.querySelector<HTMLElement>(".mmda-app-nav")!.style.overflow,
    ).toBe("auto");
    expect(fullApp.dataset.layout).toBe("topBarFull");
    expect(fullApp.style.gridTemplateAreas).toContain('"top top"');
  });
});

describe("AbstractUiBuilder layout wiring", () => {
  const field = (name: string, label: string) =>
    new MetaUiField({
      fieldName: name,
      displayLabel: label,
      fieldIdx: 0,
      dataType: SqlDataType.NVARCHAR,
      nullable: false,
    });

  const metaui = new MetaUi({
    objName: "Product",
    displayLabel: "商品",
    groups: [
      {
        groupName: "base",
        groupLabel: "基本信息",
        many: false,
        fields: [field("name", "名称"), field("code", "编码")],
      },
      {
        groupName: "s1",
        groupLabel: "概要",
        many: false,
        fields: [field("state", "状态")],
      },
      {
        groupName: "t1",
        groupLabel: "明细",
        many: false,
        fields: [field("remark", "备注")],
      },
    ],
  });

  it("按 primary / summary / tails 分区并应用组内列数", () => {
    const context = new UiViewContext({
      model: { name: "N", code: "C", state: "启用", remark: "R" },
      metaui,
      view: "details",
    });
    const host = mount(
      new HtmlUiBuilder().buildView(context, {
        showToolbar: false,
        primaryCols: 3,
      }),
    );

    expect(host.querySelector(".mmda-page-primary")?.textContent).toContain(
      "基本信息",
    );
    expect(host.querySelector(".mmda-page-summary")?.textContent).toContain(
      "概要",
    );
    expect(host.querySelector(".mmda-page-tails")?.textContent).toContain(
      "明细",
    );
    expect(
      host.querySelector<HTMLElement>(
        ".mmda-page-primary .mmda-field-group-layout",
      )?.dataset.cols,
    ).toBe("3");
    expect(
      host.querySelector<HTMLElement>(
        ".mmda-page-summary .mmda-field-group-layout",
      )?.dataset.cols,
    ).toBe("1");
    expect(host.querySelector("form")).toBeNull();
  });

  it("HTML 皮肤通过 FieldLayout 显示校验消息且不重复标签", () => {
    const context = new UiViewContext({
      model: { name: "", code: "", state: "", remark: "" },
      metaui,
      view: "edit",
    });
    context.setFieldError("name", "名称必填");
    const host = mount(
      new HtmlUiBuilder().buildView(context, { showToolbar: false }),
    );

    const nameField = host.querySelector(
      ".mmda-page-primary .mmda-field-layout",
    )!;
    expect(host.querySelector("form.mmda-form")).not.toBeNull();
    expect(nameField.querySelectorAll("label")).toHaveLength(1);
    expect(nameField.querySelector(".mmda-field-message")?.textContent).toBe(
      "名称必填",
    );
  });
});
