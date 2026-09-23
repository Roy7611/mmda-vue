/**
 * rui-syncfusion 皮肤安全网：工厂映射冒烟 + 纯逻辑（列构建 / 过滤模型 /
 * 插件映射器）+ 字段工厂接线。不断言 EJ2 渲染结果，只断言 createElement
 * 的 props 映射与事件回传。
 */
import { describe, expect, it, vi } from "vitest";
import { isValidElement, type ReactElement } from "react";
import { TextBoxComponent } from "@syncfusion/ej2-react-inputs";
import { CheckBoxComponent } from "@syncfusion/ej2-react-buttons";
import {
  MetaUiField,
  MetaUiFilterType,
  MONTH_PICKER_FORMAT,
  SqlDataType,
  type UiContext,
} from "@mmda/core";
import { RuiFieldFactory } from "@mmda/rui";
import { SfRuiFactory } from "../factory";
import { SfRuiFieldFactory } from "../field_factory";
import { buildColumns, gridFiltersToModel } from "../factory/table";
import {
  EJ2_SCHEDULER_VIEWS,
  ej2RecordToUiEvent,
  mapUiEventsToEj2,
  mapUiResourcesToEj2,
} from "../plugins/scheduler";
import {
  ej2RecordToUiCard,
  tagsFromString,
  tagsToString,
  uiCardToEj2,
  uiColumnsToEj2,
} from "../plugins/kanban";
import { toEj2DataSourceSettings } from "../plugins/pivot_table";
import { mapUiTabsToEj2 } from "../plugins/ribbon";
import {
  paletteSymbolsOf,
  vuiConnectorToEj2,
  vuiNodeToEj2,
  vuiShapeToEj2,
} from "../plugins/diagram_editor";
import { ej2RecordToUiTask, mapUiTasksToEj2 } from "../plugins/gantt";
import { chartAsPlugin, createSfChartFactory } from "../plugins/chart";

const propsOf = (node: unknown): Record<string, any> =>
  (node as ReactElement).props as Record<string, any>;

const childrenOf = (node: unknown): any[] => {
  const children = propsOf(node).children;
  if (children == null) return [];
  return Array.isArray(children) ? children : [children];
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const makeField = (init: Record<string, unknown>): MetaUiField =>
  new MetaUiField({
    fieldIdx: 0,
    nullable: true,
    listed: true,
    ...init,
  } as any);

describe("SfRuiFactory 冒烟", () => {
  const factory = new SfRuiFactory();

  it("全部控件成员都是函数，nativeInplaceEdit 开启", () => {
    const members = [
      "button", "textInput", "buttonGroup", "selectButtonGroup",
      "splitButton", "dropDownButton", "moreMenuButton",
      "floatingActionButton", "textArea", "numberInput", "checkBox",
      "switch", "radioButtonGroup", "checkBoxList", "bitCheckBoxList",
      "maskedTextBox", "oneTimePasswordInput", "colorPicker", "slider",
      "rating", "chips", "datePicker", "monthPicker", "dateTimePicker",
      "timePicker", "dateRangePicker", "calendar", "dropDownList",
      "comboBox", "multiSelect", "multiItemSelect", "multiValueSelect",
      "multiTextSelect", "multiBitSelect", "treeSelect", "dropDownTree",
      "autoComplete", "tagAutoComplete", "badge", "message", "avatar",
      "breadcrumb", "card", "divider", "tooltip", "tabs", "toolbar",
      "splitter", "sidebar", "drawer", "contextMenu", "carousel", "list",
      "tree", "paginator", "progressBar", "skeleton", "loading", "error",
      "searchRelative", "fileLink", "fileUploader", "filesUploader",
      "imageUploader", "imagesUploader", "imageGallery", "stepper",
      "signaturePad", "queryBuilder", "inplaceEditor", "speechToText",
      "barcode", "qrCode", "table", "grid", "treeGrid", "formField",
      "link", "actionButton", "toast", "confirm", "dialog",
    ];
    for (const name of members) {
      expect(typeof (factory as any)[name], name).toBe("function");
    }
    expect(factory.nativeInplaceEdit).toBe(true);
  });

  it("table / grid / treeGrid 返回 React 元素", () => {
    const table = factory.table({ fields: [], rows: [] } as any);
    expect(isValidElement(table)).toBe(true);
    expect(isValidElement(factory.grid({ fields: [], rows: [] } as any))).toBe(true);
    expect(
      isValidElement(factory.treeGrid({ fields: [], rows: [] } as any)),
    ).toBe(true);
  });
});

describe("输入控件映射", () => {
  const factory = new SfRuiFactory();

  it("textInput：值/占位/禁用/只读/cssClass/htmlAttributes/事件", () => {
    const onChange = vi.fn();
    const node = factory.textInput({
      value: "abc",
      placeholder: "名称",
      disabled: true,
      class: "my-cls",
      htmlAttributes: { "data-x": "1" },
      onChange,
    } as any);
    expect((node as ReactElement).type).toBe(TextBoxComponent);
    const p = propsOf(node);
    expect(p.value).toBe("abc");
    expect(p.placeholder).toBe("名称");
    expect(p.enabled).toBe(false);
    expect(p.cssClass).toContain("my-cls");
    expect(p.htmlAttributes["data-x"]).toBe("1");
    p.input({ value: "xy" });
    expect(onChange).toHaveBeenLastCalledWith("xy");
    p.change({ value: "zz" });
    expect(onChange).toHaveBeenLastCalledWith("zz");
  });

  it("textArea：原生 textarea，onChange 取 event.target.value", () => {
    const onChange = vi.fn();
    const node = factory.textArea({
      value: "多行",
      rows: 4,
      maxLength: 10,
      disabled: true,
      onChange,
    } as any) as ReactElement;
    expect(node.type).toBe("textarea");
    const p = propsOf(node);
    expect(p.value).toBe("多行");
    expect(p.rows).toBe(4);
    expect(p.maxLength).toBe(10);
    expect(p.disabled).toBe(true);
    p.onChange({ target: { value: "新" } });
    expect(onChange).toHaveBeenCalledWith("新");
  });

  it("numberInput：min/max/step/format/decimals/disabled/change", () => {
    const onChange = vi.fn();
    const node = factory.numberInput({
      value: 5,
      min: 0,
      max: 10,
      step: 2,
      format: "N2",
      decimals: 2,
      disabled: true,
      showSpinButton: false,
      suffix: "kg",
      onChange,
    } as any);
    const p = propsOf(node);
    expect(p.value).toBe(5);
    expect(p.min).toBe(0);
    expect(p.max).toBe(10);
    expect(p.step).toBe(2);
    expect(p.format).toBe("N2");
    expect(p.decimals).toBe(2);
    expect(p.enabled).toBe(false);
    expect(p.showSpinButton).toBe(false);
    expect(p.suffix).toBe("kg");
    p.change({ value: 7 });
    expect(onChange).toHaveBeenLastCalledWith(7);
    p.change({});
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("checkBox / switch：checked 与 change 布尔回传", () => {
    const onCheck = vi.fn();
    const box = factory.checkBox({
      checked: true,
      label: "启用",
      disabled: true,
      onChange: onCheck,
    } as any);
    expect(propsOf(box).checked).toBe(true);
    expect(propsOf(box).label).toBe("启用");
    expect(propsOf(box).disabled).toBe(true);
    propsOf(box).change({ checked: false });
    expect(onCheck).toHaveBeenCalledWith(false);

    const onSwitch = vi.fn();
    const sw = factory.switch({
      checked: false,
      onLabel: "开",
      offLabel: "关",
      onChange: onSwitch,
    } as any);
    expect(propsOf(sw).checked).toBe(false);
    expect(propsOf(sw).onLabel).toBe("开");
    propsOf(sw).change({ checked: true });
    expect(onSwitch).toHaveBeenCalledWith(true);
  });

  it("radioButtonGroup：按 modelValue 勾选，change 回传选项值", () => {
    const onChange = vi.fn();
    const node = factory.radioButtonGroup({
      options: [
        { value: "a", label: "甲" },
        { value: "b", label: "乙" },
      ],
      value: "a",
      onChange,
    } as any) as ReactElement;
    const radios = childrenOf(node);
    expect(radios).toHaveLength(2);
    expect(propsOf(radios[0]).checked).toBe(true);
    expect(propsOf(radios[1]).checked).toBe(false);
    expect(propsOf(radios[0]).label).toBe("甲");
    propsOf(radios[1]).change({ checked: true });
    expect(onChange).toHaveBeenCalledWith("b");
    // 取消勾选不触发
    propsOf(radios[0]).change({ checked: false });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("checkBoxList：全选/单选 toggle 回传选项数组", () => {
    const onChange = vi.fn();
    const options = [
      { value: "a", label: "甲" },
      { value: "b", label: "乙" },
    ];
    const node = factory.checkBoxList({
      options,
      value: ["a"],
      onChange,
    } as any) as ReactElement;
    const children = childrenOf(node);
    expect(children).toHaveLength(3); // selectAll + 2 项
    expect(propsOf(children[0]).checked).toBe(false); // 1/2 未全选
    expect(propsOf(children[1]).checked).toBe(true);
    expect(propsOf(children[2]).checked).toBe(false);

    propsOf(children[2]).change({ checked: true });
    expect(onChange).toHaveBeenLastCalledWith(options);

    propsOf(children[0]).change({ checked: true });
    expect(onChange).toHaveBeenLastCalledWith(options);
  });

  it("colorPicker：mode 映射，change 回传 hex", () => {
    const onChange = vi.fn();
    const picker = factory.colorPicker({
      value: "#ff0000",
      mode: "palette",
      onChange,
    } as any);
    expect(propsOf(picker).mode).toBe("Palette");
    propsOf(picker).change({ currentValue: { hex: "#00ff00" } });
    expect(onChange).toHaveBeenCalledWith("#00ff00");
    const plain = factory.colorPicker({} as any);
    expect(propsOf(plain).mode).toBe("Picker");
  });

  it("slider / rating：类型与只读映射", () => {
    const onSlide = vi.fn();
    const slider = factory.slider({
      value: 3,
      min: 0,
      max: 10,
      type: "Range",
      onChange: onSlide,
    } as any);
    expect(propsOf(slider).type).toBe("Range");
    propsOf(slider).change({ value: 8 });
    expect(onSlide).toHaveBeenCalledWith(8);

    const onRate = vi.fn();
    const rating = factory.rating({
      value: 3,
      itemsCount: 10,
      disabled: true,
      onChange: onRate,
    } as any);
    expect(propsOf(rating).value).toBe(3);
    expect(propsOf(rating).itemsCount).toBe(10);
    expect(propsOf(rating).readOnly).toBe(true);
    propsOf(rating).valueChanged({ value: 4 });
    expect(onRate).toHaveBeenCalledWith(4);
  });

  it("maskedTextBox：mask/promptChar/disabled/change", () => {
    const onChange = vi.fn();
    const node = factory.maskedTextBox({
      value: "138",
      mask: "000-0000-0000",
      promptChar: "_",
      disabled: true,
      onChange,
    } as any);
    const p = propsOf(node);
    expect(p.mask).toBe("000-0000-0000");
    expect(p.promptChar).toBe("_");
    expect(p.enabled).toBe(false);
    p.change({ value: "139" });
    expect(onChange).toHaveBeenCalledWith("139");
  });
});

describe("选择控件映射", () => {
  const factory = new SfRuiFactory();
  const options = [
    { value: "a", label: "甲", group: "G1" },
    { value: "b", label: "乙", group: "G2" },
  ];

  it("dropDownList：dataSource/fields(含 groupBy)/enabled/change", () => {
    const onChange = vi.fn();
    const node = factory.dropDownList({
      options,
      value: "a",
      placeholder: "选",
      onChange,
    } as any);
    const p = propsOf(node);
    expect(p.value).toBe("a");
    expect(p.dataSource).toEqual(options);
    expect(p.fields).toEqual({ value: "value", text: "label", groupBy: "group" });
    expect(p.enabled).toBe(true);
    expect(p.allowFiltering).toBe(true);
    p.change({ value: "b" });
    expect(onChange).toHaveBeenLastCalledWith("b");
    p.change({});
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("dropDownList filtering：suggest 远程搜索，短查询清空", async () => {
    const suggest = vi.fn(async (query: string) => [`${query}-1`, `${query}-2`]);
    const node = factory.dropDownList({
      options: [],
      suggest,
      minLength: 2,
    } as any);
    const filtering = propsOf(node).filtering;
    expect(typeof filtering).toBe("function");

    const args: any = { text: "ab", updateData: vi.fn() };
    filtering(args);
    expect(args.preventDefaultAction).toBe(true);
    await flush();
    expect(suggest).toHaveBeenCalledWith("ab");
    expect(args.updateData).toHaveBeenCalledWith([
      { value: "ab-1", label: "ab-1" },
      { value: "ab-2", label: "ab-2" },
    ]);

    const short = { text: "a", updateData: vi.fn() };
    filtering(short);
    expect(short.updateData).toHaveBeenCalledWith([]);
    expect(suggest).toHaveBeenCalledTimes(1);
  });

  it("无 suggest 时不挂 filtering", () => {
    const node = factory.dropDownList({ options: [] } as any);
    expect(propsOf(node).filtering).toBeUndefined();
  });

  it("comboBox：allowCustom 与 change", () => {
    const onChange = vi.fn();
    const node = factory.comboBox({
      options,
      value: "a",
      allowCustom: true,
      onChange,
    } as any);
    expect(propsOf(node).allowCustom).toBe(true);
    propsOf(node).change({ value: "自定义" });
    expect(onChange).toHaveBeenCalledWith("自定义");
  });

  it("multiSelect：CheckBox 模式 + 选中键 + change 回传选项", () => {
    const onChange = vi.fn();
    const plain = [
      { value: "a", label: "甲" },
      { value: "b", label: "乙" },
    ];
    const node = factory.multiSelect({
      options: plain,
      value: ["a"],
      onChange,
    } as any);
    const p = propsOf(node);
    expect(p.mode).toBe("CheckBox");
    expect(p.showSelectAll).toBe(true);
    expect(p.value).toEqual(["a"]);
    p.change({ value: ["a", "b"] });
    expect(onChange).toHaveBeenLastCalledWith(plain);
  });

  it("treeSelect：值归一数组，checkbox 模式，change 单/多选", () => {
    const onChange = vi.fn();
    const single = factory.treeSelect({
      data: [{ id: "n1", label: "节点" }],
      value: "n1",
      onChange,
    } as any);
    expect(propsOf(single).value).toEqual(["n1"]);
    expect(propsOf(single).mode).toBe("Default");
    propsOf(single).change({ value: ["n2"] });
    expect(onChange).toHaveBeenLastCalledWith("n2");
    propsOf(single).change({ value: [] });
    expect(onChange).toHaveBeenLastCalledWith(null);

    const multiple = factory.treeSelect({
      data: [],
      selectionMode: "checkbox",
      onChange,
    } as any);
    expect(propsOf(multiple).mode).toBe("CheckBox");
    expect(propsOf(multiple).showCheckBox).toBe(true);
    propsOf(multiple).change({ value: ["a", "b"] });
    expect(onChange).toHaveBeenLastCalledWith(["a", "b"]);
  });

  it("autoComplete：minLength/suggestionCount/change 字符串化", () => {
    const onChange = vi.fn();
    const node = factory.autoComplete({
      options,
      value: "甲",
      minLength: 2,
      suggestionCount: 5,
      onChange,
    } as any);
    const p = propsOf(node);
    expect(p.value).toBe("甲");
    expect(p.minLength).toBe(2);
    expect(p.suggestionCount).toBe(5);
    p.change({ value: 123 });
    expect(onChange).toHaveBeenCalledWith("123");
  });
});

describe("日期控件映射", () => {
  const factory = new SfRuiFactory();

  it("datePicker：值/范围/禁用/cleared 同时发 onClear 与 onChange(null)", () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    const day = new Date(2026, 8, 22);
    const node = factory.datePicker({
      value: day,
      min: new Date(2026, 0, 1),
      max: new Date(2026, 11, 31),
      format: "yyyy-MM-dd",
      disabled: true,
      onChange,
      onClear,
    } as any);
    const p = propsOf(node);
    expect(p.value).toEqual(day);
    expect(p.min).toEqual(new Date(2026, 0, 1));
    expect(p.format).toBe("yyyy-MM-dd");
    expect(p.enabled).toBe(false);
    p.change({ value: new Date(2026, 9, 1) });
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 9, 1));
    p.cleared();
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("monthPicker：Year 起止 + 月份格式", () => {
    const node = factory.monthPicker({ value: new Date(2026, 8, 1) } as any);
    const p = propsOf(node);
    expect(p.start).toBe("Year");
    expect(p.depth).toBe("Year");
    expect(p.format).toBe(MONTH_PICKER_FORMAT);
  });
});

describe("按钮映射", () => {
  const factory = new SfRuiFactory();

  it("button：content/iconCss/isPrimary/disabled，onClick 阻止默认", () => {
    const onClick = vi.fn();
    const node = factory.button({
      label: "保存",
      icon: "e-icons e-save",
      colorRole: "primary",
      disabled: true,
      onClick,
    } as any);
    const p = propsOf(node);
    expect(p.content).toBe("保存");
    expect(p.iconCss).toBe("e-icons e-save");
    expect(p.isPrimary).toBe(true);
    expect(p.disabled).toBe(true);
    const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };
    p.onClick(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalled();
  });

  it("selectButtonGroup：选中态 class 与点击 toggle", () => {
    const onUpdate = vi.fn();
    const node = factory.selectButtonGroup({
      options: [
        { value: "list", label: "列表" },
        { value: "card", label: "卡片" },
      ],
      modelValue: "list",
      onUpdate,
    } as any) as ReactElement;
    const buttons = childrenOf(node);
    expect(buttons).toHaveLength(2);
    expect(propsOf(buttons[0]).className).toContain("e-primary");
    expect(propsOf(buttons[1]).className).toContain("e-flat");
    propsOf(buttons[1]).onClick();
    expect(onUpdate).toHaveBeenCalledWith("card");
  });

  it("dropDownButton：actions 映射为 items", () => {
    const node = factory.dropDownButton({
      label: "更多",
      actions: [
        { name: "export", label: "导出", icon: "e-icons e-download" },
        { name: "sep", divider: true },
        { name: "print", label: "打印", disabled: true },
      ],
    } as any);
    const items = propsOf(node).items;
    expect(items[0]).toMatchObject({ text: "导出", iconCss: "e-icons e-download" });
    expect(items[1]).toMatchObject({ separator: true });
    expect(items[2]).toMatchObject({ text: "打印", disabled: true });
  });
});

describe("展示与导航映射", () => {
  const factory = new SfRuiFactory();

  it("badge / avatar / divider / message 原生元素", () => {
    const badge = factory.badge({ value: 3, shape: "dot" } as any) as ReactElement;
    expect(badge.type).toBe("span");
    expect(propsOf(badge).className).toContain("e-badge-dot");

    const avatar = factory.avatar({ label: "罗" } as any) as ReactElement;
    expect(avatar.type).toBe("span");
    expect(propsOf(avatar).className).toContain("e-avatar");

    const divider = factory.divider({ label: "或" } as any) as ReactElement;
    expect(divider.type).toBe("div");
    expect(propsOf(divider).className).toContain("e-divider");

    const onClose = vi.fn();
    const message = factory.message({
      content: "已保存",
      severity: "success",
      showCloseIcon: true,
      onClose,
    } as any) as ReactElement;
    expect(propsOf(message).className).toContain("mmda-message--success");
    expect(propsOf(message).role).toBe("alert");
  });

  it("progressBar：值夹在 min/max 内", () => {
    const node = factory.progressBar({ value: 120, max: 100 } as any);
    expect(propsOf(node).value).toBe(100);
    expect(propsOf(node).type).toBe("Linear");
  });

  it("tabs：items/selectedItem/selected 回传索引", () => {
    const onChange = vi.fn();
    const node = factory.tabs({
      items: [{ header: "甲", content: "A" }, { header: "乙", content: "B" }],
      value: 1,
      onChange,
    } as any);
    const p = propsOf(node);
    expect(p.selectedItem).toBe(1);
    expect(p.items).toHaveLength(2);
    expect(p.items[0].header).toEqual({ text: "甲" });
    p.selected({ selectedIndex: 0 });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("paginator：总数/页大小/当前页，click 回传 onPage", () => {
    const onPage = vi.fn();
    const node = factory.paginator({
      pagination: { recordCount: 95, pageSize: 20, pageNo: 2 },
      pageSizeOptions: [10, 20, 50],
      onPage,
    } as any);
    const p = propsOf(node);
    expect(p.totalRecordsCount).toBe(95);
    expect(p.pageSize).toBe(20);
    expect(p.currentPage).toBe(2);
    p.click({ currentPage: 3 });
    expect(onPage).toHaveBeenCalledWith({ pageNo: 3 });
    p.click({ newProp: { pageSize: 50 } });
    expect(onPage).toHaveBeenCalledWith({ pageSize: 50 });
  });

  it("tree：fields 映射与 nodeSelected", () => {
    const onNodeSelect = vi.fn();
    const data = [{ id: 1, label: "根", children: [] }];
    const node = factory.tree({
      data,
      selectionMode: "checkbox",
      onNodeSelect,
    } as any);
    const p = propsOf(node);
    expect(p.dataSource).toEqual(data);
    expect(p.showCheckBox).toBe(true);
    expect(p.fields).toMatchObject({ id: "id", text: "label" });
    p.nodeSelected({ nodeData: data[0] });
    expect(onNodeSelect).toHaveBeenCalledWith(data[0]);
  });

  it("contextMenu：items 递归映射，select 按 text 找回菜单项", () => {
    const onSelect = vi.fn();
    const node = factory.contextMenu({
      target: "#host",
      items: [
        {
          name: "open",
          label: "打开",
          items: [{ name: "new", label: "新建窗口" }],
        },
      ],
      onSelect,
    } as any);
    const p = propsOf(node);
    expect(p.items[0].text).toBe("打开");
    expect(p.items[0].items[0].text).toBe("新建窗口");
    p.select({ item: { text: "打开" } });
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: "open" }),
    );
  });

  it("fileLink：href/target，preview 拦截默认跳转", () => {
    const onPreview = vi.fn();
    const node = factory.fileLink({
      url: "/files/a.pdf",
      fileName: "a.pdf",
      preview: true,
      onPreview,
    } as any) as ReactElement;
    expect(node.type).toBe("a");
    const p = propsOf(node);
    expect(p.href).toBe("/files/a.pdf");
    expect(p.target).toBe("_blank");
    const event = { preventDefault: vi.fn() };
    p.onClick(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(onPreview).toHaveBeenCalledWith("/files/a.pdf");
  });

  it("searchRelative：显示标签，点击走 toSearch", () => {
    const toSearch = vi.fn();
    const node = factory.searchRelative({
      modelValue: { id: "p1", partnerName: "甲公司" },
      optionLabel: "partnerName",
      placeholder: "选择客户",
      toSearch,
    } as any) as ReactElement;
    const button = childrenOf(node)[0];
    expect(propsOf(button).children).toBe("甲公司");
    propsOf(button).onClick({ preventDefault: vi.fn() });
    expect(toSearch).toHaveBeenCalled();
  });

  it("stepper：步骤映射与 activeStep", () => {
    const node = factory.stepper({
      items: [{ label: "一" }, { label: "二", status: "completed" }],
      value: 1,
    } as any);
    const p = propsOf(node);
    expect(p.steps).toHaveLength(2);
    expect(p.activeStep).toBe(1);
  });

  it("barcode / qrCode：类型与尺寸", () => {
    const barcode = factory.barcode({ value: "123", format: "code39" } as any);
    expect(propsOf(barcode).type).toBe("Code39");
    expect(propsOf(barcode).width).toBe("200px");
    expect(propsOf(barcode).cssClass).toContain("mmda-barcode");

    const qr = factory.qrCode({ value: "https://mmda.cloud" } as any);
    expect(propsOf(qr).value).toBe("https://mmda.cloud");
    expect(propsOf(qr).width).toBe("160px");
    const matrix = factory.qrCode({ value: "x", format: "dataMatrix" } as any);
    expect(isValidElement(matrix)).toBe(true);
  });

  it("inplaceEditor：禁用且无 display 槽时退化为 noop 控制器", () => {
    const onReady = vi.fn();
    const node = factory.inplaceEditor({ disabled: true, onReady } as any) as ReactElement;
    expect(node.type).toBe("div");
    expect(onReady).toHaveBeenCalledTimes(1);
    const controller = onReady.mock.calls[0][0];
    expect(() => {
      controller.open();
      controller.close();
    }).not.toThrow();
  });

  it("inplaceEditor：正常路径返回宿主组件元素", () => {
    const node = factory.inplaceEditor(
      {},
      { display: () => "显示", content: () => "编辑" },
    ) as ReactElement;
    expect(typeof node.type).toBe("function");
    expect(propsOf(node).slots?.display?.()).toBe("显示");
  });
});

describe("图标", () => {
  const factory = new SfRuiFactory();

  it("iconCssOf：动作名 / pi 前缀 / 已是 css / 未知回退", () => {
    expect(factory.iconCssOf("edit")).toBe("e-icons e-edit");
    expect(factory.iconCssOf("pi pi-save")).toBe("e-icons e-save");
    expect(factory.iconCssOf("fas fa-eye-slash")).toBe("fas fa-eye-slash");
    expect(factory.iconCssOf("e-icons e-custom")).toBe("e-icons e-custom");
    expect(factory.iconCssOf("whatever")).toBe("e-icons e-whatever");
    expect(factory.iconCssOf("")).toBe("e-icons e-play");
  });

  it("resolveIcon 返回 <i> 元素", () => {
    const node = factory.resolveIcon("delete") as ReactElement;
    expect(node.type).toBe("i");
    expect(propsOf(node).className).toBe("e-icons e-trash");
  });
});

describe("buildColumns", () => {
  const name = makeField({
    fieldName: "name",
    displayLabel: "名称",
    dataType: SqlDataType.VARCHAR,
  });
  const qty = makeField({
    fieldName: "qty",
    displayLabel: "数量",
    fieldIdx: 1,
    dataType: SqlDataType.INT,
  });
  const active = makeField({
    fieldName: "active",
    displayLabel: "启用",
    fieldIdx: 2,
    dataType: SqlDataType.BIT,
  });
  const created = makeField({
    fieldName: "createdAt",
    displayLabel: "创建日期",
    fieldIdx: 3,
    dataType: SqlDataType.DATE,
  });
  const updated = makeField({
    fieldName: "updatedAt",
    displayLabel: "更新时间",
    fieldIdx: 4,
    dataType: SqlDataType.DATETIME,
  });

  it("类型 / 对齐 / 宽度 / 格式按 dataType 推导", () => {
    const columns = buildColumns(
      { fields: [name, qty, active, created, updated], rows: [] } as any,
      false,
    );
    const byField = Object.fromEntries(columns.map((c) => [c.field, c]));
    expect(byField.name.headerText).toBe("名称");
    expect(byField.name.type).toBeUndefined();
    expect(byField.name.textAlign).toBe("Left");
    expect(byField.qty.type).toBe("number");
    expect(byField.qty.textAlign).toBe("Right");
    expect(byField.qty.width).toBe(110);
    expect(byField.active.type).toBe("boolean");
    expect(byField.active.displayAsCheckBox).toBe(true);
    expect(byField.active.width).toBe(90);
    expect(byField.createdAt.type).toBe("date");
    expect(byField.createdAt.format).toEqual({
      type: "date",
      format: "yyyy-MM-dd",
    });
    expect(byField.updatedAt.type).toBe("datetime");
    expect(byField.updatedAt.format).toEqual({
      type: "dateTime",
      format: "yyyy-MM-dd HH:mm:ss",
    });
  });

  it("listSize 覆盖宽度；sortable/filterable 开关下传", () => {
    const wide = makeField({
      fieldName: "wide",
      dataType: SqlDataType.VARCHAR,
      listSize: 260,
      sortable: false,
    });
    const columns = buildColumns(
      { fields: [wide], rows: [], filterable: false } as any,
      false,
    );
    expect(columns[0].width).toBe(260);
    expect(columns[0].allowSorting).toBe(false);
    expect(columns[0].allowFiltering).toBe(false);
  });

  it("可编辑列：默认放行，canEdit:false 关列", () => {
    const locked = makeField({
      fieldName: "locked",
      dataType: SqlDataType.VARCHAR,
    });
    const columns = buildColumns(
      {
        fields: [name, qty, locked],
        rows: [],
        fieldCellEditors: { locked: { canEdit: false } },
      } as any,
      true,
    );
    const byField = Object.fromEntries(columns.map((c) => [c.field, c]));
    // 无 editor 配置 = 允许编辑（canEdit 函数延到 cellEdit）
    expect(byField.name.allowEditing).toBe(true);
    expect(byField.name.editType).toBe("defaultedit");
    expect(byField.qty.allowEditing).toBe(true);
    expect(byField.qty.editType).toBe("numericedit");
    expect(byField.locked.allowEditing).toBe(false);
    expect(byField.locked.editType).toBeUndefined();
  });

  it("引用列带模板：标量 code 解析为选项 label 显示", () => {
    const status = makeField({
      fieldName: "status",
      displayLabel: "状态",
      dataType: SqlDataType.NVARCHAR,
      selectOptions: "0;NEW;新|1;USED;已启用",
    });
    const columns = buildColumns({ fields: [status], rows: [] } as any, false);
    const template = columns[0].template as (data: any) => ReactElement;
    expect(typeof template).toBe("function");
    const cell = template({ status: "NEW" });
    expect(childrenOf(cell)).toContain("新");
    const empty = template({ status: null });
    expect(childrenOf(empty)).toContain("");
  });

  it("rowActions 追加动作列，按钮点击触发 onAction", () => {
    const onAction = vi.fn();
    const columns = buildColumns(
      {
        fields: [name],
        rows: [],
        rowActions: () => [
          { name: "edit", label: "编辑", onAction },
          { name: "sep", divider: true },
        ],
      } as any,
      false,
      (icon?: string) => icon ?? "",
    );
    const action = columns[columns.length - 1];
    expect(action.headerText).toBe("");
    expect(action.allowSorting).toBe(false);
    const cell = (action.template as (data: any) => ReactElement)({});
    const buttons = childrenOf(cell).filter(Boolean);
    expect(buttons).toHaveLength(1); // divider 被过滤
    propsOf(buttons[0]).onClick({ stopPropagation: vi.fn() });
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});

describe("gridFiltersToModel", () => {
  const textField = makeField({
    fieldName: "name",
    dataType: SqlDataType.VARCHAR,
    filterTypes: MetaUiFilterType.TEXT,
  });
  const numField = makeField({
    fieldName: "qty",
    dataType: SqlDataType.INT,
    filterTypes: MetaUiFilterType.NUMBER,
  });
  const boolField = makeField({
    fieldName: "active",
    dataType: SqlDataType.BIT,
    filterTypes: MetaUiFilterType.BOOLEAN,
  });
  const enumField = makeField({
    fieldName: "status",
    dataType: SqlDataType.NVARCHAR,
    selectOptions: "0;NEW;新|1;USED;已启用|-1;DEPRECATED;已弃用",
    filterTypes: MetaUiFilterType.TEXT | MetaUiFilterType.SET,
  });
  const refField = makeField({
    fieldName: "workDeptID",
    dataType: SqlDataType.INT,
    selectOptions:
      "HAS_ONE Department(deptID,deptName,parentDeptID) AS workDepartment WHERE(status>0)",
    filterTypes: MetaUiFilterType.SET | MetaUiFilterType.MULTI,
  });

  it("文本 contains → CONTAINS；isnull → IS_NULL", () => {
    expect(
      gridFiltersToModel(
        [{ field: "name", operator: "contains", value: "张" }],
        [textField] as any,
      ),
    ).toEqual({ name: { filterType: "text", operator: "CONTAINS", value: "张" } });
    expect(
      gridFiltersToModel([{ field: "name", operator: "isnull" }], [
        textField,
      ] as any),
    ).toEqual({ name: { filterType: "text", operator: "IS_NULL" } });
  });

  it("数字上下界 → BETWEEN", () => {
    expect(
      gridFiltersToModel(
        [
          { field: "qty", operator: "greaterthanorequal", value: 10 },
          { field: "qty", operator: "lessthanorequal", value: 20 },
        ],
        [numField] as any,
      ),
    ).toEqual({
      qty: { filterType: "number", operator: "BETWEEN", value: 10, valueTo: 20 },
    });
  });

  it("布尔 equal → boolean 值；isnull → null", () => {
    expect(
      gridFiltersToModel([{ field: "active", operator: "equal", value: true }], [
        boolField,
      ] as any),
    ).toEqual({ active: { filterType: "boolean", value: true } });
    expect(
      gridFiltersToModel([{ field: "active", operator: "isnull" }], [
        boolField,
      ] as any),
    ).toEqual({ active: { filterType: "boolean", value: null } });
  });

  it("enum equal 按 label 解析为 code 集合；notequal 取补集", () => {
    expect(
      gridFiltersToModel(
        [
          { field: "status", operator: "equal", value: "新" },
          { field: "status", operator: "equal", value: "已启用" },
        ],
        [enumField] as any,
      ).status,
    ).toEqual({ filterType: "set", operator: "IN", values: ["NEW", "USED"] });
    expect(
      gridFiltersToModel(
        [{ field: "status", operator: "notequal", value: "DEPRECATED" }],
        [enumField] as any,
      ).status,
    ).toEqual({ filterType: "set", operator: "IN", values: ["NEW", "USED"] });
  });

  it("REF/HAS_ONE equal → set IN 原值", () => {
    expect(
      gridFiltersToModel(
        [
          { field: "workDeptID", operator: "equal", value: 3 },
          { field: "workDeptID", operator: "equal", value: 8 },
        ],
        [refField] as any,
      ),
    ).toEqual({
      workDeptID: { filterType: "set", operator: "IN", values: [3, 8] },
    });
  });

  it("比较 + 集合混合 → multi", () => {
    const model = gridFiltersToModel(
      [
        { field: "status", operator: "contains", value: "N" },
        { field: "status", operator: "equal", value: "新" },
      ],
      [enumField] as any,
    ).status as any;
    expect(model.filterType).toBe("multi");
    expect(model.filterModels).toHaveLength(2);
    expect(model.filterModels[1]).toEqual({
      filterType: "set",
      operator: "IN",
      values: ["NEW"],
    });
  });
});

describe("SfRuiFieldFactory", () => {
  const makeContext = (values: Record<string, unknown>) =>
    ({
      getFieldValue: (field: MetaUiField) => values[field.fieldName],
      setFieldValue: vi.fn((field: MetaUiField, value: unknown) => {
        values[field.fieldName] = value;
      }),
      displayField: (field: MetaUiField) => values[field.fieldName],
      isFieldReadonly: () => false,
      isInvalid: () => false,
      select: vi.fn(),
    }) as unknown as UiContext;

  it("绑定 Syncfusion factory，继承 rui 基类", () => {
    const ff = new SfRuiFieldFactory();
    expect(ff).toBeInstanceOf(RuiFieldFactory);
    expect((ff as any).factory).toBeInstanceOf(SfRuiFactory);
  });

  it("inplaceFieldEditor 命名回归守卫（dispatch 键）", () => {
    const ff = new SfRuiFieldFactory() as any;
    expect(typeof ff.inplaceFieldEditor).toBe("function");
    const field = makeField({
      fieldName: "x",
      dataType: SqlDataType.VARCHAR,
      renderer: "inplaceFieldEditor",
    });
    expect(ff[field.renderer!]).toBe(ff.inplaceFieldEditor);
  });

  it("textInput 渲染器：包 control 壳，值进 / onChange 出", () => {
    const ff = new SfRuiFieldFactory();
    const field = makeField({
      fieldName: "name",
      dataType: SqlDataType.VARCHAR,
      placeholder: "名称",
    });
    const values: Record<string, unknown> = { name: "hello" };
    const ctx = makeContext(values);
    const node = ff.textInput(field, ctx) as ReactElement;
    expect(node.type).toBe("div");
    expect(propsOf(node).className).toContain("mmda-control");
    const input = childrenOf(node)[0];
    expect(input.type).toBe(TextBoxComponent);
    expect(propsOf(input).value).toBe("hello");
    propsOf(input).input({ value: "world" });
    expect(ctx.setFieldValue).toHaveBeenCalledWith(field, "world");
    expect(values.name).toBe("world");
  });

  it("fallbackInput 按 dataType 路由：布尔 → checkBox", () => {
    const ff = new SfRuiFieldFactory();
    const field = makeField({
      fieldName: "active",
      dataType: SqlDataType.BIT,
    });
    const ctx = makeContext({ active: true });
    const node = ff.fallbackInput(field, ctx) as ReactElement;
    const inner = childrenOf(node)[0];
    expect(inner.type).toBe(CheckBoxComponent);
    expect(propsOf(inner).checked).toBe(true);
  });
});

describe("插件映射器（纯函数，不加载可选 EJ2 包）", () => {
  it("scheduler：事件 / 资源 / 视图映射与回读", () => {
    const events = mapUiEventsToEj2([
      {
        id: 1,
        title: "例会",
        start: "2026-09-22T10:00:00",
        end: "2026-09-22T11:00:00",
        allDay: true,
        display: "background",
        resourceId: "r1",
      } as any,
    ]);
    expect(events[0].Id).toBe(1);
    expect(events[0].Subject).toBe("例会");
    expect(events[0].StartTime).toBeInstanceOf(Date);
    expect(events[0].IsAllDay).toBe(true);
    expect(events[0].IsBlock).toBe(true);
    expect(events[0].OwnerId).toBe("r1");

    const back = ej2RecordToUiEvent(events[0]);
    expect(back.id).toBe(1);
    expect(back.title).toBe("例会");
    expect(back.allDay).toBe(true);
    expect(back.display).toBe("background");
    expect(back.resourceId).toBe("r1");

    expect(mapUiResourcesToEj2([{ id: "r1", title: "甲", color: "#fff" } as any])).toEqual([
      { Id: "r1", Text: "甲", Color: "#fff" },
    ]);
    expect(EJ2_SCHEDULER_VIEWS.day).toBe("Day");
    expect(EJ2_SCHEDULER_VIEWS.timelineWeek).toBe("TimelineWeek");
  });

  it("kanban：tags / 卡片 / 列映射与回读", () => {
    expect(tagsToString(["a", "b"])).toBe("a,b");
    expect(tagsToString("x")).toBe("x");
    expect(tagsFromString("a, b,,")).toEqual(["a", "b"]);
    expect(tagsFromString(null)).toEqual([]);

    const row = uiCardToEj2({
      id: 1,
      title: "任务",
      status: "Open",
      summary: "摘要",
      tags: ["急"],
      custom: "保留",
    } as any);
    expect(row).toMatchObject({
      Id: 1,
      Title: "任务",
      Status: "Open",
      Summary: "摘要",
      Tags: "急",
      custom: "保留",
    });
    const card = ej2RecordToUiCard(row);
    expect(card).toMatchObject({
      id: 1,
      title: "任务",
      status: "Open",
      summary: "摘要",
      tags: ["急"],
      custom: "保留",
    });

    expect(
      uiColumnsToEj2([
        { key: "Open", header: "开放", collapsed: true, maxCount: 5 } as any,
      ]),
    ).toEqual([
      {
        keyField: "Open",
        headerText: "开放",
        allowToggle: true,
        isExpanded: false,
        maxCount: 5,
        showItemCount: true,
      },
    ]);
  });

  it("pivot：dataSourceSettings 轴 / 聚合 / 格式", () => {
    const settings = toEj2DataSourceSettings({
      data: [{ region: "东", amount: 10 }],
      rows: [{ name: "region", caption: "区域" }],
      columns: [{ name: "quarter" }],
      values: [{ name: "amount", aggregate: "Sum" }],
      formats: [{ name: "amount", format: "N0" }],
      expandAll: true,
    } as any);
    expect(settings.dataSource).toEqual([{ region: "东", amount: 10 }]);
    expect(settings.rows).toEqual([{ name: "region", caption: "区域" }]);
    expect(settings.columns).toEqual([{ name: "quarter" }]);
    expect(settings.values).toEqual([{ name: "amount", type: "Sum" }]);
    expect(settings.formatSettings).toEqual([{ name: "amount", format: "N0" }]);
    expect(settings.expandAll).toBe(true);
  });

  it("ribbon：tabs → groups → collections → items", () => {
    const onClick = vi.fn();
    const tabs = mapUiTabsToEj2([
      {
        header: "主页",
        groups: [
          {
            header: "剪贴板",
            collections: [
              {
                items: [
                  { type: "button", label: "粘贴", icon: "e-paste", onClick },
                  {
                    type: "dropDown",
                    label: "插入",
                    items: [{ label: "表格", onClick }],
                  },
                ],
              },
            ],
          },
        ],
      } as any,
    ]);
    const items = (tabs[0].groups as any[])[0].collections[0].items as any[];
    expect(items[0].type).toBe("Button");
    expect(items[0].buttonSettings.content).toBe("粘贴");
    items[0].buttonSettings.clicked();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(items[1].type).toBe("DropDown");
    items[1].dropDownSettings.select({ item: { text: "表格" } });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("diagram：形状 / 节点 / 连线 / 符号面板", () => {
    expect(vuiShapeToEj2({ family: "bpmn", kind: "startEvent" } as any)).toEqual({
      type: "Bpmn",
      shape: "Event",
      event: { event: "Start" },
    });
    expect(vuiShapeToEj2({ family: "flow", kind: "terminator" } as any)).toEqual({
      type: "Flow",
      shape: "Terminator",
    });
    expect(vuiShapeToEj2({ family: "er", kind: "attribute" } as any)).toEqual({
      type: "Basic",
      shape: "Ellipse",
    });
    expect(vuiShapeToEj2(undefined)).toEqual({ type: "Basic", shape: "Rectangle" });

    const node = vuiNodeToEj2({
      id: "n1",
      text: "开始",
      shape: { family: "flow", kind: "terminator" },
    } as any);
    expect(node.id).toBe("n1");
    expect(node.offsetX).toBe(100);
    expect(node.annotations).toEqual([{ content: "开始" }]);
    expect(node.shape).toEqual({ type: "Flow", shape: "Terminator" });

    const connector = vuiConnectorToEj2({
      id: "c1",
      sourceId: "a",
      targetId: "b",
      text: "流转",
    } as any);
    expect(connector).toMatchObject({
      id: "c1",
      sourceID: "a",
      targetID: "b",
    });

    const palette = paletteSymbolsOf([
      {
        id: "er",
        title: "ER",
        items: [{ id: "attr", label: "属性", shape: { family: "er", kind: "attribute" } }],
      } as any,
    ]);
    expect(palette[0].symbols[0]).toMatchObject({
      id: "attr",
      shape: { type: "Basic", shape: "Ellipse" },
    });
  });

  it("gantt：任务映射与回读", () => {
    const rows = mapUiTasksToEj2([
      {
        id: 1,
        name: "立项",
        startDate: "2026-09-01",
        endDate: "2026-09-05",
        progress: 40,
        parentId: 0,
        type: "milestone",
      } as any,
    ]);
    expect(rows[0]).toMatchObject({
      TaskID: 1,
      TaskName: "立项",
      Duration: undefined,
      Progress: 40,
      Milestone: true,
    });
    expect(rows[0].StartDate).toBeInstanceOf(Date);
    expect(rows[0].EndDate).toBeInstanceOf(Date);

    const back = ej2RecordToUiTask(rows[0]);
    expect(back).toMatchObject({
      id: 1,
      name: "立项",
      parentId: 0,
      progress: 40,
      type: "milestone",
    });
  });

  it("chart：工厂成员齐备，bullet 映射，未知图走 fallback", () => {
    const charts = createSfChartFactory();
    for (const name of [
      "chart", "lineChart", "barChart", "pieChart", "bullet",
      "sankey", "sparkline", "stockChart", "comboChart",
    ]) {
      expect(typeof (charts as any)[name], name).toBe("function");
    }

    const bullet = charts.bullet({
      value: 70,
      target: 90,
      min: 0,
      max: 100,
      ranges: [{ from: 0, to: 50, color: "red" }],
    } as any) as ReactElement;
    const p = propsOf(bullet);
    expect(p.dataSource).toEqual([{ value: 70, target: 90 }]);
    expect(p.minimum).toBe(0);
    expect(p.maximum).toBe(100);
    expect(p.ranges).toEqual([{ start: 0, end: 50, color: "red" }]);

    const gauge = charts.circularGauge({} as any) as ReactElement;
    expect(isValidElement(gauge)).toBe(true);
  });

  it("chartAsPlugin：按 chartKind 分发到工厂方法", () => {
    const pieChart = vi.fn(() => "pie-node");
    const plugin = chartAsPlugin({ pieChart } as any);
    const node = plugin.buildUi(null as any, {
      chartKind: "pie",
      data: { rows: [] },
    } as any);
    expect(pieChart).toHaveBeenCalledWith(
      { rows: [] },
      expect.objectContaining({ chartKind: "pie" }),
    );
    expect(node).toBe("pie-node");
  });
});
