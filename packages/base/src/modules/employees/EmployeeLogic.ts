/* eslint-disable no-useless-escape */
/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
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
  type EntityLogicInit,
  EntityLogic,
  SubEntityLogic,
  type UiLogicFnResult,
} from "@mmda/vui";
import { type Employee, defineEmployee } from "../../models/Employee";
import { EmployeeStatus } from "../../enums/EmployeeStatus";

/**
 * čĺäş¤äşéťčž
 * @author mmda codebot
 * @since 2024-07-17 07:38:58.0
 * @revision 2024-09-01 23:08:29.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * čĺäş¤äşéťčž
 */
export class EmployeeLogic extends EntityLogic<Employee> {
  constructor(init: EntityLogicInit) {
    super(defineEmployee, init);
    this.beforeSave = (
      context: UiContext,
      model: Employee,
      action: EntityAction,
    ) => {
      const { mobile, email, qq } = model;
      const { $t: t } = context.globalProps;
      // ććşĺˇéŞčŻ
      const regPhone =
        /^((13[0-9])|(14[0-9])|(15[0-9])|(16[0-9])|(17[0-9])|(18[0-9])|(19[0-9]))\d{8}$/;
      // éŽçŽąéŞčŻ
      const regEmail =
        /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
      // qqĺˇéŞčŻ
      const regQQ = /^[1-9][0-9]{4,10}$/;
      if (!regPhone.test(mobile) && !isRefNone(mobile))
        return Promise.reject(Error(t("invalid.regPhoneFormat")));
      if (!regEmail.test(email) && !isRefNone(email))
        return Promise.reject(Error(t("invalid.regEmailFormat")));
      if (!regQQ.test(qq) && !isRefNone(qq))
        return Promise.reject(Error(t("invalid.regQQFormat")));
      return Promise.resolve(true);
    };
    this.selectableList = {
      batchCreateEmployeeAccounts: (item: Employee) =>
        item.status !== EmployeeStatus.LEAVE && !item.hasUserAccount,
    };
  }
  async batchCreateEmployeeAccounts(context: UiContext<Employee>) {
    //ĺ˝ĺéä¸­éĄš
    const { selectedItems, translate: t } = context;
    if (!MetaModel.hasAny(selectedItems)) {
      context.uiBuilder.toast(this, {
        severity: 'warning',
        title: t("dialog.title.warning"),
        message: t("invalid.requiredSelectAny"),
        life: 3000,
      });
      throw new Error(t("invalid.requiredSelectAny"));
    }
    const empIds = (selectedItems ?? []).map((it) => it.empID);
    const { $api } = context.globalProps;
    const apiClient = $api as ApiClient;
    try {
      const res = await apiClient.doAction(
        {
          action: "batchCreateEmployeeAccounts",
          repository: "Employees",
          service: "base",
        },
        empIds,
      );
      //ĺłé­çŞĺŁ
      if (res) {
        context.uiBuilder.toast(context, {
          severity: "success",
          title: t("dialog.success"),
          message: t("success.accountsGenerated"),
          life: 3000,
        });
        await context.refresh?.();
      }
    } catch (errorC: any) {
      context.uiBuilder.toast(context, {
        severity: "error",
        title: t("failure.failed"),
        message: errorC.message,
        life: 3000,
      });
      return false;
    }
  }
  beforeIndex(): UiLogicFnResult<Employee> {
    const { fields, groups, customActions } = super.beforeIndex();
    if (fields.length === 0) {
      fields.push(
        this.field("status"),
        this.field("gender"),
        this.field("workDeptID"),
      );
    }
    if (customActions.length == 0) {
      customActions.push(
        {
          name: "importEmployeeWorkers",
          icon: "pi pi-file-import",
          label: "action.batchCreate",
          group: "selectMany",
          role: "primary",
          onAction: async (
            context: UiContext<Employee> & Pick<UiContext<Employee>, "select">,
          ) => {
            const t = context.translate.bind(context);
            const toast = (props: Record<string, unknown>) =>
              context.uiBuilder?.toast(context, props);
            try {
              await context.app?.meta.getPack({
                service: "mes",
                repository: "Workers",
              });
            } catch (error: any) {
              toast({
                severity: "error",
                title: t("dialog.title.error"),
                message: error?.message ?? String(error),
                life: 3000,
              });
              return false;
            }
            const selection = await context.select({
              service: "mes",
              repository: "Workers",
              searchParam: {
                pager: defaultPager(),
                queryParams: {
                  empID: "IS NULL",
                  status: `NOT IN ${EmployeeStatus.LEAVE}`,
                },
              },
              selectionMode: "multiple",
            });
            if (!Array.isArray(selection) || selection.length === 0) return;
            const submitBody = selection.map(
              (item: { workerID?: string; id?: string }) =>
                item.workerID ?? item.id,
            );
            try {
              const res = await context.app?.api.doAction(
                {
                  action: "batchSave",
                  repository: "Employees",
                  service: "base",
                },
                submitBody,
              );
              if (res) {
                toast({
                  severity: "success",
                  message: t("success.operationSuccessful"),
                  title: t("dialog.success"),
                  life: 3000,
                });
                await context.refresh?.();
              }
            } catch (error: any) {
              toast({
                severity: "error",
                title: t("dialog.title.error"),
                message: error?.message ?? String(error),
                life: 3000,
              });
            }
          },
        },
        {
          name: "batchCreateEmployeeAccounts",
          icon: "pi pi-file-import",
          label: "action.batchCreateAccounts",
          group: "selectMany",
          role: "primary",
          onAction: async (context: UiContext<Employee>) => {
            context.toSelectManyIndex(
              "batchCreateEmployeeAccounts",
              async () => await this.batchCreateEmployeeAccounts(context),
            );
          },
        },
      );
    }
    return { fields, groups, customActions };
  }
  /**
   * čŽžç˝Žçźčžäş¤äşéťčž
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

  //čŽžç˝ŽčŻŚćéťčž
  //beforeDetails(){}
}

/**
 * ćé čĺäş¤äşéťčž
 * @param metaUiService ĺć°ćŽćĺĄ
 * @param router čˇŻçą
 * @param module ć¨Ąĺ
 * @returns
 */
export const EmployeeLogicCtor = (
  metaUiService: MetaUiService,
  
  module?: Module,
) =>
  new EmployeeLogic({
    metaUiService: metaUiService,
    repository: "Employees",
    
    module: module || metaUiService.findModule("Employee"),
  });
//#endregion ~GENERATED PARTS END
