import { afterEach, describe, expect, it, vi } from "vitest";
import { h, render } from "vue";
import { MetaUi, MetaUiField, MetaUiGroupLogic, SqlDataType } from "@mmda/core";
import { VueUiLayout } from "../ui/layout/layout";
import { VueUiContext } from "../contexts/vue_ui_context";
import { TestUiBuilder } from "./test_builder";

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
  const layout = new VueUiLayout();

  it("支持字段横纵方向；有 message 才显示", () => {
    const horizontal = new VueUiLayout();
    const vertical = new VueUiLayout();
    vertical.fieldVertical = true;
    const host = mount(
      h("div", [
        horizontal.layoutField({
          label: h("label", { class: "mmda-field-label" }, "名称"),
          control: h("input"),
          message: "必填" as any,
          messageKind: "error",
        }),
        vertical.layoutField({
          label: h("label", { class: "mmda-field-label" }, "编码"),
          control: h("output", "A01"),
          message: "也显示" as any,
          messageKind: "warning",
        }),
      ]),
    );

    const fields = host.querySelectorAll<HTMLElement>(".mmda-field");
    expect(fields[0].className).toContain("mmda-field--horizontal");
    expect(fields[0].className).toContain("mmda-field");
    expect(fields[0].querySelector(".mmda-field-control")).not.toBeNull();
    expect(fields[0].querySelector(".mmda-field-message.error")?.textContent).toBe(
      "必填",
    );
    expect(fields[0].querySelector(".mmda-field-label")).not.toBeNull();
    expect(fields[1].className).toContain("mmda-field--vertical");
    expect(
      fields[1].querySelector(".mmda-field-message.warning")?.textContent,
    ).toBe("也显示");
  });

  it("占格跨列跨行不重叠", () => {
    const horizontal = new VueUiLayout();
    const remark = horizontal.layoutField({
      label: h("label", { class: "mmda-field-label" }, "备注"),
      control: h("textarea"),
      gridColumn: "1 / span 2",
      gridRow: "2 / span 1",
    });
    const photo = horizontal.layoutField({
      label: h("label", { class: "mmda-field-label" }, "照片"),
      control: h("img"),
      gridColumn: "1 / span 1",
      gridRow: "3 / span 3",
    });
    const host = mount(h("div", [remark, photo]));
    const fields = host.querySelectorAll<HTMLElement>(".mmda-field");
    expect(fields[0].style.gridColumn).toBe("1 / span 2");
    expect(fields[0].style.gridRow).toBe("2 / span 1");
    expect(fields[1].style.gridColumn).toBe("1 / span 1");
    expect(fields[1].style.gridRow).toBe("3 / span 3");
  });

  it("控制分组内部列数，概要分组可固定为一列", () => {
    layout.fieldGroupLayout = { type: "grid", gridCols: 3 };
    const threeCol = layout.layoutFieldGroup({
      fields: [h("span", "A"), h("span", "B"), h("span", "C")],
    });
    layout.fieldGroupLayout = { type: "column", gridCols: 1 };
    const oneCol = layout.layoutFieldGroup({
      fields: [h("span", "S1"), h("span", "S2")],
    });
    const host = mount(h("div", [threeCol, oneCol]));

    const groups = host.querySelectorAll<HTMLElement>(
      ".mmda-field-group",
    );
    expect(groups[0].dataset.gridCols).toBe("3");
    expect(groups[0].className).toContain("mmda-field-group--grid");
    expect(groups[1].dataset.gridCols).toBe("1");
    expect(groups[1].className).toContain("mmda-field-group--column");
  });

  it("页面工具栏置顶，左右分栏且右侧可折叠", async () => {
    const host = mount(
      layout.layoutPage({
        toolbar: h("button", "保存"),
        primary: [h("section", "主信息")],
        summary: [h("section", "概要")],
        tails: [h("section", "明细")],
        footer: h("div", "页脚"),
      }),
    );

    const page = host.querySelector<HTMLElement>("section.mmda-page")!;
    const toolbar = host.querySelector<HTMLElement>(".mmda-page-header")!;
    const body = host.querySelector<HTMLElement>(".mmda-page-body")!;
    const main = host.querySelector<HTMLElement>(".mmda-page-main")!;
    expect(page.style.overflow).toBe("auto");
    expect(toolbar.style.position).toBe("sticky");
    expect(body.classList.contains("mmda-page-body--with-summary")).toBe(
      true,
    );
    expect(body.classList.contains("is-summary-open")).toBe(true);
    expect(host.querySelector(".mmda-page-scroll")).toBeNull();
    expect(host.querySelector(".mmda-page-primary")).toBeNull();
    expect(host.querySelector(".mmda-page-tails")).toBeNull();
    expect(main.textContent).toContain("主信息");
    expect(main.textContent).toContain("明细");
    expect(host.querySelector(".mmda-page-summary-body")?.textContent).toBe(
      "概要",
    );
    expect(host.querySelector(".mmda-page-footer")?.textContent).toBe("页脚");
    expect(body.contains(host.querySelector(".mmda-page-footer")!)).toBe(
      true,
    );

    const toggle = host.querySelector(
      ".mmda-page-summary-toggle",
    ) as HTMLElement;
    toggle.click();
    await Promise.resolve();
    expect(body.classList.contains("is-summary-collapsed")).toBe(true);
  });

  it("VueUiLayout.scaffold 提供侧栏通高和顶栏通栏两种 grid", () => {
    const left = mount(
      new VueUiLayout().scaffold({
        topBar: h("span", "Top"),
        nav: h("span", "Nav"),
        page: h("span", "Page"),
      }),
    );
    const full = mount(
      new VueUiLayout().scaffold({
        variant: "topBarFull",
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

describe("VueUiBuilder layout wiring", () => {
  const field = (name: string, label: string) =>
    new MetaUiField({
      fieldName: name,
      displayLabel: label,
      fieldIdx: 0,
      dataType: SqlDataType.NVARCHAR,
      nullable: false,
    });

  const metaUi = new MetaUi({
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

  /** 元数据故意把子表插在主表前；渲染主表按 groupName，子表按 groupIdx */
  const interleavedMetaui = new MetaUi({
    objName: "Material",
    displayLabel: "物料",
    groups: [
      {
        groupName: "skus",
        groupLabel: "SKU",
        many: true,
        groupIdx: 33,
        relObjName: "Sku",
        joinOn: "materialID=@materialID",
        groupUi: {
          objName: "Sku",
          displayLabel: "SKU",
          groups: [
            {
              groupName: "a1",
              groupLabel: "行",
              many: false,
              fields: [field("skuCode", "Sku编码")],
            },
          ],
        },
      },
      {
        groupName: "partNos",
        groupLabel: "供货号",
        many: true,
        groupIdx: 30,
        relObjName: "MaterialPartner",
        joinOn: "materialID=@materialID",
        groupUi: {
          objName: "MaterialPartner",
          displayLabel: "供货号",
          groups: [
            {
              groupName: "a1",
              groupLabel: "行",
              many: false,
              fields: [field("partnerName", "伙伴")],
            },
          ],
        },
      },
      {
        groupName: "a2",
        groupLabel: "质检追踪",
        many: false,
        fields: [field("qcRatio", "质检比例")],
      },
      {
        groupName: "features",
        groupLabel: "特征",
        many: true,
        groupIdx: 31,
        relObjName: "MaterialFeature",
        joinOn: "materialID=@materialID",
        groupUi: {
          objName: "MaterialFeature",
          displayLabel: "特征",
          primaryKey: "featureCode",
          groups: [
            {
              groupName: "a1",
              groupLabel: "行",
              many: false,
              fields: [
                {
                  ...field("featureCode", "特征码"),
                  primaryKey: true,
                },
                field("featureName", "特征名称"),
              ],
            },
          ],
        },
      },
      {
        groupName: "a1",
        groupLabel: "基本信息",
        many: false,
        fields: [field("materialCode", "物料编码")],
      },
      {
        groupName: "medias",
        groupLabel: "媒体文件",
        many: true,
        groupIdx: 32,
        relObjName: "MaterialMedia",
        joinOn: "materialID=@materialID",
        groupUi: {
          objName: "MaterialMedia",
          displayLabel: "媒体文件",
          groups: [
            {
              groupName: "a1",
              groupLabel: "行",
              many: false,
              fields: [field("mediaUrl", "文件")],
            },
          ],
        },
      },
    ],
  });

  it("按 primary / summary / tails 分区并应用组内列数", () => {
    const context = new VueUiContext({
      model: { name: "N", code: "C", state: "启用", remark: "R" },
      metaUi,
      view: "details",
    });
    const host = mount(
      new TestUiBuilder().buildView(context, {
        showToolbar: false,
        primaryCols: 3,
      }),
    );

    expect(host.querySelector(".mmda-page-main")?.textContent).toContain(
      "基本信息",
    );
    expect(host.querySelector(".mmda-page-main")?.textContent).toContain(
      "明细",
    );
    expect(host.querySelector(".mmda-page-summary")?.textContent).toContain(
      "概要",
    );
    expect(
      host.querySelector<HTMLElement>(
        ".mmda-page-main .mmda-field-group",
      )?.dataset.gridCols,
    ).toBe("3");
    expect(
      host.querySelector<HTMLElement>(
        ".mmda-page-summary .mmda-field-group",
      )?.dataset.gridCols,
    ).toBe("1");
    expect(host.querySelector(".mmda-page-main .mmda-group.primary")).not.toBeNull();
    expect(host.querySelector(".mmda-page-main .mmda-group.master")).not.toBeNull();
    expect(host.querySelector(".mmda-page-main > .mmda-group")).not.toBeNull();
    expect(host.querySelector(".mmda-page-main fieldset.mmda-group")).toBeNull();
    expect(host.querySelector(".mmda-page-summary .mmda-group.secondary")).not.toBeNull();
    expect(host.querySelector("form")).toBeNull();
  });

  it("主区主表按 groupName、子表按 groupIdx", () => {
    const context = new VueUiContext({
      model: {
        materialCode: "M1",
        qcRatio: 1,
        partNos: [],
        features: [],
        medias: [],
        skus: [],
      },
      metaUi: interleavedMetaui,
      view: "details",
    });
    const host = mount(
      new TestUiBuilder().buildView(context, { showToolbar: false }),
    );
    const labels = [
      ...host.querySelectorAll(".mmda-page-main .mmda-group-title"),
    ].map((el) => el.textContent);
    expect(labels).toEqual([
      "基本信息",
      "质检追踪",
      "供货号",
      "特征",
      "媒体文件",
      "SKU",
    ]);
  });

  it("默认用 card；props.container 为 fieldset 时用 legend", async () => {
    const context = new VueUiContext({
      model: { name: "N", code: "C", state: "启用", remark: "R" },
      metaUi,
      view: "details",
    });
    const cardHost = mount(
      new TestUiBuilder().buildGroup(metaUi.getGroup("base")!, context),
    );
    expect(
      cardHost.querySelector("article.mmda-group.primary.master"),
    ).not.toBeNull();
    expect(cardHost.querySelector("fieldset.mmda-group")).toBeNull();
    expect(cardHost.querySelector(".mmda-group-toggle")).not.toBeNull();
    expect(cardHost.querySelector(".mmda-group-body")).not.toBeNull();
    const cardClass = cardHost.querySelector("article.mmda-group")!.className;
    expect(cardClass.match(/\bmmda-group\b/g)).toHaveLength(1);
    expect(cardClass.match(/\bmaster\b/g)).toHaveLength(1);
    expect(cardClass.match(/\bprimary\b/g)).toHaveLength(1);

    const header = cardHost.querySelector(".mmda-group-header") as HTMLElement;
    header.click();
    await Promise.resolve();
    expect(cardHost.querySelector(".mmda-group.is-collapsed")).not.toBeNull();
    expect(cardHost.querySelector(".e-collapse")).not.toBeNull();
    expect(cardHost.querySelector(".mmda-group-body")).not.toBeNull();
    header.click();
    await Promise.resolve();
    expect(cardHost.querySelector(".mmda-group.is-expanded")).not.toBeNull();
    expect(cardHost.querySelector(".mmda-group-body")).not.toBeNull();

    const fieldsetHost = mount(
      new TestUiBuilder().buildGroup(metaUi.getGroup("base")!, context, undefined, {
        container: "fieldset",
      }),
    );
    expect(fieldsetHost.querySelector("fieldset.mmda-group")).not.toBeNull();
    expect(fieldsetHost.querySelector("article.mmda-group")).toBeNull();
    expect(fieldsetHost.querySelector(".mmda-group-card")).toBeNull();
  });

  it("右边栏概要分组排在附件之后", () => {
    const context = new VueUiContext({
      model: {
        name: "N",
        code: "C",
        state: "启用",
        remark: "R",
        attachments: [],
      },
      metaUi,
      view: "details",
    });
    const host = mount(
      new TestUiBuilder().buildView(context, { showToolbar: false }),
    );

    const pageBody = host.querySelector(".mmda-page-body")!;
    expect(pageBody.querySelector(".mmda-page-summary-toggle")).not.toBeNull();
    const summary = host.querySelector(".mmda-page-summary")!;
    const body = summary.querySelector(".mmda-page-summary-body")!;
    const children = [...body.children];
    expect(children[0]?.classList.contains("mmda-attachments")).toBe(true);
    expect(children.at(-1)?.textContent).toContain("概要");
  });

  it("FieldLayout 显示校验消息且不重复标签", () => {
    const context = new VueUiContext({
      model: { name: "", code: "", state: "", remark: "" },
      metaUi,
      view: "edit",
    });
    context.setFieldError("name", "名称必填");
    const host = mount(
      new TestUiBuilder().buildView(context, { showToolbar: false }),
    );

    const nameField = host.querySelector(
      ".mmda-page-main .mmda-field",
    )!;
    expect(host.querySelector("form.mmda-form")).not.toBeNull();
    expect(nameField.querySelectorAll("label")).toHaveLength(1);
    expect(nameField.querySelector(".mmda-field-message")?.textContent).toBe(
      "名称必填",
    );
  });

  it("编辑页子表 header 渲染 actions 工具栏", () => {
    const context = new VueUiContext({
      model: {
        materialCode: "M1",
        qcRatio: 1,
        partNos: [],
        features: [],
        medias: [],
        skus: [],
      },
      metaUi: interleavedMetaui,
      view: "edit",
    });
    const skus = interleavedMetaui.getGroup("skus")!;
    const grpLogic = new MetaUiGroupLogic(skus);
    const add = vi.fn((ctx: VueUiContext) => {
      ctx.addSubGroupItem("skus", {
        skuCode: "S1",
        editable: true,
      } as any);
    });
    grpLogic.defaultAddFn = add as any;
    context.setupGroupLogic(grpLogic);

    const host = mount(
      new TestUiBuilder().buildView(context, { showToolbar: false }),
    );
    const skuCard = [...host.querySelectorAll(".mmda-group.sub")].find((el) =>
      el.textContent?.includes("SKU"),
    ) as HTMLElement;
    expect(skuCard).toBeTruthy();
    expect(skuCard.querySelector(".mmda-group-actions")).not.toBeNull();
    expect(skuCard.querySelector("#add-skus-button")).not.toBeNull();
    expect(skuCard.querySelector("#clear-skus-button")).not.toBeNull();
    const addBtn = skuCard.querySelector(
      "#add-skus-button",
    ) as HTMLButtonElement;
    // 平面图标按钮：可见文案进 tooltip
    expect(addBtn.title || addBtn.getAttribute("aria-label")).toBeTruthy();
    expect(addBtn.textContent?.replace(/\s/g, "")).toBe("");
    // 顺序：title | actions | toggle
    const header = skuCard.querySelector(".mmda-group-header")!;
    const children = [...header.children].map((el) => el.className);
    expect(children.some((c) => c.includes("mmda-group-actions"))).toBe(true);
    expect(children.at(-1)).toContain("mmda-group-toggle");

    addBtn.click();
    expect(add).toHaveBeenCalledTimes(1);
    expect((context.model as any).skus).toHaveLength(1);
  });

  it("原生 Grid 子表默认整组可编辑，字段可单独关闭", () => {
    const medias = interleavedMetaui.getGroup("medias")!;
    const createBuilder = () => {
      const builder = new TestUiBuilder();
      let tableProps: any;
      (builder.factory as any).nativeInplaceEdit = true;
      (builder.factory as any).list = (
        _rows: any[],
        _metaUi: MetaUi,
        props: any,
      ) => {
        tableProps = props;
        return h("div");
      };
      return { builder, getTableProps: () => tableProps };
    };

    const enabledContext = new VueUiContext({
      model: { medias: [] },
      metaUi: interleavedMetaui,
      view: "edit",
    });
    const enabled = createBuilder();
    enabled.builder.buildGroup(medias, enabledContext);
    expect(enabled.getTableProps().editable).toBe(true);
    expect(enabled.getTableProps().fieldCellEditors?.mediaUrl).toBeUndefined();
    expect(enabled.getTableProps().inplaceEditStart).toBe("excel");

    const features = interleavedMetaui.getGroup("features")!;
    const featureContext = new VueUiContext({
      model: { features: [{ featureCode: "Color-1", editable: true }] },
      metaUi: interleavedMetaui,
      view: "edit",
    });
    const featureBuilder = createBuilder();
    featureBuilder.builder.buildGroup(features, featureContext);
    // 主键字段只要行 editable 且字段未 lock，默认可原位编辑（不必进 Record）
    expect(featureBuilder.getTableProps().editable).toBe(true);
    expect(
      featureBuilder.getTableProps().fieldCellEditors?.featureCode,
    ).toBeUndefined();
    expect(
      featureBuilder.getTableProps().fieldCellEditors?.featureName,
    ).toBeUndefined();

    const disabledContext = new VueUiContext({
      model: { medias: [] },
      metaUi: interleavedMetaui,
      view: "edit",
    });
    const groupLogic = new MetaUiGroupLogic(medias);
    groupLogic.field("mediaUrl").inplaceEdit(false);
    disabledContext.setupGroupLogic(groupLogic);
    const disabled = createBuilder();
    disabled.builder.buildGroup(medias, disabledContext);
    expect(disabled.getTableProps().editable).toBe(true);
    expect(disabled.getTableProps().fieldCellEditors?.mediaUrl).toEqual({
      canEdit: false,
    });

    const groupDisabledContext = new VueUiContext({
      model: { medias: [] },
      metaUi: interleavedMetaui,
      view: "edit",
    });
    const disabledGroupLogic = new MetaUiGroupLogic(medias).inplaceEdit(false);
    groupDisabledContext.setupGroupLogic(disabledGroupLogic);
    const groupDisabled = createBuilder();
    groupDisabled.builder.buildGroup(medias, groupDisabledContext);
    expect(groupDisabled.getTableProps().editable).toBe(false);
  });

  it("编辑页只读字段走 display renderer 而非 editor", () => {
    const dateField = new MetaUiField({
      fieldName: "createdAt",
      displayLabel: "创建日期",
      fieldIdx: 0,
      dataType: SqlDataType.DATETIME,
      nullable: true,
      readOnly: true,
      editor: "DateTimePicker",
      renderer: "textSpan",
    });
    const meta = new MetaUi({
      objName: "Product",
      displayLabel: "商品",
      groups: [
        {
          groupName: "s1",
          groupLabel: "概要",
          many: false,
          fields: [dateField],
        },
      ],
    });
    const context = new VueUiContext({
      model: { createdAt: "2026-08-31 10:00:00" },
      metaUi: meta,
      view: "edit",
    });
    const host = mount(
      new TestUiBuilder().buildView(context, { showToolbar: false }),
    );
    const field = host.querySelector(".mmda-field")!;
    expect(field.querySelector("input")).toBeNull();
    expect(field.querySelector(".mmda-field-display, output")).not.toBeNull();
    expect(field.textContent).toContain("2026");
  });
});
