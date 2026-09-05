/* eslint-disable no-useless-escape */
/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import { type MetaUiService, type Module, type MetaUiField, type UiContext, defaultPager, EntityAction, ApiClient, MetaModel, isRefNone } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult } from '@mmda/vui';
import { type Region, defineRegion } from '../../models/Region';
/**
 * 区域交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:59.0
 * @revision 2024-07-17 08:54:33.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 区域交互逻辑
 */
export class RegionLogic extends UiLogic<Region> {
	constructor(init: UiLogicInit) {
		super(defineRegion, init);
		this.beforeSave = (context: UiContext, model: Region, action: EntityAction) => {
			const { telPrefix, localeCode, countryCode } = model
			const { $t: t } = context.globalProps
			// 国家区号验证
			const regTelPrefix = /\+\d{1,3}\s?/g
			// 特殊字符验证
			const regex = /[`~!@#$%^&*()\+=<>?:"{}|,.\/;'\\[\]·！#￥（——）：；“”‘、，|《。》？、【】[\]]/;
			if (regex.test(localeCode) && !isRefNone(localeCode)) return Promise.reject(Error(t('invalid.regSpecialCharactersFormat')));
			if (!regTelPrefix.test(telPrefix) && !isRefNone(telPrefix)) return Promise.reject(Error(t('invalid.regTelPrefixFormat')));
			if (regex.test(countryCode) && !isRefNone(countryCode)) return Promise.reject(Error(t('invalid.regSpecialCharactersFormat')))
			return Promise.resolve(true);
		};
	}
	beforeIndex(): UiLogicFnResult<Region> {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length === 0) {
			fields.push(
				this.field('regionType'),
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
 * 构造区域交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const RegionLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new RegionLogic({
	metaUiService: metaUiService,
	repository: 'Regions',
	router,
	module: module || metaUiService.findModule('Region'),
})
//#endregion ~GENERATED PARTS END
