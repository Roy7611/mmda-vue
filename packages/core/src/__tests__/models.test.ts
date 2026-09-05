import { describe, expect, it } from "vitest";
import { entityActionFactory, EntityActionType } from "../metaui/metaui_action";
import { SqlDataType } from "../metaui/datatype";
import { MetaUiField } from "../metaui/metaui_field";
import {
  assignSearchParam,
  defaultSearchParam,
  EntityState,
  isDifferentSearchParam,
} from "../models/entity";
import { SortOrder } from "../models/pagination";
import { MetaModel } from "../models/metamodel";
import {
  auth,
  ModuleFactory,
  ModuleOp,
  ModuleStatus,
  ModuleVersion,
} from "../metaui/module";
import type { Attachment, ReportTemplate } from "../models/file";
import { createMockMetaUi } from "./helpers/metaui_mock";

function row(partial: Record<string, unknown>) {
  return {
    rowNum: "1",
    entityState: EntityState.DEFAULT,
    ...partial,
  } as any;
}

describe("EntityAction", () => {
  it("工厂生成标准按钮声明", () => {
    const onAction = (): void => {};
    expect(entityActionFactory.create(onAction)).toEqual({
      id: `${EntityActionType.CREATE}-button`,
      name: EntityActionType.CREATE,
      role: "primary",
      onAction,
    });
    expect(entityActionFactory.save(onAction).role).toBe("danger");
    expect(entityActionFactory.edit(onAction).role).toBe("primary");
  });
});

describe("EntitySearchParam", () => {
  it("defaultSearchParam 带默认分页", () => {
    const param = defaultSearchParam("仓");
    expect(param.searchWord).toBe("仓");
    expect(param.pager.pageSize).toBe(20);
    expect(param.pager.pageNo).toBe(1);
  });

  it("assignSearchParam 覆盖分页和查询条件", () => {
    const to = defaultSearchParam();
    assignSearchParam(to, {
      pager: { pageSize: 50, pageNo: 2 },
      searchWord: "A",
      queryParams: { status: "OPEN" },
    });
    expect(to.pager.pageSize).toBe(50);
    expect(to.pager.pageNo).toBe(2);
    expect(to.searchWord).toBe("A");
    expect(to.queryParams).toEqual({ status: "OPEN" });
  });

  it("isDifferentSearchParam 比较分页、关键词和 queryParams", () => {
    const a = defaultSearchParam("x");
    const b = defaultSearchParam("x");
    expect(isDifferentSearchParam(a, b)).toBe(false);
    b.searchWord = "y";
    expect(isDifferentSearchParam(a, b)).toBe(true);
    const c = defaultSearchParam();
    c.queryParams = { a: 1 };
    const d = defaultSearchParam();
    d.queryParams = { a: 2 };
    expect(isDifferentSearchParam(c, d)).toBe(true);
  });

  it("复制和比较包含 sorts 与 filterModel", () => {
    const source = defaultSearchParam();
    source.pager.sorts = [{ sortBy: "name", sortOrder: SortOrder.DESC }];
    source.filterModel = {
      name: { filterType: "text", operator: "CONTAINS", value: "A" },
    };
    const copy = assignSearchParam(defaultSearchParam(), source);

    expect(isDifferentSearchParam(copy, source)).toBe(false);
    copy.filterModel!.name = {
      filterType: "text",
      operator: "CONTAINS",
      value: "B",
    };
    expect(isDifferentSearchParam(copy, source)).toBe(true);
  });
});

describe("MetaModel 状态与集合", () => {
  it("created / modified / destroy 按位判断", () => {
    const e = row({ entityState: EntityState.CREATED });
    expect(MetaModel.isEntity(e)).toBe(true);
    expect(MetaModel.created(e)).toBe(true);
    expect(MetaModel.dirty(e)).toBe(true);
    MetaModel.modify(e);
    expect(MetaModel.createdForModified(e)).toBe(true);
    MetaModel.destroy(e);
    expect(MetaModel.deleted(e)).toBe(true);
    expect(e.entityState).toBe(EntityState.DELETED);
  });

  it("sum / count 忽略已删除项（count 看 entityState）", () => {
    const items = [
      row({ qty: 2, entityState: EntityState.DEFAULT }),
      row({ qty: 3, entityState: EntityState.DELETED }),
      row({ qty: 4, entityState: EntityState.CREATED }),
    ];
    expect(MetaModel.count(items)).toBe(2);
    expect(MetaModel.maxRowNum(items)).toBe(1);
    expect(MetaModel.hasAny(items, (it) => it.qty === 4)).toBe(true);
    expect(MetaModel.hasAnyLike(items, { qty: 2 })).toBe(true);
  });

  it("addItem 递增 rowNum；deleteItem 对新建行直接移除", () => {
    const items: any[] = [
      row({ rowNum: "3", entityState: EntityState.DEFAULT }),
    ];
    const created = row({ entityState: EntityState.CREATED, name: "new" });
    MetaModel.addItem(items, created);
    expect(created.rowNum).toBe("4");
    expect(items).toHaveLength(2);
    MetaModel.deleteItem(items, created);
    expect(items).toHaveLength(1);
    MetaModel.deleteItem(items, items[0]);
    expect(items).toHaveLength(1);
    expect(MetaModel.deleted(items[0])).toBe(true);
  });
});

describe("Module.auth", () => {
  it("EXPORT / IMPORT 位不再互换", () => {
    const flags = auth(ModuleOp.EXPORT | ModuleOp.IMPORT | ModuleOp.READ);
    expect(flags.allowRead).toBe(true);
    expect(flags.allowExport).toBe(true);
    expect(flags.allowImport).toBe(true);
    expect(flags.allowEdit).toBe(false);
    expect(auth(ModuleOp.EXPORT).allowImport).toBe(false);
    expect(auth(ModuleOp.IMPORT).allowExport).toBe(false);
  });

  it("ModuleFactory 按 url 和实体名索引，并冻结 authority", () => {
    const factory = new ModuleFactory([
      {
        moduleCode: "W.01",
        moduleLabel: "仓库",
        moduleType: "FEATURE",
        moduleVersion: ModuleVersion.TEAM,
        allowOps: ModuleOp.READ | ModuleOp.EDIT,
        moduleUrl: "/wms/warehouse",
        requiredCreateParam: false,
        status: ModuleStatus.RELEASED,
        divider: false,
        objName: "Warehouse",
      },
    ]);
    expect(factory.findModuleByName("Warehouse")?.moduleLabel).toBe("仓库");
    expect(
      factory.findModuleByUrl("/wms/warehouse")?.authority?.allowEdit,
    ).toBe(true);
    const authority = factory.findModuleByName("Warehouse")!.authority!;
    expect(Object.isFrozen(authority)).toBe(true);
    expect(Object.isFrozen(authority.authorizedActions)).toBe(true);
    expect(() => {
      (authority as { allowRead: boolean }).allowRead = false;
    }).toThrow();
  });

  it("ModuleFactory 优先保留服务端 authority，缺省时按 allowOps 拆解，并遍历子模块", () => {
    const factory = new ModuleFactory([
      {
        moduleCode: "B",
        moduleLabel: "基础数据",
        moduleType: "SYSTEM",
        moduleVersion: ModuleVersion.TEAM,
        allowOps: 255,
        moduleUrl: "/BASE",
        requiredCreateParam: false,
        status: ModuleStatus.RELEASED,
        divider: false,
        subModules: [
          {
            moduleCode: "B.01",
            moduleLabel: "组织",
            moduleType: "MODULE",
            moduleVersion: ModuleVersion.TEAM,
            allowOps: 255,
            moduleUrl: "/BASE/Org",
            requiredCreateParam: false,
            status: ModuleStatus.RELEASED,
            divider: false,
            subModules: [
              {
                moduleCode: "B.01.001",
                moduleLabel: "部门",
                moduleType: "FEATURE",
                moduleVersion: ModuleVersion.TEAM,
                allowOps: 255,
                authority: {
                  allowRead: true,
                  allowEdit: false,
                  allowCreate: false,
                  allowDelete: false,
                  allowPrint: false,
                  allowExport: false,
                  allowImport: false,
                  allowUpload: false,
                  authScope: "SELF",
                  authorizedActions: [],
                },
                moduleUrl: "/BASE/Departments",
                requiredCreateParam: false,
                status: ModuleStatus.RELEASED,
                divider: false,
                objName: "Department",
              } as any,
            ],
          } as any,
        ],
      } as any,
    ]);
    const root = factory.modules[0]!;
    expect(root.allowOps).toBe(255);
    expect(root.authority?.allowRead).toBe(true); // 无 authority → 按 allowOps
    expect(root.subModules?.[0]?.moduleCode).toBe("B.01");
    expect(root.subModules?.[0]?.subModules?.[0]?.moduleCode).toBe("B.01.001");
    expect(factory.findModuleByName("Department")?.authority?.allowRead).toBe(
      true,
    );
    expect(factory.findModuleByName("Department")?.authority?.allowEdit).toBe(
      false,
    ); // 服务端授权优先，不因 allowOps:255 抬权
  });
});

describe("MetaModel.createEntity / savable", () => {
  it("按元数据字段从原型创建，状态为 CREATED", () => {
    const fld = new MetaUiField({
      fieldIdx: 0,
      fieldName: "whName",
      displayLabel: "仓库",
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
    });
    const metaui = createMockMetaUi([fld]);
    const created = MetaModel.createEntity(
      metaui,
      (o: object) => Object.assign({}, o) as any,
      { whName: "主仓" },
      {},
    );
    expect(created.whName).toBe("主仓");
    expect(MetaModel.created(created)).toBe(true);
  });

  it("无 mapper 时也能从原型创建（select 弹窗列表）", () => {
    const fld = new MetaUiField({
      fieldIdx: 0,
      fieldName: "categoryName",
      displayLabel: "类别",
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
    });
    const metaui = createMockMetaUi([fld]);
    const created = MetaModel.createEntity(
      metaui,
      (o: object) => Object.assign({}, o) as any,
      { categoryName: "砂箱", editable: true, deletable: false },
    );
    expect(created.categoryName).toBe("砂箱");
    expect(MetaModel.created(created)).toBe(true);
  });

  it("mapper 用源字段名填充目标字段", () => {
    const fld = new MetaUiField({
      fieldIdx: 0,
      fieldName: "whName",
      displayLabel: "仓库",
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
    });
    const metaui = createMockMetaUi([fld]);
    const created = MetaModel.createEntity(
      metaui,
      (o: object) => Object.assign({}, o) as any,
      { name: "东仓" },
      { whName: "name" },
    );
    expect(created.whName).toBe("东仓");
  });

  it("savable 去掉 actions 和空值，并标记已修改", () => {
    const fld = new MetaUiField({
      fieldIdx: 0,
      fieldName: "whName",
      displayLabel: "仓库",
      dataType: SqlDataType.NVARCHAR,
      nullable: true,
    });
    const metaui = createMockMetaUi([fld]);
    const payload = MetaModel.savable(
      metaui,
      {
        whName: "主仓",
        actions: [{ name: "save" }],
        unused: null,
        entityState: EntityState.DEFAULT,
      },
      {
        ignoreProperties: ["actions"],
        ignoreNullish: true,
        ignoreDeeply: false,
        keepDirtyOnly: true,
      },
    );
    expect(payload.whName).toBe("主仓");
    expect(payload.actions).toBeUndefined();
    expect(payload.unused).toBeUndefined();
    expect(MetaModel.modified(payload)).toBe(true);
  });
});

describe("Attachment / ReportTemplate", () => {
  it("是带文件字段的 Entity 形状，不挂在 ApiClient 上", () => {
    const attachment: Attachment = {
      rowNum: "1",
      editable: true,
      deletable: true,
      entityState: EntityState.CREATED,
      fileName: "a.pdf",
      fileSize: "12KB",
    };
    const template: ReportTemplate = {
      rowNum: "1",
      editable: true,
      deletable: true,
      entityState: EntityState.DEFAULT,
      templateName: "订单导入",
      templateFile: "/templates/order.xlsx",
      templateID: "t1",
    };
    expect(attachment.fileName).toBe("a.pdf");
    expect(template.templateID).toBe("t1");
  });
});
