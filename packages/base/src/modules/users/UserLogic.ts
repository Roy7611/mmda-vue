/* eslint-disable no-useless-escape */
/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, defaultPager, EntityAction, ApiClient, MetaModel, isRefNone, isNullOrUndefined } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type User, defineUser } from '../../models/User';
import { type UserRole, defineUserRole } from '../../models/UserRole';
import { type UserDevice, defineUserDevice } from '../../models/UserDevice';
import { type UserOpenIdentity, defineUserOpenIdentity } from '../../models/UserOpenIdentity';
import { type UserRelation, defineUserRelation } from '../../models/UserRelation';
import { changeUsePwd } from '../../components/ChangePasswordForm';
import { h, reactive, ref } from 'vue'
import { DepartmentStatus } from '../../enums/DepartmentStatus';
/**
 * 用户交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:59.0
 * @revision 2024-07-18 02:22:47.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 用户交互逻辑
 */
const pwdData = reactive({
	data: {
		userID: '',
		newPwd: '',
		newPwdAgain: '',
	},
});

const parmas = reactive({
	disapproveReason: ''
}) as any

//修改密码
const beforeChangePwd = async (context: UiContext, model: User, action: EntityAction) => {
	pwdData.data.newPwd = '';
	try {
		// 生成弹窗
		await context.uiBuilder.confirmDialog(
			h(changeUsePwd, {
				onGetTepModel(val: any) {
					pwdData.data = val;
				},
			}),
			context,
			{
				title: '修改密码',
				width: '30%',
				height: 'auto',
				maxHeight: '70vh',
				showFooter: true,
				accept: async () => {
					pwdData.data.userID = model.userID ?? '';
					const { $toast, $api, $app, $router } = context.globalProps;

					if (!pwdData.data.userID) {
						$toast.add({
							severity: 'error',
							detail: '未获取到用户标识',
							summary: '错误',
							group: 'br',
							life: 3000
						});
						return false;
					}

					if (!pwdData.data.newPwd) {
						$toast.add({
							severity: 'error',
							detail: '请填写新密码',
							summary: '错误',
							group: 'br',
							life: 3000
						});
						return false;
					}

					if (pwdData.data.newPwd !== pwdData.data.newPwdAgain) {
						$toast.add({
							severity: 'error',
							detail: '新密码与二次确认密码不相同，请确认',
							summary: '错误',
							group: 'br',
							life: 3000
						});
						return false;
					}

					const apiClient = $api as ApiClient;
					try {
						const res = await apiClient.doAction(
							{
								path: pwdData.data.userID,
								action: 'changePwd',
								repository: 'Users',
								service: 'base',
							},
							{
								payload: {
									newPwd: pwdData.data.newPwd
								}
							});

						if (res) {
							$toast.add({
								severity: 'success',
								detail: '修改密码成功',
								summary: '成功',
								life: 3000
							});
							$app.signOut();
							window.localStorage.removeItem('user');
							setTimeout(() => $router.replace('/Base/Signin'), 2000);
						}
						return true;
					} catch (error: any) {
						$toast.add({
							severity: 'error',
							detail: error.message,
							summary: '错误',
							group: 'br',
							life: 3000
						});
						return false;
					}
				},
				reject: async () => {
					return false;
				},
			}
		);
	} catch (error: any) {
		return false;
	}
}

// 驳回
const beforeDisapprove = async (context: UiContext, model: User, action: EntityAction) => {
	const { $ui: ui, $api: apiBox } = context.globalProps
	await context.uiBuilder.confirmDialog(ui.factory.formItem({
		name: 'disapproveReason',
		label: context.t('auth.disapproveReason'),
		required: true,
		isEdit: true
	}, {
		default: () => ui.factory.textarea(parmas.disapproveReason, {
			autoResize: true,
			placeholder: context.t('invalid.requireDisapproveReason'),
			'onUpdate:modelValue': (value: any) => {
				parmas.disapproveReason = value;
			},
		})
	}), context, {
		title: action.label,
		width: '30%',
		height: 'auto',
		maxHeight: '70vh',
		showFooter: true,
		accept: async () => {
			if (parmas.disapproveReason === '') {
				context.uiBuilder.toast(context, {
					severity: 'error',
					summary: context.t('dialog.title.error'),
					detail: context.t('invalid.requireDisapproveReason'),
					group: 'br',
					life: 3000
				})
				return false
			}
			try {
				const res = await apiBox.doAction({
					path: model.userID,
					action: 'disapprove',
					repository: 'Users',
					service: 'base',
				}, {
					actionName: action.label,
					payload: parmas
				})
				if (res) {
					context.uiBuilder.toast(context, {
						severity: 'success',
						summary: context.t('dialog.success'),
						detail: context.t('账号驳回成功，请前往邮箱查看驳回原因'),
						group: 'br',
						life: 3000
					})
					context.reload();
					return true
				}
			} catch (error:any) {
				context.uiBuilder.toast(context, {
					severity: 'error',
					detail: error.message,
					summary: context.t('dialog.title.error'),
					group: 'br',
					position: 'bottom-right',
					life: 3000,
				})
				return false
			}
		},
		reject: async () => {},
	})
	return false
}
export class UserLogic extends UiLogic<User> {
	constructor(init: UiLogicInit) {
		super(defineUser, init);
		this.addRelativeLogic<UserRole>('roles', (master) => new UserRoleLogic(this, master));
		this.addRelativeLogic<UserDevice>('devices', (master) => new UserDeviceLogic(this, master));
		this.addRelativeLogic<UserOpenIdentity>('openIdentities', (master) => new UserOpenIdentityLogic(this, master));
		this.addRelativeLogic<UserRelation>('relations', (master) => new UserRelationLogic(this, master));
		this.beforeAction = (context: UiContext, model: User, action: EntityAction) => {
			try {
				if (action.name == 'changePwd') return beforeChangePwd(context, model, action);
				else if (action.name === 'disapprove') return beforeDisapprove(context, model, action)
				else return Promise.resolve(true);
			} catch (error: any) {
				return Promise.resolve(false);
			}
		}
		this.beforeSave = (context: UiContext, model: User, action: EntityAction) => {
			const { email, telPrefix, mobile } = model
			const { $t: t } = context.globalProps
			// 邮箱验证
			const regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
			// 国家区号验证
			const regTelPrefix = /\+\d{1,3}\s?/g
			// 手机号验证
			const regPhone = /^((13[0-9])|(14[0-9])|(15[0-9])|(16[0-9])|(17[0-9])|(18[0-9])|(19[0-9]))\d{8}$/
			if (!regEmail.test(email) && !isRefNone(email)) return Promise.reject(Error(t('invalid.regEmailFormat')));
			if (!regTelPrefix.test(telPrefix) && !isRefNone(telPrefix)) return Promise.reject(Error(t('invalid.regTelPrefixFormat')));
			if (!regPhone.test(mobile) && !isRefNone(mobile)) return Promise.reject(Error(t('invalid.regPhoneFormat')));
			return Promise.resolve(true);
		};
	}
	beforeIndex(): UiLogicFnResult<User> {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length === 0) {
			fields.push(
				this.field('status').searchable(true),
				this.field('subscribedChannels').searchable(true),
				this.field('staff').searchable(true),
				this.field('deptID').setCustomCellRenderer((fld, ctx, props) => {
					if (isRefNone(ctx.model.deptID)) return h('div');
					const { modules } = ctx.app;
					const linkable = props?.linkable ?? true;
					const url = linkable ? ctx.routeToRelative(fld) : '';
					// 检索出引用模块的主模块
					const refMainModule = modules.find((module: Module) => module?.subModules && module.subModules.findIndex((subModule: Module) => subModule.objName === fld.reference?.refObjName) != -1);
					// 检索出引用模块
					const refModule = refMainModule && refMainModule.subModules && refMainModule.subModules.find((subModule: Module) => subModule.objName === fld.reference?.refObjName);
					const { $router, $ui: ui } = ctx.globalProps;
					const namedRoute = { name: 'Department', params: { id: ctx.model.deptID } };
					const r = $router.resolve(namedRoute);
					if (!url || !refModule?.authority?.allowRead) return ui.factory.textSpan(ctx.model.customProperties.$deptID);
					return ctx.uiBuilder.fldFactory.HasOneText(fld, ctx)
				})
			)
		}
		return { fields, groups, customActions }
	}
	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('deptID').onChange((context, model, newVal) => {
					model.roles.forEach((value: any) => {
						if (value.entityState > 4) {
							value.entityState = 4
						}
					})
					const items = model.roles.filter((value: any) => value.entityState < 4)
					if (isRefNone(newVal) && items.length > 0) {
						items.forEach((value: any) => {
							value.deptID = null
							value.customProperties.$deptID = ''
							MetaModel.modify(value)
						})
					} else {
						items.forEach((value: any) => {
							value.deptID = newVal
							value.customProperties.$deptID = model.customProperties.$deptID
							MetaModel.modify(value)
						})
					}
				}).setSearchParam((context, model, fld) => ({
					status: `IN ${DepartmentStatus.RUNNING}`
				}))
			)
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
				this.group<UserRole>('roles').defaultAdder(this.newUserRole),
				// this.group<UserDevice>('devices').defaultAdder(this.newUserDevice),
				this.group<UserOpenIdentity>('openIdentities')
					.addCustomAction({
						name: 'createContractItem',
						label: '创建',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.newUserOpenIdentity,
						view: UiViewOne.Edit,
					}),
				// this.group<UserRelation>('relations')
				// 	.addCustomAction({
				// 		name: 'createContractItem',
				// 		label: '创建',
				// 		icon: 'far fa-plus-circle',
				// 		role: 'info',
				// 		onAction: this.newUserRelation,
				// 		view: UiViewOne.Edit,
				// 	}),
			)
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
				this.field('deptID').setCustomRenderer((fld, ctx, props) => {
					const fldVal = ctx.getFieldValue(fld);
					return h('div', { style: { width: '100%', overflow: 'hidden' } }, [
						h(
							'a',
							{
								style: {
									color: '#409eff',
								},
								href: 'javascript:;',
								onClick: async () => {
									const { $api: apiBox, $router: router } = ctx.globalProps;

									if (fldVal.deptID) {
										window.open(`/BASE/Departments/${fldVal.deptID}`, '_blank');
									}
								},
							},
							fldVal ? fldVal.deptName : ''
						),
					]);
				}),
				this.field('personID').setCustomRenderer((fld, ctx, props) => {
					const fldVal = ctx.getFieldValue(fld);
					return h('div', { style: { width: '100%', overflow: 'hidden' } }, [
						h(
							'a',
							{
								style: {
									color: '#409eff',
								},
								href: 'javascript:;',
								onClick: async () => {
									const { $api: apiBox, $router: router } = ctx.globalProps;

									if (fldVal.personID) {
										window.open(`/BASE/Persons/${fldVal.personID}`, '_blank');
									}
								},
							},
							fldVal ? fldVal.personName : ''
						),
					]);
				}),
			);
		}
		return { fields, groups, customActions };
	}
	/**
	* 创建用户角色
	* @param context 界面上下文
	* @param target 项目模板
	*/
	newUserRole(context: UiContext, target: User) {
		context.select<UserRole>({
			repository: 'Roles',
			searchParam: {
				pager: defaultPager(),
				queryParams: {},
			},
			ctor: defineUserRole,
			selectionMode: 'multiple',
		})
			.then((selection: any) => {
				if (selection) {
					// 取相同的数据
					const items = selection.filter((item: any) => MetaModel.hasAnyLike(target.roles, { roleID: item.roleID }));
					if (items.length > 0) return context.uiBuilder.toast(context, {
						severity: 'error',
						summary: context.globalProps.$t('dialog.title.error'),
						group: 'br',
						detail: context.globalProps.$t('不能添加重复的角色'),
						life: 3000
					})
					context.addSubGroupItems<UserRole>({
						target,
						group: 'roles',
						source: selection,
						propsMapper: {
							deptID: () => ({ deptID: !isRefNone(target.deptID) ? target.deptID : '', deptName: target.customProperties.$deptID })
						},
					});

				}
			})
			.catch((error: any) => {
			});
	}

	/**
	* 创建用户终端设备
	* @param context 界面上下文
	* @param target 项目模板
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
	* 创建用户开放标识
	* @param context 界面上下文
	* @param target 项目模板
	*/
	newUserOpenIdentity(context: UiContext, target: User) {
		// context.newSubGroupItem<UserOpenIdentity>({
		// 	group: 'openIdentities',
		// 	target,
		// }).then(item => {
		// 	if (item) {
		// 		context.addSubGroupItem('openIdentities', item);
		// 	}
		// })
		context.createSubGroupItems({
			group: 'openIdentities',
			target,
			propsMapper: {
				openIDType: m => {
					const i = 0
					if (Array.isArray(m.openIdentities) && m.openIdentities.length > 0) {
						const num = Number(m.openIdentities[m.openIdentities.length - 1].rowNum) + 1
						return `${num}`
					} else {
						return `${i + 1}`
					}

				}
			},
			creator: defineUserOpenIdentity
		}).then(item => {
			if (item) {
				context.addSubGroupItem('openIdentities', item)
			}
		})
	}

	/**
	* 创建用户关系
	* @param context 界面上下文
	* @param target 项目模板
	*/
	newUserRelation(context: UiContext, target: User) {
		context.newSubGroupItem<UserRelation>({
			group: 'relations',
			target,
		}).then(item => {
			if (item) {
				context.addSubGroupItem('relations', item);

			}
		})
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造用户交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const UserLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new UserLogic({
	service: metaUiService,
	repository: 'Users',
	router,
	module: module || metaUiService.findModule('User'),
})
/**
 * 角色交互逻辑
 */
export class UserRoleLogic extends UiGroupLogic<UserRole, User> {
	constructor(parent: UserLogic, master: User) {
		super(defineUserRole, parent, master, 'roles')
	}
}
/**
 * 设备交互逻辑
 */
export class UserDeviceLogic extends UiGroupLogic<UserDevice, User> {
	constructor(parent: UserLogic, master: User) {
		super(defineUserDevice, parent, master, 'devices')
	}
}
/**
 * 开放标识交互逻辑
 */
export class UserOpenIdentityLogic extends UiGroupLogic<UserOpenIdentity, User> {
	constructor(parent: UserLogic, master: User) {
		super(defineUserOpenIdentity, parent, master, 'openIdentities')
	}
}
/**
 * 用户关系交互逻辑
 */
export class UserRelationLogic extends UiGroupLogic<UserRelation, User> {
	constructor(parent: UserLogic, master: User) {
		super(defineUserRelation, parent, master, 'relations')
	}
}
//#endregion ~GENERATED PARTS END
