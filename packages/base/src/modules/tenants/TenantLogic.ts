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
  cleanProps,
  fasIcon,
} from "@mmda/vui";
import { type Tenant, defineTenant } from "../../models/Tenant";
import {
  type TenantModule,
  defineTenantModule,
} from "../../models/TenantModule";
import { h, mergeProps } from "vue";
const UI_NAME = "mmda";
/**
 * 租户交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:59.0
 * @revision 2024-09-01 23:08:30.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 租户交互逻辑
 */
export class TenantLogic extends UiLogic<Tenant> {
  constructor(init: UiLogicInit) {
    super(defineTenant, init);
    this.addRelativeLogic<TenantModule>(
      "modules",
      (master) => new TenantModuleLogic(this, master),
    );
    this.beforeSave = (
      context: UiContext,
      model: Tenant,
      action: EntityAction,
    ) => {
      const { mobile } = model;
      const { $t: t } = context.globalProps;
      // 手机号验证
      const regPhone =
        /^((13[0-9])|(14[0-9])|(15[0-9])|(16[0-9])|(17[0-9])|(18[0-9])|(19[0-9]))\d{8}$/;
      if (!regPhone.test(mobile) && !isRefNone(mobile))
        return Promise.reject(Error(t("invalid.regPhoneFormat")));
      return Promise.resolve(true);
    };
  }
  beforeIndex(): UiLogicFnResult<Tenant> {
    const { fields, groups, customActions } = super.beforeIndex();
    if (fields.length === 0) {
      fields.push(
        this.field("status").searchable(true),
        this.field("countryCode").setCustomCellRenderer(
          (
            fld,
            ctx: UiContext<Tenant> &
              Pick<UiContext<Tenant>, "getFieldCurrentOption">,
            props,
          ) => {
            if (isRefNone(ctx.model.countryCode)) return h("div");
            const { modules } = ctx.app;
            const linkable = props?.linkable ?? true;
            const url = linkable ? ctx.routeToRelative(fld) : "";
            // 检索出引用模块的主模块
            const refMainModule = modules.find(
              (module: Module) =>
                module?.subModules &&
                module.subModules.findIndex(
                  (subModule: Module) =>
                    subModule.objName === fld.reference?.refObjName,
                ) != -1,
            );
            // 检索出引用模块
            const refModule =
              refMainModule &&
              refMainModule.subModules &&
              refMainModule.subModules.find(
                (subModule: Module) =>
                  subModule.objName === fld.reference?.refObjName,
              );
            const { $router, $ui: ui } = ctx.globalProps;
            const namedRoute = {
              name: "Country",
              params: {
                id: `${ctx.model.country.localeCode},${ctx.model.countryCode}`,
              },
            };
            const r = $router.resolve(namedRoute);
            const options = ctx.getFieldCurrentOption(fld);
            const customProps = {
              role: `external-link-icon`,
              style: {
                marginRight: "5px",
                cursor: "pointer",
                color: "var(--p-button-info-background)",
              },
              onClick: () => window.open(r.href, "_blank"),
            };
            if (!url || !refModule?.authority?.allowRead)
              return ui.factory.textSpan(
                ctx.model.customProperties.$countryCode,
              );
            return h(
              "div",
              {
                class: "flex_item_center",
                role: `${UI_NAME}-external-link`,
                id: fld.fieldName,
                ...props,
              },
              [
                fasIcon(
                  "external-link",
                  mergeProps(customProps, cleanProps(["class"], props ?? {})),
                ),
                ui.factory.textSpan(options.briefName),
              ],
            );
          },
        ),
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
        this.group<TenantModule>("modules").addCustomAction({
          name: "createContractItem",
          label: "action.create",
          icon: "far fa-plus-circle",
          role: "info",
          onAction: this.newTenantModule,
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
  beforeDetails(): UiLogicFnResult<Tenant> {
    const { fields, groups, customActions } = super.beforeDetails();
    if (fields.length === 0) {
      fields.push(
        this.field("countryCode").setCustomRenderer(
          (fld, ctx: UiContext<Tenant>, props) => {
            if (isRefNone(ctx.model.countryCode)) return h("div");
            const { modules } = ctx.app;
            const linkable = props?.linkable ?? true;
            const url = linkable ? ctx.routeToRelative(fld) : "";
            // 检索出引用模块的主模块
            const refMainModule = modules.find(
              (module: Module) =>
                module?.subModules &&
                module.subModules.findIndex(
                  (subModule: Module) =>
                    subModule.objName === fld.reference?.refObjName,
                ) != -1,
            );
            // 检索出引用模块
            const refModule =
              refMainModule &&
              refMainModule.subModules &&
              refMainModule.subModules.find(
                (subModule: Module) =>
                  subModule.objName === fld.reference?.refObjName,
              );
            const { $router, $ui: ui } = ctx.globalProps;
            const namedRoute = {
              name: "Country",
              params: {
                id: `${ctx.model.country.localeCode},${ctx.model.countryCode}`,
              },
            };
            const r = $router.resolve(namedRoute);
            const customProps: any = {
              role: `external-link-icon`,
              style: {
                marginRight: "5px",
                cursor: "pointer",
                color: "var(--p-button-info-background)",
              },
              onClick: () => window.open(r.href, "_blank"),
            };
            if (!url || !refModule?.authority?.allowRead)
              return ui.factory.textSpan(ctx.model.country.briefName);
            return h(
              "div",
              {
                class: "flex_item_center",
                role: `${UI_NAME}-external-link`,
                id: fld.fieldName,
                ...props,
              },
              [
                fasIcon(
                  "external-link",
                  mergeProps(customProps, cleanProps(["class"], props ?? {})),
                ),
                ui.factory.textSpan(ctx.model.country.briefName),
              ],
            );
          },
        ),
      );
    }
    return { fields, groups, customActions };
  }
  /**
   * 创建租赁模块
   * @param context 界面上下文
   * @param target 项目模板
   */
  newTenantModule(context: UiContext<Tenant>, target: Tenant) {
    // context.newSubGroupItem<TenantModule>({
    // 	group: 'modules',
    // 	target,
    // }).then(item => {
    // 	if (item) {
    // 		context.addSubGroupItem('modules', item as TenantModule);
    // 	}
    // })
    context
      .createSubGroupItems({
        group: "modules",
        target,
        propsMapper: {
          moduleCode: (m) => {
            let i = 0;
            if (Array.isArray(m.modules) && m.modules.length > 0) {
              const num = Number(m.modules[m.modules.length - 1].rowNum) + 1;
              return `${num}`;
            } else {
              return `${i + 1}`;
            }
          },
        },
        creator: defineTenantModule,
      })
      .then((item) => {
        if (item) {
          context.addSubGroupItem("modules", item as TenantModule);
        }
      });
  }
  //设置详情逻辑
  //beforeDetails(){}
}

/**
 * 构造租户交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const TenantLogicCtor = (
  metaUiService: MetaUiService,
  router: Router,
  module?: Module,
) =>
  new TenantLogic({
    metaUiService: metaUiService,
    repository: "Tenants",
    router,
    module: module || metaUiService.findModule("Tenant"),
  });
/**
 * 租赁模块交互逻辑
 */
export class TenantModuleLogic extends UiGroupLogic<TenantModule, Tenant> {
  constructor(parent: TenantLogic, master: Tenant) {
    super(defineTenantModule, parent, master, "modules");
  }
}
//#endregion ~GENERATED PARTS END
