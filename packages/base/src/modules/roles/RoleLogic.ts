/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { ref, unref, watch } from 'vue';
import { MetaUiService, Module, MetaUiField, type UiContext, MetaModel, isRefNone } from '@mmda/core';
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
const renderModuleCodeLabel = (
	_fld: MetaUiField,
	ctx: UiContext<RoleModuleAuth>,
) => {
	const row = ctx.model as RoleModuleAuth & { moduleLabel?: string };
	const code = row.moduleCode ?? '';
	const label = row.moduleLabel ?? '';
	return [code, label].filter(Boolean).join(' ');
};
const actionKey = (action: { actionName?: string; actionCode?: string }) =>
	action.actionName || action.actionCode || '';

/** 勾选后向子模块级联；复选框由 TreeGrid `booleanedit` + `displayAsCheckBox` 负责。 */
const cascadeAuthFlag =
	(fieldName: string) =>
	(
		_ctx: UiContext<RoleModuleAuth>,
		model: RoleModuleAuth,
		val: boolean | string | number,
	) => {
		const currentItem: any = model;
		const secondCode = getSecondPart(currentItem.moduleCode);
		const oneCode = getOnePart(currentItem.moduleCode);
		if (!secondCode) {
			if (isRefNone(oneCode)) {
				(currentItem.subModuleAuths ?? []).forEach((item: any) => {
					item[fieldName] = val;
					if (!item.subModuleAuths) item.subModuleAuths = [];
					item.subModuleAuths.forEach((v: any) => {
						v[fieldName] = val;
					});
				});
			} else {
				(currentItem.subModuleAuths ?? []).forEach((item: any) => {
					item[fieldName] = val;
				});
			}
		} else {
			currentItem[fieldName] = val;
		}
	};
const renderAuthorizedActions = (
	_fld: MetaUiField,
	ctx: UiContext<RoleModuleAuth>,
) => {
	const row = ctx.model as RoleModuleAuth & {
		moduleActions?: Array<{ actionName?: string; actionCode?: string; displayLabel?: string }>;
		actions?: Array<{ actionName?: string; actionCode?: string; displayLabel?: string }>;
		authorizedActions?: Array<{ actionName?: string; actionCode?: string; displayLabel?: string }>;
		authority?: { authorizedActions?: Array<{ actionName?: string; actionCode?: string; displayLabel?: string }> };
	};
	const actions = row.moduleActions ?? row.actions ?? [];
	const authorized = row.authorizedActions ?? row.authority?.authorizedActions ?? [];
	const allowed = new Set(authorized.map(actionKey).filter(Boolean));
	const labels = (actions.length
		? actions.filter(action => allowed.has(actionKey(action)))
		: authorized
	)
		.map(action => action.displayLabel)
		.filter(Boolean);
	return labels.join('、');
};
const editAuthorizedActions = (
	_fld: MetaUiField,
	ctx: UiContext<RoleModuleAuth>,
	_props?: Record<string, unknown>,
) => {
	const { $ui: ui, $t: t } = ctx.globalProps;
	const row = ctx.model as RoleModuleAuth & {
		moduleActions?: unknown[];
		actions?: unknown[];
		authorizedActions?: unknown[];
		authority?: { authorizedActions?: unknown[] };
	};
	return ui.factory.multiSelect({
		showClear: true,
		editable: true,
		placeholder: t('action.select'),
		dataKey: 'actionName',
		optionLabel: 'displayLabel',
		class: 'ui-searchOp w-full',
		options: row.moduleActions ?? row.actions ?? [],
		modelValue: row.authorizedActions ?? row.authority?.authorizedActions,
		onUpdate: (value: unknown) => {
			row.authorizedActions = value as typeof row.authorizedActions;
			MetaModel.modify(row);
		},
	});
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
			fields.push(this.field('roleType'), this.field('creator'));
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
					.field('moduleCode')
					.setCustomRenderer(renderModuleCodeLabel)
					.setCustomCellRenderer(renderModuleCodeLabel)
					.inplaceEdit(false)
					.nextField('allowRead')
					.inplaceEdit()
					.onChange(cascadeAuthFlag('allowRead'))
					.nextField('allowCreate')
					.inplaceEdit()
					.onChange(cascadeAuthFlag('allowCreate'))
					.nextField('allowEdit')
					.inplaceEdit()
					.onChange(cascadeAuthFlag('allowEdit'))
					.nextField('allowPrint')
					.inplaceEdit()
					.onChange(cascadeAuthFlag('allowPrint'))
					.nextField('allowDelete')
					.inplaceEdit()
					.onChange(cascadeAuthFlag('allowDelete'))
					.nextField('allowImport')
					.inplaceEdit()
					.onChange(cascadeAuthFlag('allowImport'))
					.nextField('allowExport')
					.inplaceEdit()
					.onChange(cascadeAuthFlag('allowExport'))
					.nextField('allowUpload')
					.inplaceEdit()
					.onChange(cascadeAuthFlag('allowUpload'))
					.nextField('authScope')
					.inplaceEdit()
					.nextField('authActions')
					.setCustomEditor(editAuthorizedActions)
					.setCustomCellRenderer(renderAuthorizedActions)
					.inplaceEdit().parent
				//角色用户
				// this.group<UserRole>('users').defaultAdder(this.addusers).field('parttime').inplaceEdit().parent
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
					.field('moduleCode')
					.setCustomRenderer(renderModuleCodeLabel)
					.setCustomCellRenderer(renderModuleCodeLabel)
					.inplaceEdit(false)
					.nextField('allowRead')
					.nextField('allowCreate')
					.nextField('allowEdit')
					.inplaceEdit()
					.nextField('allowPrint')
					.inplaceEdit()
					.nextField('allowDelete')
					.inplaceEdit()
					.nextField('allowImport')
					.inplaceEdit()
					.nextField('allowExport')
					.inplaceEdit()
					.nextField('allowUpload')
					.inplaceEdit()
					.nextField('authScope')
					.inplaceEdit()
					.nextField('authActions')
					.setCustomCellRenderer(renderAuthorizedActions).parent
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
				this.field('moduleCode')
					.setCustomRenderer(renderModuleCodeLabel)
					.setCustomCellRenderer(renderModuleCodeLabel)
			);
		}

		return { fields, groups, customActions };
	}
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length === 0) {
			fields.push(
				this.field('moduleCode')
					.setCustomRenderer(renderModuleCodeLabel)
					.setCustomCellRenderer(renderModuleCodeLabel),
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
									item.subModuleAuths.forEach((value: any) => {
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
					.setCustomCellRenderer(renderAuthorizedActions)
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
