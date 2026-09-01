/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from "vue-router";
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
} from "@mmda/core";
import {
  type UiLogicInit,
  UiLogic,
  UiGroupLogic,
  type UiLogicFnResult,
  UiViewOne,
} from "@mmda/vui";
import { type Carrier, defineCarrier } from "../../models/Carrier";
import {
  type CarrierCatalog,
  defineCarrierCatalog,
} from "../../models/CarrierCatalog";
import {
  type CarrierProduct,
  defineCarrierProduct,
} from "../../models/CarrierProduct";
import {
  type CarrierNProd,
  defineCarrierNProd,
} from "../../models/CarrierNProd";

/**
 * 承运商交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:57.0
 * @revision 2024-09-01 23:08:28.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 承运商交互逻辑
 */
export class CarrierLogic extends UiLogic<Carrier> {
  constructor(init: UiLogicInit) {
    super(defineCarrier, init);
    this.addRelativeLogic<CarrierCatalog>(
      "catalogs",
      (master) => new CarrierCatalogLogic(this, master),
    );
    this.addRelativeLogic<CarrierProduct>(
      "products",
      (master) => new CarrierProductLogic(this, master),
    );

    this.beforeUpload = (
      context: UiContext,
      model: Carrier,
      field: MetaUiField,
    ) => {
      try {
        // 上传文件编码校验补齐
        if (
          !model.carrierCode &&
          (field.fieldName == "apiProdUrl" || field.fieldName == "apiTestUrl")
        ) {
          context.uiBuilder.toast(context, {
            severity: "error",
            summary: context.t("dialog.title.error"),
            detail: context.t("invalid.carrierCodeRequired"),
            group: "br",
          });
          return Promise.reject(false);
        } else {
          return Promise.resolve(true);
        }
      } catch (error: any) {
        return Promise.resolve(false);
      }
    };
  }
  beforeIndex(): UiLogicFnResult<Carrier> {
    const { fields, groups, customActions } = super.beforeIndex();
    if (fields.length === 0) {
      fields.push(this.field("carrierName").searchable(true));
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
        this.field("apiProdUrl").onChange((context, model, newVal, oldVal) => {
          if (isRefNone(model.carrierCode))
            return context.uiBuilder.toast(context, {
              severity: "error",
              summary: context.t("dialog.title.error"),
              detail: context.t("invalid.carrierCodeRequired"),
              // group: 'br',
              life: 3000,
            });
        }),
      );
      /**
			fields.push(
				this.field('fldName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange<string>((ctx,model,newVal,oldVal)=>{ })
					.onValidate<string>((value,model)=>{ })
			);
			 */
    }
    if (groups.length == 0) {
      groups.push(
        this.group<CarrierCatalog>("catalogs").addCustomAction({
          name: "createContractItem",
          label: "action.create",
          icon: "far fa-plus-circle",
          role: "info",
          onAction: this.newCarrierCatalog,
          view: UiViewOne.Edit,
        }),
        this.group<CarrierProduct>("products").addCustomAction({
          name: "createContractItem",
          label: "action.create",
          icon: "far fa-plus-circle",
          role: "info",
          onAction: this.newCarrierProduct,
          view: UiViewOne.Edit,
        }),
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
   * 创建承运商产品服务
   * @param context 界面上下文
   * @param target 项目模板
   */
  newCarrierProduct(context: UiContext<Carrier>, target: Carrier) {
    context
      .select<CarrierNProd>({
        repository: "CarrierNProds",
        searchParam: {
          pager: defaultPager(),
        },
        ctor: defineCarrierNProd,
      })
      .then((selection: any) => {
        if (selection) {
          context.addSubGroupItems<CarrierProduct>({
            target,
            group: "products",
            source: selection,
            propsMapper: {
              prodName: (m) => selection.carrierName,
              prodCode: (m) => selection.carrierProdCode,
              catalogCode: (m) => selection.catalogCode,
              prodDesc: (m) => selection.prodDesc,
            },
          });
        }
      });
  }

  /**
   * 创建承运商服务目录
   * @param context 界面上下文
   * @param target 项目模板
   */
  newCarrierCatalog(context: UiContext<Carrier>, target: Carrier) {
    context
      .select<CarrierNProd>({
        repository: "CarrierNProds",
        searchParam: {
          pager: defaultPager(),
        },
        ctor: defineCarrierNProd,
      })
      .then((selection: any) => {
        if (selection) {
          context.addSubGroupItems<CarrierCatalog>({
            target,
            group: "catalogs",
            source: selection,
            propsMapper: {
              catalogName: (m) => selection.carrierName,
              catalogCode: (m) => selection.carrierCode,
              carrierCode: (m) => target.carrierCode,
            },
          });
        }
      });
  }
  //设置详情逻辑
  //beforeDetails(){}
}

/**
 * 构造承运商交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const CarrierLogicCtor = (
  metaUiService: MetaUiService,
  router: Router,
  module?: Module,
) =>
  new CarrierLogic({
    metaUiService: metaUiService,
    repository: "Carriers",
    router,
    module: module || metaUiService.findModule("Carrier"),
  });
/**
 * 产品目录交互逻辑
 */
export class CarrierCatalogLogic extends UiGroupLogic<CarrierCatalog, Carrier> {
  constructor(parent: CarrierLogic, master: Carrier) {
    super(defineCarrierCatalog, parent, master, "catalogs");
  }
}
/**
 * 产品交互逻辑
 */
export class CarrierProductLogic extends UiGroupLogic<CarrierProduct, Carrier> {
  constructor(parent: CarrierLogic, master: Carrier) {
    super(defineCarrierProduct, parent, master, "products");
  }
}
//#endregion ~GENERATED PARTS END
