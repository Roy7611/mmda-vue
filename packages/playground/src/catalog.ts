import { reactive } from "vue";
import {
  DEFAULT_PAGE_SIZE,
  EntityState,
  MetaUi,
  MetaUiField,
  ModuleFactory,
  ModuleOp,
  ModuleStatus,
  ModuleVersion,
  SqlDataType,
  type EntitySearchParam,
  type MetaUiPack,
  type Module,
  type PagedList,
} from "@mmda/core";

export const DEMO_PREFIX = "/DEMO";

const field = (
  fieldName: string,
  displayLabel: string,
  dataType = SqlDataType.NVARCHAR,
  nullable = true,
  fieldIdx = 0,
  extra: Record<string, unknown> = {},
) =>
  new MetaUiField({
    fieldName,
    displayLabel,
    dataType,
    nullable,
    fieldIdx,
    listed: true,
    sortable: true,
    ...extra,
  });

export type Product = {
  id: string;
  rowNum: string;
  code: string;
  name: string;
  price: number;
  status: string;
  categoryId: string;
  enabled: boolean;
  editable: boolean;
  deletable: boolean;
  entityState: number;
};

export type Category = {
  id: string;
  rowNum: string;
  name: string;
  parentId: string;
  icon: string;
  editable: boolean;
  deletable: boolean;
  entityState: number;
};

const entityFlags = {
  editable: true,
  deletable: true,
  entityState: EntityState.DEFAULT,
};

export const productRows = reactive<Product[]>([
  {
    id: "1",
    rowNum: "1",
    code: "P-001",
    name: "演示商品",
    price: 99,
    status: "ACTIVE",
    categoryId: "11",
    enabled: true,
    ...entityFlags,
  },
  {
    id: "2",
    rowNum: "2",
    code: "P-002",
    name: "第二件商品",
    price: 128,
    status: "DRAFT",
    categoryId: "12",
    enabled: true,
    ...entityFlags,
  },
  {
    id: "3",
    rowNum: "3",
    code: "P-003",
    name: "归档配件",
    price: 36,
    status: "ARCHIVED",
    categoryId: "21",
    enabled: false,
    ...entityFlags,
  },
  {
    id: "4",
    rowNum: "4",
    code: "P-004",
    name: "树节点商品",
    price: 56,
    status: "ACTIVE",
    categoryId: "21",
    enabled: true,
    ...entityFlags,
  },
  {
    id: "5",
    rowNum: "5",
    code: "P-005",
    name: "演示灯具",
    price: 188,
    status: "ACTIVE",
    categoryId: "11",
    enabled: true,
    ...entityFlags,
  },
  {
    id: "6",
    rowNum: "6",
    code: "P-006",
    name: "包装盒",
    price: 12,
    status: "DRAFT",
    categoryId: "12",
    enabled: true,
    ...entityFlags,
  },
]);

export const categoryRows = reactive<Category[]>([
  {
    id: "1",
    rowNum: "1",
    name: "成品",
    parentId: "",
    icon: "fas fa-box",
    ...entityFlags,
  },
  {
    id: "11",
    rowNum: "2",
    name: "电器",
    parentId: "1",
    icon: "fas fa-plug",
    ...entityFlags,
  },
  {
    id: "12",
    rowNum: "3",
    name: "日用",
    parentId: "1",
    icon: "fas fa-cube",
    ...entityFlags,
  },
  {
    id: "2",
    rowNum: "4",
    name: "配件",
    parentId: "",
    icon: "fas fa-cogs",
    ...entityFlags,
  },
  {
    id: "21",
    rowNum: "5",
    name: "螺丝",
    parentId: "2",
    icon: "fas fa-wrench",
    ...entityFlags,
  },
]);

export const productMeta = new MetaUi({
  objName: "Product",
  displayLabel: "商品",
  primaryKey: "id",
  uniqueKey: "code",
  labelKey: "name",
  groups: [
    {
      groupName: "base",
      groupLabel: "基本信息",
      many: false,
      fields: [
        field("code", "编码", SqlDataType.NVARCHAR, false, 0),
        field("name", "名称", SqlDataType.NVARCHAR, false, 1),
        field("price", "价格", SqlDataType.DECIMAL, false, 2),
        field("status", "状态", SqlDataType.NVARCHAR, false, 3, {
          selectOptions: "1;ACTIVE;在售|0;DRAFT;草稿|2;ARCHIVED;下架",
        }),
        field("categoryId", "分类", SqlDataType.NVARCHAR, true, 4),
        field("enabled", "启用", SqlDataType.BIT, true, 5),
      ],
    },
  ],
});

export const categoryMeta = new MetaUi({
  objName: "Category",
  displayLabel: "分类",
  primaryKey: "id",
  uniqueKey: "name",
  labelKey: "name",
  groups: [
    {
      groupName: "base",
      groupLabel: "基本信息",
      many: false,
      fields: [
        field("name", "名称", SqlDataType.NVARCHAR, false, 0),
        field("parentId", "上级", SqlDataType.NVARCHAR, true, 1),
        field("icon", "图标", SqlDataType.NVARCHAR, true, 2),
      ],
    },
  ],
});

const productPack: MetaUiPack = { metaui: productMeta };
const categoryPack: MetaUiPack = { metaui: categoryMeta };

export const playgroundPacks: Record<string, MetaUiPack> = {
  Products: productPack,
  Catalog: productPack,
  Categories: categoryPack,
};

function feature(
  moduleCode: string,
  moduleLabel: string,
  moduleUrl: string,
  objName: string,
  icon: string,
): Module {
  return {
    moduleCode,
    moduleLabel,
    moduleType: "FEATURE",
    moduleIcon: icon,
    moduleVersion: ModuleVersion.FREE,
    objName,
    allowOps: ModuleOp.READ | ModuleOp.EDIT | ModuleOp.CREATE | ModuleOp.DELETE,
    moduleUrl,
    requiredCreateParam: false,
    status: ModuleStatus.RELEASED,
    divider: false,
  };
}

export const playgroundModules: Module[] = [
  {
    moduleCode: "D.01",
    moduleLabel: "vui-agnaive",
    moduleType: "MODULE",
    moduleIcon: "fas fa-layer-group",
    moduleVersion: ModuleVersion.FREE,
    allowOps: ModuleOp.READ,
    moduleUrl: DEMO_PREFIX,
    requiredCreateParam: false,
    status: ModuleStatus.RELEASED,
    divider: false,
    subModules: [
      feature(
        "D.01.001",
        "商品列表",
        `${DEMO_PREFIX}/Products`,
        "Product",
        "fas fa-table",
      ),
      feature(
        "D.01.002",
        "分类树",
        `${DEMO_PREFIX}/Categories`,
        "Category",
        "fas fa-sitemap",
      ),
      feature(
        "D.01.003",
        "分类 + 商品",
        `${DEMO_PREFIX}/Catalog`,
        "Product",
        "fas fa-columns",
      ),
    ],
  },
];

export const playgroundModuleFactory = new ModuleFactory(playgroundModules);

export function nextId(rows: { id: string }[]) {
  return String(Math.max(0, ...rows.map((row) => Number(row.id) || 0)) + 1);
}

export function pageOf<T>(list: T[], param?: EntitySearchParam): PagedList<T> {
  const pageNo = param?.pager?.pageNo ?? 1;
  const pageSize = param?.pager?.pageSize ?? DEFAULT_PAGE_SIZE;
  const start = (pageNo - 1) * pageSize;
  return {
    list: list.slice(start, start + pageSize).map((item) => ({ ...item })),
    pagination: {
      pageNo,
      pageSize,
      pageCount: Math.max(1, Math.ceil(list.length / pageSize) || 1),
      recordCount: list.length,
    },
  };
}

export function descendantIds(rootId?: string) {
  if (!rootId) return undefined;
  const ids = new Set([rootId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const item of categoryRows) {
      if (item.parentId && ids.has(item.parentId) && !ids.has(item.id)) {
        ids.add(item.id);
        grew = true;
      }
    }
  }
  return ids;
}
