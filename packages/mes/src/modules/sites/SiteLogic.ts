/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { MetaUiService, Module, MetaUiField, type UiContext, isRefNone, ApiClient, defaultPager, MetaModel } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiBuilder, UI_BUILDER_KEY } from '@mmda/vui';
import { type Site, defineSite } from '@/models/Site';
import { type SiteShift, defineSiteShift } from '@/models/SiteShift';
import { type Shift, defineShift } from '@/models/Shift';
import { SiteLevel, SiteLevelEnum } from '@/enums/SiteLevel';
import { h, inject } from 'vue';
import { WorkCenterLevel, WorkCenterLevelEnum } from '@/enums/WorkCenterLevel';

/**
 * 生产站点交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:05.0
 * @revision 2024-09-01 23:04:43.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 生产站点交互逻辑
 */
export class SiteLogic extends UiLogic<Site> {
	constructor(init: UiLogicInit) {
		super(defineSite, init);
		this.addRelativeLogic<SiteShift>('shifts',(master)=>new SiteShiftLogic(this,master));
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(this.field('siteLevel').searchable(true), this.field('openDate').searchable(true), this.field('status').searchable(true));
		}
		return { fields, groups, customActions };
	}
	/**
	 * 设置编辑交互逻辑 DEPRECATED
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				/**
				 * 【编辑】控制能编辑新的和已启用的工作中心，已启用的工作中心编码、站点级别和所属父站点不能再修改。
				 */
				this.field('siteCode').lockIf(model => model.status == 'USED' || model.status == 'DEPRECATED'),
				this.field('siteLevel')
					.lockIf(model => model.status == 'USED' || model.status == 'DEPRECATED')
					.onChange((ctx, model, newVal, oldVal) => {
						model.superSiteID = null;
					}),
				// 站点级别为工厂隐藏选择父站点
				// this.field('superSiteID')
				// 	.lockIf(model => model.status == 'USED' || model.status == 'DEPRECATED')
				// 	.hideIf((model: Site) => model.siteLevel === SiteLevel.PLANT)
				// 	.setSearchParam((ctx, model) => {
				// 		return {
				// 			siteLevel: isRefNone(model.siteLevel) ? '' : `${SiteLevelEnum.valueOf(model.siteLevel) - 1}`,
				// 			status:'USED',
				// 		};
				// 	}),
				//注释：当前支持在已弃用状态下编辑此信息
				// this.field('siteName').lockIf(model => model.status == 'DEPRECATED'),
				// this.field('addressID').lockIf(model => model.status == 'DEPRECATED'),
				// this.field('workCalendarID').lockIf(model => model.status == 'DEPRECATED'),
				// this.field('currCode').lockIf(model => model.status == 'DEPRECATED'),
				// this.field('tags').lockIf(model => model.status == 'DEPRECATED'),
				this.field('siteLevel').onChange((ctx, model, newVal, oldVal) => {
					model.superSiteID = null;
				}),
				// 站点级别为工厂隐藏选择父站点
				this.field('superSiteID')
					.lockIf((model: Site) => model.siteLevel === 'PLANT')
					.setSearchParam((ctx, model) => {
						return {
							siteLevel: isRefNone(model.siteLevel) ? '' : `${WorkCenterLevelEnum.valueOf(model.siteLevel) - 1}`,
							status: 'USED',
						};
					})
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
				this.group<SiteShift>('shifts')
					.defaultAdder(this.addShifts)
			);
		}
		return { fields, groups, customActions };
	}

	/**
	 * 添加开动班次
	 * @param context
	 * @param target
	 */
	addShifts(context: UiContext<Site>, target: Site) {
		return context.select<Shift>({
			repository: 'Shifts',
			service: 'mes',
			ctor: defineShift,
			selectionMode: 'multiple',
			searchParam: {
				pager: defaultPager(),
			},
			selectableFn: (m: Shift) => !(target.shifts && target.shifts.find((r: SiteShift) => !MetaModel.deleted(r) && r.shiftID === m.shiftID))
		}).then((selection: Shift[] | unknown) => {
			const list = Array.isArray(selection) ? selection : [];
			if (list.length === 0) return;
			context.addSubGroupItems({
				target,
				group: 'shifts',
				sequenceKey: 'itemID',
				source: list,
				propsMapper: {
					shiftID: item => ({
						shiftID: item.shiftID,
						shiftName: item.shiftName
					}),
				},
			});
		});
	}

	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造生产站点交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const SiteLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new SiteLogic({
		service: metaUiService,
		repository: 'Sites',
		router,
		module: module || metaUiService.findModule('Site'),
	})
	/**
	 * 开动班次交互逻辑
	 */
	export class SiteShiftLogic extends UiGroupLogic<SiteShift,Site>{
		constructor(parent: SiteLogic, master: Site){
			super(defineSiteShift,parent,master,'shifts')
		}
	}
	//#endregion ~GENERATED PARTS END
