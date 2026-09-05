/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from "vue-router";
import {
  MetaUiService,
  Module,
  MetaUiField,
  UiContext,
  defaultPager,
  MetaModel,
  EntityState,
  ApiClient,
  ModuleOp,
  ModuleAuth,
  auth,
  hasBit,
} from "@mmda/core";
import {
  type UiLogicInit,
  UiLogic,
  UiGroupLogic,
  type UiLogicFnResult,
  UiViewOne,
} from "@mmda/vui";
import { type Unit, defineUnit } from "../../models/Unit";
import {
  type UnitConversion,
  defineUnitConversion,
} from "../../models/UnitConversion";
/**
 * 计量单位交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:59.0
 * @revision 2024-07-17 07:38:59.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 计量单位交互逻辑
 */
export class UnitLogic extends UiLogic<Unit> {
  constructor(init: UiLogicInit) {
    super(defineUnit, init);
    this.addRelativeLogic<UnitConversion>(
      "conversions",
      (master) => new UnitConversionLogic(this, master),
    );
  }
  beforeIndex(): UiLogicFnResult<Unit> {
    const { fields, groups, customActions } = super.beforeIndex();
    if (fields.length === 0) {
      fields.push(this.field("unitType"));
    }
    return { fields, groups, customActions };
  }
  /**
   * 设置编辑交互逻辑
   */
  beforeEdit() {
    const { fields, groups, customActions } = super.beforeEdit();
    if (fields.length == 0) {
      /**
			fields.push(
				this.field('fldName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange<string>((ctx,model,newVal,oldVal)=>{ })
					.onValidate<string>((value,model)=>{ })
			);
			 */
      fields.push(
        this.field("roundMode").setCustomEditor(
          (fld, ctx: UiContext<Unit>, props) => {
            const { $ui: ui, $t: t } = ctx.globalProps;
            const fldRef = fld.reference;
            return ui.factory.select({
              modelValue: ctx.model.roundMode,
              optionLabel: "text",
              optionValue: "id",
              options: fldRef.refOptions,
              onUpdate: (value: string) => {
                ctx.model.roundMode = value as any;
                // 状态改为已修改
                MetaModel.modify(ctx.model);
              },
            });
          },
        ),
        this.field("unitType").setCustomEditor(
          (fld, ctx: UiContext<Unit>, props) => {
            const { $ui: ui, $t: t } = ctx.globalProps;
            const fldRef = fld.reference;
            return ui.factory.select({
              modelValue: ctx.model.unitType,
              optionLabel: "text",
              optionValue: "id",
              options: fldRef.refOptions,
              onUpdate: (value: string) => {
                ctx.model.unitType = value as any;
                // 状态改为已修改
                MetaModel.modify(ctx.model);
              },
            });
          },
        ),
      );
    }
    if (groups.length == 0) {
      groups.push(
        this.group<UnitConversion>("conversions").addCustomAction({
          name: "createContractItem",
          label: "action.create",
          icon: "far fa-plus-circle",
          role: "info",
          onAction: this.newUnitConversion,
          view: UiViewOne.Edit,
        }),
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
   * 创建计量单位转换
   * @param context 界面上下文
   * @param target 项目模板
   */
  newUnitConversion(context: UiContext, target: Unit) {
    context
      .createSubGroupItems({
        group: "conversions",
        target,
        propsMapper: {
          unitRight: (m) => {
            const i = 0;
            if (Array.isArray(m.conversions) && m.conversions.length > 0) {
              const num =
                Number(m.conversions[m.conversions.length - 1].rowNum) + 1;
              return `${num}`;
            } else {
              return `${i + 1}`;
            }
          },
        },
        creator: defineUnitConversion,
      })
      .then((item) => {
        if (item) {
          context.addSubGroupItem("conversions", item as UnitConversion);
        }
      });
  }
  //设置详情逻辑
  //beforeDetails(){}
}

/**
 * 构造计量单位交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const UnitLogicCtor = (
  metaUiService: MetaUiService,
  router: Router,
  module?: Module,
) =>
  new UnitLogic({
    metaUiService: metaUiService,
    repository: "Units",
    router,
    module: module || metaUiService.findModule("Unit"),
  });
/**
 * 单位转换交互逻辑
 */
export class UnitConversionLogic extends UiGroupLogic<UnitConversion, Unit> {
  constructor(parent: UnitLogic, master: Unit) {
    super(defineUnitConversion, parent, master, "conversions");
  }
}
//#endregion ~GENERATED PARTS END
