// @ts-nocheck
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { h, nextTick } from "vue";
import { L10n } from "@syncfusion/ej2-base";
import {
  MetaUi,
  MetaUiGroup,
  ModuleFactory,
  ModuleOp,
  ModuleStatus,
  ModuleVersion,
  auth,
} from "@mmda/core";
import { MMDA_COLOR_PALETTE_IDS, UiViewMany, isLocalAppModuleUrl } from "@mmda/vui";
import {
  applySyncfusionLocale,
  resolveSyncfusionCulture,
} from "../syncfusion_i18n";
import { SyncfusionUiBuilder } from "../syncfusion_builder";
import { createSyncfusionFieldFactory } from "../syncfusion_field_factory";
import { createSyncfusionUiFactory, autoFitSyncfusionListGrid } from "../syncfusion_factory";
import { syncfusionLayout } from "../syncfusion_layout";
import { PhotoGallery } from "../components/PhotoGallery";
import { FilesUploader } from "../components/FilesUploader";

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
    expect(factory.table).toBeTypeOf("function");
    expect(factory.dialog).toBeTypeOf("function");
    expect(factory.photoGallery).toBeTypeOf("function");
    expect(factory.filesUploader).toBeTypeOf("function");
    expect(factory.resolveIcon("save")).toBe("e-icons e-save");
    expect(factory.resolveIcon("clear")).toBe("e-icons e-erase");
    expect(factory.resolveIcon("add")).toBe("e-icons e-plus");
    expect(factory.formItem).toBeTypeOf("function");
    expect(factory.dataTable).toBeTypeOf("function");
    expect(factory.datePicker).toBeTypeOf("function");
    expect(factory.numberInput).toBeTypeOf("function");
    expect(factory.select).toBeTypeOf("function");
    expect(factory.toggleSwitch).toBeTypeOf("function");
    expect(factory.dataViewBox).toBeTypeOf("function");
  });

  it("maps unified gantt tasks onto EJ2 fields and view modes", async () => {
    const { mapUiTasksToEj2, GANTT_VIEW_MODES } = await import("../components/GanttChart");
    const rows = mapUiTasksToEj2(
      [
        { id: 1, name: "Cut", startDate: "2026-01-01", parentId: null, type: "task" },
        { id: 2, name: "Pack", startDate: "2026-01-02", parentId: 1, type: "milestone" },
      ],
      [{ source: 1, target: 2, type: "FS" }],
    );
    expect(rows[1].Predecessor).toBe("1FS");
    expect(rows[1].Milestone).toBe(true);
    expect(rows[0].TaskName).toBe("Cut");
    expect(GANTT_VIEW_MODES.week.timelineViewMode).toBe("Week");
    const builder = new SyncfusionUiBuilder();
    const vnode = builder.buildGanttChart({} as any, {
      tasks: [{ id: 1, name: "Cut" }],
      readonly: true,
    });
    expect(vnode.props.tasks).toEqual([{ id: 1, name: "Cut" }]);
    expect(vnode.props.readonly).toBe(true);
  });

  it("renders photo thumbnails and opens the fullscreen carousel", () => {
    const emit = vi.fn();
    const render = (PhotoGallery as any).setup(
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
    expect(grid.props.class).toBe("mmda-photo-gallery__grid");
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

  it("queues multiple files and reports custom upload progress", async () => {
    const emit = vi.fn();
    const upload = vi.fn(
      async (
        files: File[],
        control: { onProgress: (value: number) => void },
      ) => {
        control.onProgress(48);
        return files.map((file) => `/files/${file.name}`);
      },
    );
    let exposed: any;
    const render = (FilesUploader as any).setup(
      {
        upload,
        multiple: true,
        autoUpload: false,
        disabled: false,
        allowedExtensions: ".jpg,.png",
        maxFileSize: undefined,
        dropText: "拖放图片",
        chooseText: "选择图片",
        uploadText: "上传",
        clearText: "清空",
      },
      {
        emit,
        expose: (value: any) => {
          exposed = value;
        },
      },
    );
    const first = new File(["a"], "front.jpg", { type: "image/jpeg" });
    const second = new File(["b"], "back.png", { type: "image/png" });
    const initial = render();
    const uploader = initial.children[0].children[0];
    uploader.props.selected({
      filesData: [{ rawFile: first }, { rawFile: second }],
    });
    await nextTick();

    expect(render().children[1].children[0].children).toHaveLength(2);
    await exposed.start();
    expect(upload).toHaveBeenCalledWith(
      [first, second],
      expect.objectContaining({
        signal: expect.any(AbortSignal),
        onProgress: expect.any(Function),
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      "success",
      ["/files/front.jpg", "/files/back.png"],
      [first, second],
    );
  });

  it("dialog defaults to draggable, resizable, and close icon", () => {
    const factory = createSyncfusionUiFactory();
    const vnode = factory.dialog(
      { visible: true, onUpdateVisible: () => undefined, header: "选择" },
      { default: () => null },
    );
    expect(vnode.props?.allowDragging).toBe(true);
    expect(vnode.props?.enableResize).toBe(true);
    expect(vnode.props?.showCloseIcon).toBe(true);
    expect(vnode.props?.header).toContain("选择");
    expect(vnode.props?.header).toContain("mmda-sf-dialog__title");
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
    expect(fields.DropdownList).toBe(fields.dropdown);
    expect(fields.DatePicker).toBe(fields.datePicker);
    expect(fields.FileUpload).toBe(fields.fileUpload);
    expect(fields.QuantityUnit).toBe(fields.quantityUnit);
    expect(fields.Chips).toBe(fields.chips);
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
    const chips = vnode.children as any[];
    expect(vnode.props.class).toContain("e-chip-list");
    expect(chips.map((chip) => chip.children[0].children)).toEqual([
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

  it("maps reference dropdown options to text/value instead of raw objects", () => {
    const fields = createSyncfusionFieldFactory();
    const category = {
      categoryID: "C1",
      categoryName: "原料",
    };
    const reference = {
      hasOne: true,
      isRef: false,
      alias: "category",
      refFlds: ["categoryID", "categoryName"],
      refOptions: [category],
      valueOf: (option: any) => option?.categoryID,
      labelOf: (option: any) => option?.categoryName,
    };
    const setFieldValue = vi.fn();
    const context = {
      model: { categoryID: "C1", category },
      // HAS_ONE：getFieldValue 返回导航属性
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

    const vnode = fields.dropdown(field, context);
    const dropdown = vnode.children[0] as any;
    expect(dropdown.props.dataSource).toEqual([category]);
    expect(dropdown.props.fields).toEqual({
      text: "categoryName",
      value: "categoryID",
    });
    expect(dropdown.props.value).toBe("C1");

    dropdown.props.change({ value: "C1", itemData: category });
    expect(setFieldValue).toHaveBeenCalledWith(field, category);
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
      }),
      getSearchForRelativeOptions: () => ({
        searchWord: category,
        isComposing: false,
      }),
      searchRelative: vi.fn(),
      setFieldValue: vi.fn(),
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
      (child: any) => child?.props?.appendTemplate === "appendTemplate",
    );
    expect(textbox).toBeTruthy();
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

  it("constructs the builder against the new AbstractUiBuilder contract", () => {
    const builder = new SyncfusionUiBuilder();
    expect(builder.factory.layout.fieldMessage).toBe(false);
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

  it("renders the metadata name field as a details link", () => {
    const metaui = new MetaUi({
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
      metaui,
      module: {},
      getFieldLogic: () => ({}),
      details,
    } as any;
    const builder = new SyncfusionUiBuilder();
    const link = builder.displayCellFor(
      metaui.getField("materialCode")!,
      { materialID: "m1", materialCode: "M001" },
      context,
      { tableMetaui: metaui },
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
    const vnode = builder.moreMenuButton({ t: (k: string) => k } as any, [
      { name: "import", label: "导入", onAction: () => undefined },
      { name: "export", label: "导出", onAction: () => undefined },
      { name: "print", label: "打印", onAction: () => undefined },
    ])[0];
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
    const vnode = builder.moreMenuButton({ t: (k: string) => k } as any, [
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
        name: "listSettings",
        label: "表格设置",
        onAction: () => undefined,
      },
    ])[0];
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

  it("uses DropupMenuButton when popupPlacement opens upward", () => {
    const builder = new SyncfusionUiBuilder();
    const vnode = builder.factory.menuButton(
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
    ).toMatch(/DropupMenuButton|MmdaDropupMenuButton/i);
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
      name: "SyncfusionAppMenu",
    });
    const systemsBar = builder.buildAppSideBar({
      modules,
      header: () => null,
    });
    expect(systemsBar.type).toMatchObject({
      name: "SyncfusionAppMenu",
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
      }).props?.class,
    ).toBe("mmda-sf-sidebar");
  });

  it("uses a real href for MES feature links while running as BASE", () => {
    expect(isLocalAppModuleUrl("base", "/MES/Stations")).toBe(false);
    expect(isLocalAppModuleUrl("base", "/BASE/Departments")).toBe(true);
  });

  it("binds table dataSource as a plain array copy", () => {
    const factory = createSyncfusionUiFactory();
    const selectedItems: any[] = [];
    const metaui = {
      getListedFields: () => [{ fieldName: "name", displayLabel: "名称" }],
      groups: [],
      primaryKey: "id",
    } as any;
    const rows = [{ id: "1", name: "a" }];
    const vnode = gridOf(
      factory.table(rows, metaui, {
        selectedItems,
        selectionMode: "multiple",
      }),
    );
    expect(vnode.props?.dataSource).toEqual(rows);
    expect(vnode.props?.dataSource).not.toBe(rows);
    expect(vnode.key).toContain("mmda-sf-grid-");
  });

  it("enables Grid column grouping by default and can disable it", () => {
    const factory = createSyncfusionUiFactory();
    const metaui = {
      objName: "Material",
      getListedFields: () => [
        { fieldName: "categoryName", displayLabel: "物料类别" },
        { fieldName: "materialCode", displayLabel: "物料编码" },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const enabledHost = factory.table([], metaui, {
      pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
    });
    const enabled = gridOf(enabledHost);
    expect(enabled.props?.allowGrouping).toBe(true);
    expect(enabled.props?.enableVirtualization).toBe(true);
    expect(enabled.props?.allowPaging).toBe(false);
    expect(enabled.props?.groupSettings).toEqual(
      expect.objectContaining({
        showDropArea: true,
        showGroupedColumn: false,
        disablePageWiseAggregates: true,
      }),
    );
    const category = enabled.props?.columns?.find(
      (column: any) => column?.field === "categoryName",
    );
    expect(category?.allowGrouping).toBe(true);

    const disabled = gridOf(factory.table([], metaui, { enableGroup: false }));
    expect(disabled.props?.allowGrouping).toBe(false);
    expect(disabled.props?.groupSettings).toBeUndefined();
  });

  it("resolves custom binding after client-side grouping on paginated lists", async () => {
    const factory = createSyncfusionUiFactory();
    const metaui = {
      objName: "Material",
      getListedFields: () => [
        { fieldName: "category", displayLabel: "类别" },
        { fieldName: "name", displayLabel: "名称" },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const rows = [
      { id: "1", category: "A", name: "alpha" },
      { id: "2", category: "A", name: "beta" },
      { id: "3", category: "B", name: "gamma" },
    ];
    const vnode = gridOf(
      factory.table(rows, metaui, {
        pagination: { pageNo: 1, pageSize: 20, recordCount: 3 },
      }),
    );
    const ej2Grid = { dataSource: { result: rows, count: rows.length } };
    vnode.props.ref?.({ ej2Instances: ej2Grid });

    vnode.props.dataStateChange({
      action: { requestType: "grouping" },
      group: [{ field: "category" }],
    });
    await nextTick();

    expect(Array.isArray(ej2Grid.dataSource?.result)).toBe(true);
    expect(ej2Grid.dataSource.count).toBe(ej2Grid.dataSource.result.length);
  });

  it("uses row virtualization and an external Pager for list pages", () => {
    const factory = createSyncfusionUiFactory();
    const onPage = vi.fn();
    const metaui = {
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
    const host = factory.table(rows, metaui, {
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
      "name",
    ]);
    expect(columns[1]).toMatchObject({
      allowSorting: false,
      textAlign: "Left",
      headerTextAlign: "Left",
      template: "mmdaCell_rowNum",
      customAttributes: { class: "mmda-sf-rownum-col" },
      freeze: "Left",
    });
    expect(columns[2]).toMatchObject({
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

    const rowNumCell = slots.mmdaCell_rowNum({ data: rows[0] });
    expect(rowNumCell.props.class).toBe("mmda-sf-rownum__index");
    expect(rowNumCell.children).toBe("21");
  });

  it("renders three flat row actions by default without a dropdown", () => {
    const factory = createSyncfusionUiFactory();
    const metaui = {
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
      factory.table([row], metaui, {
        rowMenu: (item: any) => [
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
    const metaui = {
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
      factory.table([row], metaui, {
        showActions: true,
        rowMenu: (item: any) => [
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
    const metaui = {
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
      factory.table([{ id: "1", qty: 12, status: 1, name: "a" }], metaui, {}),
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
    const metaui = {
      objName: "Product",
      getListedFields: () => [
        { fieldName: "name", displayLabel: "名称", dataType: 48 },
        { fieldName: "code", displayLabel: "编码", dataType: 48 },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const vnode = gridOf(
      factory.table([row], metaui, {
        inplaceEdit: true,
        inplaceEditStart: "click",
        editableFields: ["name"],
        canEditCell: (item) => item.editable,
        onCellSave,
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
      row,
      expect.objectContaining({ fieldName: "name" }),
      "新名称",
      "旧名称",
    );
    expect(onCellSave.mock.calls[0][0]).toBe(row);

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
    const metaui = {
      objName: "Product",
      getListedFields: () => [
        { fieldName: "name", displayLabel: "名称", dataType: 48 },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const vnode = gridOf(
      factory.table([{ id: "1", name: "旧" }], metaui, {
        inplaceEdit: true,
        inplaceEditStart: "excel",
        editableFields: ["name"],
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
    const metaui = {
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
      factory.table(rows, metaui, {
        filterDisplay: "menu",
        pagination: { pageNo: 1, pageSize: 20, recordCount: 1 },
        onFilterModelChange,
      }),
    );
    expect(vnode.props?.filterSettings).toEqual({ type: "Menu" });
    const columns = vnode.props.columns.filter(
      (column: any) => column?.field && column.field !== "rowNum",
    );
    expect(columns[0].filter).toMatchObject({
      type: "CheckBox",
    });
    expect(columns[0].filter.itemTemplate).toBeUndefined();
    expect(columns[0].filter.dataSource).toEqual([
      { category: "RAW", text: "原材料", __mmdaChoice: true },
      { category: "PART", text: "零件", __mmdaChoice: true },
    ]);
    expect(columns[0].foreignKeyField).toBeUndefined();
    expect(columns[0].dataSource).toBeUndefined();
    expect(columns[1].filter).toEqual({ type: "Menu" });

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
    const metaui = {
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
      factory.table([], metaui, {
        filterDisplay: "menu",
        pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
      }),
    );
    const column = vnode.props.columns.find(
      (item: any) => item?.field === "materialType",
    );
    expect(column.filter.type).toBe("CheckBox");
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
    const metaui = {
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
      factory.table([], metaui, {
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
    const metaui = {
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
      factory.table([], metaui, {
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
    const metaui = {
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
      factory.table([], metaui, {
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
    expect(columns[3].filter).toEqual({ type: "Menu" });

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
    const metaui = {
      objName: "Order",
      getListedFields: () => [
        { fieldName: "amount", displayLabel: "金额", dataType: 68 },
        { fieldName: "orderedAt", displayLabel: "日期", dataType: 184 },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const vnode = gridOf(
      factory.table([], metaui, {
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

  it("uses DateTimePicker controls for datetime BETWEEN", () => {
    const factory = createSyncfusionUiFactory();
    const metaui = {
      objName: "Order",
      getListedFields: () => [
        { fieldName: "orderedAt", displayLabel: "日期", dataType: 184 },
      ],
      groups: [],
      primaryKey: "id",
    } as any;
    const vnode = gridOf(
      factory.table([], metaui, {
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
          value: "between",
          change: undefined,
        },
      },
    });
    const controls = Array.from(target.querySelectorAll("input"))
      .map((input: any) => input.ej2_instances?.[0])
      .filter(Boolean);
    expect(controls.map((control: any) => control.getModuleName())).toEqual([
      "datetimepicker",
      "datetimepicker",
    ]);
    dateColumn.filter.ui.destroy();
    target.remove();
  });

  it("builds module breadcrumb from parent chain", () => {
    const factory = new ModuleFactory([
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
    ]);
    const dept = factory.findModuleByName("Department")!;
    const builder = new SyncfusionUiBuilder();
    const vnode = builder.buildModuleBreadcrumb({ title: "部门" } as any, {
      module: dept,
    });
    expect(vnode.type).toBe("nav");
    expect((vnode.props as any)?.class).toContain("mmda-sf-breadcrumb");
    const kids = vnode.children as any[];
    const linkItem = kids.find((c) => c?.props?.class === "e-breadcrumb-item");
    const link = linkItem?.children?.[0];
    expect(link?.props?.to).toBe("/BASE/org");
    expect(link?.type?.name ?? link?.type).toMatch(/RouterLink/);
    const leafItem = [...kids]
      .reverse()
      .find((c) => c?.props?.class === "e-breadcrumb-item");
    const leafLabel = leafItem?.children?.[0]?.children?.[1]?.children;
    expect(leafLabel).toBe("部门");
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
      metaui: { objName: "Department", displayLabel: "部门" },
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
    expect(JSON.stringify(withDeleteButtons)).toContain("listSettings");
    expect(JSON.stringify(withoutDeleteButtons)).toContain("listSettings");
    expect(JSON.stringify(withDeleteButtons)).toContain("autoFitColumns");
    expect(JSON.stringify(withDeleteButtons).indexOf("autoFitColumns")).toBeLessThan(
      JSON.stringify(withDeleteButtons).indexOf("listSettings"),
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

    const metaui = new MetaUi({
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
    const pack = { metaui, filters: [], sorts: [] };
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
      metaui,
      t: (key: string) => key,
      filters: [],
      searchParam: { pager: { sorts: [] } },
      logic: {
        repository: "Items",
        meta: { metaui: staleMetaUi, filters: [], sorts: [] },
        metaUiService: { updateForCache },
      },
    } as any;

    await autoFitSyncfusionListGrid(context);

    expect(autoFitColumns).toHaveBeenCalledWith(["name", "code"]);
    expect(metaui.getField("name")?.listSize).toBe(180);
    expect(metaui.getField("code")?.listSize).toBe(96);
    expect(staleMetaUi.getField("name")?.listSize).toBe(120);
    expect(updateForCache).toHaveBeenCalledWith(
      "Items",
      expect.objectContaining({ metaui }),
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
      metaui: { objName: "Material", displayLabel: "物料" },
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
    expect(String(buttons[5].props.cssClass ?? "")).toContain("mmda-btn-tonal");
    expect(buttons[5].props.iconCss).toBeFalsy();
    expect(String(buttons[0].props.cssClass ?? "")).toContain("mmda-btn-tonal");
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
