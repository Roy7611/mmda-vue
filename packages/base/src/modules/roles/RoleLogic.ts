/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { h, ref, unref, watch } from 'vue';
import { MetaUiService, Module, MetaUiField, type UiContext, defaultPager, MetaModel, EntityState, ApiClient, ModuleOp, ModuleAuth, auth, SearchOp, hasBit, isRefNone } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type Role, defineRole } from '../../models/Role';
import { type RoleModuleAuth, defineRoleModuleAuth } from '../../models/RoleModuleAuth';
import { type RoleDataAuth, defineRoleDataAuth } from '../../models/RoleDataAuth';
import { type RoleUiAuth, defineRoleUiAuth } from '../../models/RoleUiAuth';
/**
 * 角色交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:59.0
 * @revision 2024-09-01 23:08:30.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 角色交互逻辑
 */
//获得两个点之后的部分
const selected = ref();
const deepCopy = (original: Object | any): Object => {
	if (Array.isArray(original)) {
		return original.map(deepCopy);
	} else if (typeof original === 'object') {
		const copy = Object.create(Object.getPrototypeOf(original));
		Object.keys(original).forEach(key => {
			copy[key] = deepCopy(original[key]);
		});
		return copy;
	}
	return original;
};
const getSecondPart = (str: string) => {
	const parts = str.split('.');
	if (parts.length > 2) {
		return parts[2]; // 获取第三部分，即第二个点后的字符
	}
	return null; // 如果没有两个点，则返回null
};
//获得1个点之后的部分
const getOnePart = (str: string) => {
	const parts = str.split('.');
	if (parts.length > 1) {
		return parts[0] + '.' + parts[1]; // 获取第三部分，即第二个点后的字符
	}
	// else if (parts.length >= 0 && parts.length <= 2 ) {
	// 	return parts[0]+parts[1]; // 获取第三部分，即第二个点后的字符
	// }
	return null; // 如果没有两个点，则返回null
};
export class RoleLogic extends UiLogic<Role> {
	constructor(init: UiLogicInit) {
		super(defineRole, init);
		this.addRelativeLogic<RoleModuleAuth>('moduleAuths', master => new RoleModuleAuthLogic(this, master));
		this.addRelativeLogic<RoleDataAuth>('dataAuths', master => new RoleDataAuthLogic(this, master));
		this.addRelativeLogic<RoleUiAuth>('uiAuths', master => new RoleUiAuthLogic(this, master));
	}

	/**
	 * 设置编辑交互逻辑
	 */
	beforeIndex(): UiLogicFnResult<Role> {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length === 0) {
			fields.push(this.field('roleType').searchable(true), this.field('creator').searchable(true));
		}
		return { fields, groups, customActions };
	}
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
				//角色功能
				this.group<RoleModuleAuth>('moduleAuths')
					.field('allowRead')
					.inPlaceEdit()
					.setCustomEditor((fld, ctx: UiContext<RoleModuleAuth>, props) => {
						props.onChange = (val: boolean | string | number) => {
							const currentItem: any = ctx.model;
							//判断是不是主菜单
							const secondCode = getSecondPart(currentItem.moduleCode);
							//获取第一个菜单的code
							const oneCode = getOnePart(currentItem.moduleCode);
							// console.log('oneCode', oneCode);
							//主菜单
							if (!secondCode) {
								if (isRefNone(oneCode)) {
									currentItem.subModules.forEach((item: any) => {
										item.allowRead = val
										if (!item.subModules) {
											item.subModules = []
										}
										item.subModules.forEach((v: any) => {
											v.allowRead = val
										})
									})
								} else {
									currentItem.subModules.forEach((item: any) => {
										item.allowRead = val
									})
									//获取主表的M.01这样的字段
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	if (item.moduleCode.includes(oneCode)) {
									// 		item.allowRead = item.allowCreate = item.allowDelete =
									// 			item.allowEdit = item.allowExport = item.allowImport = item.allowPrint = val;
									// 	}
									// });
								}
							} else {
								if (val == false) {
									currentItem.allowRead = val;
									// currentItem.allowCreate=val;
									// currentItem.allowDelete=val;
									// currentItem.allowEdit=val;
									// currentItem.allowExport=val;
									// currentItem.allowImport=val;
									// currentItem.allowPrint=val;
								} else {
									currentItem.allowRead = val;
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	console.log('是否是一级菜单', getSecondPart(item.moduleCode));
									// 	if (!getSecondPart(item.moduleCode)) {
									// 		item.allowRead = val;
									// 	}
									// });
								}
							}
						};
						// 判断用户是否有这个权限，没有权限展示为空
						const mA = !isRefNone(ctx.model.allowOps) ? auth(ctx.model.allowOps.value) : '';
						if (!(mA as any)[fld.fieldName]) {
							return h('div', {}, null);
						} else {
							return ctx.uiBuilder.fldFactory.Switcher(fld, ctx, props);
						}
					})
					.nextField('allowCreate')
					.inPlaceEdit()
					.setCustomEditor((fld, ctx: UiContext<RoleModuleAuth>, props) => {
						props.onChange = (val: boolean | string | number) => {
							const currentItem: any = ctx.model;
							//判断是不是主菜单
							const secondCode = getSecondPart(currentItem.moduleCode);
							//获取第一个菜单的code
							const oneCode = getOnePart(currentItem.moduleCode);
							//主菜单
							if (!secondCode) {
								if (isRefNone(oneCode)) {
									currentItem.subModules.forEach((item: any) => {
										item.allowCreate = val
										if (!item.subModules) {
											item.subModules = []
										}
										item.subModules.forEach((v: any) => {
											v.allowCreate = val
										})
									})
								} else {
									currentItem.subModules.forEach((item: any) => {
										item.allowCreate = val
									})
									//获取主表的M.01这样的字段
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	if (item.moduleCode.includes(oneCode)) {
									// 		item.allowRead = item.allowCreate = item.allowDelete =
									// 			item.allowEdit = item.allowExport = item.allowImport = item.allowPrint = val;
									// 	}
									// });
								}
							} else {
								if (val == false) {
									currentItem.allowCreate = val;
									// currentItem.allowCreate=val;
									// currentItem.allowDelete=val;
									// currentItem.allowEdit=val;
									// currentItem.allowExport=val;
									// currentItem.allowImport=val;
									// currentItem.allowPrint=val;
								} else {
									currentItem.allowCreate = val;
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	console.log('是否是一级菜单', getSecondPart(item.moduleCode));
									// 	if (!getSecondPart(item.moduleCode)) {
									// 		item.allowCreate = val;
									// 	}
									// });
								}
							}
						};
						// 判断用户是否有这个权限，没有权限展示为空
						const mA = !isRefNone(ctx.model.allowOps) ? auth(ctx.model.allowOps.value) : '';
						if (!(mA as any)[fld.fieldName]) {
							return h('div', {}, null);
						} else {
							return ctx.uiBuilder.fldFactory.Switcher(fld, ctx, props);
						}
					})
					.nextField('allowEdit')
					.inPlaceEdit()
					.setCustomEditor((fld, ctx: UiContext<RoleModuleAuth>, props) => {
						props.onChange = (val: boolean | string | number) => {
							const currentItem: any = ctx.model;
							//判断是不是主菜单
							const secondCode = getSecondPart(currentItem.moduleCode);
							//获取第一个菜单的code
							const oneCode = getOnePart(currentItem.moduleCode);
							//主菜单
							if (!secondCode) {
								if (isRefNone(oneCode)) {
									currentItem.subModules.forEach((item: any) => {
										item.allowEdit = val
										if (!item.subModules) {
											item.subModules = []
										}
										item.subModules.forEach((v: any) => {
											v.allowEdit = val
										})
									})
								} else {
									currentItem.subModules.forEach((item: any) => {
										item.allowEdit = val
									})
									//获取主表的M.01这样的字段
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	if (item.moduleCode.includes(oneCode)) {
									// 		item.allowRead = item.allowCreate = item.allowDelete =
									// 			item.allowEdit = item.allowExport = item.allowImport = item.allowPrint = val;
									// 	}
									// });
								}
							} else {
								if (val == false) {
									currentItem.allowEdit = val;
									// currentItem.allowCreate=val;
									// currentItem.allowDelete=val;
									// currentItem.allowEdit=val;
									// currentItem.allowExport=val;
									// currentItem.allowImport=val;
									// currentItem.allowPrint=val;
								} else {
									currentItem.allowEdit = val;
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	console.log('是否是一级菜单', getSecondPart(item.moduleCode));
									// 	if (!getSecondPart(item.moduleCode)) {
									// 		item.allowCreate = val;
									// 	}
									// });
								}
							}
						};
						// 判断用户是否有这个权限，没有权限展示为空
						const mA = !isRefNone(ctx.model.allowOps) ? auth(ctx.model.allowOps.value) : '';
						if (!(mA as any)[fld.fieldName]) {
							return h('div', {}, null);
						} else {
							return ctx.uiBuilder.fldFactory.Switcher(fld, ctx, props);
						}
					})
					.nextField('allowPrint')
					.inPlaceEdit()
					.setCustomEditor((fld, ctx: UiContext<RoleModuleAuth>, props) => {
						props.onChange = (val: boolean | string | number) => {
							const currentItem: any = ctx.model;
							//判断是不是主菜单
							const secondCode = getSecondPart(currentItem.moduleCode);
							//获取第一个菜单的code
							const oneCode = getOnePart(currentItem.moduleCode);
							//主菜单
							if (!secondCode) {
								if (isRefNone(oneCode)) {
									currentItem.subModules.forEach((item: any) => {
										item.allowPrint = val
										if (!item.subModules) {
											item.subModules = []
										}
										item.subModules.forEach((v: any) => {
											v.allowPrint = val
										})
									})
								} else {
									currentItem.subModules.forEach((item: any) => {
										item.allowPrint = val
									})
									//获取主表的M.01这样的字段
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	if (item.moduleCode.includes(oneCode)) {
									// 		item.allowRead = item.allowCreate = item.allowDelete =
									// 			item.allowEdit = item.allowExport = item.allowImport = item.allowPrint = val;
									// 	}
									// });
								}
							} else {
								if (val == false) {
									currentItem.allowPrint = val;
									// currentItem.allowCreate=val;
									// currentItem.allowDelete=val;
									// currentItem.allowEdit=val;
									// currentItem.allowExport=val;
									// currentItem.allowImport=val;
									// currentItem.allowPrint=val;
								} else {
									currentItem.allowPrint = val;
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	console.log('是否是一级菜单', getSecondPart(item.moduleCode));
									// 	if (!getSecondPart(item.moduleCode)) {
									// 		item.allowCreate = val;
									// 	}
									// });
								}
							}
						};

						const mA = !isRefNone(ctx.model.allowOps) ? auth(ctx.model.allowOps.value) : '';
						if (!(mA as any)[fld.fieldName]) {
							return h('div', {}, null);
						} else {
							return ctx.uiBuilder.fldFactory.Switcher(fld, ctx, props);
						}
					})
					.nextField('allowDelete')
					.inPlaceEdit()
					.setCustomEditor((fld, ctx: UiContext<RoleModuleAuth>, props) => {
						props.onChange = (val: boolean | string | number) => {
							const currentItem: any = ctx.model;
							//判断是不是主菜单
							const secondCode = getSecondPart(currentItem.moduleCode);
							//获取第一个菜单的code
							const oneCode = getOnePart(currentItem.moduleCode);
							//主菜单
							if (!secondCode) {
								if (isRefNone(oneCode)) {
									currentItem.subModules.forEach((item: any) => {
										item.allowDelete = val
										if (!item.subModules) {
											item.subModules = []
										}
										item.subModules.forEach((v: any) => {
											v.allowDelete = val
										})
									})
								} else {
									currentItem.subModules.forEach((item: any) => {
										item.allowDelete = val
									})
									//获取主表的M.01这样的字段
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	if (item.moduleCode.includes(oneCode)) {
									// 		item.allowRead = item.allowCreate = item.allowDelete =
									// 			item.allowEdit = item.allowExport = item.allowImport = item.allowPrint = val;
									// 	}
									// });
								}
							} else {
								if (val == false) {
									currentItem.allowDelete = val;
									// currentItem.allowCreate=val;
									// currentItem.allowDelete=val;
									// currentItem.allowEdit=val;
									// currentItem.allowExport=val;
									// currentItem.allowImport=val;
									// currentItem.allowPrint=val;
								} else {
									currentItem.allowDelete = val;
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	console.log('是否是一级菜单', getSecondPart(item.moduleCode));
									// 	if (!getSecondPart(item.moduleCode)) {
									// 		item.allowCreate = val;
									// 	}
									// });
								}
							}
						};
						// 判断用户是否有这个权限，没有权限展示为空
						const mA = !isRefNone(ctx.model.allowOps) ? auth(ctx.model.allowOps.value) : '';
						if (!(mA as any)[fld.fieldName]) {
							return h('div', {}, null);
						} else {
							return ctx.uiBuilder.fldFactory.Switcher(fld, ctx, props);
						}
					})
					.nextField('allowImport')
					.inPlaceEdit()
					.setCustomEditor((fld, ctx: UiContext<RoleModuleAuth>, props) => {
						props.onChange = (val: boolean | string | number) => {
							const currentItem: any = ctx.model;
							//判断是不是主菜单
							const secondCode = getSecondPart(currentItem.moduleCode);
							//获取第一个菜单的code
							const oneCode = getOnePart(currentItem.moduleCode);
							//主菜单
							if (!secondCode) {
								if (isRefNone(oneCode)) {
									currentItem.subModules.forEach((item: any) => {
										item.allowImport = val
										if (!item.subModules) {
											item.subModules = []
										}
										item.subModules.forEach((v: any) => {
											v.allowImport = val
										})
									})
								} else {
									currentItem.subModules.forEach((item: any) => {
										item.allowImport = val
									})
									//获取主表的M.01这样的字段
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	if (item.moduleCode.includes(oneCode)) {
									// 		item.allowRead = item.allowCreate = item.allowDelete =
									// 			item.allowEdit = item.allowExport = item.allowImport = item.allowPrint = val;
									// 	}
									// });
								}
							} else {
								if (val == false) {
									currentItem.allowImport = val;
									// currentItem.allowCreate=val;
									// currentItem.allowDelete=val;
									// currentItem.allowEdit=val;
									// currentItem.allowExport=val;
									// currentItem.allowImport=val;
									// currentItem.allowPrint=val;
								} else {
									currentItem.allowImport = val;
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	console.log('是否是一级菜单', getSecondPart(item.moduleCode));
									// 	if (!getSecondPart(item.moduleCode)) {
									// 		item.allowCreate = val;
									// 	}
									// });
								}
							}
						};
						// 判断用户是否有这个权限，没有权限展示为空
						const mA = !isRefNone(ctx.model.allowOps) ? auth(ctx.model.allowOps.value) : '';
						if (!(mA as any)[fld.fieldName]) {
							return h('div', {}, null);
						} else {
							return ctx.uiBuilder.fldFactory.Switcher(fld, ctx, props);
						}
					})
					.nextField('allowExport')
					.inPlaceEdit()
					.setCustomEditor((fld, ctx: UiContext<RoleModuleAuth>, props) => {
						props.onChange = (val: boolean | string | number) => {
							const currentItem: any = ctx.model;
							//判断是不是主菜单
							const secondCode = getSecondPart(currentItem.moduleCode);
							//获取第一个菜单的code
							const oneCode = getOnePart(currentItem.moduleCode);
							//主菜单
							if (!secondCode) {
								if (isRefNone(oneCode)) {
									currentItem.subModules.forEach((item: any) => {
										item.allowExport = val
										if (!item.subModules) {
											item.subModules = []
										}
										item.subModules.forEach((v: any) => {
											v.allowExport = val
										})
									})
								} else {
									currentItem.subModules.forEach((item: any) => {
										item.allowExport = val
									})
									//获取主表的M.01这样的字段
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	if (item.moduleCode.includes(oneCode)) {
									// 		item.allowRead = item.allowCreate = item.allowDelete =
									// 			item.allowEdit = item.allowExport = item.allowImport = item.allowPrint = val;
									// 	}
									// });
								}
							} else {
								if (val == false) {
									currentItem.allowExport = val;
									// currentItem.allowCreate=val;
									// currentItem.allowDelete=val;
									// currentItem.allowEdit=val;
									// currentItem.allowExport=val;
									// currentItem.allowImport=val;
									// currentItem.allowPrint=val;
								} else {
									currentItem.allowExport = val;
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	console.log('是否是一级菜单', getSecondPart(item.moduleCode));
									// 	if (!getSecondPart(item.moduleCode)) {
									// 		item.allowCreate = val;
									// 	}
									// });
								}
							}
						};
						// 判断用户是否有这个权限，没有权限展示为空
						const mA = !isRefNone(ctx.model.allowOps) ? auth(ctx.model.allowOps.value) : '';
						if (!(mA as any)[fld.fieldName]) {
							return h('div', {}, null);
						} else {
							return ctx.uiBuilder.fldFactory.Switcher(fld, ctx, props);
						}
					})
					.nextField('allowUpload')
					.inPlaceEdit()
					.setCustomEditor((fld, ctx: UiContext<RoleModuleAuth>, props) => {
						props.onChange = (val: boolean | string | number) => {
							const currentItem: any = ctx.model;
							//判断是不是主菜单
							const secondCode = getSecondPart(currentItem.moduleCode);
							//获取第一个菜单的code
							const oneCode = getOnePart(currentItem.moduleCode);
							//主菜单
							if (!secondCode) {
								if (isRefNone(oneCode)) {
									currentItem.subModules.forEach((item: any) => {
										item.allowUpload = val
										if (!item.subModules) {
											item.subModules = []
										}
										item.subModules.forEach((v: any) => {
											v.allowUpload = val
										})
									})
								} else {
									currentItem.subModules.forEach((item: any) => {
										item.allowUpload = val
									})
									//获取主表的M.01这样的字段
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	if (item.moduleCode.includes(oneCode)) {
									// 		item.allowRead = item.allowCreate = item.allowDelete =
									// 			item.allowEdit = item.allowExport = item.allowImport = item.allowPrint = val;
									// 	}
									// });
								}
							} else {
								if (val == false) {
									currentItem.allowUpload = val;
									// currentItem.allowCreate=val;
									// currentItem.allowDelete=val;
									// currentItem.allowEdit=val;
									// currentItem.allowExport=val;
									// currentItem.allowImport=val;
									// currentItem.allowPrint=val;
								} else {
									currentItem.allowUpload = val;
									// ctx.root.model.moduleAuths.forEach((item: any) => {
									// 	console.log('是否是一级菜单', getSecondPart(item.moduleCode));
									// 	if (!getSecondPart(item.moduleCode)) {
									// 		item.allowCreate = val;
									// 	}
									// });
								}
							}
						};
						// 判断用户是否有这个权限，没有权限展示为空
						const mA = !isRefNone(ctx.model.allowOps) ? auth(ctx.model.allowOps.value) : '';
						if (!(mA as any)[fld.fieldName]) {
							return h('div', {}, null);
						} else {
							return ctx.uiBuilder.fldFactory.Switcher(fld, ctx, props);
						}
					})
					.nextField('authScope')
					.inPlaceEdit()
					.nextField('authActions')
					.inPlaceEdit().parent
				//角色用户
				// this.group<UserRole>('users').defaultAdder(this.addusers).field('parttime').inPlaceEdit().parent
			);
		}
		return { fields, groups, customActions };
	}
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (groups.length == 0) {
			groups.push(
				//角色功能
				this.group<RoleModuleAuth>('moduleAuths')
					.field('allowRead')
					.nextField('allowCreate')
					.nextField('allowEdit')
					.inPlaceEdit()
					.nextField('allowPrint')
					.inPlaceEdit()
					.nextField('allowDelete')
					.inPlaceEdit()
					.nextField('allowImport')
					.inPlaceEdit()
					.nextField('allowExport')
					.inPlaceEdit()
					.nextField('allowUpload')
					.inPlaceEdit()
					.nextField('authScope')
					.inPlaceEdit()
					.nextField('authActions')
					.setCustomCellRenderer((fld, ctx: UiContext<RoleModuleAuth>, props) => {
						if (ctx.model.authorizedActions && ctx.model.authorizedActions.length > 0) {
							ctx.model.authActions = ctx.model.authorizedActions.map((obj: any) => obj.displayLabel).join(', ');
						} else {
							ctx.model.authActions = null;
						}
						return h('span', ctx.model.authActions)
					}).parent
			);
		}

		return { fields, groups, customActions };
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造角色交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const RoleLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new RoleLogic({
		metaUiService: metaUiService,
		repository: 'Roles',
		router,
		module: module || metaUiService.findModule('Role'),
	});
/**
 * 功能权限交互逻辑
 */
export class RoleModuleAuthLogic extends UiGroupLogic<RoleModuleAuth, Role> {
	constructor(parent: RoleLogic, master: Role) {
		super(defineRoleModuleAuth, parent, master, 'moduleAuths');
	}
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (fields.length === 0) {
			fields.push(
				this.field('moduleCode').setCustomRenderer((fld, ctx: UiContext<RoleModuleAuth>, props) =>
					`${ctx.model.moduleLabel}`
				).setCustomCellRenderer((fld, ctx: UiContext<RoleModuleAuth>, props) => {
					const currentItem: any = ctx.model;
					//判断是不是主菜单
					const secondCode = getSecondPart(currentItem.moduleCode);
					// if (!secondCode) {
					// 	return `${ctx.model.moduleCode} ${ctx.model.moduleLabel}`;
					// } else {
					// 	//非第一个菜单加空格
					// 	const originalText = '\xa0\xa0\xa0\xa0' + `${ctx.model.moduleCode} ${ctx.model.moduleLabel}`;
					// 	return originalText;
					// }
					return `${ctx.model.moduleLabel}`
				})
			);
		}

		return { fields, groups, customActions };
	}
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length === 0) {
			fields.push(
				this.field('moduleCode').setCustomRenderer((fld, ctx: UiContext<RoleModuleAuth>, props) =>
					`${ctx.model.moduleLabel}`
				).setCustomCellRenderer((fld, ctx: UiContext<RoleModuleAuth>, props) => {
					const currentItem: any = ctx.model;
					//判断是不是主菜单
					const secondCode = getSecondPart(currentItem.moduleCode);
					// if (!secondCode) {
					// 	return `${ctx.model.moduleCode} ${ctx.model.moduleLabel}`;
					// } else {
					// 	//非第一个菜单加空格
					// 	const originalText = '\xa0\xa0\xa0\xa0' + `${ctx.model.moduleCode} ${ctx.model.moduleLabel}`;
					// 	return originalText;
					// }
					return `${ctx.model.moduleLabel}`
				}),
				this.field('authActions')
					.setCustomEditor((fld, ctx: UiContext<RoleModuleAuth>, props) => {
						const { $ui: ui, $t: t } = ctx.globalProps
						return ui.factory.multiSelect({
							showClear: true,
							// id: `search_${fld.fieldName}`,
							editable: true,
							// display: 'chip',
							placeholder: t('action.select'),
							dataKey: 'actionName',
							optionLabel: 'displayLabel',
							// optionValue: 'actionName',
							class: 'ui-searchOp w-full',
							options: ctx.model.moduleActions,
							modelValue: ctx.model.authorizedActions,
							onUpdate: (value: any) => {
								ctx.model.authorizedActions = value;
								const { name } = ctx
								const str = name.split(',')
								const arr1 = str[1].split('.')
								this.master.moduleAuths.forEach((item: any) => {
									item.subModules.forEach((value: any) => {
										if (item.moduleCode === arr1[0]) {
											MetaModel.modify(item);
										}
										if (value.moduleCode === arr1[1]) {
											MetaModel.modify(value);
										}
									})
								})
								// 状态改为已修改
								MetaModel.modify(ctx.model);
							},
						});
					})
					.setCustomCellRenderer((fld, ctx: UiContext<RoleModuleAuth>, props) => {
						if (ctx.model.authorizedActions && ctx.model.authorizedActions.length > 0) {
							ctx.model.authActions = ctx.model.authorizedActions.map((obj: any) => obj.displayLabel).join(', ');
						} else {
							ctx.model.authActions = null;
						}
						return h('span', ctx.model.authActions)
					})
				// 修改子表显示数据
			);
		}

		return { fields, groups, customActions };
	}
}
/**
 * 数据权限交互逻辑
 */
export class RoleDataAuthLogic extends UiGroupLogic<RoleDataAuth, Role> {
	constructor(parent: RoleLogic, master: Role) {
		super(defineRoleDataAuth, parent, master, 'dataAuths');
	}
}
/**
 * UI权限交互逻辑
 */
export class RoleUiAuthLogic extends UiGroupLogic<RoleUiAuth, Role> {
	constructor(parent: RoleLogic, master: Role) {
		super(defineRoleUiAuth, parent, master, 'uiAuths');
	}
}
//#endregion ~GENERATED PARTS END
