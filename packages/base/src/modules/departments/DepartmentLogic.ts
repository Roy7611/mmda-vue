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
  isNullOrUndefined,
} from "@mmda/core";
import {
  type UiLogicInit,
  UiLogic,
  UiGroupLogic,
  type UiLogicFnResult,
} from "@mmda/vui";
import { type Department, defineDepartment } from "../../models/Department";
import { DepartmentStatus } from "../../enums/DepartmentStatus";
import { EmployeeStatus } from "../../enums/EmployeeStatus";

/**
 * 部门交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:57.0
 * @revision 2024-09-01 23:08:29.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 部门交互逻辑
 */
export class DepartmentLogic extends UiLogic<Department> {
  constructor(init: UiLogicInit) {
    super(defineDepartment, init);
    this.beforeSave = (
      context: UiContext,
      model: Department,
      action: EntityAction,
    ) => {
      const { tel } = model;
      const { $t: t } = context.globalProps;

      // 检查是否为无效的单一数字（如"0"）
      if (
        tel &&
        !isRefNone(tel) &&
        tel.trim().length === 1 &&
        /^\d$/.test(tel.trim())
      ) {
        return Promise.reject(Error(t("invalid.phoneSingleDigit")));
      }

      // 手机号验证
      const regPhone =
        /^((13[0-9])|(14[0-9])|(15[0-9])|(16[0-9])|(17[0-9])|(18[0-9])|(19[0-9]))\d{8}$/;
      // 座机验证
      const regTel = /^(0\d{2,3}-)?\d{7,8}(-\d{1,4})?$/;
      if (!(regPhone.test(tel) || regTel.test(tel)) && !isRefNone(tel))
        return Promise.reject(Error(t("invalid.regTelFormat")));
      return Promise.resolve(true);
    };
  }
  beforeIndex(): UiLogicFnResult<Department> {
    const { fields, groups, customActions } = super.beforeIndex();
    if (fields.length === 0) {
      fields.push(
        this.field("status").searchable(true),
        this.field("workLane").searchable(true),
        this.field("deptType").searchable(true),
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
        this.field("parentDeptID").setSearchParam((context, model) => ({
          status: `IN ${DepartmentStatus.RUNNING}`,
        })),
        this.field("leaderID").setSearchParam((context, model) => ({
          status: `NOT IN ${EmployeeStatus.LEAVE}`,
        })),
        this.field("tel").onValidate<string>((value, _model, context) => {
          if (
            !isNullOrUndefined(value) &&
            value.trim().length === 1 &&
            /^\d$/.test(value.trim())
          ) {
            return context.translate("invalid.phoneFormat");
          }
          console.log("tel", value);
          return null;
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
 * 构造部门交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const DepartmentLogicCtor = (
  metaUiService: MetaUiService,
  router: Router,
  module?: Module,
) =>
  new DepartmentLogic({
    metaUiService: metaUiService,
    repository: "Departments",
    router,
    module: module || metaUiService.findModule("Department"),
  });
//#endregion ~GENERATED PARTS END
