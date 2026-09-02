import { EntityState, type EntitySearchParam } from "@mmda/core";
import { UiLogic, UiViewManyKind, type UiLogicInit } from "@mmda/vui";
import {
  categoryRows,
  descendantIds,
  nextId,
  pageOf,
  productRows,
  type Category,
  type Product,
} from "./catalog";

const asProduct = (value: object) => value as Product;
const asCategory = (value: object) => value as Category;

function matchWord(item: Product, word: string) {
  if (!word) return true;
  const needle = word.toLowerCase();
  return (
    item.code.toLowerCase().includes(needle) ||
    item.name.toLowerCase().includes(needle) ||
    item.status.toLowerCase().includes(needle)
  );
}

export class ProductLogic extends UiLogic<Product> {
  constructor(init: UiLogicInit) {
    super(asProduct, init);
  }

  async getAll(param?: EntitySearchParam) {
    const word = param?.searchWord ?? "";
    const list = productRows.filter((item) => matchWord(item, word));
    return pageOf(list, param);
  }

  async load(id: string) {
    const item = productRows.find((row) => row.id === id);
    if (!item) throw new Error(`Product ${id} not found`);
    return { ...item };
  }

  async create() {
    return {
      id: "",
      rowNum: "",
      code: "",
      name: "",
      price: 0,
      status: "ACTIVE",
      categoryId: "",
      enabled: true,
      editable: true,
      deletable: true,
      entityState: EntityState.CREATED,
    };
  }

  async save(model: Product) {
    const saved = { ...model };
    if (!saved.id) {
      saved.id = nextId(productRows);
      saved.rowNum = saved.id;
      saved.entityState = EntityState.DEFAULT;
      productRows.push(saved);
    } else {
      const index = productRows.findIndex((row) => row.id === saved.id);
      if (index >= 0) productRows[index] = saved;
    }
    return { ...saved };
  }

  async delete(id: string) {
    const index = productRows.findIndex((row) => row.id === id);
    if (index >= 0) productRows.splice(index, 1);
    return true;
  }

  async deleteAll(idList: string[]) {
    const remove = new Set(idList);
    for (let i = productRows.length - 1; i >= 0; i -= 1) {
      if (remove.has(productRows[i]!.id)) productRows.splice(i, 1);
    }
    return true;
  }

  async initMetadata() {
    return this.meta;
  }
}

export class CatalogLogic extends ProductLogic {
  currentCategoryId = "";

  constructor(init: UiLogicInit) {
    super(init);
    this.viewOptions = {
      index: (ctx) => ({
        viewKind: UiViewManyKind.categoryList,
        tree: () => ({
          data: categoryRows,
          fields: {
            id: "id",
            label: "name",
            parentId: "parentId",
            icon: "icon",
          },
          showIcon: true,
          showTreeSearchBar: true,
          showTreeFooter: true,
          selected: this.currentCategoryId,
          onNodeSelect: (node: Category | Category[]) => {
            const current = Array.isArray(node) ? node[0] : node;
            this.currentCategoryId = current?.id ?? "";
            ctx.searchParam.pager.pageNo = 1;
            void (ctx as { search?: () => Promise<unknown> }).search?.();
          },
        }),
      }),
    };
  }

  async getAll(param?: EntitySearchParam) {
    const word = param?.searchWord ?? "";
    const ids = descendantIds(this.currentCategoryId);
    const list = productRows.filter(
      (item) => matchWord(item, word) && (!ids || ids.has(item.categoryId)),
    );
    return pageOf(list, param);
  }
}

export class CategoryLogic extends UiLogic<Category> {
  constructor(init: UiLogicInit) {
    super(asCategory, init);
  }

  async getAll(param?: EntitySearchParam) {
    return pageOf(categoryRows, param);
  }

  async load(id: string) {
    const item = categoryRows.find((row) => row.id === id);
    if (!item) throw new Error(`Category ${id} not found`);
    return { ...item };
  }

  async create() {
    return {
      id: "",
      rowNum: "",
      name: "",
      parentId: "",
      icon: "fas fa-folder",
      editable: true,
      deletable: true,
      entityState: EntityState.CREATED,
    };
  }

  async save(model: Category) {
    const saved = { ...model };
    if (!saved.id) {
      saved.id = nextId(categoryRows);
      saved.rowNum = saved.id;
      saved.entityState = EntityState.DEFAULT;
      categoryRows.push(saved);
    } else {
      const index = categoryRows.findIndex((row) => row.id === saved.id);
      if (index >= 0) categoryRows[index] = saved;
    }
    return { ...saved };
  }

  async delete(id: string) {
    const index = categoryRows.findIndex((row) => row.id === id);
    if (index >= 0) categoryRows.splice(index, 1);
    return true;
  }

  async initMetadata() {
    return this.meta;
  }
}
