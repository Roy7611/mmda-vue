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
  isNullOrUndefined,
} from "@mmda/core";
import {
  type UiLogicInit,
  UiLogic,
  UiGroupLogic,
  type UiLogicFnResult,
  UiViewOne,
} from "@mmda/vui";
import { type User, defineUser } from "../../models/User";
import { type UserRole, defineUserRole } from "../../models/UserRole";
import { type UserDevice, defineUserDevice } from "../../models/UserDevice";
import {
  type UserOpenIdentity,
  defineUserOpenIdentity,
} from "../../models/UserOpenIdentity";
import {
  type UserRelation,
  defineUserRelation,
} from "../../models/UserRelation";
import { DepartmentStatus } from "../../enums/DepartmentStatus";
/**
 * ??????
 * @author mmda codebot
 * @since 2024-07-17 07:38:59.0
 * @revision 2024-07-18 02:22:47.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * ??????
 */

//????
const beforeChangePwd = async (
  context: UiContext<User> & Required<Pick<UiContext<User>, "reload">>,
  model: User,
  action: EntityAction,
) => {
  const pwdData = {
    data: {
      userID: "",
      newPwd: "",
      newPwdAgain: "",
    },
  };
  try {
    // ????
    const factory = context.uiBuilder.factory;
    await context.uiBuilder.dialog(
      [
        factory.formField?.(
          {
            name: "newPwd",
            label: context.t("auth.newPassword"),
            required: true,
            isEdit: true,
          },
          {
            default: () =>
              factory.textInput({
                value: pwdData.data.newPwd,
                type: "Password",
                autocomplete: "new-password",
                onChange: (value: string) => {
                  pwdData.data.newPwd = value;
                },
              }),
          },
        ),
        factory.formField?.(
          {
            name: "newPwdAgain",
            label: context.t("auth.confirmNewPassword"),
            required: true,
            isEdit: true,
          },
          {
            default: () =>
              factory.textInput({
                value: pwdData.data.newPwdAgain,
                type: "Password",
                autocomplete: "new-password",
                onChange: (value: string) => {
                  pwdData.data.newPwdAgain = value;
                },
              }),
          },
        ),
      ],
      context,
      {
        title: context.t("auth.changePassword"),
        width: "30%",
        height: "auto",
        maxHeight: "70vh",
        showFooter: true,
        onAccept: async () => {
          pwdData.data.userID = model.userID ?? "";
          const toast = (props: Record<string, unknown>) =>
            context.uiBuilder.toast(context, props);

          if (!pwdData.data.userID) {
            toast({
              severity: "error",
              message: context.t("auth.userIdMissing"),
              title: context.t("dialog.title.error"),
              life: 3000,
            });
            return false;
          }

          if (!pwdData.data.newPwd) {
            toast({
              severity: "error",
              message: context.t("auth.pleaseEnterNewPassword"),
              title: context.t("dialog.title.error"),
              life: 3000,
            });
            return false;
          }

          if (pwdData.data.newPwd !== pwdData.data.newPwdAgain) {
            toast({
              severity: "error",
              message: context.t("auth.passwordMismatch"),
              title: context.t("dialog.title.error"),
              life: 3000,
            });
            return false;
          }

          try {
            const res = await context.apiClient.doAction(
              {
                path: pwdData.data.userID,
                action: "changePwd",
                repository: "Users",
                service: "base",
              },
              {
                payload: {
                  newPwd: pwdData.data.newPwd,
                },
              },
            );

            if (res) {
              toast({
                severity: "success",
                message: context.t("auth.changePasswordSuccess"),
                title: context.t("dialog.success"),
                life: 3000,
              });
              await context.app?.signOut();
              window.localStorage.removeItem("user");
            }
            return true;
          } catch (error: any) {
            toast({
              severity: "error",
              message: error.message,
              title: context.t("dialog.title.error"),
              life: 3000,
            });
            return false;
          }
        },
        onReject: async () => {
          return false;
        },
      },
    );
  } catch (error: any) {
    return false;
  }
};

// ??
const beforeDisapprove = async (
  context: UiContext<User> & Required<Pick<UiContext<User>, "reload">>,
  model: User,
  action: EntityAction,
) => {
  const { $ui: ui, $api: apiBox } = context.globalProps;
  const params = { disapproveReason: "" };
  await context.uiBuilder.dialog(
    ui.factory.formField(
      {
        name: "disapproveReason",
        label: context.t("auth.disapproveReason"),
        required: true,
        isEdit: true,
      },
      {
        default: () =>
          ui.factory.textArea({
            value: params.disapproveReason,
            autoResize: true,
            placeholder: context.t("invalid.requireDisapproveReason"),
            onChange: (value) => {
              params.disapproveReason = value;
            },
          }),
      },
    ),
    context,
    {
      title: action.label,
      width: "30%",
      height: "auto",
      maxHeight: "70vh",
      showFooter: true,
      onAccept: async () => {
        if (params.disapproveReason === "") {
          context.uiBuilder.toast(context, {
            severity: "error",
            title: context.t("dialog.title.error"),
            message: context.t("invalid.requireDisapproveReason"),
            life: 3000,
          });
          return false;
        }
        try {
          const res = await apiBox.doAction(
            {
              path: model.userID,
              action: "disapprove",
              repository: "Users",
              service: "base",
            },
            {
              actionName: action.label,
              payload: params,
            },
          );
          if (res) {
            context.uiBuilder.toast(context, {
              severity: "success",
              title: context.t("dialog.success"),
              message: context.t("success.disapproveAccount"),
              life: 3000,
            });
            context.reload();
            return true;
          }
        } catch (error: any) {
          context.uiBuilder.toast(context, {
            severity: "error",
            message: error.message,
            title: context.t("dialog.title.error"),
            position: "bottom-right",
            life: 3000,
          });
          return false;
        }
      },
      onReject: async () => {},
    },
  );
  return false;
};
export class UserLogic extends UiLogic<User> {
  constructor(init: UiLogicInit) {
    super(defineUser, init);
    this.addRelativeLogic<UserRole>(
      "roles",
      (master) => new UserRoleLogic(this, master),
    );
    this.addRelativeLogic<UserDevice>(
      "devices",
      (master) => new UserDeviceLogic(this, master),
    );
    this.addRelativeLogic<UserOpenIdentity>(
      "openIdentities",
      (master) => new UserOpenIdentityLogic(this, master),
    );
    this.addRelativeLogic<UserRelation>(
      "relations",
      (master) => new UserRelationLogic(this, master),
    );
    this.beforeAction = (
      context: UiContext<User> & Required<Pick<UiContext<User>, "reload">>,
      model: User,
      action: EntityAction,
    ) => {
      try {
        if (action.name == "changePwd")
          return beforeChangePwd(context, model, action);
        else if (action.name === "disapprove")
          return beforeDisapprove(context, model, action);
        else return Promise.resolve(true);
      } catch (error: any) {
        return Promise.resolve(false);
      }
    };
    this.beforeSave = (
      context: UiContext,
      model: User,
      action: EntityAction,
    ) => {
      const { email, telPrefix, mobile } = model;
      const { $t: t } = context.globalProps;
      // ????
      const regEmail =
        /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
      // ??????
      const regTelPrefix = /\+\d{1,3}\s?/g;
      // ?????
      const regPhone =
        /^((13[0-9])|(14[0-9])|(15[0-9])|(16[0-9])|(17[0-9])|(18[0-9])|(19[0-9]))\d{8}$/;
      if (!regEmail.test(email) && !isRefNone(email))
        return Promise.reject(Error(t("invalid.regEmailFormat")));
      if (!regTelPrefix.test(telPrefix) && !isRefNone(telPrefix))
        return Promise.reject(Error(t("invalid.regTelPrefixFormat")));
      if (!regPhone.test(mobile) && !isRefNone(mobile))
        return Promise.reject(Error(t("invalid.regPhoneFormat")));
      return Promise.resolve(true);
    };
  }
  beforeIndex(): UiLogicFnResult<User> {
    const { fields, groups, customActions } = super.beforeIndex();
    if (fields.length === 0) {
      fields.push(
        this.field("status"),
        this.field("subscribedChannels"),
        this.field("staff"),
        this.field("deptID").setCustomCellRenderer(
          (fld, ctx: UiContext<User>, props) => {
            if (isRefNone(ctx.model.deptID)) return ctx.uiBuilder.factory.textSpan("");
            const modules = ctx.app?.state.modules ?? [];
            const linkable = props?.linkable ?? true;
            const url = linkable ? ctx.routeToRelative(fld) : "";
            // ???????????
            const refMainModule = modules.find(
              (module: Module) =>
                module?.subModules &&
                module.subModules.findIndex(
                  (subModule: Module) =>
                    subModule.objName === fld.reference?.refObjName,
                ) != -1,
            );
            // ???????
            const refModule =
              refMainModule &&
              refMainModule.subModules &&
              refMainModule.subModules.find(
                (subModule: Module) =>
                  subModule.objName === fld.reference?.refObjName,
              );
            const { $router, $ui: ui } = ctx.globalProps;
            const namedRoute = {
              name: "Department",
              params: { id: ctx.model.deptID },
            };
            const r = $router.resolve(namedRoute);
            if (!url || !refModule?.authority?.allowRead)
              return ui.factory.textSpan(ctx.model.customProperties.$deptID);
            return ctx.uiBuilder.fldFactory.hasOneText(fld, ctx);
          },
        ),
      );
    }
    return { fields, groups, customActions };
  }
  /**
   * ????????
   */
  beforeEdit() {
    const { fields, groups, customActions } = super.beforeEdit();
    if (fields.length == 0) {
      fields.push(
        this.field("deptID")
          .onChange((context, model, newVal) => {
            model.roles.forEach((value: any) => {
              if (value.entityState > 4) {
                value.entityState = 4;
              }
            });
            const items = model.roles.filter(
              (value: any) => value.entityState < 4,
            );
            if (isRefNone(newVal) && items.length > 0) {
              items.forEach((value: any) => {
                value.deptID = null;
                value.customProperties.$deptID = "";
                MetaModel.modify(value);
              });
            } else {
              items.forEach((value: any) => {
                value.deptID = newVal;
                value.customProperties.$deptID = model.customProperties.$deptID;
                MetaModel.modify(value);
              });
            }
          })
          .refFilter((model, ctx) => {
					const __p = ((context, model, fld) => ({
            status: `IN ${DepartmentStatus.RUNNING}`,
          }))(ctx as any, model as any, undefined as any);
					if (!__p) return "";
					return Object.entries(__p)
						.filter(([, v]) => v !== "" && v != null)
						.map(([k, v]) => {
							const s = String(v);
							if (/^(IS |NOT |IN |LIKE )/i.test(s.trim())) return `${k} ${s}`;
							if (/^[><=]/.test(s)) return `${k}${s}`;
							return typeof v === "number" || typeof v === "boolean" ? `${k}=${v}` : `${k}='${s}'`;
						})
						.join(" AND ");
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
        this.group<UserRole>("roles").defaultAdder(this.newUserRole),
        // this.group<UserDevice>('devices').defaultAdder(this.newUserDevice),
        this.group<UserOpenIdentity>("openIdentities").addCustomAction({
          name: "createContractItem",
          label: "action.create",
          icon: "far fa-plus-circle",
          role: "info",
          onAction: this.newUserOpenIdentity,
          view: UiViewOne.Edit,
        }),
        // this.group<UserRelation>('relations')
        // 	.addCustomAction({
        // 		name: 'createContractItem',
        // 		label: '??',
        // 		icon: 'far fa-plus-circle',
        // 		role: 'info',
        // 		onAction: this.newUserRelation,
        // 		view: UiViewOne.Edit,
        // 	}),
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
  beforeDetails() {
    const { fields, groups, customActions } = super.beforeDetails();
    if (fields.length === 0) {
      fields.push(
        this.field("deptID").setCustomRenderer(
          (fld, ctx: UiContext<User>, props) => {
            const fldVal = ctx.getFieldValue(fld);
            return ctx.uiBuilder.factory.link({
              text: fldVal ? fldVal.deptName : "",
              href: fldVal?.deptID ? `/BASE/Departments/${fldVal.deptID}` : undefined,
              target: "_blank",
              style: { color: "#409eff", width: "100%", overflow: "hidden" },
            });
          },
        ),
        this.field("personID").setCustomRenderer(
          (fld, ctx: UiContext<User>, props) => {
            const fldVal = ctx.getFieldValue(fld);
            return ctx.uiBuilder.factory.link({
              text: fldVal ? fldVal.personName : "",
              href: fldVal?.personID ? `/BASE/Persons/${fldVal.personID}` : undefined,
              target: "_blank",
              style: { color: "#409eff", width: "100%", overflow: "hidden" },
            });
          },
        ),
      );
    }
    return { fields, groups, customActions };
  }
  /**
   * ??????
   * @param context ?????
   * @param target ????
   */
  newUserRole(context: UiContext<User>, target: User) {
    context
      .select<UserRole>({
        repository: "Roles",
        searchParam: {
          pager: defaultPager(),
          queryParams: {},
        },
        ctor: defineUserRole,
        selectionMode: "multiple",
      })
      .then((selection: any) => {
        if (selection) {
          // ??????
          const items = selection.filter((item: any) =>
            MetaModel.hasAnyLike(target.roles, { roleID: item.roleID }),
          );
          if (items.length > 0)
            return context.uiBuilder.toast(context, {
              severity: "error",
              title: context.globalProps.$t("dialog.title.error"),
              message: context.globalProps.$t("invalid.duplicateRole"),
              life: 3000,
            });
          context.addSubGroupItems<UserRole>({
            target,
            group: "roles",
            source: selection,
            propsMapper: {
              deptID: () => ({
                deptID: !isRefNone(target.deptID) ? target.deptID : "",
                deptName: target.customProperties.$deptID,
              }),
            },
          });
        }
      })
      .catch((error: any) => {});
  }

  /**
   * ????????
   * @param context ?????
   * @param target ????
   */
  // newUserDevice(context: UiContext, target: User) {
  // 	context.newSubGroupItem<UserDevice>({
  // 		group: 'devices',
  // 		target,
  // 	}).then(item => {
  // 		if (item) {
  // 			target.devices.push(item)
  // 		}
  // 	})
  // }

  /**
   * ????????
   * @param context ?????
   * @param target ????
   */
  newUserOpenIdentity(context: UiContext<User>, target: User) {
    // context.newSubGroupItem<UserOpenIdentity>({
    // 	group: 'openIdentities',
    // 	target,
    // }).then(item => {
    // 	if (item) {
    // 		context.addSubGroupItem('openIdentities', item as UserOpenIdentity);
    // 	}
    // })
    context
      .createSubGroupItems({
        group: "openIdentities",
        target,
        propsMapper: {
          openIDType: (m) => {
            const i = 0;
            if (
              Array.isArray(m.openIdentities) &&
              m.openIdentities.length > 0
            ) {
              const num =
                Number(m.openIdentities[m.openIdentities.length - 1].rowNum) +
                1;
              return `${num}`;
            } else {
              return `${i + 1}`;
            }
          },
        },
        creator: defineUserOpenIdentity,
      })
      .then((item) => {
        if (item) {
          context.addSubGroupItem("openIdentities", item as UserOpenIdentity);
        }
      });
  }

  /**
   * ??????
   * @param context ?????
   * @param target ????
   */
  newUserRelation(context: UiContext<User>, target: User) {
    context
      .newSubGroupItem<UserRelation>({
        group: "relations",
        target,
      })
      .then((item) => {
        if (item) {
          context.addSubGroupItem("relations", item);
        }
      });
  }
  //??????
  //beforeDetails(){}
}

/**
 * ????????
 * @param metaUiService ?????
 * @param router ??
 * @param module ??
 * @returns
 */
export const UserLogicCtor = (
  metaUiService: MetaUiService,
  router: UiLogicInit["router"],
  module?: Module,
) =>
  new UserLogic({
    metaUiService: metaUiService,
    repository: "Users",
    router,
    module: module || metaUiService.findModule("User"),
  });
/**
 * ??????
 */
export class UserRoleLogic extends UiGroupLogic<UserRole, User> {
  constructor(parent: UserLogic, master: User) {
    super(defineUserRole, parent, master, "roles");
  }
}
/**
 * ??????
 */
export class UserDeviceLogic extends UiGroupLogic<UserDevice, User> {
  constructor(parent: UserLogic, master: User) {
    super(defineUserDevice, parent, master, "devices");
  }
}
/**
 * ????????
 */
export class UserOpenIdentityLogic extends UiGroupLogic<
  UserOpenIdentity,
  User
> {
  constructor(parent: UserLogic, master: User) {
    super(defineUserOpenIdentity, parent, master, "openIdentities");
  }
}
/**
 * ????????
 */
export class UserRelationLogic extends UiGroupLogic<UserRelation, User> {
  constructor(parent: UserLogic, master: User) {
    super(defineUserRelation, parent, master, "relations");
  }
}
//#endregion ~GENERATED PARTS END
