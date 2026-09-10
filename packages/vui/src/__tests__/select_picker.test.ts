import { describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import {
  MetaUi,
  MetaUiField,
  ModuleVersion,
  SqlDataType,
  defineEntity,
} from "@mmda/core";
import { VueUiContext } from "../contexts/vue_ui_context";
import { UiViewMany } from "../contexts/view";

const hostMeta = new MetaUi({
  objName: "Material",
  displayLabel: "物料",
  groups: [
    {
      groupName: "base",
      groupLabel: "基本",
      many: false,
      fields: [
        new MetaUiField({
          fieldName: "categoryID",
          displayLabel: "物料类别",
          fieldIdx: 0,
          dataType: SqlDataType.NVARCHAR,
          nullable: true,
        }),
      ],
    },
  ],
});

const catMeta = new MetaUi({
  objName: "MaterialCat",
  displayLabel: "物料类别",
  groups: [
    {
      groupName: "base",
      groupLabel: "基本",
      many: false,
      fields: [
        new MetaUiField({
          fieldName: "categoryName",
          displayLabel: "名称",
          fieldIdx: 0,
          dataType: SqlDataType.NVARCHAR,
          nullable: true,
          listed: true,
        }),
        new MetaUiField({
          fieldName: "code",
          displayLabel: "编码",
          fieldIdx: 1,
          dataType: SqlDataType.NVARCHAR,
          nullable: true,
          listed: true,
        }),
      ],
    },
  ],
});

/** dialog 收到宿主 VNode 时立刻跑一次 render，模拟弹层挂载。 */
function mountDialogContent(content: any) {
  const Comp = content?.type;
  if (Comp && typeof Comp.setup === "function") {
    const render = Comp.setup(
      content.props ?? {},
      {
        attrs: {},
        slots: {},
        emit: () => undefined,
        expose: () => undefined,
      } as any,
    );
    if (typeof render === "function") render();
  }
}

describe("select picker build", () => {
  it("selectOne 弹层走 ui.build，不走 buildView；无模块只读", async () => {
    const build = vi.fn((ctx: any) =>
      h("div", {
        class: "mmda-select-list",
        "data-view": String(ctx.view ?? ""),
      }),
    );
    const buildView = vi.fn(() => h("div", { class: "mmda-select-form" }));
    const dialog = vi.fn(async (content: any) => {
      mountDialogContent(content);
      return "cancel" as const;
    });

    const ctx = new VueUiContext({
      model: { id: "1" },
      metaUi: hostMeta,
      view: "edit",
      app: {
        name: "base",
        meta: {
          getPack: async () => ({
            metaUi: catMeta,
            filters: [],
          }),
          getApiClient: () => ({
            searchAll: async () => ({
              list: [],
              pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
            }),
          }),
          findModule: () => undefined,
        },
        findModule: () => undefined,
        di: {
          injectAsync: async () => {
            throw new Error("not registered");
          },
        },
        ui: {
          build,
          buildView,
          dialog,
          overlay: { closeTopDialog: async () => undefined },
        },
        i18n: { global: { t: (k: string) => k } },
      } as any,
    });

    await ctx.select({
      repository: "MaterialCats",
      selectionMode: "single",
    });

    expect(build).toHaveBeenCalledTimes(1);
    expect(buildView).not.toHaveBeenCalled();
    const selectCtx = build.mock.calls[0]![0];
    expect(selectCtx.view).toBe(UiViewMany.SelectOne);
    expect(selectCtx.logic.createEntity).toBe(defineEntity);
    expect(selectCtx.module?.authority).toEqual(
      expect.objectContaining({
        allowRead: false,
        allowCreate: false,
        allowEdit: false,
        allowDelete: false,
      }),
    );
    expect(build.mock.calls[0]![1]).toEqual(
      expect.objectContaining({
        selectionMode: "single",
        showToolbar: true,
        showSearchbar: true,
        showBreadcrumb: false,
        showActions: false,
        showActionColumn: false,
        loading: selectCtx.loading,
      }),
    );
    expect(dialog).toHaveBeenCalled();
  });

  it("DI 命中业务 Logic 且有模块时跟 Index 权限", async () => {
    const module = {
      moduleCode: "A.01",
      moduleLabel: "物料类别",
      moduleType: "FEATURE" as const,
      moduleVersion: ModuleVersion.NONE,
      objName: "MaterialCat",
      authority: {
        allowRead: true,
        allowCreate: true,
        allowEdit: true,
        allowDelete: false,
        allowPrint: false,
        allowExport: false,
        allowImport: false,
        allowUpload: false,
        allowDownload: false,
      },
    };

    const createEntity = vi.fn((source: object) =>
      defineEntity({ ...source, hydrated: true }),
    );
    const injectedLogic = {
      createEntity,
      meta: undefined as any,
      module: undefined as any,
      repository: "MaterialCats",
      initMetadata: async () => {
        injectedLogic.meta = { metaUi: catMeta, filters: [] };
        return injectedLogic.meta;
      },
      applyTo: async () => undefined,
      beforeSearch: () => undefined,
      getAll: async () => ({
        list: [],
        pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
      }),
    };
    const build = vi.fn(() => h("div", { class: "mmda-select-list" }));
    const dialog = vi.fn(async (content: any) => {
      mountDialogContent(content);
      return "cancel" as const;
    });

    const ctx = new VueUiContext({
      model: { id: "1" },
      metaUi: hostMeta,
      view: "edit",
      app: {
        name: "base",
        meta: {
          getPack: async () => ({
            metaUi: catMeta,
            filters: [],
          }),
          getApiClient: () => ({
            searchAll: async () => ({
              list: [],
              pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
            }),
          }),
          findModule: (name: string) =>
            name === "MaterialCat" ? module : undefined,
        },
        findModule: (name: string) =>
          name === "MaterialCat" ? module : undefined,
        di: {
          injectAsync: async (token: string) => {
            expect(token).toBe("base:MaterialCatsLogic");
            return injectedLogic;
          },
        },
        ui: {
          build,
          buildView: vi.fn(),
          dialog,
          overlay: { closeTopDialog: async () => undefined },
        },
        i18n: { global: { t: (k: string) => k } },
      } as any,
    });

    await ctx.select({
      repository: "MaterialCats",
      selectionMode: "single",
    });

    expect(build).toHaveBeenCalledTimes(1);
    const selectCtx = build.mock.calls[0]![0];
    expect(selectCtx.logic).toBe(injectedLogic);
    expect(selectCtx.logic.createEntity).toBe(createEntity);
    expect(build.mock.calls[0]![1]).toEqual(
      expect.objectContaining({
        showActions: true,
        showActionColumn: true,
      }),
    );
  });

  it("宿主跟踪 loading 可再次 build", async () => {
    const builds: any[] = [];
    const build = vi.fn((ctx: any, props: any) => {
      builds.push({ loading: props.loading?.value });
      return h("div", { class: "mmda-select-list" });
    });
    let hostRender: (() => unknown) | undefined;
    const dialog = vi.fn(async (content: any) => {
      const Comp = content?.type as ReturnType<typeof defineComponent>;
      hostRender = Comp.setup!(
        {},
        {
          attrs: {},
          slots: {},
          emit: () => undefined,
          expose: () => undefined,
        } as any,
      ) as () => unknown;
      hostRender();
      return "cancel" as const;
    });

    const ctx = new VueUiContext({
      model: { id: "1" },
      metaUi: hostMeta,
      view: "edit",
      app: {
        name: "base",
        meta: {
          getPack: async () => ({
            metaUi: catMeta,
            filters: [],
          }),
          getApiClient: () => ({
            searchAll: async () => ({
              list: [],
              pagination: { pageNo: 1, pageSize: 20, recordCount: 0 },
            }),
          }),
          findModule: () => undefined,
        },
        findModule: () => undefined,
        di: {
          injectAsync: async () => {
            throw new Error("not registered");
          },
        },
        ui: {
          build,
          buildView: vi.fn(),
          dialog,
          overlay: { closeTopDialog: async () => undefined },
        },
        i18n: { global: { t: (k: string) => k } },
      } as any,
    });

    await ctx.select({
      repository: "MaterialCats",
      selectionMode: "single",
    });

    expect(build).toHaveBeenCalledTimes(1);
    const selectCtx = build.mock.calls[0]![0];
    selectCtx.loading.value = true;
    hostRender?.();
    expect(build).toHaveBeenCalledTimes(2);
    expect(builds[1]?.loading).toBe(true);
  });
});
