/*
 * @Author: LiuLan 15999689+browser-liu@user.noreply.gitee.com
 * @Date: 2026-05-18 13:55:40
 * @LastEditors: LiuLan 15999689+browser-liu@user.noreply.gitee.com
 * @LastEditTime: 2026-06-11 15:31:47
 * @FilePath: \mmda\packages\mes\src\modules\work_teams\WorkTeamLogic.ts
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
import { type MetaUiService, type Module, type MetaUiField, type UiContext, defaultPager, EntityAction, ApiClient, MetaModel, isRefNone, EntityState } from '@mmda/core';
import { type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type WorkTeam, defineWorkTeam } from '@/models/WorkTeam';
import { type Worker, defineSelectWorker, defineWorker } from '@/models/Worker';
import { type WorkerSkill, defineWorkerSkill } from '@/models/WorkerSkill';
import { type WorkTeamShift, defineWorkTeamShift } from '@/models/WorkTeamShift';
import { EmployeeStatus } from '@mmda/base/src/enums/EmployeeStatus';
import { UrgencyEnum } from '@mmda/base/src/enums/Urgency';
/**
 * 班组交互逻辑
 * @author mmda codebot
 * @since 2026-03-30 11:54:31.0
 * @revision 2026-03-30 11:54:58.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 班组交互逻辑
 */
export class WorkTeamLogic extends UiLogic<WorkTeam> {
	constructor(init: UiLogicInit) {
		super(defineWorkTeam, init);
		this.addRelativeLogic<Worker>('members', (master) => new WorkLogic(this, master));
		this.addRelativeLogic<WorkTeamShift>('shifts', (master) => new WorkTeamShiftLogic(this, master));
	}

	hasMember(target: WorkTeam, workerID?: string) {
		if (!workerID || !target.members) return false;
		return target.members.some((item: Worker) => !MetaModel.deleted(item) && item.workerID === workerID);
	}

	/**
	 * 列表页逻辑
	 */
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();

		if (fields.length == 0) {
			fields.push(
				// 班组类型
				this.field('teamTypeID'),

				// 班组长
				this.field('leaderID'),

				// 合格否
				this.field('qualified'),

				// 状态
				this.field('status')
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
				/*
				this.field('fldName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange<string>((ctx,model,newVal,oldVal)=>{ })
					.onValidate<string>((value,model)=>{ })
				*/
				this.field('leaderID')
					.refFilter((model, ctx) => {
					const __p = ((ctx, model) => ({
						status: EmployeeStatus.ON_BOARD
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
				})
					.onChange<string>(async (ctx, model, newVal, oldVal) => {
						if (!newVal || this.hasMember(model, newVal)) return;
						let leader = model.leader;

						if (!leader || leader.workerID !== newVal) {
							try {
								leader = defineWorker(await ctx.apiClient.getOne(newVal, {
									repository: 'Workers',
									service: 'mes',
								}));
							} catch (error) {
								console.warn('班组长自动加入成员分组失败', error);
								return;
							}
						}

						if (!leader || this.hasMember(model, leader.workerID)) return;

						ctx.addSubGroupItems({
							target: model,
							group: 'members',
							sequenceKey: 'itemID',
							source: [leader],
							propsMapper: {
								workerID: (item: any) => item.workerID,
							},
						});
					}),
				this.field('qualified').lockIf(() => true),
				this.field('status').lockIf(() => true)
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

			if (groups.length == 0) {
				// 工人组
				groups.push(
					this.group<Worker>('members')
						.inplaceEdit(false)
						.defaultAdder(this.addMembers)
						.onChange((ctx, model, items) => {
							const activeMembers = (items ?? []).filter(
								(item: Worker) => !MetaModel.deleted(item)
							);
							model.memberCount = activeMembers.length;

							if (!model.leaderID) return;

							const hasLeader = activeMembers.some(
								(item: Worker) => item.workerID === model.leaderID
							);
							if (hasLeader) return;

							model.leaderID = undefined;
							model.leader = undefined;
						})
				);

				// 班次分组
				groups.push(
					this.group<WorkTeamShift>('shifts')
						.defaultAdder(this.addShifts)
				);
			}


		}
		return { fields, groups, customActions };
	}

	/**
	 * 添加工人
	 * @param context
	 * @param target
	 */
	addMembers(context: UiContext<WorkTeam>, target: WorkTeam) {
		return context.select<Worker>({
			repository: 'Workers',
			service: 'mes',
			ctor: defineSelectWorker,
			selectionMode: 'multiple',
			searchParam: {
				pager: defaultPager(),
				queryParams: {
					status: EmployeeStatus.ON_BOARD
				}
			},
			selectableFn: (m: Worker) => !this.hasMember(target, m.workerID) && m.workerID !== target.leaderID
		}).then((selection: Worker[] | unknown) => {
			const list = Array.isArray(selection) ? selection : [];
			if (list.length === 0) return;
			// list.forEach((item: Worker) => {
			// 	item.entityState = EntityState.MODIFIED;
			// })
			context.addSubGroupItems({
				target,
				group: 'members',
				sequenceKey: 'itemID',
				source: list,
				propsMapper: {
					workerID: item => item.workerID,
					skills: 'skills'
				},
			});
		});
	}


	/**
	 * 添加班次
	 * @param context
	 * @param target
	 */
	addShifts(context: UiContext<WorkTeam>, target: WorkTeam) {
		return context.select<WorkTeamShift>({
			repository: 'Shifts',
			service: 'mes',
			ctor: defineWorkTeamShift,
			selectionMode: 'multiple',
			searchParam: {
				pager: defaultPager(),
			},
			selectableFn: (m: WorkTeamShift) => !(target.shifts && target.shifts.find((r: WorkTeamShift) => !MetaModel.deleted(r) && r.shiftID === m.shiftID))
		}).then((selection: WorkTeamShift[] | unknown) => {
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

					// priority: item => ({
					// 	priority: item.priority,
					// 	priorityName: UrgencyEnum.textOf(item.priority)
					// }),
				},
			});
			console.log(context.model, '值');

		});
	}


	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造班组交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns 
 */
export const WorkTeamLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) => new WorkTeamLogic({
	metaUiService: metaUiService,
	repository: 'WorkTeams',
	router,
	module: module || metaUiService.findModule('WorkTeam'),
})
/**
 * 工人交互逻辑
 */
export class WorkLogic extends UiGroupLogic<Worker, WorkTeam> {
	constructor(parent: WorkTeamLogic, master: WorkTeam) {
		super(defineWorker, parent, master, 'members')

		this.addRelativeLogic<WorkerSkill>('skills', (master) => new WorkerSkillLogic(this, master));
	}
}

/**
 * 工人技能交互逻辑
 */
export class WorkerSkillLogic extends UiGroupLogic<WorkerSkill, Worker> {
	constructor(parent: WorkLogic, master: Worker) {
		super(defineWorkerSkill, parent, master, 'skills')
	}
}

/**
 * 出勤班次交互逻辑
 */
export class WorkTeamShiftLogic extends UiGroupLogic<WorkTeamShift, WorkTeam> {
	constructor(parent: WorkTeamLogic, master: WorkTeam) {
		super(defineWorkTeamShift, parent, master, 'shifts')
	}
}
//#endregion ~GENERATED PARTS END
