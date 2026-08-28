/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import type { MetaUiService, Module, UiContext, EntityAction } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, UiLogicFnResult } from '@mmda/vui';
import { type ProjectAcceptance, defineProjectAcceptance } from '@/models/ProjectAcceptance';
import { type ProjectAcceptanceItem, defineProjectAcceptanceItem } from '@/models/ProjectAcceptanceItem';
import { type ProjectDeliveryItem, defineProjectDeliveryItem } from '@/models/ProjectDeliveryItem';
import { defaultPager } from '@mmda/core';
import { ProjectAcceptanceStatus } from '@/enums/ProjectAcceptanceStatus';
import { ProjectAcceptanceStatusEnum } from '@/enums/ProjectAcceptanceStatus';

/**
 * 项目验收交互逻辑
 * @author mmda codebot
 * @since 2025-01-15 09:10:08.0
 * @revision 2025-06-24 13:25:01.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 项目验收交互逻辑
 */
export class ProjectAcceptanceLogic extends UiLogic<ProjectAcceptance> {
	constructor(init: UiLogicInit) {
		super(defineProjectAcceptance, init);
		this.addRelativeLogic<ProjectAcceptanceItem>('items', master => new ProjectAcceptanceItemLogic(this, master));
	}

	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length === 0) {
			fields.push(this.field('projectID').searchable(true), this.field('checkType').searchable(true), this.field('status').searchable(true));
		}
		return { fields, groups, customActions };
	}

	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();

		if (fields.length === 0) {
			fields.push(
				this.field('checkDate').lockIf(lockIfEdit),
				this.field('acceptedDate').lockIf(lockIfEdit),
				this.field('acceptNo').lockIf(lockIfEdit),
				this.field('projectID').lockIf(m => {
					if (m.refName === 'ProjectTask') {
						return true;
					}
					return lockIfEdit(m);
				}),
				this.field('checkType').lockIf(m => {
					if (m.refName === 'ProjectTask') {
						return true;
					}
					return lockIfEdit(m);
				}),
				this.field('acceptSummary').lockIf(lockIfEdit),
				this.field('customJson').lockIf(lockIfEdit),
				// 根据状态锁
				this.field('checkResult').lockIf(this.lockByStatus),
				this.field('checker').lockIf(this.lockByStatus),
				this.field('remark').lockIf(this.lockByStatus)
			);
		}

		if (groups.length == 0) {
			groups.push(
				this.group('items')
					.addCustomAction({
						name: 'addFromDeliverables',
						label: '从交付物添加',
						icon: 'far fa-plus-circle',
						role: 'info',
						visible: m => m.status === ProjectAcceptanceStatus.INITIAL,
						onAction: async (ctx: UiContext<ProjectAcceptance>) => {
							if (!ctx.model.projectID || ctx.model.projectID === '0') {
								ctx.uiBuilder.toast(ctx, {
									severity: 'error',
									summary: ctx.globalProps.$t('dialog.title.error'),
									detail: '请先选择项目',
									group: 'br',
									life: 3000,
								});
								return;
							}

							// 打开交付物选择对话框
							ctx
								.select<ProjectDeliveryItem>({
									repository: 'ProjectDeliveryItems',
									selectionMode: 'multiple',
									searchParam: {
										pager: defaultPager(),
										queryParams: {
											projectID: ctx.model.projectID,
										},
									},
									ctor: (data: any) => defineProjectDeliveryItem(data) as ProjectDeliveryItem,
								})
								.then(selection => {
									if (Array.isArray(selection) && selection.length > 0) {
										const source = selection.map(item => ({
											...item,
											itemName: `${item.productName || ''}${item.productName && item.specs ? ': ' : ''}${item.specs || ''}`.trim(),
										}));

										ctx.addSubGroupItems<ProjectAcceptanceItem>({
											target: ctx.model,
											group: 'items',
											source,
											sequenceKey: 'itemID',
											propsMapper: {
												acceptanceID: () => ctx.model.id,
											},
										});
									}
								});
						},
					})
					.addCustomAction({
						name: 'addManually',
						label: '手动创建',
						icon: 'far fa-plus-circle',
						role: 'info',
						visible: m => m.status === ProjectAcceptanceStatus.INITIAL,
						onAction: async (ctx: UiContext<ProjectAcceptance>) => {
							// 手动添加一个空的验收项
							ctx
								.newSubGroupItem<ProjectAcceptanceItem>({
									group: 'items',
									sequenceKey: 'itemID',
									target: ctx.model,
									propsMapper: {
										acceptanceID: () => ctx.model.id,
									},
								})
								.then((item: any) => {
									if (item) {
										ctx.addSubGroupItem('items', item);
									}
								});
						},
					})
			);
		}

		return { fields, groups, customActions };
	}

	lockByStatus(model: ProjectAcceptance) {
		const currentPath = window.location.pathname;
		const isCreate = currentPath.indexOf('Create') > -1;
		if (isCreate) {
			return false;
		}
		const statusValue = ProjectAcceptanceStatusEnum.valueOf(model.status);
		const { SUBMITTED_VALUE, RECTIFYING_VALUE, INITIAL_VALUE } = ProjectAcceptanceStatusEnum;
		if (statusValue === SUBMITTED_VALUE || statusValue === RECTIFYING_VALUE || statusValue === INITIAL_VALUE) {
			return false;
		}
		return true;
	}

	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造项目验收交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProjectAcceptanceLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new ProjectAcceptanceLogic({
		service: metaUiService,
		repository: 'ProjectAcceptances',
		router,
		module: module || metaUiService.findModule('ProjectAcceptance'),
	});
/**
 * 验收分项交互逻辑
 */
export class ProjectAcceptanceItemLogic extends UiGroupLogic<ProjectAcceptanceItem, ProjectAcceptance> {
	constructor(parent: ProjectAcceptanceLogic, master: ProjectAcceptance) {
		super(defineProjectAcceptanceItem, parent, master, 'items');
		console.log(parent, master);
	}

	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		fields.push(
			this.field('itemName').lockIf(() => lockIfEdit(this.master)),
			this.field('acceptCriteria').lockIf(() => lockIfEdit(this.master)),
			this.field('accepted').lockIf(this.lockByStatus),
			this.field('remainingIssue').lockIf(this.lockByStatus),
			this.field('expectedToResolve').lockIf(this.lockByStatus)
		);
		return { fields, groups, customActions };
	}

	lockByStatus = () => {
		const currentPath = window.location.pathname;
		const isCreate = currentPath.indexOf('Create') > -1;
		// 状态和refName取自 master
		const status = this.master.status;
		if (isCreate) {
			return false;
		}
		const statusValue = ProjectAcceptanceStatusEnum.valueOf(status);
		const { SUBMITTED_VALUE, RECTIFYING_VALUE, INITIAL_VALUE } = ProjectAcceptanceStatusEnum;
		if (statusValue === SUBMITTED_VALUE || statusValue === RECTIFYING_VALUE || statusValue === INITIAL_VALUE) {
			return false;
		}
		return true;
	};
}
//#endregion ~GENERATED PARTS END

function lockIfEdit(model: any) {
	if (model.status === ProjectAcceptanceStatus.INITIAL) {
		return false;
	}
	const currentPath = window.location.pathname;
	const isEdit = currentPath.indexOf('Edit') > -1;
	return isEdit;
}
