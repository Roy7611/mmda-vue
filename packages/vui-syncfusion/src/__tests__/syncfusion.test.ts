// @ts-nocheck
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { h, nextTick } from "vue";
import { L10n } from "@syncfusion/ej2-base";
import { MetaModel, MetaUi, MetaUiField, MetaUiFieldFilterType, MetaUiGroup, ModuleFactory, ModuleOp, ModuleStatus, ModuleVersion, SqlDataType, auth, columnFilterKindOf } from "@mmda/core";
import { MMDA_COLOR_PALETTE_IDS, UiViewMany, isLocalAppModuleUrl } from "@mmda/vui"
import {
  applySyncfusionLocale,
  resolveSyncfusionCulture,
} from "../syncfusion_i18n";
import { SyncfusionUiBuilder } from "../syncfusion_builder";
import { createSyncfusionFieldFactory } from "../syncfusion_field_factory";
import {
  createSyncfusionUiFactory,
  autoFitSyncfusionListGrid,
  splitterEventIndex,
} from "../syncfusion_factory";
import { syncfusionLayout } from "../syncfusion_layout";
import { SfImageGallery } from "../components/SfImageGallery";
import { gridFiltersToModel, isChoiceFilterField } from "../factory/utils";

/** 索引页 table()：pagable-table → loading-host → Grid；无分页时 loading-host → Grid。 */
const gridOf = (vnode: any) => {
  let node = vnode;
  if (node?.props?.class === "mmda-sf-pagable-table") {
    const kids = node.children;
    node = Array.isArray(kids) ? kids[0] : kids;
  }
  if (node && !node.props?.columns) {
    const kids = node.children;
    const slot = typeof kids === "function" ? kids : kids?.default;
    const inner = typeof slot === "function" ? slot() : slot;
    if (inner != null) {
      node = Array.isArray(inner) ? inner[0] : inner;
    }
  }
  return node;
};

const pagerOf = (vnode: any) => {
  if (vnode?.props?.class !== "mmda-sf-pagable-table") return null;
  const kids = vnode.children;
  return Array.isArray(kids) ? kids[1] : null;
};

describe("Syncfusion skin", () => {
  it("maps all MMDA palettes to Material 3 accent and surface variables", () => {
    const css = readFileSync(resolve(process.cwd(), "src/style.css"), "utf8");
    for (const palette of MMDA_COLOR_PALETTE_IDS) {
      expect(css).toContain(`data-mmda-palette="${palette}"`);
    }
    expect(css).toContain("--color-sf-primary-container");
    expect(css).toContain("--color-sf-surface");
    expect(css).toContain("--color-sf-background");
    expect(css).toContain("--color-sf-outline-variant");
    expect(css).toContain("html.e-dark-mode[data-mmda-palette=");
    expect(css).toContain("html.mmda-dark[data-mmda-palette=");
  });

  it("implements the vui factory and layout contracts", () => {
    const factory = createSyncfusionUiFactory();
    expect(factory.layout).toBe(syncfusionLayout);
    expect(factory.nativeInplaceEdit).toBe(true);
    expect(factory.paginator).toBeTypeOf("function");
    expect(factory.table).toBeTypeOf("function");
    expect(factory.grid).toBeTypeOf("function");
    expect(factory.dialog).toBeUndefined();
    expect(factory.splitter).toBeTypeOf("function");
    expect(factory.tabs).toBeTypeOf("function");
    expect(factory.toolbar).toBeTypeOf("function");
    const split = factory.splitter(
      [
        { content: h("span", "L"), size: "16rem", min: "12rem", collapsible: true },
        { content: h("span", "R"), min: "16rem" },
      ],
      { class: "mmda-tree-list-splitter" },
    );
    expect(split.type).toBeTruthy();
    expect((split.type as { name?: string }).name).toBe("SfSplitter");
    expect(splitterEventIndex({ index: [0, 1] })).toBe(0);
    expect(splitterEventIndex({ index: 0 })).toBe(0);
    expect(factory.tree).toBeTypeOf("function");
    const tree = factory.tree({
      data: [{ id: "1", label: "根" }],
      fields: { icon: "icon" },
      selectionMode: "single",
      showIcon: true,
      allowDragDrop: true,
    });
    expect(tree.props.fields).toBeTruthy();
    expect(tree.props.selectionMode).toBe("single");
    expect(tree.props.showIcon).toBe(true);
    expect(tree.props.allowDragDrop).toBe(true);
    expect(factory.imageGallery).toBeTypeOf("function");
    expect(factory.filesUploader).toBeTypeOf("function");
    expect(factory.inplaceEditor).toBeTypeOf("function");
    expect(factory.resolveIcon("save")).toBe("e-icons e-save");
    expect(factory.resolveIcon("clear")).toBe("e-icons e-erase");
    expect(factory.resolveIcon("add")).toBe("e-icons e-plus");
    expect(factory.formField).toBeTypeOf("function");
    expect(factory.datePicker).toBeTypeOf("function");
    expect(factory.numberInput).toBeTypeOf("function");
    expect(factory.progressBar).toBeTypeOf("function");
    expect(factory.skeleton).toBeTypeOf("function");
    expect(factory.speechToText).toBeTypeOf("function");
    expect(factory.dropDownList).toBeTypeOf("function");
    expect(factory.switch).toBeTypeOf("function");
    expect(factory.formItem).toBeUndefined();
    expect(factory.dataTable).toBeUndefined();
    expect(factory.primeVueTable).toBeUndefined();
    expect(factory.select).toBeUndefined();
    expect(factory.toggleSwitch).toBeUndefined();
    expect(factory.dataViewBox).toBeUndefined();
    expect(factory.defaultFilterDisplay).toBeUndefined();
    expect(factory.checkbox).toBeUndefined();
  });

  it("maps factory.splitter reverse and resizeStop", () => {
    const factory = createSyncfusionUiFactory();
    const onResizeStop = vi.fn();
    const vnode = factory.splitter(
      [
        { content: h("span", "L"), size: "16rem" },
        { content: h("span", "R") },
      ],
      {
        enableReversePanes: true,
        class: "mmda-tree-list-splitter",
        onResizeStop,
      },
    );
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(" ")
      : String(vnode.props?.class ?? "");
    expect(cls).toContain("mmda-splitter");
    expect(cls).toContain("mmda-splitter--reverse");
    expect(vnode.props?.enableReversePanes).toBe(true);
    vnode.props?.onResizeStop?.({ index: 0, paneSize: [40, 60] });
    expect(onResizeStop).toHaveBeenCalled();
  });

  it("factory.list wraps paginator only when pagination is set", () => {
    const factory = createSyncfusionUiFactory();
    const metaUi = new MetaUi({
      objName: "Item",
      displayLabel: "项",
      groups: [{ groupName: "base", groupLabel: "基本", many: false, fields: [] }],
    });
    const paged = factory.list([{ id: "1" }], metaUi, {
      pagination: { pageNo: 1, pageSize: 20, recordCount: 1 },
      onPage: () => undefined,
    });
    expect(paged.props?.class).toBe("mmda-sf-pagable");
    const bare = factory.list([{ id: "1" }], metaUi, {});
    expect(bare.props?.class).toBe("mmda-sf-list");
  });

  it("maps factory.badge colorRole and circle shape to e-badge classes", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.badge({
      value: 10,
      colorRole: "primary",
      shape: "circle",
    });
    const cls = String(vnode.props?.class ?? vnode.props?.className ?? "");
    const joined = Array.isArray(vnode.props?.class)
      ? vnode.props.class.filter(Boolean).join(" ")
      : cls;
    expect(joined).toContain("e-badge");
    expect(joined).toContain("e-badge-primary");
    expect(joined).toContain("e-badge-circle");
    expect(vnode.children).toBe("10");
  });

  it("maps factory.message defaults to Filled EJ2 Message", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.message({
      content: "保存失败",
      severity: "error",
    });
    expect(vnode.props?.content).toBe("保存失败");
    expect(vnode.props?.severity).toBe("Error");
    expect(vnode.props?.variant).toBe("Filled");
    expect(vnode.props?.showCloseIcon).toBe(true);
    expect(vnode.props?.showIcon).toBe(true);
    const css = String(vnode.props?.cssClass ?? "");
    expect(css).toContain("mmda-message");
  });

  it("maps factory.avatar circle large label to e-avatar classes", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.avatar({
      label: "GR",
      shape: "circle",
      size: "large",
    });
    const joined = Array.isArray(vnode.props?.class)
      ? vnode.props.class.filter(Boolean).join(" ")
      : String(vnode.props?.class ?? "");
    expect(joined).toContain("e-avatar");
    expect(joined).toContain("e-avatar-circle");
    expect(joined).toContain("e-avatar-large");
    expect(vnode.children).toBe("GR");
  });

  it("maps factory.card surface, colorRole, image, headerImage, divider", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.card(
      {
        title: "Summary",
        colorRole: "primary",
        surface: "outlined",
        image: "/cover.png",
        headerImage: "/face.png",
        divider: true,
      },
      { default: () => [h("p", "body")] },
    );
    const joined = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(" ")
      : String(vnode.props?.class ?? "");
    expect(joined).toContain("e-card");
    expect(joined).toContain("mmda-card");
    expect(joined).toContain("mmda-card--primary");
    expect(joined).toContain("mmda-card--outlined");
    const kids = Array.isArray(vnode.children) ? vnode.children : [];
    const classOf = (node: any) =>
      Array.isArray(node?.props?.class)
        ? node.props.class.flat(8).filter(Boolean).join(" ")
        : String(node?.props?.class ?? "");
    expect(kids.some((n: any) => classOf(n).includes("e-card-image"))).toBe(true);
    expect(
      kids.some((n: any) => classOf(n).includes("e-card-separator")),
    ).toBe(true);
    const header = kids.find((n: any) => classOf(n).includes("e-card-header"));
    const headerKids = Array.isArray(header?.children) ? header.children : [];
    expect(
      headerKids.some((n: any) => classOf(n).includes("e-card-header-image")),
    ).toBe(true);
  });

  it("maps factory.divider orientation and label", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.divider({
      orientation: "vertical",
      label: "或",
    });
    const joined = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(" ")
      : String(vnode.props?.class ?? "");
    expect(joined).toContain("e-separator");
    expect(joined).toContain("mmda-divider");
    expect(joined).toContain("mmda-divider--vertical");
    expect(joined).toContain("mmda-divider--labeled");
    expect(vnode.props?.["aria-orientation"]).toBe("vertical");
    const labelNode = Array.isArray(vnode.children)
      ? vnode.children[0]
      : vnode.children;
    expect(labelNode?.children).toBe("或");
  });

  it("maps factory.tooltip TopCenter and Hover opensOn", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.tooltip(
      { content: "说明", position: "top", opensOn: "hover" },
      { default: () => [h("button", "保存")] },
    );
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/Tooltip/);
    expect(vnode.props?.content).toBe("说明");
    expect(vnode.props?.position).toBe("TopCenter");
    expect(vnode.props?.opensOn).toBe("Hover");
    expect(vnode.props?.showTipPointer).toBe(true);
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-tooltip--top");
  });

  it("exposes factory.inplaceEditor and fld InplaceFieldEditor", () => {
    const factory = createSyncfusionUiFactory();
    expect(factory.inplaceEditor).toBeTypeOf("function");
    const vnode = factory.inplaceEditor(
      {},
      {
        display: () => [h("span", "显示")],
        content: () => [h("input")],
      },
    );
    expect(String(vnode.type?.name ?? vnode.type?.__name ?? "")).toMatch(
      /InplaceEditor/,
    );
    const fields = createSyncfusionFieldFactory();
    expect(fields.inplaceFieldEditor).toBeTypeOf("function");
    expect(fields.InplaceFieldEditor).toBe(fields.inplaceFieldEditor);
    expect(fields.InplaceEditor).toBeUndefined();
  });

  it("maps factory.colorPicker mode, value, and emits hex", () => {
    const factory = createSyncfusionUiFactory();
    const onChange = vi.fn();
    const vnode = factory.colorPicker({
      value: "#035a",
      mode: "palette",
      showModeSwitcher: false,
      onChange,
    });
    expect(vnode.props?.value).toBe("#035a");
    expect(vnode.props?.mode).toBe("Palette");
    expect(vnode.props?.modeSwitcher).toBe(false);
    const joined = String(vnode.props?.cssClass ?? "");
    expect(joined).toContain("mmda-colorpicker");
    expect(joined).toContain("mmda-colorpicker--palette");
    vnode.props?.change?.({
      currentValue: { hex: "#7b1fa2", rgba: "rgba(123,31,162,1)" },
    });
    expect(onChange).toHaveBeenCalledWith("#7b1fa2");
  });

  it("maps factory.numberInput format, decimals, and value", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.numberInput({
      value: 12.5,
      decimals: 2,
      min: 0,
      format: "n2",
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/NumericTextBox/i);
    expect(vnode.props?.format).toBe("n2");
    expect(vnode.props?.decimals).toBe(2);
    expect(vnode.props?.min).toBe(0);
    expect(vnode.props?.value).toBe(12.5);
    expect(vnode.props?.step).toBe(1);
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-numberinput");
  });

  it("maps factory.textArea value rows and resizeMode", () => {
    const factory = createSyncfusionUiFactory();
    const onChange = vi.fn();
    const vnode = factory.textArea({
      value: "hello",
      rows: 5,
      resizeMode: "None",
      onChange,
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/TextArea/i);
    expect(vnode.props?.value).toBe("hello");
    expect(vnode.props?.rows).toBe(5);
    expect(vnode.props?.resizeMode).toBe("None");
    expect(vnode.props?.enabled).toBe(true);
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-textarea");
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-textarea--none");
    vnode.props?.input?.({ value: "next" });
    expect(onChange).toHaveBeenCalledWith("next");
  });

  it("maps factory.textInput placeholder type and showClearButton", () => {
    const factory = createSyncfusionUiFactory();
    const onChange = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const vnode = factory.textInput({
      value: "hello",
      placeholder: "hint",
      type: "Password",
      showClearButton: true,
      onChange,
      onFocus,
      onBlur,
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/TextBox/i);
    expect(vnode.props?.value).toBe("hello");
    expect(vnode.props?.placeholder).toBe("hint");
    expect(vnode.props?.type).toBe("Password");
    expect(vnode.props?.showClearButton).toBe(true);
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-textinput");
    vnode.props?.input?.({ value: "next" });
    expect(onChange).toHaveBeenCalledWith("next");
    vnode.props?.focus?.();
    vnode.props?.blur?.();
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it("maps factory.progressBar value and Linear type", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.progressBar({
      value: 42,
      size: "small",
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/ProgressBar/);
    expect(vnode.props?.value).toBe(42);
    expect(vnode.props?.type).toBe("Linear");
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-progressbar--small");
  });

  it("maps factory.signaturePad strokeColor and isReadOnly", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.signaturePad({
      value: "data:image/png;base64,abc",
      strokeColor: "#111111",
      readOnly: true,
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/Signature/);
    expect(vnode.props?.strokeColor).toBe("#111111");
    expect(vnode.props?.isReadOnly).toBe(true);
  });

  it("maps factory.stepper activeStep and Vertical orientation", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.stepper({
      value: 1,
      orientation: "vertical",
      items: [{ label: "甲" }, { label: "乙" }],
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/Stepper/);
    expect(vnode.props?.activeStep).toBe(1);
    expect(vnode.props?.orientation).toBe("Vertical");
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-stepper--vertical");
  });

  it("maps factory.timeline Vertical and Before align", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.timeline({
      orientation: "vertical",
      align: "before",
      items: [{ label: "发运", time: "2026-01-01 00:00:00" }],
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/Timeline/);
    expect(vnode.props?.orientation).toBe("Vertical");
    expect(vnode.props?.align).toBe("Before");
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-timeline--vertical");
  });

  it("maps factory.skeleton shape and shimmerEffect", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.skeleton({
      shape: "circle",
      width: 40,
      height: 40,
      shimmer: "pulse",
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/Skeleton/);
    expect(vnode.props?.shape).toBe("Circle");
    expect(vnode.props?.shimmerEffect).toBe("Pulse");
    expect(vnode.props?.width).toBe(40);
    expect(vnode.props?.visible).toBe(true);
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-skeleton--circle");
  });

  it("maps factory.loading to spinner host not e-spin", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.loading({ label: "加载中", size: "small" });
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(" ")
      : String(vnode.props?.class ?? "");
    expect(cls).toContain("mmda-loading");
    expect(cls).not.toContain("e-spin");
    expect(vnode.props?.label).toBe("加载中");
    expect(vnode.props?.size).toBe("small");
    expect(vnode.props?.loading).toBe(true);
  });

  it("maps factory.tree to SfTree with mmda-tree", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.tree({
      data: [{ id: "1", label: "根" }],
      selectionMode: "checkbox",
    });
    expect(vnode.type?.name ?? vnode.type?.__name).toBe("SfTree");
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(" ")
      : String(vnode.props?.class ?? "");
    expect(cls).toContain("mmda-tree");
    expect(cls).toContain("mmda-tree--checkbox");
    expect(vnode.props?.selectionMode).toBe("checkbox");
  });

  it("maps factory.speechToText transcript lang and interim", () => {
    const factory = createSyncfusionUiFactory();
    const onChange = vi.fn();
    const vnode = factory.speechToText({
      value: "你好",
      lang: "zh-CN",
      interim: false,
      onChange,
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/SpeechToText/);
    expect(vnode.props?.transcript).toBe("你好");
    expect(vnode.props?.lang).toBe("zh-CN");
    expect(vnode.props?.allowInterimResults).toBe(false);
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-speech-to-text");
    vnode.props?.transcriptChanged?.({ transcript: "好的" });
    expect(onChange).toHaveBeenCalledWith("好的");
  });

  it("maps factory.radioButtonGroup RadioButton name and checked", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.radioButtonGroup({
      value: "b",
      name: "kind",
      options: [
        { value: "a", label: "甲" },
        { value: "b", label: "乙" },
      ],
    });
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(" ")
      : String(vnode.props?.class ?? "");
    expect(cls).toContain("mmda-radiobuttongroup");
    const kids = Array.isArray(vnode.children) ? vnode.children : [];
    expect(kids.length).toBe(2);
    const types = kids.map(
      (child) => child?.type?.name ?? child?.type?.__name ?? String(child?.type),
    );
    expect(types.join(" ")).toMatch(/RadioButton/);
    expect(kids[0].props?.name).toBe("kind");
    expect(kids[1].props?.name).toBe("kind");
    expect(kids[0].props?.checked).toBe(false);
    expect(kids[1].props?.checked).toBe(true);
    expect(kids[1].props?.value).toBe("b");
  });


  it("maps factory.maskedTextBox mask and value", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.maskedTextBox({
      mask: "000 0000 0000",
      value: "13800138000",
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/MaskedTextBox/i);
    expect(vnode.props?.mask).toBe("000 0000 0000");
    expect(vnode.props?.value).toBe("13800138000");
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-maskedtextbox");
  });

  it("maps factory.oneTimePasswordInput length type and value", () => {
    const factory = createSyncfusionUiFactory();
    const onChange = vi.fn();
    const vnode = factory.oneTimePasswordInput({
      length: 6,
      type: "number",
      value: "123456",
      onChange,
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/OtpInput/i);
    expect(vnode.props?.length).toBe(6);
    expect(vnode.props?.type).toBe("number");
    expect(vnode.props?.value).toBe("123456");
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-otpinput");
    vnode.props?.valueChanged?.({ value: "654321" });
    expect(onChange).toHaveBeenCalledWith("654321");
  });

  it("maps factory.queryBuilder to QueryBuilder", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.queryBuilder({
      columns: [{ fieldName: "age", label: "Age", valueType: "number" }],
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/QueryBuilder/i);
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-querybuilder");
    expect(vnode.props?.columns?.[0]?.field).toBe("age");
  });

  it("maps factory.slider type Range and value", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.slider({
      type: "Range",
      min: 0,
      max: 50,
      step: 5,
      value: [10, 40],
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/Slider/i);
    expect(vnode.props?.type).toBe("Range");
    expect(vnode.props?.min).toBe(0);
    expect(vnode.props?.max).toBe(50);
    expect(vnode.props?.step).toBe(5);
    expect(vnode.props?.value).toEqual([10, 40]);
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-slider--range");
  });

  it("maps factory.rating itemsCount and readOnly", () => {
    const factory = createSyncfusionUiFactory();
    const onChange = vi.fn();
    const vnode = factory.rating({
      value: 2,
      itemsCount: 5,
      readOnly: true,
      onChange,
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/Rating/i);
    expect(vnode.props?.value).toBe(2);
    expect(vnode.props?.itemsCount).toBe(5);
    expect(vnode.props?.readOnly).toBe(true);
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-rating");
    vnode.props?.valueChanged?.({ value: 4 });
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("maps factory.sidebar dock target mediaQuery gestures", () => {
    const factory = createSyncfusionUiFactory();
    const onChange = vi.fn();
    const vnode = factory.sidebar({
      isOpen: true,
      type: "Push",
      enableDock: true,
      dockSize: 72,
      target: "#main",
      mediaQuery: "(min-width: 600px)",
      enableGestures: false,
      onChange,
    });
    expect(vnode.props?.isOpen).toBe(true);
    expect(vnode.props?.type).toBe("Push");
    expect(vnode.props?.enableDock).toBe(true);
    expect(vnode.props?.dockSize).toBe(72);
    expect(vnode.props?.target).toBe("#main");
    expect(vnode.props?.mediaQuery).toBe("(min-width: 600px)");
    expect(vnode.props?.enableGestures).toBe(false);
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-sidebar--dock");
    vnode.props?.close?.();
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("maps factory.tabs value headerPlacement scrollable", () => {
    const factory = createSyncfusionUiFactory();
    const onChange = vi.fn();
    const vnode = factory.tabs({
      items: [
        { header: "One", content: "a" },
        { header: { text: "Two", iconCss: "e-icons e-home" }, content: "b" },
      ],
      value: 1,
      headerPlacement: "Left",
      scrollable: false,
      onChange,
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/Tab/i);
    expect(vnode.props?.selectedItem).toBe(1);
    expect(vnode.props?.headerPlacement).toBe("Left");
    expect(vnode.props?.overflowMode).toBe("Popup");
    expect(vnode.props?.heightAdjustMode).toBe("Fill");
    expect(vnode.props?.items?.[0]?.header).toEqual({
      text: "One",
      iconCss: undefined,
    });
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-tabs");
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-tabs--left");
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-tabs--popup");
    vnode.props?.selected?.({ selectedIndex: 0 });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("maps factory.toolbar slots and align", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.toolbar(
      { layout: "medium", align: { end: "left" }, class: "skin" },
      {
        start: () => "S",
        center: () => "C",
        end: () => "E",
      },
    );
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(" ")
      : String(vnode.props?.class ?? "");
    expect(cls).toContain("mmda-toolbar");
    expect(cls).toContain("mmda-toolbar--medium");
    expect(cls).toContain("mmda-toolbar--with-center");
    const kids = vnode.children as any[];
    const endCls = Array.isArray(kids[2].props.class)
      ? kids[2].props.class.flat(8).filter(Boolean).join(" ")
      : String(kids[2].props.class ?? "");
    expect(endCls).toContain("mmda-toolbar__end--left");
  });

  it("maps factory.drawer to Over with backdrop", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.drawer({ visible: true } as any);
    expect(vnode.props?.type).toBe("Over");
    expect(vnode.props?.showBackdrop).toBe(true);
    expect(vnode.props?.isOpen).toBe(true);
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-sidebar--drawer");
  });

  it("maps factory.datePicker format, Monday week, and no typing", () => {
    const factory = createSyncfusionUiFactory();
    const onChange = vi.fn();
    const day = new Date(2026, 8, 7);
    const vnode = factory.datePicker({
      value: day,
      onChange,
    });
    expect(vnode.props?.format).toBe("yyyy-MM-dd");
    expect(vnode.props?.allowEdit).toBe(false);
    expect(vnode.props?.firstDayOfWeek).toBe(1);
    expect(vnode.props?.strictMode).toBe(true);
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-datepicker");
    vnode.props?.change?.({ value: day });
    expect(onChange).toHaveBeenCalledWith(day);
    const month = factory.monthPicker({ value: day });
    expect(month.props?.start).toBe("Year");
    expect(month.props?.format).toBe("yyyy-MM");
    expect(String(month.props?.cssClass ?? "")).toContain("mmda-datepicker--month");
    const start = new Date(2026, 8, 1);
    const end = new Date(2026, 8, 7);
    const range = factory.dateRangePicker({ value: [start, end] });
    expect(range.props?.startDate).toEqual(start);
    expect(range.props?.endDate).toEqual(end);
    expect(String(range.props?.cssClass ?? "")).toContain("mmda-daterangepicker");
  });

  it("maps factory.barcode format to EJ2 type", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.barcode({
      value: "123456789",
      format: "ean13",
      displayText: "SN-1",
    });
    expect(vnode.props?.type).toBe("Ean13");
    expect(vnode.props?.value).toBe("123456789");
    expect(vnode.props?.mode).toBe("SVG");
    expect(vnode.props?.displayText).toEqual({
      text: "SN-1",
      visibility: true,
    });
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-barcode--ean13");
  });

  it("maps factory.qrCode dataMatrix to DataMatrixGenerator", () => {
    const factory = createSyncfusionUiFactory();
    const qr = factory.qrCode({ value: "https://example.com" });
    const dm = factory.qrCode({ value: "SYNC123", format: "dataMatrix" });
    expect(qr.type?.name ?? qr.type).toBeTruthy();
    expect(qr.props?.value).toBe("https://example.com");
    expect(qr.props?.displayText?.visibility).toBe(false);
    expect(String(dm.props?.cssClass ?? "")).toContain("mmda-qrcode--data-matrix");
    expect(dm.props?.value).toBe("SYNC123");
  });

  it("renders photo thumbnails and opens the fullscreen carousel", () => {
    const emit = vi.fn();
    const render = (SfImageGallery as any).setup(
      {
        items: [
          {
            src: "/files/material-1.jpg",
            title: "正面",
            description: "物料正面",
          },
          { src: "/files/material-2.jpg", title: "背面" },
        ],
        emptyText: "暂无图片",
        columns: 4,
        dialogTitle: "图片预览",
        loop: true,
      },
      { emit },
    );

    const initial = render();
    const grid = initial.children[0];
    expect(grid.props.class).toBe("mmda-image-gallery__grid");
    expect(grid.children).toHaveLength(2);
    expect(grid.children[0].children[0].props.src).toBe(
      "/files/material-1.jpg",
    );

    grid.children[0].props.onClick();
    const opened = render();
    const dialog = opened.children[1];
    expect(dialog.props.visible).toBe(true);
    expect(dialog.props.width).toBe("100vw");
    const carousel = dialog.children.default();
    expect(carousel.props.items).toHaveLength(2);
    expect(carousel.props.selectedIndex).toBe(0);
    expect(emit).toHaveBeenCalledWith(
      "itemClick",
      expect.objectContaining({ title: "正面" }),
      0,
    );
  });

  it("maps fileLink and uploader chrome", () => {
    const factory = createSyncfusionUiFactory();
    expect(factory.fileLink).toBeTypeOf("function");
    expect(factory.fileUploader).toBeTypeOf("function");
    expect(factory.filesUploader).toBeTypeOf("function");
    expect(factory.imageUploader).toBeTypeOf("function");
    expect(factory.imagesUploader).toBeTypeOf("function");
    expect(factory.filePicker).toBe(factory.fileUploader);
    expect(factory.FileUpload).toBe(factory.filesUploader);
    expect(factory.imagePicker).toBe(factory.imageUploader);
    const link = factory.fileLink({ url: "/f/a.pdf", downloadable: false });
    expect(link.type).toBe("span");
    expect(JSON.stringify(link.props.class)).toContain("mmda-file-link");
    expect(JSON.stringify(link.props.class)).toContain("mmda-file-link--blocked");
  });

  it("forces action buttons to type=button so form pages do not submit", () => {
    const factory = createSyncfusionUiFactory();
    const onAction = vi.fn();
    const vnode = factory.actionButton(
      { name: "add", label: "添加", onAction },
      (message) => message,
      true,
      { id: "add-features-button" },
    );
    // EJ2 Vue Button 不认 htmlAttributes；type 作为原生透传
    expect(vnode.props.type).toBe("button");
    expect(vnode.props.htmlAttributes).toBeUndefined();
    expect(vnode.props.id).toBe("add-features-button");
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    vnode.props.onClick(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("registers old metadata editor aliases", () => {
    const fields = createSyncfusionFieldFactory();
    expect(fields.TextBox).toBe(fields.textInput);
    expect(fields.DropDownList).toBe(fields.dropDownList);
    expect(fields.dropdown).toBeUndefined();
    expect(fields.DatePicker).toBe(fields.datePicker);
    expect(fields.FileUpload).toBe(fields.fileUpload);
    expect(fields.FileUploader).toBe(fields.fileUploader);
    expect(fields.FilesUploader).toBe(fields.filesUploader);
    expect(fields.ImageUploader).toBe(fields.imageUploader);
    expect(fields.Url).toBe(fields.fileLink);
    expect(fields.QuantityUnit).toBe(fields.quantityUnit);
    expect(fields.Chips).toBe(fields.chips);
    expect(fields.BitChipSet).toBe(fields.bitChipSet);
    expect(fields.EnumChipSet).toBe(fields.enumChipSet);
    expect(fields.enumSetTags).toBeUndefined();
    expect(fields.BitTags).toBeUndefined();
    expect(fields.InplaceFieldEditor).toBe(fields.inplaceFieldEditor);
  });

  it("renders QuantityUnit as value, space, and suffix unit", () => {
    const fields = createSyncfusionFieldFactory();
    const field = {
      fieldName: "unitWeight",
      suffix: "KG",
      renderer: "QuantityUnit",
    } as any;
    const vnode = fields.QuantityUnit(field, {
      getFieldValue: () => 12.5,
    } as any);
    expect(vnode.children).toBe("12.5 KG");
  });

  it("renders Chips from comma-separated tags", () => {
    const fields = createSyncfusionFieldFactory();
    const vnode = fields.Chips(
      { fieldName: "tags", renderer: "Chips" } as any,
      { getFieldValue: () => "原料,辅料, 包装" } as any,
    );
    expect(String(vnode.props.cssClass ?? "")).toContain("mmda-chips");
    expect(vnode.props.chips.map((chip: any) => chip.text)).toEqual([
      "原料",
      "辅料",
      "包装",
    ]);
    const tags = fields.tags(
      { fieldName: "tags" } as any,
      { getFieldValue: () => "原料,辅料, 包装" } as any,
    );
    expect(tags.props.chips.map((chip: any) => chip.text)).toEqual([
      "原料",
      "辅料",
      "包装",
    ]);
  });

  it("uses NumericTextBox appendTemplate for unit suffix and native spin", () => {
    const fields = createSyncfusionFieldFactory();
    const context = {
      getFieldValue: () => 2,
      setFieldValue: vi.fn(),
      isFieldReadonly: () => false,
      isInvalid: () => false,
    } as any;
    const vnode = fields.numberInput(
      { fieldName: "unitVolume", suffix: "CBM" } as any,
      context,
    );
    const numeric = vnode.children[0] as any;
    expect(numeric.props.showSpinButton).toBe(true);
    expect(numeric.props.appendTemplate).toBe("appendTemplate");
    expect(JSON.stringify(numeric.children.appendTemplate?.())).toContain("CBM");
    expect(numeric.props.appendIconTemplate).toBeUndefined();
    expect(typeof numeric.props.created).toBe("function");
  });

  it("falls back to formatter as unit in appendTemplate suffix", () => {
    const fields = createSyncfusionFieldFactory();
    const context = {
      getFieldValue: () => 12,
      setFieldValue: vi.fn(),
      isFieldReadonly: () => false,
      isInvalid: () => false,
    } as any;
    const vnode = fields.numberInput(
      { fieldName: "expirationDays", formatter: "天" } as any,
      context,
    );
    const numeric = vnode.children[0] as any;
    expect(numeric.props.appendTemplate).toBe("appendTemplate");
    expect(JSON.stringify(numeric.children.appendTemplate?.())).toContain("天");
    expect(typeof numeric.props.created).toBe("function");
  });

  it("injects unit suffix before spin buttons when appendTemplate slot is inactive", async () => {
    const fields = createSyncfusionFieldFactory();
    document.body.innerHTML = `
      <div class="e-input-group">
        <input id="unitWeight" />
        <span class="e-input-group-icon e-spin-down"></span>
        <span class="e-input-group-icon e-spin-up"></span>
      </div>
    `;
    const vnode = fields.numberInput(
      { fieldName: "unitWeight", suffix: "KG" } as any,
      {
        getFieldValue: () => 1,
        setFieldValue: vi.fn(),
        isFieldReadonly: () => false,
        isInvalid: () => false,
      } as any,
    );
    const numeric = vnode.children[0] as any;
    numeric.props.created();
    await new Promise((resolve) => queueMicrotask(resolve));
    const suffix = document.querySelector(".mmda-numeric-suffix");
    expect(suffix?.textContent).toBe("KG");
    expect(suffix?.nextElementSibling?.classList.contains("e-spin-down")).toBe(
      true,
    );
    document.body.innerHTML = "";
  });

  it("maps reference dropDownList options to value/label chrome options", () => {
    const fields = createSyncfusionFieldFactory();
    const category = {
      categoryID: "C1",
      categoryName: "原料",
    };
    const reference = {
      hasOne: false,
      isRef: true,
      isEnum: false,
      alias: "category",
      refFlds: ["categoryID", "categoryName"],
      refOptions: [category],
      valueOf: (option: any) => option?.categoryID,
      labelOf: (option: any) => option?.categoryName,
    };
    const setFieldValue = vi.fn();
    const context = {
      model: { categoryID: "C1", category },
      getFieldValue: () => category,
      setFieldValue,
      isFieldReadonly: () => false,
      isInvalid: () => false,
    } as any;
    const field = {
      fieldName: "categoryID",
      displayLabel: "物料类别",
      nullable: true,
      placeholder: "",
      reference,
    } as any;

    const vnode = fields.dropDownList(field, context);
    const chrome = vnode.children[0] as any;
    expect(chrome.props.dataSource).toEqual([
      { value: "C1", label: "原料" },
    ]);
    expect(chrome.props.fields).toEqual({
      text: "label",
      value: "value",
    });
    expect(chrome.props.value).toBe("C1");
    const joined = String(chrome.props?.cssClass ?? "");
    expect(joined).toContain("mmda-dropdown-list");

    chrome.props.change({ value: "C1" });
    expect(setFieldValue).toHaveBeenCalledWith(field, category);
  });

  it("maps factory.dropDownList options, group, icon, and suggest", () => {
    const factory = createSyncfusionUiFactory();
    const onChange = vi.fn();
    const suggest = vi.fn(async () => [{ value: "x", label: "X" }]);
    const vnode = factory.dropDownList({
      value: "a",
      options: [
        { value: "a", label: "甲", group: "G", icon: "flag" },
        { value: "b", label: "乙", group: "G" },
      ],
      suggest,
      onChange,
    });
    expect(vnode.props?.value).toBe("a");
    expect(vnode.props?.dataSource?.[0]).toMatchObject({
      value: "a",
      label: "甲",
      group: "G",
      icon: "flag",
    });
    expect(vnode.props?.fields?.groupBy).toBe("group");
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-dropdown-list");
    expect(typeof vnode.props?.filtering).toBe("function");
    vnode.props?.change?.({ value: "b" });
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("maps factory.multiSelect CheckBox keys and bindMode class", () => {
    const factory = createSyncfusionUiFactory();
    const onChange = vi.fn();
    const vnode = factory.multiValueSelect({
      value: [1],
      options: [
        { value: 1, label: "读" },
        { value: 2, label: "写" },
      ],
      onChange,
    });
    expect(vnode.props?.mode).toBe("CheckBox");
    expect(vnode.props?.value).toEqual([1]);
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-multi-select");
    vnode.props?.change?.({ value: [1, 2] });
    expect(onChange).toHaveBeenCalledWith([1, 2]);
  });

  it("maps factory.bitCheckBoxList or_bits layout", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.bitCheckBoxList({
      value: 1,
      options: [
        { value: 1, label: "读" },
        { value: 2, label: "写" },
      ],
    });
    const cls = Array.isArray(vnode.props?.class)
      ? vnode.props.class.flat(8).filter(Boolean).join(" ")
      : String(vnode.props?.class ?? "");
    expect(cls).toContain("mmda-checkbox-list");
    expect(cls).toContain("mmda-checkbox-list--bits");
  });

  it("maps factory.tagAutoComplete Box custom values", () => {
    const factory = createSyncfusionUiFactory();
    const onUpdate = vi.fn();
    const vnode = factory.tagAutoComplete({
      value: "a,b",
      options: ["a", "b"],
      onUpdate,
    });
    expect(vnode.props?.mode).toBe("Box");
    expect(vnode.props?.allowCustomValue).toBe(true);
    expect(vnode.props?.value).toEqual(["a", "b"]);
    vnode.props?.change?.({ value: ["a", "c"] });
    expect(onUpdate).toHaveBeenCalledWith("a,c");
  });

  it("maps factory.treeSelect nested data, checkbox array, and hook class", () => {
    const factory = createSyncfusionUiFactory();
    const onChange = vi.fn();
    const vnode = factory.treeSelect({
      value: "a",
      data: [{ id: "a", label: "甲", children: [{ id: "a1", label: "甲1" }] }],
      fields: { id: "id", label: "label", children: "children" },
      selectionMode: "checkbox",
      onChange,
    });
    expect(vnode.props?.value).toEqual(["a"]);
    expect(vnode.props?.showCheckBox).toBe(true);
    expect(vnode.props?.allowMultiSelection).toBe(true);
    expect(vnode.props?.allowFiltering).toBe(true);
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-tree-select");
    expect(factory.dropDownTree).toBe(factory.treeSelect);
    vnode.props?.change?.({ value: ["a", "a1"] });
    expect(onChange).toHaveBeenCalledWith(["a", "a1"]);
  });

  it("maps factory.comboBox allowCustom and custom class", () => {
    const factory = createSyncfusionUiFactory();
    const custom = factory.comboBox({
      value: "t",
      options: ["a"],
    });
    expect(custom.props?.allowCustom).toBe(true);
    expect(String(custom.props?.cssClass ?? "")).toContain("mmda-combobox");
    expect(String(custom.props?.cssClass ?? "")).toContain(
      "mmda-combobox--custom",
    );
    const closed = factory.comboBox({
      value: "a",
      options: ["a"],
      allowCustom: false,
    });
    expect(closed.props?.allowCustom).toBe(false);
    expect(String(closed.props?.cssClass ?? "")).not.toContain(
      "mmda-combobox--custom",
    );
  });

  it("SearchBox uses relative search control instead of plain text input", () => {
    const fields = createSyncfusionFieldFactory();
    expect(fields.SearchBox).toBe(fields.searchBox);
    expect(fields.searchBox).not.toBe(fields.textInput);

    const category = { categoryID: "C1", categoryName: "原料" };
    const reference = {
      hasOne: true,
      isRef: false,
      alias: "category",
      refFlds: ["categoryID", "categoryName"],
      refOptions: [] as any[],
      refRepository: "MaterialCats",
      valueOf: (option: any) => option?.categoryID,
      labelOf: (option: any) => option?.categoryName,
    };
    const buildSearchForRelative = vi.fn(() =>
      h("div", { class: "mmda-sf-relative-search" }),
    );
    const context = {
      model: { categoryID: "C1", category },
      getFieldValue: () => category,
      getFieldOptions: () => ({
        selectOptions: [category],
        searchParam: { searchWord: "" },
        currentSelectOption: category,
        isComposing: false,
      }),
      searchRelative: vi.fn(),
      setFieldValue: vi.fn(),
      app: { ui: { buildSearchForRelative } },
      uiBuilder: { buildSearchForRelative },
      isFieldReadonly: () => false,
      isInvalid: () => false,
    } as any;
    const field = {
      fieldName: "categoryID",
      displayLabel: "物料类别",
      nullable: true,
      reference,
    } as any;

    fields.searchBox(field, context);
    expect(buildSearchForRelative).toHaveBeenCalled();
    expect(buildSearchForRelative.mock.calls[0][1]).toBe(field);
  });

  it("puts search and refresh icons on the search TextBox appendTemplate", () => {
    const builder = new SyncfusionUiBuilder();
    const resetFilters = vi.fn();
    const onSearch = vi.fn();
    const onRefresh = vi.fn();
    const context = {
      translate: (key: string) => key,
      searchParam: { searchWord: "螺丝", pager: { pageNo: 2, pageSize: 50 } },
      filters: [],
      searchFields: [],
      customSearchFields: [],
      resetFilters,
      search: vi.fn(),
    } as any;
    const vnode = builder.buildModuleSearchbar(context, { onSearch, onRefresh });
    const textbox = vnode.children.find(
      (child: any) =>
        child?.props?.appendTemplate === "appendTemplate" ||
        child?.type?.name === "SfSearchTextInput",
    );
    expect(textbox).toBeTruthy();
    expect(String(textbox.props.cssClass ?? "")).toContain("e-small");
    expect(textbox.props.placeholder).toBe("action.search");
    const addons = textbox.children.appendTemplate();
    const buttons = addons.children;
    expect(buttons[0].props.title).toBe("action.search");
    expect(buttons[1].props.title).toBe("action.refresh");
    expect(JSON.stringify(vnode)).not.toContain("isPrimary");

    buttons[1].props.onClick({ preventDefault() {}, stopPropagation() {} });
    expect(onRefresh).toHaveBeenCalled();
    expect(resetFilters).not.toHaveBeenCalled();

    context.searchParam.searchWord = "  ";
    vnode.props.onSubmit({ preventDefault() {} });
    expect(resetFilters).toHaveBeenCalled();
    expect(onSearch).not.toHaveBeenCalled();

    context.searchParam.searchWord = "垫片";
    vnode.props.onSubmit({ preventDefault() {} });
    expect(onSearch).toHaveBeenCalledWith("垫片");
    expect(context.searchParam.pager.pageNo).toBe(1);
  });

  it("constructs the builder against the new VueUiBuilder contract", () => {
    const builder = new SyncfusionUiBuilder();
    expect(builder.factory.layout.fieldVertical).toBe(false);
    expect(builder.buildAppScaffold()).toBeTruthy();
    expect(builder.overlayHost).toBeTruthy();
  });

  it("wraps toolbar actions in a button group", () => {
    const builder = new SyncfusionUiBuilder();
    const group = builder.factory.buttonGroup(
      () => [
        builder.factory.actionButton(
          { name: "refresh", label: "Refresh", onAction: () => undefined },
          (key) => key,
        ),
        builder.factory.actionButton(
          { name: "create", label: "Create", onAction: () => undefined },
          (key) => key,
        ),
      ],
      { class: "mmda-sf-toolbar-actions" },
    );
    const className = Array.isArray(group.props?.class)
      ? group.props.class.join(" ")
      : String(group.props?.class ?? "");
    expect(className).toContain("e-btn-group");
    expect(className).toContain("mmda-sf-button-group");
    expect(className).toContain("mmda-sf-toolbar-actions");
  });

  it("maps button colorRole onto EJ2 style classes", () => {
    const factory = createSyncfusionUiFactory();
    const danger = factory.button({
      label: "Delete",
      colorRole: "danger",
      buttonType: "outlined",
    });
    const css = String(danger.props?.cssClass ?? "");
    expect(css).toContain("e-danger");
    expect(css).toContain("e-outline");
    expect(css).toContain("mmda-button--danger");
  });

  it("renders selectButtonGroup as radio or checkbox", () => {
    const factory = createSyncfusionUiFactory();
    const options = [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
    ];
    const single = factory.selectButtonGroup("center", {
      options,
      optionLabel: "label",
      optionValue: "value",
    });
    const radios = (single.children ?? []).filter(
      (node: any) => node?.props?.type === "radio",
    );
    expect(radios.length).toBe(2);

    const multi = factory.selectButtonGroup(["left"], {
      selectionMode: "multiple",
      options,
      optionLabel: "label",
      optionValue: "value",
    });
    const checks = (multi.children ?? []).filter(
      (node: any) => node?.props?.type === "checkbox",
    );
    expect(checks.length).toBe(2);
  });

  it("renders the metadata name field as a details link", () => {
    const metaUi = new MetaUi({
      objName: "Material",
      displayLabel: "物料",
      primaryKey: "materialID",
      labelKey: "materialCode",
      groups: [
        {
          groupName: "basic",
          groupLabel: "基础信息",
          many: false,
          fields: [
            {
              fieldIdx: 1,
              fieldName: "materialCode",
              displayLabel: "物料编码",
              dataType: 12,
              nullable: false,
              listed: true,
            },
          ],
        },
      ],
    });
    const details = vi.fn();
    const context = {
      name: ".",
      editing: false,
      metaUi,
      module: {},
      getFieldLogic: () => ({}),
      details,
    } as any;
    const builder = new SyncfusionUiBuilder();
    const link = builder.displayCellFor(
      metaUi.getField("materialCode")!,
      { materialID: "m1", materialCode: "M001" },
      context,
      { tableMetaui: metaUi },
    ) as any;

    expect(link.type).toBe("a");
    expect(link.props.class).toContain("mmda-table-link");
    expect(link.children).toBe("M001");
    link.props.onClick({ preventDefault: vi.fn() });
    expect(details).toHaveBeenCalledWith(
      expect.objectContaining({ materialID: "m1" }),
    );
  });

  it("builds more actions as DropDownButton, not horizontal Menu", () => {
    const builder = new SyncfusionUiBuilder();
    const vnode = builder.factory.moreMenuButton(
      {
        label: "action.more",
        buttonType: "tonal",
        colorRole: "secondary",
      },
      [
        { name: "import", label: "导入", onAction: () => undefined },
        { name: "export", label: "导出", onAction: () => undefined },
        { name: "print", label: "打印", onAction: () => undefined },
      ],
    );
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/DropDownButton/i);
    expect(vnode.props?.items).toHaveLength(3);
    expect(vnode.props?.items?.[0]?.text).toBe("导入");
    expect(vnode.props?.content).toBe("action.more");
    expect(vnode.props?.iconCss).toBeFalsy();
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-btn-tonal");
    expect(String(vnode.props?.cssClass ?? "")).not.toContain("e-outline");
    expect(String(vnode.props?.cssClass ?? "")).not.toContain("e-flat");
  });

  it("renders more-menu dividers as separators without more-N labels", () => {
    const builder = new SyncfusionUiBuilder();
    const vnode = builder.factory.moreMenuButton(
      {
        label: "action.more",
        buttonType: "tonal",
        colorRole: "secondary",
      },
      [
        { name: "import", label: "导入", onAction: () => undefined },
        { name: "export", label: "导出", onAction: () => undefined },
        { name: "print", label: "打印", onAction: () => undefined },
        { divider: true },
        {
          name: "autoFitColumns",
          label: "自动列宽",
          onAction: () => undefined,
        },
        {
          name: "tableSettings",
          label: "表格设置",
          onAction: () => undefined,
        },
      ],
    );
    expect(vnode.props?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "导入" }),
        expect.objectContaining({ separator: true }),
        expect.objectContaining({ text: "自动列宽" }),
        expect.objectContaining({ text: "表格设置" }),
      ]),
    );
    expect(JSON.stringify(vnode.props?.items)).not.toMatch(/more-\d+/);
    expect(vnode.props?.items?.find((item: any) => item.separator)?.text).toBeUndefined();
  });

  it("renders FabComponent for floatingActionButton", () => {
    const builder = new SyncfusionUiBuilder();
    const vnode = builder.factory.floatingActionButton({
      icon: "e-icons e-plus",
      label: "新建",
      target: "#main",
    });
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/Fab/i);
    expect(vnode.props?.position).toBe("BottomRight");
    expect(vnode.props?.iconCss).toBe("e-icons e-plus");
    expect(vnode.props?.content).toBe("新建");
    expect(vnode.props?.target).toBe("#main");
    expect(String(vnode.props?.cssClass ?? "")).toContain("e-primary");
    expect(String(vnode.props?.cssClass ?? "")).toContain("mmda-fab--bottomRight");
  });

  it("uses DropupMenuButton when popupPlacement opens upward", () => {
    const builder = new SyncfusionUiBuilder();
    const vnode = builder.factory.dropDownButton(
      {
        icon: "fas fa-palette",
        popupPlacement: "top-end",
        hideCaret: true,
        shape: "circle",
        buttonType: "text",
      },
      [
        {
          name: "blue",
          label: "蓝色",
          icon: "mmda-palette-swatch",
          onAction: () => undefined,
        },
      ],
    );
    expect(
      vnode.type?.name ?? vnode.type?.__name ?? String(vnode.type),
    ).toMatch(/DropupMenuButton|SfDropupMenuButton/i);
    expect(vnode.props?.placement).toBe("top-end");
    expect(vnode.props?.items).toHaveLength(1);
    expect(vnode.props?.items?.[0]?.label).toBe("蓝色");
  });

  it("runs the selected SplitButton action by its normalized id", () => {
    const builder = new SyncfusionUiBuilder();
    const reload = vi.fn();
    const vnode = builder.factory.splitButton({
      label: "恢复默认",
      buttonType: "outlined",
      actions: [
        {
          name: "reloadFromDatabase",
          label: "从数据库恢复",
          command: reload,
        },
      ],
    });
    expect(vnode.props?.content).toBe("恢复默认");
    expect(vnode.props?.cssClass).toContain("mmda-sf-split--outline");
    expect(vnode.props?.cssClass).not.toContain("e-outline");
    vnode.props?.select({ item: { id: "reloadFromDatabase" } });
    expect(reload).toHaveBeenCalledOnce();
  });

  it("maps flat secondary SplitButton to wrapper surface classes", () => {
    const builder = new SyncfusionUiBuilder();
    const vnode = builder.factory.splitButton({
      label: "恢复默认",
      buttonType: "text",
      colorRole: "secondary",
      actions: [],
    });
    const cssClass = String(vnode.props?.cssClass ?? "");
    expect(cssClass).toContain("mmda-sf-split--flat");
    expect(cssClass).toContain("mmda-sf-split--secondary");
    expect(cssClass).not.toContain("e-flat");
    expect(cssClass).not.toContain("e-secondary");
  });

  it("defaults to e-card, uses fieldset when container is fieldset", () => {
    const builder = new SyncfusionUiBuilder();
    const group = new MetaUiGroup({
      groupName: "base",
      groupLabel: "基本信息",
      many: false,
      fields: [],
    });
    const card = builder.wrapGroup(group, h("div", "body"));
    expect(card.type?.name ?? card.type?.__name).toBe("MmdaGroupCard");
    expect(String(card.props?.class)).toContain("e-card");
    expect(String(card.props?.class)).toContain("primary");
    expect(String(card.props?.class)).toContain("master");
    const fieldset = builder.wrapGroup(group, h("div", "body"), {
      container: "fieldset",
    });
    expect(fieldset.type).toBe("fieldset");
    expect(String(fieldset.props?.class)).toContain("primary");
    expect(String(fieldset.props?.class)).toContain("master");
  });

  it("uses EJ2 Sidebar dock menu when top-level module codes have no dot", () => {
    const modules = new ModuleFactory([
      {
        moduleCode: "B",
        moduleLabel: "基础数据",
        moduleType: "SYSTEM",
        moduleVersion: ModuleVersion.TEAM,
        allowOps: ModuleOp.READ,
        moduleUrl: "/BASE",
        requiredCreateParam: false,
        status: ModuleStatus.RELEASED,
        divider: false,
        subModules: [
          {
            moduleCode: "B.01",
            moduleLabel: "组织架构",
            moduleType: "MODULE",
            moduleVersion: ModuleVersion.TEAM,
            allowOps: ModuleOp.READ,
            moduleUrl: "/BASE/org",
            requiredCreateParam: false,
            status: ModuleStatus.RELEASED,
            divider: false,
            subModules: [
              {
                moduleCode: "B.01.001",
                moduleLabel: "部门",
                moduleType: "FEATURE",
                moduleVersion: ModuleVersion.TEAM,
                allowOps: ModuleOp.READ,
                moduleUrl: "/BASE/Departments",
                requiredCreateParam: false,
                status: ModuleStatus.RELEASED,
                divider: false,
              },
            ],
          },
        ],
      },
    ]).modules;
    const builder = new SyncfusionUiBuilder();

    const automatic = builder.buildAppMenu(modules);
    expect(automatic.type).toMatchObject({
      name: "SfAppSideMenu",
    });
    expect(builder.buildAppSideMenu({ modules }).type).toMatchObject({
      name: "SfAppSideMenu",
    });
    const systemsBar = builder.buildAppSideBar({
      modules,
      header: () => null,
    });
    expect(systemsBar.type).toMatchObject({
      name: "SfAppSideMenu",
    });
    expect(systemsBar.props?.logo).toBeTypeOf("function");

    const scaffold = builder.buildAppScaffold({
      layout: "sidebarLeft",
      sideBar: () => null,
      body: () => null,
    });
    expect(scaffold.props?.class).toBe("mmda-sf-shell");
    expect(scaffold.props?.id).toBe("mmda-sf-shell");

    expect(
      builder.buildAppSideBar({
        modules: modules[0]?.subModules ?? [],
        header: () => null,
      }).type,
    ).toMatchObject({ name: "SfAppSideMenu" });
  });

  it("uses a real href for MES feature links while running as BASE", () => {
    expect(isLocalAppModuleUrl("base", "/MES/Stations")).toBe(false);
    expect(isLocalAppModuleUrl("base", "/BASE/Departments")).toBe(true);
  });

  it("binds table dataSource as a plain array copy", () => {
    const factory = createSyncfusionUiFactory();
    const selectedItems: any[] = [];
    const metaUi = {
      getListedFields: () => [{ fieldName: "name", displayLabel: "名称" }],
      groups: [],
      primaryKey: "id",
    } as any;
    const rows = [{ id: "1", name: "a" }];
    const vnode = gridOf(
      factory.table(rows, metaUi, {
        selectedItems,
        selectionMode: "multiple",
      }),
    );
    expect(vnode.props?.dataSource).toEqual(rows);
    expect(vnode.props?.dataSource).not.toBe(rows);
    expect(vnode.key).toContain("mmda-sf-grid-");
  });

  it("wires Grid detailTemplate when rowDetail is set", () => {
    const factory = createSyncfusionUiFactory();
    const metaUi = {
      getListedFields: () => [{ fieldName: "name", displayLabel: "名称" }],
      groups: [],
      primaryKey: "id",
    } as any;
    const vnode = gridOf(
      factory.table([{ id: "1", name: "a" }], metaUi, {
        rowDetail: { detail: () => h("div") },
      }),
    );
    expect(vnode.props?.detailTemplate).toBeTruthy();
    expect(vnode.props?.enableVirtualization).toBe(false);
  });

  it("enables Grid column grouping by default and can disable it", () => {
    const factory = createSyncfusionUiFactory();
    const metaUi = {
      objName: "Material",
      getListedFields: () => [
        { fieldName: "categoryName", displayLabel: "物料类别" },
        { fieldName: "materialCode", displayLabel: "物料编码" },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const enabledHost = factory.table([], metaUi, {
      pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
    });
    const enabled = gridOf(enabledHost);
    expect(enabled.props?.allowGrouping).toBe(false);
    expect(enabled.props?.enableVirtualization).toBe(true);
    expect(enabled.props?.allowPaging).toBe(false);
    expect(enabled.props?.groupSettings).toBeUndefined();

    const local = gridOf(factory.table([], metaUi, {}));
    expect(local.props?.allowGrouping).toBe(true);

    const disabled = gridOf(factory.table([], metaUi, { groupable: false }));
    expect(disabled.props?.allowGrouping).toBe(false);
    expect(disabled.props?.groupSettings).toBeUndefined();
  });

  it("uses row virtualization and an external Pager for list pages", () => {
    const factory = createSyncfusionUiFactory();
    const onPage = vi.fn();
    const metaUi = {
      objName: "Product",
      getListedFields: () => [
        {
          fieldName: "name",
          displayLabel: "名称",
          dataType: 48,
          nullable: false,
          sortable: true,
          listSize: 180,
          align: "CENTER",
          renderer: "textSpan",
        },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const rows = [{ id: "1", rowNum: "21", name: "alpha" }];
    const host = factory.table(rows, metaUi, {
      pagination: { pageNo: 3, pageSize: 10, recordCount: 45 },
      onPage,
      selectionMode: "multiple",
      filterDisplay: "menu",
      renderCell: (_field: any, row: any) =>
        h("a", { href: `#${row.id}` }, row.name),
    });

    expect(host.props?.class).toBe("mmda-sf-pagable-table");
    const vnode = gridOf(host);
    expect(vnode.props?.allowPaging).toBe(false);
    expect(vnode.props?.enableVirtualization).toBe(true);
    expect(vnode.props?.enableVirtualMaskRow).toBe(false);
    expect(vnode.props?.height).toBe("100%");
    expect(vnode.props?.allowResizing).toBe(true);
    expect(vnode.props?.allowFiltering).toBe(true);
    expect(vnode.props?.filterSettings).toEqual({ type: "Menu" });
    expect(vnode.props?.dataSource).toEqual({ result: rows, count: 1 });
    expect(vnode.props?.pageSettings).toMatchObject({
      pageSize: 50,
    });

    const pager = pagerOf(host);
    expect(pager?.props).toMatchObject({
      currentPage: 3,
      pageSize: 10,
      totalRecordsCount: 45,
    });
    pager.props.click({
      isInteracted: true,
      currentPage: 4,
      pageSize: 10,
    });
    expect(onPage).toHaveBeenCalledWith({ pageNo: 4, pageSize: 10 });

    const columns = vnode.props.columns;
    expect(columns[0]).toMatchObject({
      type: "checkbox",
      width: 48,
      minWidth: 48,
      maxWidth: 48,
      textAlign: "Center",
      freeze: "Left",
    });
    expect(columns.map((column: any) => column.field)).toEqual([
      undefined,
      "rowNum",
      "id",
      "name",
    ]);
    expect(columns[2]).toMatchObject({
      field: "id",
      isPrimaryKey: true,
      visible: false,
    });
    expect(columns[1]).toMatchObject({
      allowSorting: false,
      textAlign: "Left",
      headerTextAlign: "Left",
      field: "rowNum",
      customAttributes: { class: "mmda-sf-rownum-col" },
      freeze: "Left",
    });
    expect(columns[1].template).toBeUndefined();
    expect(columns[1].valueAccessor).toBeUndefined();
    expect(columns[3]).toMatchObject({
      width: 180,
      textAlign: "Center",
      headerTextAlign: "Center",
      allowSorting: true,
      allowFiltering: true,
      template: "mmdaCell_name",
    });
    const slots = vnode.children as any;
    const cell = slots.mmdaCell_name({ data: rows[0] });
    expect(cell.props.style.textAlign).toBe("center");
    const link = Array.isArray(cell.children)
      ? cell.children[0]
      : cell.children;
    expect(link.type).toBe("a");
    expect(link.props.href).toBe("#1");
    expect(link.children).toBe("alpha");
    expect(slots.mmdaCell_rowNum).toBeUndefined();
  });

  it("merges virtualized selection into selectedItems and keeps it across window change", async () => {
    const factory = createSyncfusionUiFactory();
    const metaUi = {
      objName: "Product",
      getListedFields: () => [
        { fieldName: "name", displayLabel: "名称", dataType: 48 },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const rows = Array.from({ length: 100 }, (_, index) => ({
      id: String(index + 1),
      rowNum: String(index + 1),
      name: `row-${index + 1}`,
    }));
    const selectedItems: any[] = [];
    const onSelect = vi.fn();
    const vnode = gridOf(
      factory.table(rows, metaUi, {
        pagination: { pageNo: 1, pageSize: 1000, recordCount: 100 },
        selectionMode: "multiple",
        selectedItems,
        onSelect,
      }),
    );
    expect(vnode.props.columns.some((c: any) => c.field === "id" && c.isPrimaryKey)).toBe(
      true,
    );

    const selectedRow = rows[0];
    vnode.props.rowSelected({ data: selectedRow, isInteracted: true });
    expect(selectedItems).toEqual([selectedRow]);
    expect(onSelect).toHaveBeenCalledWith([selectedRow]);

    const grid = {
      dataSource: null as any,
      hideSpinner: vi.fn(),
      getCurrentViewRecords: vi.fn(() => rows.slice(50, 100)),
      selectRows: vi.fn(),
    };
    vnode.props.ref({ ej2Instances: grid });
    vnode.props.dataStateChange({
      action: { requestType: "virtualscroll" },
      skip: 50,
      take: 50,
    });
    await nextTick();
    await nextTick();
    // 换窗不得清空 selectedItems
    expect(selectedItems).toEqual([selectedRow]);
    // 卸行 deselect（非用户）忽略
    vnode.props.rowDeselected({
      data: selectedRow,
      isInteracted: false,
    });
    expect(selectedItems).toEqual([selectedRow]);
    vnode.props.rowDeselected({
      data: selectedRow,
    });
    expect(selectedItems).toEqual([selectedRow]);

    expect(vnode.props.enableVirtualMaskRow).toBe(false);

    const other = rows[60];
    vnode.props.rowSelected({ data: other, isInteracted: true });
    expect(selectedItems.map((r) => r.id)).toEqual(["1", "61"]);
    vnode.props.rowDeselected({ data: other, isInteracted: true });
    expect(selectedItems.map((r) => r.id)).toEqual(["1"]);
  });

  it("marks listed MetaUiField.primaryKey as isPrimaryKey without hidden id", () => {
    const factory = createSyncfusionUiFactory();
    const metaUi = {
      objName: "Product",
      getListedFields: () => [
        {
          fieldName: "productId",
          displayLabel: "编号",
          dataType: 48,
          primaryKey: true,
        },
        { fieldName: "name", displayLabel: "名称", dataType: 48 },
      ],
      groups: [],
      primaryKey: "productId",
    } as any;
    const vnode = gridOf(factory.table([], metaUi, {}));
    const columns = vnode.props.columns;
    expect(columns.find((c: any) => c.field === "id")).toBeUndefined();
    expect(columns.find((c: any) => c.field === "productId")).toMatchObject({
      isPrimaryKey: true,
    });
  });

  it("custom-binds only a virtual window, not the full server page", async () => {
    const factory = createSyncfusionUiFactory();
    const metaUi = {
      objName: "Product",
      getListedFields: () => [
        { fieldName: "name", displayLabel: "名称", dataType: 48 },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const rows = Array.from({ length: 200 }, (_, index) => ({
      id: String(index + 1),
      rowNum: String(index + 1),
      name: `row-${index + 1}`,
    }));
    const vnode = gridOf(
      factory.table(rows, metaUi, {
        pagination: { pageNo: 1, pageSize: 1000, recordCount: 3392 },
      }),
    );
    expect(vnode.props?.enableVirtualization).toBe(true);
    expect(vnode.props?.dataSource.count).toBe(200);
    expect(vnode.props?.dataSource.result).toHaveLength(50);
    expect(vnode.props?.dataSource.result[0].name).toBe("row-1");
    expect(vnode.props?.dataSource.result.at(-1).name).toBe("row-50");

    const grid = {
      dataSource: null as any,
      hideSpinner: vi.fn(),
    };
    vnode.props.ref({ ej2Instances: grid });
    vnode.props.dataStateChange({
      action: { requestType: "virtualscroll" },
      skip: 50,
      take: 50,
    });
    await nextTick();
    await nextTick();
    expect(grid.dataSource.count).toBe(200);
    expect(grid.dataSource.result).toHaveLength(50);
    expect(grid.dataSource.result[0].name).toBe("row-51");
    expect(grid.hideSpinner).toHaveBeenCalled();
  });

  it("uses valueAccessor for non-template columns including reference fields", () => {
    const factory = createSyncfusionUiFactory();
    const statusField = {
      fieldName: "status",
      displayLabel: "状态",
      dataType: 48,
      renderer: "textSpan",
      reference: {
        isEnum: true,
        isRef: false,
        hasOne: false,
        valueOf: (option: any) => option.code,
        labelOf: (option: any) => option.label,
      },
    };
    const metaUi = {
      objName: "Product",
      getListedFields: () => [
        {
          fieldName: "name",
          displayLabel: "名称",
          dataType: 48,
          renderer: "textSpan",
        },
        statusField,
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const rows = [
      {
        id: "1",
        name: "alpha",
        status: "OPEN",
        customProperties: { $status: "打开" },
      },
    ];
    const vnode = gridOf(
      factory.table(rows, metaUi, {
        pagination: { pageNo: 1, pageSize: 1000, recordCount: 1000 },
        templateCellFields: ["name"],
        renderCell: (_field: any, row: any) =>
          h("a", { href: `#${row.id}` }, row.name),
      }),
    );
    const columns = vnode.props.columns;
    const nameCol = columns.find((column: any) => column.field === "name");
    const statusCol = columns.find((column: any) => column.field === "status");
    expect(nameCol.template).toBe("mmdaCell_name");
    expect(nameCol.clipMode).toBe("EllipsisWithTooltip");
    expect(nameCol.valueAccessor).toBeUndefined();
    expect(statusCol.template).toBeUndefined();
    expect(statusCol.clipMode).toBe("Ellipsis");
    expect(typeof statusCol.valueAccessor).toBe("function");
    expect(statusCol.valueAccessor("status", rows[0])).toBe(
      MetaModel.displayField(rows[0], statusField),
    );
    expect(statusCol.valueAccessor("status", rows[0])).toBe("打开");
    const slots = vnode.children as any;
    expect(slots.mmdaCell_name).toBeTypeOf("function");
    expect(slots.mmdaCell_status).toBeUndefined();
  });

  it("renders three flat row actions by default without a dropdown", () => {
    const factory = createSyncfusionUiFactory();
    const metaUi = {
      objName: "Product",
      getListedFields: () => [
        {
          fieldName: "name",
          displayLabel: "名称",
          dataType: 48,
          nullable: false,
        },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const details = vi.fn();
    const edit = vi.fn();
    const remove = vi.fn();
    const custom = vi.fn();
    const row = {
      id: "1",
      rowNum: "4",
      name: "alpha",
      editable: true,
      deletable: false,
    };
    const vnode = gridOf(
      factory.table([row], metaUi, {
        rowActions: (item: any) => [
          ...(item.editable !== false
            ? [{ name: "edit", label: "编辑", onAction: edit }]
            : []),
          ...(item.deletable !== false
            ? [{ name: "delete", label: "删除", onAction: remove }]
            : []),
          { name: "details", label: "详情", onAction: details },
          { divider: true },
          { name: "custom", label: "派工", onAction: custom },
        ],
      }),
    );
    const columns = vnode.props.columns;
    expect(columns.at(-1)).toMatchObject({
      field: "__mmdaActions",
      headerText: "操作",
      allowSorting: false,
      allowFiltering: false,
      allowGrouping: false,
      freeze: "Right",
      template: "mmdaCell_actions",
      width: 108,
    });
    const slots = vnode.children as any;
    const cell = slots.mmdaCell_actions({ data: row });
    expect(cell.props.class).toBe("mmda-sf-row-actions");
    const [editButton, deletePlaceholder, detailsButton] = cell.children;
    expect(editButton.props.title).toBe("编辑");
    expect(deletePlaceholder.props.class).toBe(
      "mmda-sf-row-action-placeholder",
    );
    expect(detailsButton.props.title).toBe("详情");
    expect(detailsButton.props.items).toBeUndefined();
    editButton.props.onClick();
    expect(edit).toHaveBeenCalledTimes(1);
    expect(remove).not.toHaveBeenCalled();
    detailsButton.props.onClick();
    expect(details).toHaveBeenCalledTimes(1);
    expect(custom).not.toHaveBeenCalled();
  });

  it("renders details SplitButton dropdown only when showActions is true", () => {
    const factory = createSyncfusionUiFactory();
    const metaUi = {
      objName: "Product",
      getListedFields: () => [
        {
          fieldName: "name",
          displayLabel: "名称",
          dataType: 48,
          nullable: false,
        },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const details = vi.fn();
    const edit = vi.fn();
    const remove = vi.fn();
    const custom = vi.fn();
    const row = {
      id: "1",
      rowNum: "4",
      name: "alpha",
      editable: true,
      deletable: false,
    };
    const vnode = gridOf(
      factory.table([row], metaUi, {
        showActions: true,
        rowActions: (item: any) => [
          ...(item.editable !== false
            ? [{ name: "edit", label: "编辑", onAction: edit }]
            : []),
          ...(item.deletable !== false
            ? [{ name: "delete", label: "删除", onAction: remove }]
            : []),
          { name: "details", label: "详情", onAction: details },
          { divider: true },
          { name: "custom", label: "派工", onAction: custom },
        ],
      }),
    );
    expect(vnode.props.columns.at(-1).width).toBe(124);
    const slots = vnode.children as any;
    const cell = slots.mmdaCell_actions({ data: row });
    const [, , detailsSplit] = cell.children;
    expect(detailsSplit.props.title).toBe("详情");
    expect(detailsSplit.props.items.map((item: any) => item.text)).toEqual([
      "派工",
    ]);
    detailsSplit.props.click();
    expect(details).toHaveBeenCalledTimes(1);
    detailsSplit.props.select({ item: { id: "custom" } });
    expect(custom).toHaveBeenCalledTimes(1);
  });

  it("defaults numeric columns to right and enum columns to left", () => {
    const factory = createSyncfusionUiFactory();
    const metaUi = {
      objName: "Product",
      getListedFields: () => [
        {
          fieldName: "qty",
          displayLabel: "数量",
          dataType: 68,
          nullable: true,
        },
        {
          fieldName: "status",
          displayLabel: "状态",
          dataType: 68,
          nullable: true,
          reference: { isEnum: true },
        },
        {
          fieldName: "name",
          displayLabel: "名称",
          dataType: 48,
          nullable: true,
          align: "RIGHT",
        },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const vnode = gridOf(
      factory.table([{ id: "1", qty: 12, status: 1, name: "a" }], metaUi, {}),
    );
    const columns = vnode.props.columns.filter(
      (column: any) => column?.field && column.field !== "rowNum",
    );
    expect(columns[0].textAlign).toBe("Right");
    expect(columns[1].textAlign).toBe("Left");
    expect(columns[2].textAlign).toBe("Right");
    const slots = vnode.children as any;
    expect(
      slots.mmdaCell_qty({ data: { qty: 12 } }).props.style.textAlign,
    ).toBe("right");
    expect(
      slots.mmdaCell_status({ data: { status: 1 } }).props.style.textAlign,
    ).toBe("left");
  });

  it("uses EJ2 batch cell editing and keeps popup editing on readonly cells", async () => {
    const factory = createSyncfusionUiFactory();
    const onCellSave = vi.fn(() => true);
    const onItemDoubleClick = vi.fn();
    const editCell = vi.fn();
    const row = { id: "1", name: "旧名称", code: "P-1", editable: true };
    const metaUi = {
      objName: "Product",
      getListedFields: () => [
        { fieldName: "name", displayLabel: "名称", dataType: 48 },
        { fieldName: "code", displayLabel: "编码", dataType: 48 },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const vnode = gridOf(
      factory.table([row], metaUi, {
        editable: true,
        inplaceEditStart: "click",
        fieldCellEditors: {
          code: { canEdit: false },
          name: {
            canEdit: (_field, item: { editable?: boolean }) =>
              item.editable !== false,
            onSave: onCellSave,
          },
        },
        onItemDoubleClick,
      }),
    );

    expect(vnode.props.editSettings).toMatchObject({
      allowEditing: true,
      mode: "Batch",
      showConfirmDialog: false,
    });
    expect(
      vnode.props.columns.find((column: any) => column.field === "name"),
    ).toMatchObject({ allowEditing: true, editType: "defaultedit" });
    expect(
      vnode.props.columns.find((column: any) => column.field === "code"),
    ).toMatchObject({ allowEditing: false });

    vnode.props.cellSave({
      rowData: row,
      column: { field: "name" },
      value: "新名称",
      previousValue: "旧名称",
    });
    // 无行号时无法定位 features[i]，不回写（避免写到 Batch 副本）
    expect(onCellSave).not.toHaveBeenCalled();

    vnode.props.cellEdit({
      rowData: row,
      rowIndex: 0,
      column: { field: "name" },
    });
    vnode.props.cellSave({
      rowData: { ...row, name: "旧名称" },
      column: { field: "name" },
      value: "新名称",
      previousValue: "旧名称",
    });
    expect(onCellSave).toHaveBeenCalledWith(
      expect.objectContaining({ fieldName: "name" }),
      row,
      "新名称",
      "旧名称",
    );
    expect(onCellSave.mock.calls[0][1]).toBe(row);

    vnode.props.recordDoubleClick({ rowData: row, column: { field: "name" } });
    expect(onItemDoubleClick).not.toHaveBeenCalled();
    vnode.props.recordDoubleClick({ rowData: row, column: { field: "code" } });
    expect(onItemDoubleClick).toHaveBeenCalledWith(row);

    const table = document.createElement("table");
    const tr = document.createElement("tr");
    tr.setAttribute("data-rowindex", "0");
    const td = document.createElement("td");
    td.className = "e-rowcell";
    td.setAttribute("data-colindex", "1");
    tr.appendChild(td);
    table.appendChild(tr);
    vnode.props.ref({
      ej2Instances: {
        editModule: { editCell },
        getContentTable: () => table,
        getColumns: () => [
          { field: "rowNum" },
          { field: "name" },
          { field: "code" },
        ],
        element: document.createElement("div"),
      },
    });
    vnode.props.created();
    await Promise.resolve();
    await Promise.resolve();
    td.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(editCell).toHaveBeenCalledWith(0, "name");
    vnode.props.destroyed();
  });

  it("excel inplaceEditStart types over the focused cell", async () => {
    const factory = createSyncfusionUiFactory();
    const editCell = vi.fn();
    const host = document.createElement("div");
    const metaUi = {
      objName: "Product",
      getListedFields: () => [
        { fieldName: "name", displayLabel: "名称", dataType: 48 },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const vnode = gridOf(
      factory.table([{ id: "1", name: "旧" }], metaUi, {
        editable: true,
        inplaceEditStart: "excel",
      }),
    );
    expect(vnode.props.selectionSettings).toMatchObject({
      mode: "Cell",
      type: "Single",
    });
    const table = document.createElement("table");
    vnode.props.ref({
      ej2Instances: {
        isEdit: false,
        editModule: { editCell },
        getContentTable: () => table,
        getColumns: () => [{ field: "name" }],
        element: host,
      },
    });
    vnode.props.created();
    await Promise.resolve();
    await Promise.resolve();
    vnode.props.cellSelected({ rowIndex: 0, columnName: "name" });
    host.dispatchEvent(
      new KeyboardEvent("keydown", { key: "A", bubbles: true }),
    );
    expect(editCell).toHaveBeenCalledWith(0, "name");
    vnode.props.destroyed();
  });

  it("uses CheckBox choices for enum columns and Menu for other fields", async () => {
    const factory = createSyncfusionUiFactory();
    const onFilterModelChange = vi.fn();
    const categoryOptions = [
      { value: "RAW", label: "原材料" },
      { value: "PART", label: "零件" },
    ];
    const metaUi = {
      objName: "Material",
      getListedFields: () => [
        {
          fieldName: "category",
          displayLabel: "物料类别",
          dataType: 48,
          reference: {
            isEnum: true,
            isRef: false,
            hasOne: false,
            refOptions: categoryOptions,
            valueOf: (option: any) => option.value,
            labelOf: (option: any) => option.label,
          },
        },
        {
          fieldName: "name",
          displayLabel: "物料名称",
          dataType: 48,
        },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const rows = [{ id: "1", category: "RAW", name: "a" }];
    const vnode = gridOf(
      factory.table(rows, metaUi, {
        filterDisplay: "menu",
        pagination: { pageNo: 1, pageSize: 20, recordCount: 1 },
        onFilterModelChange,
      }),
    );
    expect(vnode.props?.filterSettings).toEqual({ type: "Menu" });
    const columns = vnode.props.columns.filter(
      (column: any) => column?.field && column.field !== "rowNum",
    );
    expect(columns[0].filter.type).toBe("Menu");
    expect(columns[0].filter.ui).toBeTruthy();
    expect(columns[0].foreignKeyField).toBeUndefined();
    expect(columns[0].dataSource).toBeUndefined();
    expect(columns[1].filter.type).toBe("Menu");
    expect(columns[1].filter.ui).toBeTruthy();

    const listeners: Record<string, (args: any) => void> = {};
    vnode.props.ref?.({
      ej2Instances: {
        on: (name: string, handler: (args: any) => void) => {
          listeners[name] = handler;
        },
        off: vi.fn(),
      },
    });
    vnode.props.created();
    const labelArgs = {
      value: "RAW",
      column: { field: "category" },
      data: { category: "RAW" },
    };
    listeners["filter-cbox-value"](labelArgs);
    expect(labelArgs.value).toBe("原材料");
    const rendererArgs = {
      field: "category",
      executeQuery: true,
      dataSource: [],
    };
    listeners["beforeCheckboxRenderer"](rendererArgs);
    expect(rendererArgs.executeQuery).toBe(false);
    expect(rendererArgs.dataSource).toEqual([
      { category: "RAW", text: "原材料", __mmdaChoice: true },
      { category: "PART", text: "零件", __mmdaChoice: true },
    ]);

    const { CheckBoxFilterBase } = await import("@syncfusion/ej2-grids");
    const checkbox = CheckBoxFilterBase.prototype.createCheckbox.call(
      {
        options: { disableHtmlEncode: true },
        cBoxTrue: (() => {
          const wrap = document.createElement("div");
          wrap.innerHTML =
            '<input type="checkbox"/><span class="e-label"></span>';
          return wrap;
        })(),
        cBoxFalse: (() => {
          const wrap = document.createElement("div");
          wrap.innerHTML =
            '<input type="checkbox"/><span class="e-label"></span>';
          return wrap;
        })(),
        parent: { enableHtmlSanitizer: false, getModuleName: () => "grid" },
        getLocalizedLabel: () => "",
      },
      "RAW",
      false,
      { category: "RAW", text: "原材料" },
    );
    expect(checkbox.querySelector(".e-label")?.textContent).toBe("原材料");
    const distinct = CheckBoxFilterBase.getDistinct(
      [
        { category: "PART", text: "零件", __mmdaChoice: true },
        { category: "CONSUMABLE", text: "办公用品", __mmdaChoice: true },
        { category: "LABOR", text: "劳动力", __mmdaChoice: true },
      ],
      "category",
    );
    expect(distinct.records.map((item: any) => item.category)).toEqual([
      "PART",
      "CONSUMABLE",
      "LABOR",
    ]);

    vnode.props.dataStateChange({
      action: { requestType: "filtering" },
      where: [
        {
          field: "category",
          operator: "equal",
          value: ["RAW", "PART"],
        },
      ],
    });
    expect(onFilterModelChange).toHaveBeenCalledWith({
      category: { filterType: "set", operator: "IN", values: ["RAW", "PART"] },
    });
  });

  it("uses pipe enum value;code;label via valueOf/labelOf", async () => {
    const factory = createSyncfusionUiFactory();
    const reference = {
      isEnum: true,
      refFlds: ["code", "label"],
      refOptions: [
        { value: 0, code: "LABOR", label: "劳动力" },
        { value: 64, code: "CONSUMABLE", label: "办公用品" },
        { value: 128, code: "OTHER", label: "其他" },
      ],
      valueOf: (option: any) => option.code,
      labelOf: (option: any) => option.label,
    };
    const metaUi = {
      objName: "Material",
      getListedFields: () => [
        {
          fieldName: "materialType",
          displayLabel: "物料用途",
          dataType: 48,
          reference,
        },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const vnode = gridOf(
      factory.table([], metaUi, {
        filterDisplay: "menu",
        pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
      }),
    );
    const column = vnode.props.columns.find(
      (item: any) => item?.field === "materialType",
    );
    expect(column.filter.type).toBe("Menu");
    expect(column.filter.dataSource).toEqual([
      { materialType: "LABOR", text: "劳动力", __mmdaChoice: true },
      { materialType: "CONSUMABLE", text: "办公用品", __mmdaChoice: true },
      { materialType: "OTHER", text: "其他", __mmdaChoice: true },
    ]);
  });

  it("binds ref/hasOne filter dataSource from refOptions with refFlds", async () => {
    const factory = createSyncfusionUiFactory();
    const partners = [
      { id: "p1", partnerName: "甲公司" },
      { id: "p2", partnerName: "乙公司" },
    ];
    const metaUi = {
      objName: "Order",
      getListedFields: () => [
        {
          fieldName: "partnerID",
          displayLabel: "客户",
          dataType: 48,
          reference: {
            isEnum: false,
            isRef: true,
            hasOne: false,
            refFlds: ["id", "partnerName"],
            refOptions: partners,
            valueOf: (option: any) => option.id,
            labelOf: (option: any) => option.partnerName,
          },
        },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const vnode = gridOf(
      factory.table([], metaUi, {
        filterDisplay: "menu",
        pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
      }),
    );
    const column = vnode.props.columns.find(
      (item: any) => item?.field === "partnerID",
    );
    expect(column.filter.dataSource).toEqual([
      { partnerID: "p1", text: "甲公司", __mmdaChoice: true },
      { partnerID: "p2", text: "乙公司", __mmdaChoice: true },
    ]);
    expect(column.foreignKeyField).toBeUndefined();
    expect(column.dataSource).toBeUndefined();
  });

  it("uses reference valueOf/labelOf for multi-field labels", () => {
    const factory = createSyncfusionUiFactory();
    const metaUi = {
      objName: "Material",
      getListedFields: () => [
        {
          fieldName: "categoryID",
          displayLabel: "类别",
          dataType: 48,
          reference: {
            isEnum: false,
            isRef: true,
            hasOne: false,
            refFlds: ["id", "categoryCode", "categoryName"],
            refOptions: [
              { id: "c1", categoryCode: "RAW", categoryName: "原材料" },
            ],
            valueOf: (option: any) => option.id,
            labelOf: (option: any) =>
              [option.categoryCode, option.categoryName]
                .filter(Boolean)
                .join(" "),
          },
        },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const vnode = gridOf(
      factory.table([], metaUi, {
        filterDisplay: "menu",
        pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
      }),
    );
    const column = vnode.props.columns.find(
      (item: any) => item?.field === "categoryID",
    );
    expect(column.filter.dataSource).toEqual([
      { categoryID: "c1", text: "RAW 原材料", __mmdaChoice: true },
    ]);
  });

  it("extends number/date Menu filters and keeps bool/text on default Menu", () => {
    const factory = createSyncfusionUiFactory();
    const onFilterModelChange = vi.fn();
    const metaUi = {
      objName: "Order",
      getListedFields: () => [
        { fieldName: "amount", displayLabel: "金额", dataType: 68 },
        { fieldName: "orderedAt", displayLabel: "日期", dataType: 184 },
        { fieldName: "active", displayLabel: "启用", dataType: 113 },
        { fieldName: "name", displayLabel: "名称", dataType: 48 },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const vnode = gridOf(
      factory.table([], metaUi, {
        filterDisplay: "menu",
        pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
        onFilterModelChange,
      }),
    );
    const columns = vnode.props.columns.filter(
      (column: any) => column?.field && column.field !== "rowNum",
    );

    expect(columns[0].filter).toMatchObject({
      type: "Menu",
      ui: {
        create: expect.any(Function),
        write: expect.any(Function),
        read: expect.any(Function),
        destroy: expect.any(Function),
      },
    });
    expect(columns[1].filter).toMatchObject({
      type: "Menu",
      ui: {
        create: expect.any(Function),
        write: expect.any(Function),
        read: expect.any(Function),
        destroy: expect.any(Function),
      },
    });
    expect(columns[1].type).toBe("datetime");
    expect(columns[1].format).toEqual({
      type: "dateTime",
      format: "yyyy-MM-dd HH:mm:ss",
    });
    expect(columns[2].filter).toEqual({ type: "Menu" });
    expect(columns[3].filter.type).toBe("Menu");
    expect(columns[3].filter.ui).toBeTruthy();

    const start = new Date("2026-08-01");
    vnode.props.dataStateChange({
      action: { requestType: "filtering" },
      where: [
        {
          predicates: [
            {
              field: "amount",
              operator: "greaterthanorequal",
              value: 10,
            },
            {
              field: "orderedAt",
              operator: "equal",
              value: start,
            },
            {
              field: "active",
              operator: "equal",
              value: true,
            },
          ],
        },
      ],
    });
    expect(onFilterModelChange).toHaveBeenCalledWith({
      amount: {
        filterType: "number",
        operator: "GE",
        value: 10,
      },
      orderedAt: {
        filterType: "date",
        operator: "EQ",
        value: start,
      },
      active: {
        filterType: "boolean",
        value: true,
      },
    });
  });

  it("shows a second native input for BETWEEN and emits range predicates", () => {
    const factory = createSyncfusionUiFactory();
    const onFilterModelChange = vi.fn();
    const metaUi = {
      objName: "Order",
      getListedFields: () => [
        { fieldName: "amount", displayLabel: "金额", dataType: 68 },
        { fieldName: "orderedAt", displayLabel: "日期", dataType: 184 },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const vnode = gridOf(
      factory.table([], metaUi, {
        filterDisplay: "menu",
        pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
        onFilterModelChange,
      }),
    );
    const amountColumn = vnode.props.columns.find(
      (column: any) => column?.field === "amount",
    );
    amountColumn.uid = "amount-column";

    const numberOperators = [{ value: "equal", text: "等于" }];
    vnode.props.actionBegin({
      requestType: "filterBeforeOpen",
      filterModel: {
        options: { field: "amount" },
        customFilterOperators: { numberOperator: numberOperators },
      },
    });
    expect(numberOperators).toEqual([
      { value: "equal", text: "等于" },
      { value: "between", text: "在…之间" },
    ]);

    const operatorDropDown: any = {
      value: "equal",
    };
    Object.defineProperty(operatorDropDown, "change", {
      configurable: true,
      get: () => undefined,
      set() {
        throw new TypeError("Cannot convert undefined or null to object");
      },
    });
    const target = document.createElement("div");
    target.className = "e-flmenu";
    document.body.appendChild(target);
    amountColumn.filter.ui.create({
      target,
      column: amountColumn,
      getOptrInstance: { dropOptr: operatorDropDown },
    });

    const secondWrap = target.querySelector(
      ".mmda-sf-filter-range__value--to",
    ) as HTMLElement;
    expect(secondWrap.hidden).toBe(true);
    operatorDropDown.value = "between";
    target.dispatchEvent(new Event("click"));
    expect(secondWrap.hidden).toBe(false);

    const controls = Array.from(target.querySelectorAll("input"))
      .map((input: any) => input.ej2_instances?.[0])
      .filter(Boolean);
    expect(controls).toHaveLength(2);
    controls[0].value = 10;
    controls[1].value = 99;

    const filterByColumn = vi.fn();
    amountColumn.filter.ui.read({
      column: amountColumn,
      operator: "between",
      fltrObj: {
        filterByColumn,
        removeFilteredColsByField: vi.fn(),
      },
    });
    expect(filterByColumn).toHaveBeenCalledWith(
      "amount",
      "greaterthanorequal",
      10,
      "and",
      true,
    );

    // where 若只带下界，dataStateChange 仍应用 pendingRanges 补成 BETWEEN
    vnode.props.dataStateChange({
      action: { requestType: "filtering" },
      where: [
        {
          field: "amount",
          operator: "greaterthanorequal",
          value: 10,
        },
      ],
    });
    expect(onFilterModelChange).toHaveBeenLastCalledWith({
      amount: {
        filterType: "number",
        operator: "BETWEEN",
        value: 10,
        valueTo: 99,
      },
    });

    expect(() => amountColumn.filter.ui.destroy()).not.toThrow();
    target.remove();
  });

  it("uses multi Menu filter UI for datetime columns (DATE|SET|MULTI)", () => {
    const factory = createSyncfusionUiFactory();
    const metaUi = {
      objName: "Order",
      getListedFields: () => [
        { fieldName: "orderedAt", displayLabel: "日期", dataType: 184 },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const vnode = gridOf(
      factory.table([], metaUi, {
        filterDisplay: "menu",
        pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
      }),
    );
    const dateColumn = vnode.props.columns.find(
      (column: any) => column?.field === "orderedAt",
    );
    dateColumn.uid = "ordered-at-column";
    const target = document.createElement("div");
    document.body.appendChild(target);
    dateColumn.filter.ui.create({
      target,
      column: dateColumn,
      getOptrInstance: {
        dropOptr: {
          value: "equal",
          change: undefined,
        },
      },
    });
    expect(target.querySelector(".mmda-sf-filter-multi")).toBeTruthy();
    expect(target.querySelector(".e-flmenu-input")).toBeTruthy();
    dateColumn.filter.ui.destroy();
    target.remove();
  });

  it("builds module breadcrumb from parent chain", () => {
    const factory = new ModuleFactory([
      {
        moduleCode: "B",
        moduleLabel: "基础数据",
        moduleType: "SYSTEM",
        moduleVersion: ModuleVersion.TEAM,
        allowOps: 1,
        moduleUrl: "/BASE",
        requiredCreateParam: false,
        status: ModuleStatus.RELEASED,
        divider: false,
        subModules: [
          {
            moduleCode: "B.01",
            moduleLabel: "组织架构",
            moduleType: "MODULE",
            moduleVersion: ModuleVersion.TEAM,
            moduleIcon: "far fa-sitemap",
            allowOps: 1,
            moduleUrl: "/BASE/org",
            requiredCreateParam: false,
            status: ModuleStatus.RELEASED,
            divider: false,
            subModules: [
              {
                moduleCode: "B.01.01",
                moduleLabel: "部门",
                moduleType: "FEATURE",
                moduleVersion: ModuleVersion.TEAM,
                allowOps: 7,
                moduleUrl: "/BASE/Departments",
                requiredCreateParam: false,
                status: ModuleStatus.RELEASED,
                divider: false,
                objName: "Department",
              },
            ],
          },
        ],
      },
    ]);
    const dept = factory.findModuleByName("Department")!;
    const builder = new SyncfusionUiBuilder();
    const vnode = builder.buildModuleBreadcrumb({ title: "部门" } as any, {
      module: dept,
    });
    expect((vnode.props as any)?.enableNavigation).toBe(false);
    expect(String((vnode.props as any)?.cssClass ?? "")).toContain(
      "mmda-sf-breadcrumb",
    );
    const items = (vnode.props as any)?.items as any[];
    expect(items).toHaveLength(2);
    expect(items.map((item) => item.text)).not.toContain("基础数据");
    expect(items[0].text).toBe("组织架构");
    expect(items[0].url).toBe("/BASE/org");
    expect(items[1].text).toBe("部门");
    expect(items[1].url).toBeUndefined();
  });

  it("keeps feature moduleUrl clickable when details leaf label is present", () => {
    const factory = new ModuleFactory([
      {
        moduleCode: "B",
        moduleLabel: "基础数据",
        moduleType: "SYSTEM",
        moduleVersion: ModuleVersion.TEAM,
        allowOps: 1,
        moduleUrl: "/BASE",
        requiredCreateParam: false,
        status: ModuleStatus.RELEASED,
        divider: false,
        subModules: [
          {
            moduleCode: "B.01",
            moduleLabel: "组织架构",
            moduleType: "MODULE",
            moduleVersion: ModuleVersion.TEAM,
            allowOps: 1,
            moduleUrl: "/BASE/org",
            requiredCreateParam: false,
            status: ModuleStatus.RELEASED,
            divider: false,
            subModules: [
              {
                moduleCode: "B.01.01",
                moduleLabel: "部门",
                moduleType: "FEATURE",
                moduleVersion: ModuleVersion.TEAM,
                allowOps: 7,
                moduleUrl: "/BASE/Departments",
                requiredCreateParam: false,
                status: ModuleStatus.RELEASED,
                divider: false,
                objName: "Department",
              },
            ],
          },
        ],
      },
    ]);
    const dept = factory.findModuleByName("Department")!;
    const builder = new SyncfusionUiBuilder();
    const vnode = builder.buildModuleBreadcrumb({ title: "部门" } as any, {
      module: dept,
      label: "部门【D001】",
    });
    const items = (vnode.props as any)?.items as any[];
    expect(items).toHaveLength(3);
    expect(items[1].text).toBe("部门");
    expect(items[1].url).toBe("/BASE/Departments");
    expect(items[2].text).toBe("部门【D001】");
    expect(items[2].url).toBeUndefined();
  });

  it("maps factory.breadcrumb items onto EJ2 BreadcrumbComponent", () => {
    const uiFactory = createSyncfusionUiFactory();
    const vnode = uiFactory.breadcrumb({
      items: [
        { label: "组织", to: "/org", icon: "home" },
        { label: "部门" },
      ],
      separator: ">",
    });
    expect((vnode.props as any)?.enableNavigation).toBe(false);
    expect((vnode.props as any)?.items?.[0]?.text).toBe("组织");
    expect((vnode.props as any)?.items?.[0]?.url).toBe("/org");
    expect((vnode.props as any)?.items?.[1]?.text).toBe("部门");
    expect((vnode.props as any)?.style?.["--mmda-breadcrumb-sep"]).toBe('">"');
    expect(String((vnode.props as any)?.cssClass ?? "")).toContain(
      "mmda-breadcrumb",
    );
  });

  it("maps factory.calendar onto EJ2 CalendarComponent", () => {
    const uiFactory = createSyncfusionUiFactory();
    const min = new Date(2017, 4, 9);
    const max = new Date(2017, 4, 15);
    const values = [new Date(2020, 0, 1), new Date(2020, 0, 15)];
    const vnode = uiFactory.calendar({
      value: values,
      selectionMode: "multiple",
      min,
      max,
      firstDayOfWeek: 1,
      view: "month",
      depth: "year",
      locale: "zh-Hans",
    });
    expect((vnode.props as any)?.isMultiSelection).toBe(true);
    expect((vnode.props as any)?.values).toEqual(values);
    expect((vnode.props as any)?.min).toBe(min);
    expect((vnode.props as any)?.max).toBe(max);
    expect((vnode.props as any)?.firstDayOfWeek).toBe(1);
    expect((vnode.props as any)?.start).toBe("Month");
    expect((vnode.props as any)?.depth).toBe("Year");
    expect((vnode.props as any)?.locale).toBe("zh-Hans");
    expect(String((vnode.props as any)?.cssClass ?? "")).toContain(
      "mmda-calendar",
    );
    expect(String((vnode.props as any)?.cssClass ?? "")).toContain(
      "mmda-calendar--multiple",
    );
  });

  it("maps factory.carousel onto EJ2 CarouselComponent", () => {
    const uiFactory = createSyncfusionUiFactory();
    const items = [
      { src: "/a.jpg", title: "A" },
      { src: "/b.jpg", title: "B" },
    ];
    const vnode = uiFactory.carousel({
      items,
      selectedIndex: 1,
      autoPlay: true,
      interval: 4000,
      loop: true,
      animation: "fade",
    });
    expect((vnode.props as any)?.dataSource).toHaveLength(2);
    expect((vnode.props as any)?.selectedIndex).toBe(1);
    expect((vnode.props as any)?.autoPlay).toBe(true);
    expect((vnode.props as any)?.interval).toBe(4000);
    expect((vnode.props as any)?.infinite).toBe(true);
    expect((vnode.props as any)?.animationEffect).toBe("Fade");
    expect(String((vnode.props as any)?.cssClass ?? "")).toContain(
      "mmda-carousel",
    );
  });

  it("maps factory.checkBox onto EJ2 CheckBoxComponent", () => {
    const uiFactory = createSyncfusionUiFactory();
    const vnode = uiFactory.checkBox({
      checked: true,
      label: "同意条款",
      indeterminate: true,
    });
    expect((vnode.props as any)?.checked).toBe(true);
    expect((vnode.props as any)?.label).toBe("同意条款");
    expect((vnode.props as any)?.indeterminate).toBe(true);
    expect(String((vnode.props as any)?.cssClass ?? "")).toContain(
      "mmda-checkbox",
    );
    expect(String((vnode.props as any)?.cssClass ?? "")).toContain(
      "mmda-checkbox--indeterminate",
    );
    const omitted = uiFactory.checkBox({ checked: false, label: "未半选" });
    expect((omitted.props as any)?.indeterminate).toBeUndefined();
  });

  it("maps factory.switch onto EJ2 SwitchComponent", () => {
    const uiFactory = createSyncfusionUiFactory();
    const onChange = vi.fn();
    const vnode = uiFactory.switch({
      checked: true,
      onLabel: "开",
      offLabel: "关",
      onChange,
    });
    expect((vnode.props as any)?.checked).toBe(true);
    expect((vnode.props as any)?.onLabel).toBe("开");
    expect((vnode.props as any)?.offLabel).toBe("关");
    expect(String((vnode.props as any)?.cssClass ?? "")).toContain("mmda-switch");
    vnode.props?.change?.({ checked: false });
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("renders fields.checkbox from displayLabel and getFieldValue", () => {
    const fields = createSyncfusionFieldFactory();
    const field = {
      fieldName: "active",
      displayLabel: "启用",
    } as any;
    const vnode = fields.checkBox(field, {
      getFieldValue: () => true,
      setFieldValue: vi.fn(),
      isFieldReadonly: () => false,
      isInvalid: () => false,
    } as any);
    expect(vnode.props.class).toContain("mmda-sf-control");
    const chrome = vnode.children[0];
    expect(chrome.props.label).toBe("启用");
    expect(chrome.props.checked).toBe(true);
    expect(String(chrome.props.cssClass ?? "")).toContain("mmda-checkbox");
  });

  it("maps factory.chips onto EJ2 ChipListComponent", () => {
    const uiFactory = createSyncfusionUiFactory();
    const action = uiFactory.chips({ items: ["原料", "辅料"] });
    expect((action.props as any)?.selection).toBeUndefined();
    expect((action.props as any)?.chips?.map((c: any) => c.text)).toEqual([
      "原料",
      "辅料",
    ]);
    expect(String((action.props as any)?.cssClass ?? "")).toContain("mmda-chips");
    const choice = uiFactory.chips({ kind: "choice", items: ["S", "M"] });
    expect((choice.props as any)?.selection).toBe("Single");
    const filter = uiFactory.chips({ kind: "filter", items: ["A"] });
    expect((filter.props as any)?.selection).toBe("Multiple");
    const input = uiFactory.chips({ kind: "input", items: ["A"] });
    expect((input.props as any)?.enableDelete).toBe(true);
    const colored = uiFactory.chips({
      items: [{ label: "成功", colorRole: "success", icon: "check" }],
    });
    expect((colored.props as any)?.chips?.[0]?.cssClass).toContain("e-success");
    expect((colored.props as any)?.chips?.[0]?.leadingIconCss).toBeTruthy();
  });

  it("maps factory.contextMenu onto EJ2 ContextMenuComponent", () => {
    const uiFactory = createSyncfusionUiFactory();
    const onAction = vi.fn();
    const vnode = uiFactory.contextMenu({
      target: "#editor",
      items: [
        { name: "cut", label: "剪切", icon: "cut", onAction },
        { divider: true },
        { name: "paste", label: "粘贴", disabled: true },
      ],
    });
    expect((vnode.props as any)?.target).toBe("#editor");
    expect(String((vnode.props as any)?.cssClass ?? "")).toContain(
      "mmda-context-menu",
    );
    const items = (vnode.props as any)?.items ?? [];
    expect(items[0].text).toBe("剪切");
    expect(items[0].id).toBe("cut");
    expect(items[1].separator).toBe(true);
    expect(items[2].disabled).toBe(true);
    expect(typeof (vnode.props as any)?.select).toBe("function");
    (vnode.props as any).select({ item: { id: "cut", text: "剪切" } });
    expect(onAction).toHaveBeenCalledTimes(1);
    const disabled = uiFactory.contextMenu({
      target: "#editor",
      disabled: true,
      items: [{ name: "a", label: "A" }],
    });
    expect((disabled.props as any)?.target).toBeUndefined();
  });

  it("renders list toolbar actions from module authority", () => {
    const factory = new ModuleFactory([
      {
        moduleCode: "B.01.01",
        moduleLabel: "部门",
        moduleType: "FEATURE",
        moduleVersion: ModuleVersion.TEAM,
        allowOps:
          ModuleOp.READ |
          ModuleOp.CREATE |
          ModuleOp.DELETE |
          ModuleOp.EXPORT |
          ModuleOp.IMPORT,
        moduleUrl: "/BASE/Departments",
        requiredCreateParam: false,
        status: ModuleStatus.RELEASED,
        divider: false,
        objName: "Department",
      },
    ]);
    const module = factory.findModuleByName("Department")!;
    const builder = new SyncfusionUiBuilder();
    const context = {
      view: UiViewMany.Index,
      many: true,
      editing: false,
      title: "部门",
      metaUi: { objName: "Department", displayLabel: "部门" },
      model: { list: [] },
      logic: { module, repository: "Departments" },
      module,
      refresh: () => undefined,
      actionLoadings: {},
      executing: false,
      globalProps: { $t: (message: string) => message },
      t: (message: string) => message,
      translate: (message: string) => message,
      customActions: [],
      selectionMode: null,
    };
    const withoutDelete = {
      ...context,
      module: { ...module, authority: auth(ModuleOp.READ | ModuleOp.CREATE) },
    };
    const withDeleteButtons = (builder as any).indexViewActionButtons(context);
    const withoutDeleteButtons = (builder as any).indexViewActionButtons({
      ...withoutDelete,
      logic: { module: withoutDelete.module, repository: "Departments" },
    });
    expect(withDeleteButtons.length).toBeGreaterThan(
      withoutDeleteButtons.length,
    );
    expect(JSON.stringify(withDeleteButtons)).toContain("deleteAll");
    expect(JSON.stringify(withoutDeleteButtons)).not.toContain("deleteAll");
    expect(JSON.stringify(withDeleteButtons)).toContain("tableSettings");
    expect(JSON.stringify(withoutDeleteButtons)).toContain("tableSettings");
    expect(JSON.stringify(withDeleteButtons)).toContain("autoFitColumns");
    expect(JSON.stringify(withDeleteButtons).indexOf("autoFitColumns")).toBeLessThan(
      JSON.stringify(withDeleteButtons).indexOf("tableSettings"),
    );
  });

  it("auto-fits visible list columns and persists px widths to listSize", async () => {
    const columns = [
      { field: "rowNum", width: 60, visible: true, type: undefined },
      { field: "name", width: 120, visible: true, type: undefined },
      { field: "code", width: 80, visible: true, type: undefined },
    ];
    const autoFitColumns = vi.fn();
    const gridEl = document.createElement("div");
    (gridEl as any).ej2_instances = [
      {
        getColumns: () => columns,
        autoFitColumns,
      },
    ];
    gridEl.className = "e-grid mmda-sf-table";
    document.body.appendChild(gridEl);

    const metaUi = new MetaUi({
      objName: "Item",
      displayLabel: "Item",
      primaryKey: "id",
      labelKey: "name",
      groups: [
        {
          groupName: "basic",
          groupLabel: "Basic",
          many: false,
          fields: [
            {
              fieldIdx: 1,
              fieldName: "name",
              displayLabel: "名称",
              dataType: 12,
              nullable: false,
              listed: true,
              listSize: 120,
            },
            {
              fieldIdx: 2,
              fieldName: "code",
              displayLabel: "编码",
              dataType: 12,
              nullable: false,
              listed: true,
              listSize: 80,
            },
          ],
        },
      ],
    });
    columns[1].width = "180px";
    columns[2].width = "96px";

    const updateForCache = vi.fn().mockResolvedValue(undefined);
    const pack = { metaUi, filters: [], sorts: [] };
    const staleMetaUi = new MetaUi({
      objName: "Item",
      displayLabel: "Item",
      primaryKey: "id",
      labelKey: "name",
      groups: [
        {
          groupName: "basic",
          groupLabel: "Basic",
          many: false,
          fields: [
            {
              fieldIdx: 1,
              fieldName: "name",
              displayLabel: "名称",
              dataType: 12,
              nullable: false,
              listed: true,
              listSize: 120,
            },
            {
              fieldIdx: 2,
              fieldName: "code",
              displayLabel: "编码",
              dataType: 12,
              nullable: false,
              listed: true,
              listSize: 80,
            },
          ],
        },
      ],
    });
    const context = {
      metaUi,
      t: (key: string) => key,
      filters: [],
      searchParam: { pager: { sorts: [] } },
      logic: {
        repository: "Items",
        meta: { metaUi: staleMetaUi, filters: [], sorts: [] },
        metaUiService: { updateForCache },
      },
    } as any;

    await autoFitSyncfusionListGrid(context);

    expect(autoFitColumns).toHaveBeenCalledWith(["name", "code"]);
    expect(metaUi.getField("name")?.listSize).toBe(180);
    expect(metaUi.getField("code")?.listSize).toBe(96);
    expect(staleMetaUi.getField("name")?.listSize).toBe(120);
    expect(updateForCache).toHaveBeenCalledWith(
      "Items",
      expect.objectContaining({ metaUi }),
      undefined,
    );

    gridEl.remove();
  });

  it("maps auto-fit menu icon to Syncfusion e-icons", () => {
    const builder = new SyncfusionUiBuilder();
    const items = (builder as any).listLayoutMenuItems({
      t: (key: string) => key,
    });
    expect(items[0].icon).toBe("e-icons e-auto-fit-all-column");
  });

  it("orders details actions, applies entity roles, and groups file actions", () => {
    const builder = new SyncfusionUiBuilder();
    const module = {
      authority: auth(
        ModuleOp.READ |
          ModuleOp.EDIT |
          ModuleOp.CREATE |
          ModuleOp.DELETE |
          ModuleOp.PRINT |
          ModuleOp.EXPORT |
          ModuleOp.IMPORT,
      ),
    };
    const context = {
      many: false,
      editing: false,
      metaUi: { objName: "Material", displayLabel: "物料" },
      model: {
        actions: [{ name: "deprecate", label: "弃用", role: "DANGER" }],
      },
      logic: { module, repository: "Materials" },
      module,
      templates: [],
      customActions: [],
      actionLoadings: {},
      executing: false,
      globalProps: { $router: { back: vi.fn() } },
      t: (message: string) => message,
      translate: (message: string) => message,
    };

    const buttons = (builder as any).detailsViewActionButtons(context);
    expect(
      buttons.slice(0, 6).map((button: any) => button.props?.content),
    ).toEqual([
      "action.back",
      "action.edit",
      "action.create",
      "action.delete",
      "弃用",
      "action.more",
    ]);
    expect(buttons[4].props.cssClass).toContain("e-danger");
    expect(buttons[5].props.items.map((item: any) => item.text)).toEqual([
      "action.print",
      "action.export",
      "action.import",
    ]);
    expect(String(buttons[5].props.cssClass ?? "")).toContain("e-secondary");
    expect(buttons[5].props.iconCss).toBeFalsy();
    expect(String(buttons[0].props.cssClass ?? "")).toContain("e-secondary");
  });

  it("maps vui locales onto EJ2 cultures and loads L10n", () => {
    expect(resolveSyncfusionCulture("zh")).toBe("zh-Hans");
    expect(resolveSyncfusionCulture("zh-CN")).toBe("zh-Hans");
    expect(resolveSyncfusionCulture("zh-Hans")).toBe("zh-Hans");
    expect(resolveSyncfusionCulture("zh-Hant")).toBe("zh-Hant");
    expect(resolveSyncfusionCulture("en")).toBe("en-US");
    expect(applySyncfusionLocale("zh")).toBe("zh-Hans");
    // 简体使用独立 zh-Hans；官方 zh 仅供 zh-Hant 使用。
    const l10n = new L10n("grid", {}, "zh-Hans");
    expect(l10n.getConstant("StartsWith")).toBe("开头是");
    expect(l10n.getConstant("EndsWith")).toBe("结尾是");
    expect(l10n.getConstant("NotStartsWith")).toBe("开头不是");
    expect(l10n.getConstant("ClearFilter")).toBe("清除筛选");
    expect(applySyncfusionLocale("en")).toBe("en-US");
  });
});

describe("gridFiltersToModel join/multi", () => {
  const nameField = { fieldName: "name", dataType: 48 };
  const qtyField = { fieldName: "qty", dataType: 68 };
  const statusField = {
    fieldName: "status",
    dataType: 48,
    reference: { isEnum: true },
  };

  it("string + explicit SET only is choice, not multi", () => {
    const field = new MetaUiField({
      fieldName: "name",
      displayLabel: "名称",
      fieldIdx: 0,
      dataType: SqlDataType.VARCHAR,
      nullable: true,
      listed: true,
      filterTypes: MetaUiFieldFilterType.SET,
    });
    expect(columnFilterKindOf(field)).toBe("set");
    expect(isChoiceFilterField(field)).toBe(true);
  });

  it("maps same-field AND contains to join", () => {
    const model = gridFiltersToModel(
      [
        {
          condition: "and",
          predicates: [
            { field: "name", operator: "contains", value: "a" },
            { field: "name", operator: "contains", value: "b" },
          ],
        },
      ],
      [nameField] as any,
    );
    expect(model.name).toEqual({
      filterType: "join",
      operator: "AND",
      conditions: [
        { filterType: "text", operator: "CONTAINS", value: "a" },
        { filterType: "text", operator: "CONTAINS", value: "b" },
      ],
    });
  });

  it("maps single date equal to EQ, not set", () => {
    const dateField = { fieldName: "orderedAt", dataType: 184 };
    const start = new Date("2026-08-01");
    const model = gridFiltersToModel(
      [{ field: "orderedAt", operator: "equal", value: start }],
      [dateField] as any,
    );
    expect(model.orderedAt).toEqual({
      filterType: "date",
      operator: "EQ",
      value: start,
    });
  });

  it("maps contains + IN codes to multi", () => {
    const model = gridFiltersToModel(
      [
        {
          condition: "and",
          predicates: [
            { field: "status", operator: "contains", value: "仓" },
            { field: "status", operator: "equal", value: "LABOR" },
            { field: "status", operator: "equal", value: "PART" },
          ],
        },
      ],
      [statusField] as any,
    );
    expect(model.status.filterType).toBe("multi");
    expect((model.status as any).filterModels[0]).toEqual({
      filterType: "text",
      operator: "CONTAINS",
      value: "仓",
    });
    expect((model.status as any).filterModels[1]).toEqual({
      filterType: "set",
      operator: "IN",
      values: ["LABOR", "PART"],
    });
  });

  it("keeps BETWEEN and IN from becoming join", () => {
    const between = gridFiltersToModel(
      [
        {
          predicates: [
            { field: "qty", operator: "greaterthanorequal", value: 1 },
            { field: "qty", operator: "lessthanorequal", value: 9 },
          ],
        },
      ],
      [qtyField] as any,
    );
    expect(between.qty).toEqual({
      filterType: "number",
      operator: "BETWEEN",
      value: 1,
      valueTo: 9,
    });
    const inn = gridFiltersToModel(
      [
        {
          predicates: [
            { field: "status", operator: "equal", value: "A" },
            { field: "status", operator: "equal", value: "B" },
          ],
        },
      ],
      [statusField] as any,
    );
    expect(inn.status).toEqual({
      filterType: "set",
      operator: "IN",
      values: ["A", "B"],
    });
  });
});
