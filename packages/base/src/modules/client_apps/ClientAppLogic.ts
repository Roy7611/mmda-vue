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
  isRefNone,
  defaultPager,
  UiValidation,
} from "@mmda/core";
import {
  type UiLogicInit,
  UiLogic,
  UiGroupLogic,
  type UiLogicFnResult,
  UiViewOne,
} from "@mmda/vui";
import { type ClientApp, defineClientApp } from "../../models/ClientApp";
import {
  type ClientAppModule,
  defineClientAppModule,
} from "../../models/ClientAppModule";
import {
  type ClientAppRelease,
  defineClientAppRelease,
} from "../../models/ClientAppRelease";

/**
 * 客户端应用交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:57.0
 * @revision 2024-09-01 23:08:28.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 客户端应用交互逻辑
 */
export class ClientAppLogic extends UiLogic<ClientApp> {
  constructor(init: UiLogicInit) {
    super(defineClientApp, init);
    this.addRelativeLogic<ClientAppModule>(
      "modules",
      (master) => new ClientAppModuleLogic(this, master),
    );
    this.addRelativeLogic<ClientAppRelease>(
      "releases",
      (master) => new ClientAppReleaseLogic(this, master),
    );
    this.beforeValidate = (
      context: UiContext,
      model: ClientApp,
      validation: UiValidation,
    ) => {
      if (model.monthlyRent < 0)
        return context.uiBuilder.toast(context, {
          severity: "error",
          summary: context.t("dialog.title.error"),
          detail: context.t("invalid.monthlyRentNegative"),
          group: "br",
          life: 3000,
        });
      else return Promise.resolve(true);
    };
  }
  beforeIndex(): UiLogicFnResult<ClientApp> {
    const { fields, groups, customActions } = super.beforeIndex();
    if (fields.length === 0) {
      fields.push(this.field("status").searchable(true));
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
        this.field("appLogo").hideIf((t) => isRefNone(t.appId)),
        this.field("postLogoutRedirectUris").hideIf((t) => isRefNone(t.appId)),
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
        this.group<ClientAppModule>("modules").addCustomAction({
          name: "createContractItem",
          label: "action.create",
          icon: "far fa-plus-circle",
          role: "info",
          onAction: this.newClientAppModule,
          view: UiViewOne.Edit,
        }),
        this.group<ClientAppRelease>("releases").addCustomAction({
          name: "createContractItem",
          label: "action.create",
          icon: "far fa-plus-circle",
          role: "info",
          onAction: this.newClientAppRelease,
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
   * 创建客户端应用模块
   * @param context 界面上下文
   * @param target 项目模板
   */
  newClientAppModule(context: UiContext<ClientApp>, target: ClientApp) {
    // context.newSubGroupItem<ClientAppModule>({
    // 	group: 'modules',
    // 	target,
    // }).then(item => {
    // 	if (item) {
    // 		context.addSubGroupItem('modules', item as ClientAppModule);
    // 	}
    // })
    context
      .createSubGroupItems({
        group: "modules",
        target,
        propsMapper: {
          moduleCode: (m) => {
            const i = 0;
            if (Array.isArray(m.modules) && m.modules.length > 0) {
              const num = Number(m.modules[m.modules.length - 1].rowNum) + 1;
              return `${num}.0`;
            } else {
              return `${i + 1}.0`;
            }
          },
        },
        creator: defineClientAppModule,
      })
      .then((item) => {
        if (item) {
          context.addSubGroupItem("modules", item as ClientAppModule);
        }
      });
  }

  /**
   * 创建客户端应用发布
   * @param context 界面上下文
   * @param target 项目模板
   */
  newClientAppRelease(context: UiContext<ClientApp>, target: ClientApp) {
    // context.newSubGroupItem<ClientAppRelease>({
    // 	group: 'releases',
    // 	target,
    // }).then(item => {
    // 	if (item) {
    // 		context.addSubGroupItem('releases', item as ClientAppRelease);
    // 	}
    // })
    context
      .createSubGroupItems({
        group: "releases",
        target,
        propsMapper: {
          releasedVersion: (m) => {
            const i = 0;
            if (Array.isArray(m.releases) && m.releases.length > 0) {
              const num = Number(m.releases[m.releases.length - 1].rowNum) + 1;
              return `${num}.0.0`;
            } else {
              return `${i + 1}.0.0`;
            }
          },
        },
        creator: defineClientAppRelease,
      })
      .then((item) => {
        if (item) {
          context.addSubGroupItem("releases", item as ClientAppRelease);
        }
      });
  }
  //设置详情逻辑
  //beforeDetails(){}
}

/**
 * 构造客户端应用交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ClientAppLogicCtor = (
  metaUiService: MetaUiService,
  router: Router,
  module?: Module,
) =>
  new ClientAppLogic({
    metaUiService: metaUiService,
    repository: "ClientApps",
    router,
    module: module || metaUiService.findModule("ClientApp"),
  });
/**
 * 功能模块交互逻辑
 */
export class ClientAppModuleLogic extends UiGroupLogic<
  ClientAppModule,
  ClientApp
> {
  constructor(parent: ClientAppLogic, master: ClientApp) {
    super(defineClientAppModule, parent, master, "modules");
  }
}
/**
 * 发布历史交互逻辑
 */
export class ClientAppReleaseLogic extends UiGroupLogic<
  ClientAppRelease,
  ClientApp
> {
  constructor(parent: ClientAppLogic, master: ClientApp) {
    super(defineClientAppRelease, parent, master, "releases");
  }
}
//#endregion ~GENERATED PARTS END
