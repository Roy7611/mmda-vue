/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from "vue-router";
import type { MetaUiService, Module, MetaUiField, UiContext } from "@mmda/core";
import {
  type UiLogicInit,
  UiLogic,
  UiGroupLogic,
  type UiLogicFnResult,
  UiViewOne,
} from "@mmda/vui";
import {
  type ContractTemplate,
  defineContractTemplate,
} from "../../models/ContractTemplate";
import {
  type ContractTemplateTask,
  defineContractTemplateTask,
} from "../../models/ContractTemplateTask";
import {
  type ContractTemplateTaskRelation,
  defineContractTemplateTaskRelation,
} from "../../models/ContractTemplateTaskRelation";
/**
 * 项目模板交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:57.0
 * @revision 2024-09-01 23:08:29.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 项目模板交互逻辑
 */
export class ContractTemplateLogic extends UiLogic<ContractTemplate> {
  constructor(init: UiLogicInit) {
    super(defineContractTemplate, init);
    this.addRelativeLogic<ContractTemplateTask>(
      "tasks",
      (master) => new ContractTemplateTaskLogic(this, master),
    );
    this.addRelativeLogic<ContractTemplateTaskRelation>(
      "taskRelations",
      (master) => new ContractTemplateTaskRelationLogic(this, master),
    );
  }
  beforeIndex(): UiLogicFnResult<ContractTemplate> {
    const { fields, groups, customActions } = super.beforeIndex();
    if (fields.length === 0) {
      fields.push(
        this.field("status"),
        this.field("surveyRequired"),
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
        this.group<ContractTemplateTask>("tasks").addCustomAction({
          name: "createContractItem",
          label: "action.create",
          icon: "far fa-plus-circle",
          role: "info",
          onAction: this.newContractTemplateTask,
          view: UiViewOne.Edit,
        }),
        this.group<ContractTemplateTaskRelation>(
          "taskRelations",
        ).addCustomAction({
          name: "createContractItem",
          label: "action.create",
          icon: "far fa-plus-circle",
          role: "info",
          onAction: this.newTaskRelations,
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
   * 创建合同模板任务
   * @param context 界面上下文
   * @param target 项目模板
   */
  newContractTemplateTask(context: UiContext, target: ContractTemplate) {
    context
      .newSubGroupItem<ContractTemplateTask>({
        group: "tasks",
        sequenceKey: "itemID",
        target,
      })
      .then((item) => {
        if (item) {
          context.addSubGroupItem("tasks", item);
        }
      });
  }

  /**
   * 创建合同模板任务关系
   * @param context 界面上下文
   * @param target 项目模板
   */
  newTaskRelations(context: UiContext, target: ContractTemplate) {
    context
      .newSubGroupItem<ContractTemplateTaskRelation>({
        group: "taskRelations",
        sequenceKey: "itemID",
        target,
      })
      .then((item) => {
        if (item) {
          context.addSubGroupItem("taskRelations", item);
        }
      });
  }
  //设置详情逻辑
  //beforeDetails(){}
}

/**
 * 构造项目模板交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ContractTemplateLogicCtor = (
  metaUiService: MetaUiService,
  router: Router,
  module?: Module,
) =>
  new ContractTemplateLogic({
    metaUiService: metaUiService,
    repository: "ContractTemplates",
    router,
    module: module || metaUiService.findModule("ContractTemplate"),
  });
/**
 * 任务交互逻辑
 */
export class ContractTemplateTaskLogic extends UiGroupLogic<
  ContractTemplateTask,
  ContractTemplate
> {
  constructor(parent: ContractTemplateLogic, master: ContractTemplate) {
    super(defineContractTemplateTask, parent, master, "tasks");
  }
}
/**
 * 任务关系交互逻辑
 */
export class ContractTemplateTaskRelationLogic extends UiGroupLogic<
  ContractTemplateTaskRelation,
  ContractTemplate
> {
  constructor(parent: ContractTemplateLogic, master: ContractTemplate) {
    super(defineContractTemplateTaskRelation, parent, master, "taskRelations");
  }
}
//#endregion ~GENERATED PARTS END
