/*
 * @Author: LiuLan 15999689+browser-liu@user.noreply.gitee.com
 * @Date: 2026-03-31 13:40:20
 * @LastEditors: LiuLan 15999689+browser-liu@user.noreply.gitee.com
 * @LastEditTime: 2026-06-11 17:09:34
 * @FilePath: \mmda\packages\mes\src\modules\work_team_types\WorkTeamTypeLogic.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Router } from 'vue-router';
import { type UiContext, type MetaUiService, type Module, defaultPager } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type WorkTeamType, defineWorkTeamType } from '@/models/WorkTeamType';
import { type WorkTeamTypeCert, defineWorkTeamTypeCert } from '@/models/WorkTeamTypeCert';

/**
 * 班组类型交互逻辑
 * @author mmda codebot
 * @since 2026-03-30 11:55:03.0
 * @revision 2026-03-30 11:55:10.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 班组类型交互逻辑
 */
export class WorkTeamTypeLogic extends UiLogic<WorkTeamType> {
	constructor(init: UiLogicInit) {
		super(defineWorkTeamType, init);

		this.addRelativeLogic<WorkTeamTypeCert>('workTeamTypeCerts', master => new WorkTeamTypeCertLogic(this, master));
	}

	/**
	 * 设置编辑交互逻辑
	 */
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('stdMemberCount')
					.onValidate<number>((value, model) => {
						if (value > 99999) {
							return '标配人数不能超过99999人';
						}
						return null;
					}),
				this.field('minMemberCount')
					.onValidate<number>((value, model) => {
						if (value > 99999) {
							return '最低人数不能超过99999人';
						}

						// 标配人数为空或0时，不做比较
						if (
							model.stdMemberCount == null ||
							model.stdMemberCount === 0
						) {
							return null;
						}

						if (
							value != null &&
							value > model.stdMemberCount
						) {
							return '最低人数不能超过标配人数';
						}

						return null;
					})
			);
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

			// 班组类型认证分组
			groups.push(
				this.group<WorkTeamTypeCert>('workTeamTypeCerts')
					.addCustomAction({
						name: 'createCert',
						label: '创建',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.newCert,
						view: UiViewOne.Edit,
					}),

			);
		}
		return { fields, groups, customActions };
	}

	//设置详情逻辑
	//beforeDetails(){}

	/**
	 * 创建班组类型认证
	 * @param context 界面上下文
	 * @param target 班组类型模型
	 */
	newCert(context: UiContext<WorkTeamType>, target: WorkTeamType) {
		context
			.newSubGroupItem({
				group: 'workTeamTypeCerts',
				sequenceKey: 'itemID',
				target,
				creator: defineWorkTeamTypeCert,
			})
			.then(item => {
				if (item) {
					context.addSubGroupItem('workTeamTypeCerts', item);
				}
			});

	}

}



/**
 * 构造班组类型交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const WorkTeamTypeLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new WorkTeamTypeLogic({
	service: metaUiService,
	repository: 'WorkTeamTypes',
	router,
	module: module || metaUiService.findModule('WorkTeamType'),
})

/**
 * 班组类型证书交互逻辑
 */
export class WorkTeamTypeCertLogic extends UiGroupLogic<WorkTeamTypeCert, WorkTeamType> {
	constructor(parent: WorkTeamTypeLogic, master: WorkTeamType) {
		super(defineWorkTeamTypeCert, parent, master, 'workTeamTypeCerts');
	}

	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (fields.length == 0) {
			fields.push(
				this.field('skillID').setSearchParam(() => ({
					status: 'USED',
				}))
			);
		}
		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
