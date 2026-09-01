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
  EntityUrlParam,
} from "@mmda/core";
import {
  type UiLogicInit,
  UiLogic,
  UiGroupLogic,
  type UiLogicFnResult,
  UiViewOne,
} from "@mmda/vui";
import { type MaterialCat, defineMaterialCat } from "../../models/MaterialCat";
import { MaterialTypeEnum, MaterialType } from "../../enums/MaterialType";

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

export class MaterialCatLogic extends UiLogic<MaterialCat> {
  constructor(init: UiLogicInit) {
    super(defineMaterialCat, init);
  }
  async create(
    param?: any,
    entityUrlParam?: EntityUrlParam,
  ): Promise<MaterialCat> {
    return await this.apiClient
      .createOne(
        {},
        {
          repository: "MaterialCats",
          service: "base",
          path: `create`,
        },
      )
      .then((res) => {
        const model = this.createEntity(res);
        // model.materialType = MaterialType.TOOLS;
        model.depth = param?.depth ?? 0;
        model.parentID = param?.parentID ?? "";
        model.materialX = param?.materialX ?? "";
        console.log(param, "model.materialX");

        return model;
      });
  }
  beforeIndex() {
    const { fields, groups, customActions } = super.beforeIndex();
    if (fields.length === 0) {
      // fields.push(
      // 	this.field('status').searchable(true),
      // 	this.field('supportPackage').searchable(true),
      // 	this.field('trackingMode').searchable(true),
      // )
    }
    return { fields, groups, customActions };
  }
  private materialXOptions(context: UiContext<MaterialCat>) {
    return [
      { id: 0, value: "ToolFlask", text: context.t("catalog.flask") },
      { id: 1, value: "ToolMeasure", text: context.t("catalog.measure") },
      { id: 2, value: "ToolPattern", text: context.t("catalog.pattern") },
    ];
  }
  /**
   * 设置编辑交互逻辑
   */
  beforeEdit() {
    const { fields, groups, customActions } = super.beforeEdit();
    if (fields.length == 0) {
      fields.push(
        this.field("materialX")
          .lockIf((model, ctx) => !!model.parentID)
          .setCustomRenderer((fld, ctx: UiContext<MaterialCat>, props) => {
            const options = this.materialXOptions(ctx);
            return ctx.uiBuilder.factory.textSpan(
              ctx.model.materialX
                ? options.find((x) => x.value == ctx.model.materialX)?.text
                : "-",
            );
          })
          .setCustomEditor((fld, ctx: UiContext<MaterialCat>, props) => {
            return ctx.uiBuilder.factory.select({
              options: this.materialXOptions(ctx),
              optionLabel: "text",
              optionValue: "value",
              modelValue: ctx.model.materialX,
              onUpdate: (value: any) => {
                ctx.model.materialX = value;
              },
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

  //设置详情逻辑
  //beforeDetails(){}
}

/**
 * 构造物料交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const MaterialCatLogicCtor = (
  metaUiService: MetaUiService,
  router: Router,
  module?: Module,
) =>
  new MaterialCatLogic({
    metaUiService: metaUiService,
    repository: "MaterialCats",
    router,
    module: module || metaUiService.findModule("MaterialCats"),
  });
//#endregion ~GENERATED PARTS END
