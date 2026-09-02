/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from "vue-router";
import { h, ref } from "vue";
import {
  type MetaUiService,
  type Module,
  type MetaUiField,
  type UiContext,
  defaultPager,
  EntityAction,
  ApiClient,
  MetaModel,
  isRefNone,
  EntityUrlParam,
  defineEntityArray,
  isNullOrUndefined,
} from "@mmda/core";
import {
  type UiLogicInit,
  type UiViewOptions,
  UiLogic,
  UiGroupLogic,
  type UiLogicFnResult,
  UiViewManyKind,
  UiViewOne,
} from "@mmda/vui";
import { type Material, defineMaterial } from "../../models/Material";
import {
  type MaterialFeature,
  defineMaterialFeature,
} from "../../models/MaterialFeature";
import {
  type MaterialMedia,
  defineMaterialMedia,
} from "../../models/MaterialMedia";
import { type Sku, defineSku } from "../../models/Sku";
import {
  type MaterialPartner,
  defineMaterialPartner,
} from "../../models/MaterialPartner";
import { type Partner, definePartner } from "../../models/Partner";
import { UsageStatus } from "../../enums/UsageStatus";
import { MaterialType, MaterialTypeEnum } from "../../enums/MaterialType";
import { type MaterialCat, defineMaterialCat } from "../../models/MaterialCat";
// 展示物料用途
const isHide = ref(true);
/**
 * 物料交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:58.0
 * @revision 2024-09-01 23:08:29.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 物料交互逻辑
 */
export class MaterialLogic extends UiLogic<Material> {
  constructor(init: UiLogicInit) {
    super(defineMaterial, init);
    this.beforeSave = (context: UiContext<Material>, model: Material) => {
      const category =
        context.getFieldCurrentOption("categoryID") ?? model.category;
      if (category) {
        (model as Material & { materialX?: string }).materialX =
          category.materialX ?? "";
      }
      return Promise.resolve(true);
    };
    this.addRelativeLogic<MaterialFeature>(
      "features",
      (master) => new MaterialFeatureLogic(this, master),
    );
    this.addRelativeLogic<MaterialMedia>(
      "medias",
      (master) => new MaterialMediaLogic(this, master),
    );
    this.addRelativeLogic<Sku>("skus", (master) => new SkuLogic(this, master));
    this.addRelativeLogic<MaterialPartner>(
      "partNos",
      (master) => new MaterialPartnerLogic(this, master),
    );
    this.viewOptions = {
      index: () => ({
        viewKind: UiViewManyKind.categoryList,
        foreignKey: "categoryID",
        showTreeSearchBar: true,
        treeOption: () => ({
          repository: "MaterialCats",
          loadMode: "lazy",
          preloader: () => this.preloadCats(),
          fields: {
            id: "categoryID",
            label: "categoryName",
            parentId: "parentCatID",
            children: "children",
            childrenCount: "childrenCount",
          },
          editMode: "contextMenu",
          showTreeFooter: true,
          selected: this.currentCategory?.categoryID,
          selectedNode: this.currentCategory,
          footerContent: (cat: MaterialCat) =>
            h(
              "span",
              { class: "mmda-tree-view-footer-label" },
              [
                cat.categoryCode,
                cat.categoryName,
                cat.materialType
                  ? MaterialTypeEnum.textOf(cat.materialType)
                  : "",
                cat.childrenCount,
              ]
                .filter((value) => value !== undefined && value !== "")
                .join(" · "),
            ),
          onNodeSelect: (node: MaterialCat | MaterialCat[]) => {
            this.currentCategory = Array.isArray(node) ? node[0] : node;
          },
        }),
      }),
    };
  }
  currentCategory?: MaterialCat;
  viewOptions: UiViewOptions = {};

  async create(
    param: any = {},
    entityUrlParam?: EntityUrlParam,
  ): Promise<Material> {
    const categoryID = this.currentCategory?.categoryID ?? "";
    return super.create(
      Object.assign({}, param, {
        categoryID,
        refID: categoryID,
        refName: categoryID ? "MaterialCat" : "",
      }),
      entityUrlParam,
    );
  }

  async preloadCats() {
    return this.loadCats("");
  }

  private async loadCats(parentId: string) {
    const data = await this.apiClient.searchEntities(
      {
        pager: { pageNo: 1, pageSize: 1000 },
        queryParams: { parentCatID: parentId },
      },
      { repository: "MaterialCats", service: this.apiService ?? "base" },
    );
    return defineEntityArray(defineMaterialCat, (data.list ?? []) as object[]);
  }

  beforeIndex(): UiLogicFnResult<Material> {
    const { fields, groups, customActions } = super.beforeIndex();
    if (fields.length === 0) {
      fields.push(
        this.field("status").searchable(true),
        this.field("supportPackage").searchable(true),
        this.field("trackingMode").searchable(true),
        this.field("materialType").searchable(true),
      );
    }
    return { fields, groups, customActions };
  }
  /**
   * 设置编辑交互逻辑
   */
  beforeEdit() {
    const { fields, groups, customActions } = super.beforeEdit();
    if (fields.length == 0) {
      fields.push(
        this.field("materialType").hideIf(() => isHide.value),
        this.field("categoryID").onChange((context, model, newVal) => {
          if (newVal) {
            const category = context.getFieldCurrentOption("categoryID");
            if (!category) return;
            (model as Material & { materialX?: string }).materialX =
              category.materialX ?? "";
            isHide.value = false;
            context.setFieldValue("materialType", {
              value: category.materialType,
              text: MaterialTypeEnum.textOf(category.materialType),
            });
          } else {
            (model as Material & { materialX?: string }).materialX = "";
            isHide.value = true;
          }
        }),
        //customJson 字段暂显示图号信息
        this.field("customJson")
          .setCustomRenderer((fld, ctx: UiContext<Material>, props) => {
            const drawing = JSON.parse(ctx.model.customJson || "{}").drawing;
            return h("div", drawing);
          })
          .lock(),
      );
      // /**
      // fields.push(
      // 	this.field('fldName')
      // 		.lockIf(model=>model.prop1)
      // 		.hideIf(model=>model.prop2)
      // 		.onChange<string>((ctx,model,newVal,oldVal)=>{ })
      // 		.onValidate<string>((value,model)=>{ })
      // );
      //  */
    }
    if (groups.length == 0) {
      groups.push(
        this.group<MaterialFeature>("features").defaultAdder(
          this.newMaterialFeature,
        ),
        this.group<MaterialMedia>("medias").defaultAdder(this.newMaterialMedia),
        this.group<MaterialPartner>("partNos").defaultAdder(
          this.newMaterialPartner,
        ),
        this.group<Sku>("skus").addCustomAction({
          name: "createSku",
          label: "action.add",
          icon: "far fa-plus-circle",
          role: "info",
          onAction: this.newSku,
          visible: (m: Material) => m.featuredSku,
          view: UiViewOne.Edit,
        }),
        // .field('materialPic')
        // .inPlaceEdit().parent
        // this.group<Sku>('skus').defaultAdder(this.newSku),
      );
      /**
			fields.push(
				this.group<I>('grpName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange((ctx,model,items)=>{ })
			);
			 */
    }
    return { fields, groups, customActions };
  }

  /**
   * 创建物料特征
   * @param context 界面上下文
   * @param target 项目模板
   */
  newMaterialFeature(context: UiContext<Material>, target: Material) {
    context
      .createSubGroupItems({
        group: "features",
        target,
        propsMapper: {
          featureCode: (m) => {
            const i = 0;
            if (Array.isArray(m.features) && m.features.length > 0) {
              const num = Number(m.features[m.features.length - 1].rowNum) + 1;
              return `Color-${num}`;
            } else {
              return `Color-${i + 1}`;
            }
          },
          materialID: (m) => ({
            materialID: target.materialID,
            materialCode: target.materialCode,
          }),
        },
        creator: defineMaterialFeature,
      })
      .then((item) => {
        if (item) {
          context.addSubGroupItem("features", item as MaterialFeature);
        }
      });
  }

  /**
   * 创建物料附件
   * @param context 界面上下文
   * @param target 项目模板
   */
  newMaterialMedia(context: UiContext<Material>, target: Material) {
    context
      .newSubGroupItem<MaterialMedia>({
        group: "medias",
        sequenceKey: "itemID",
        target,
      })
      .then((item) => {
        if (item) {
          context.addSubGroupItem("medias", item);
        }
      });
  }

  /**
   * 创建Sku
   * @param context 界面上下文
   * @param target 项目模板
   */
  newSku(context: UiContext<Material>, target: Material) {
    context
      .newSubGroupItem<Sku>({
        group: "skus",
        target,
      })
      .then((item) => {
        if (item) {
          context.addSubGroupItem("skus", item);
        }
      });
  }

  /**
   * 创建供货号
   * @param context 界面上下文
   * @param target 项目模板
   */
  newMaterialPartner(context: UiContext<Material>, target: Material) {
    context
      .select<Partner>({
        repository: "Partners",
        searchParam: {
          pager: defaultPager(),
          queryParams: {
            status: `NOT IN ${UsageStatus.DEPRECATED}`,
          },
        },
        selectionMode: "multiple",
        ctor: definePartner,
      })
      .then((selection: any) => {
        if (selection) {
          // 取相同的数据
          const items = selection.filter((item: any) =>
            MetaModel.hasAnyLike(target.partNos, { partnerID: item.partnerID }),
          );
          if (items.length > 0)
            return context.uiBuilder.toast(context, {
              severity: "error",
              summary: context.globalProps.$t("dialog.title.error"),
              group: "br",
              detail: context.globalProps.$t("invalid.requiredPartners"),
              life: 3000,
            });
          context.addSubGroupItems<MaterialPartner>({
            target,
            group: "partNos",
            source: selection,
            propsMapper: {
              partnerID: (m) => ({
                partnerID: m.partnerID,
                partnerCode: m.partnerCode,
                partnerName: m.partnerName,
              }),
            },
          });
        }
      });
  }

  //设置详情逻辑
  beforeDetails(): UiLogicFnResult<Material> {
    const { fields, groups, customActions } = super.beforeDetails();
    const drawingField = this.field("customJson");
    (drawingField.field as any).displayLabel = "view.drawingNo";
    if (fields.length == 0) {
      fields.push(
        this.field("materialPic").setCustomRenderer(
          (fld, ctx: UiContext<Material>, props) => {
            const fldVal = ctx.getFieldValue(fld);
            if (!fldVal) return null;
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  height: "100%",
                },
              },
              [
                ctx.uiBuilder.factory.image(fldVal, {
                  width: "70",
                  height: "70",
                  imageStyle: {
                    width: "70px",
                    height: "70px",
                    objectFit: "contain",
                  },
                  style: { width: "70px", height: "70px" },
                  preview: true,
                }),
              ],
            );
          },
        ),

        //customJson 字段暂显示图号信息
        this.field("customJson").setCustomRenderer(
          (fld, ctx: UiContext<Material>, props) => {
            const drawing = JSON.parse(ctx.model.customJson || "{}").drawing;
            return h("div", drawing);
          },
        ),
      );
    }
    if (groups.length == 0) {
      groups.push(
        this.group<MaterialPartner>("partNos").hideIf(
          (m) => !m.partNos || m.partNos.length === 0,
        ),
      );
    }
    return { fields, groups, customActions };
  }
}

/**
 * 构造物料交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const MaterialLogicCtor = (
  metaUiService: MetaUiService,
  router: Router,
  module?: Module,
) =>
  new MaterialLogic({
    metaUiService: metaUiService,
    repository: "Materials",
    router,
    module: module || metaUiService.findModule("Material"),
  });
/**
 * 特征交互逻辑
 */
export class MaterialFeatureLogic extends UiGroupLogic<
  MaterialFeature,
  Material
> {
  constructor(parent: MaterialLogic, master: Material) {
    super(defineMaterialFeature, parent, master, "features");
  }
}
/**
 * 媒体文件交互逻辑
 */
export class MaterialMediaLogic extends UiGroupLogic<MaterialMedia, Material> {
  constructor(parent: MaterialLogic, master: Material) {
    super(defineMaterialMedia, parent, master, "medias");
  }
}
/**
 * 特征交互逻辑
 */
export class SkuMaterialFeatureLogic extends UiGroupLogic<
  MaterialFeature,
  Sku
> {
  constructor(parent: SkuLogic, master: Sku) {
    super(defineMaterialFeature, parent, master, "features");
  }
}
/**
 * 特征交互逻辑
 */
export class SkuMaterialMediaLogic extends UiGroupLogic<MaterialMedia, Sku> {
  constructor(parent: SkuLogic, master: Sku) {
    super(defineMaterialMedia, parent, master, "medias");
  }
}
/**
 * SKU交互逻辑
 */
export class SkuLogic extends UiGroupLogic<Sku, Material> {
  constructor(parent: MaterialLogic, master: Material) {
    super(defineSku, parent, master, "skus");
    this.addRelativeLogic<MaterialFeature>(
      "features",
      (master) => new SkuMaterialFeatureLogic(this, master),
    );
    this.addRelativeLogic<MaterialMedia>(
      "medias",
      (master) => new SkuMaterialMediaLogic(this, master),
    );
  }
}
/**
 * 供货号交互逻辑
 */
export class MaterialPartnerLogic extends UiGroupLogic<
  MaterialPartner,
  Material
> {
  constructor(parent: MaterialLogic, master: Material) {
    super(defineMaterialPartner, parent, master, "partNos");
  }
  beforeEdit(): UiLogicFnResult<MaterialPartner> {
    const { fields, groups, customActions } = super.beforeEdit();
    if (fields.length === 0) {
      fields.push(
        this.field("packID").setSearchParam((context, model, fld) => ({
          status: UsageStatus.USED,
        })),
      );
    }

    return { fields, groups, customActions };
  }
}
// export class MaterialMediaLogic extends UiGroupLogic<MaterialMedia, Sku> {
// 	constructor(parent: MaterialLogic, master: Material) {
// 		super(defineMaterialMedia, parent, master, 'medias')

// 	}
// }
//#endregion ~GENERATED PARTS END
