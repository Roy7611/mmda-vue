/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { MetaUiService, Module, MetaUiField, EntityAction, type UiContext, isRefNone, ApiClient, isNullOrUndefined, defaultPager, MetaModel } from '@mmda/core';
import { type UiViewContext, type UiLogicInit, UiLogic, UiGroupLogic, type UiLogicFnResult, UiViewOne } from '@mmda/vui';
import { type Equipment, defineEquipment } from '@/models/Equipment';
import { type EquipmentStation, defineEquipmentStation } from '@/models/EquipmentStation';
import { h } from 'vue';
import { User, defineUser } from '@mmda/base/src/models/User';
import { Station, defineStation } from '@/models/Station';
import { BomUsage } from '@/enums/BomUsage';
import { type MaintenancePlan } from '@/models/MaintenancePlan';
import { MaintainingFrequency } from '@/enums/MaintainingFrequency';

/** 获取工位子表当前最大优先级 */
const maxStationPriority = (stations?: EquipmentStation[]) =>
	stations?.reduce((max, item) =>
		!MetaModel.deleted(item) && Number(item.priority) > max ? Number(item.priority) : max, 0
	) ?? 0;
/**
 * 移交
 * @param context
 * @param model
 * @param action
 * @returns
 */
const beforehandover = async (context: UiContext<Equipment>, model: Equipment, action: EntityAction) => {
	const { $toast } = context.globalProps;
	const user = localStorage.getItem('user')
	return context
		.select<User>({
			service: 'base',
			repository: 'Users',
			ctor: defineUser,
			selectionMode: 'single',
			searchParam: {
				pager: defaultPager(),
				queryParams: {
					userID: user ? `NOT IN ${JSON.parse(user).userId}`: '',
					status: 'ACTIVATED',
				}
			}
		})
		.then((selection: any) => {
			if (selection) {
				const submitBody = {
					ownerID: selection.userID,
					ownerDeptID: selection.deptID,
				};
				action.path = model.equipID;
				action.param = submitBody;
				return true;
			}
		});
};
/**
 * 安装
 * @param context
 * @param model
 * @param action
 * @returns
 */
const beforeInstall = async (context: UiContext<Equipment>, model: Equipment, action: EntityAction) => {
	const { $toast } = context.globalProps;
	return context
		.select<Station>({
			repository: 'Stations',
			ctor: defineStation,
			selectionMode: 'single',
			searchParam: {
				pager: defaultPager(),
				queryParams: {
					equippingType: '>0'
				}
			}
		})
		.then((selection: any) => {
			if (selection) {
				const payload = {
					lineID: selection.lineID,
					startWorkDate: '',
					checklistID: model.checklistID,
					stationID: selection.stationID,
				};
				action.param = { payload };
				return true;
			}
		});
};
/**
 * 点检
 * @param context
 * @param model
 * @param action
 */
const beforecheck = async (context: UiContext, model: Equipment, action: EntityAction) => {
	// EquipmentChecklistCreate  createParam
	// const { $toast ,$router} = context.globalProps;
	// const createParam = {
	// 	refName: 'Equipment',
	// 	refID: model.equipID,
	// 	refItemKeys: null as any,
	// };
	// $router.push({name:'EquipmentChecklistCreate',state:createParam})
	return true;
};

/**
 * 设备交互逻辑
 * @author mmda codebot
 * @since 2024-08-07 10:30:03.0
 * @revision 2024-09-01 23:04:16.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 设备交互逻辑check
 */
export class EquipmentLogic extends UiLogic<Equipment> {
	constructor(init: UiLogicInit) {
		super(defineEquipment, init);
		this.addRelativeLogic<EquipmentStation>('stations', (master) => new EquipmentStationLogic(this, master));
		this.beforeAction = (context: UiContext<Equipment>, model: Equipment, action: EntityAction) => {
			try {
				if (action.name == 'handover') return beforehandover(context, model, action);
				if (action.name == 'install') return beforeInstall(context, model, action);
				if (action.name == 'check') return beforecheck(context, model, action);
				else return Promise.resolve(true);
			} catch (error: any) {
				return Promise.resolve(false);
			}
		};
	}
	// 计算下次维护日期
	calculateNextMaintainDate(context: UiContext, maintenancePlan: MaintenancePlan): string {
		let start: string | Date; // 维护开始计算日期 如 本周第一天 本月第一天等
		let nextDate: string;
		switch (maintenancePlan.frequency) {
			case MaintainingFrequency.DAILY:
				nextDate = new Date().plus({ day: 1 }).toSQLDate();
				break;
			case MaintainingFrequency.WEEKLY:
				start = new Date().weekStart(new Date());
				if (start.plus({ day: maintenancePlan.onDay - 1 }).isAfter(new Date())) {
					nextDate = start.plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				} else {
					nextDate = start.plus({ week: 1 }).plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				}
				break;
			case MaintainingFrequency.MONTHLY:
				start = new Date().monthStart(new Date());
				if (start.plus({ day: maintenancePlan.onDay - 1 }).isAfter(new Date())) {
					nextDate = start.plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				} else {
					nextDate = start.plus({ month: 1 }).plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				}
				break;
			case MaintainingFrequency.QUARTERLY:
				start = new Date().quarterStart(new Date());
				if (start.plus({ day: maintenancePlan.onDay - 1 }).isAfter(new Date())) {
					nextDate = start.plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				} else {
					nextDate = start.plus({ quarter: 1 }).plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				}
				break;
			case MaintainingFrequency.YEARLY:
				start = new Date().monthStart(new Date());
				if (start.plus({ day: maintenancePlan.onDay - 1 }).isAfter(new Date())) {
					nextDate = start.plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				} else {
					nextDate = start.plus({ year: 1 }).plus({ day: maintenancePlan.onDay - 1 }).toSQLDate();
				}
				break;

			default:
				break;
		}

		return nextDate ?? '';
	}
	beforeIndex() {
		const { fields, groups, customActions } = super.beforeIndex();
		if (fields.length == 0) {
			fields.push(this.field('status').searchable(true), this.field('stationID').searchable(true), this.field('lineID').searchable(true));
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
				/**
				 * 控制状态为新的可以编辑，负数状态的不能编辑，其他状态锁定设备编号。
				 */
				this.field('equipNo').lockIf(model => model.status == 'NORMAL' || model.status == 'DISABLED'),
				//选择工位，确定产线
				this.field('stationID')
					.onChange((ctx: UiViewContext<any>, model, newVal, oldVal) => {
						console.log(isNullOrUndefined(newVal), '工位')
						// 提取新旧工位ID，用于同步子表
						const newStationID = !isNullOrUndefined(newVal)
							? (typeof newVal === 'object' ? (newVal as any).stationID : newVal)
							: null;
						const oldStationID = !isNullOrUndefined(oldVal)
							? (typeof oldVal === 'object' ? (oldVal as any).stationID : oldVal)
							: null;
						// 清空主表工位时，若该工位仍在子表中，则还原并警告
						if (isNullOrUndefined(newVal) && !isNullOrUndefined(oldStationID)) {
							const existsInStations = (model.stations ?? []).some(
								(item) => !MetaModel.deleted(item) && item.stationID === oldStationID
							);
							if (existsInStations) {
								ctx.setFieldValue('stationID', oldVal);
								ctx.uiBuilder.toast(ctx, {
									severity: 'warn',
									summary: ctx.t('dialog.title.prompt'),
									group: 'br',
									detail: ctx.t('equipment.stationAlreadyInList'),
									life: 3000,
								});
								return;
							}
						}
						// 切换或取消工位时，移除子表中旧工位的记录（无论movable是否开启都要清理，防止后续开启时带入旧数据）
						if (!isNullOrUndefined(oldStationID) && oldStationID !== newStationID) {
							const oldItem = (model.stations ?? []).find(
								(item) => !MetaModel.deleted(item) && item.stationID === oldStationID
							);
							if (oldItem) {
								ctx.removeSubGroupItem('stations', oldItem);
							}
						}
						if (isNullOrUndefined(newVal) === false) {
							const stationIDFieldOption = ctx.getFieldCurrentOption('stationID')
							ctx.setFieldValue('lineID', {
								lineID: stationIDFieldOption.lineID,
								lineName: stationIDFieldOption.prodLine.lineName
							})
							// 如果已开启可移动，自动将工位加入设备站点子表
							if (model.movable) {
								const station = ctx.getFieldCurrentOption('stationID');
								const stationID = station?.stationID ?? (typeof station === 'string' ? station : null);
								if (!isNullOrUndefined(stationID) && !isRefNone(stationID)) {
									const exists = (model.stations ?? []).some(
										(item) => !MetaModel.deleted(item) && item.stationID === stationID
									);
									if (!exists) {
										let priority = maxStationPriority(model.stations);
										ctx.addSubGroupItems({
											target: model,
											group: 'stations',
											source: typeof station === 'object' ? station : { stationID },
											propsMapper: {
												lineID: (m: any) => {
													if (m?.prodLine?.lineName) {
														return { lineID: m.lineID, lineName: m.prodLine.lineName };
													}
													if (m?.lineName) {
														return { lineID: m.lineID, lineName: m.lineName };
													}
													const line = ctx.getFieldCurrentOption('lineID');
													return {
														lineID: line?.lineID ?? model.lineID,
														lineName: line?.lineName,
													};
												},
												priority: () => ++priority,
											},
										});
									}
								}
							}
						} else if (isNullOrUndefined(newVal) === true) {
							ctx.clearFieldValue('lineID')
						}
					})
					.setSearchParam((ctx, model) => {
						if (model.lineID) {
							return {
								equippingType: '>0',
								lineID: model.lineID ?? '',
							};
						} else {
							return {
								equippingType: '>0'
							}
						}

					}),
				this.field('lineID')
					.lockIf(model => !isRefNone(model.lineID))
					.onChange((ctx: UiViewContext<any>, model, newVal, oldVal) => {
						if (isNullOrUndefined(newVal)) {
							model.stationID = null;
						}
					})
					.setSearchParam((ctx, model) => {
						return {
							status: 'USED'
						}
					}),
				this.field('checklistID').setSearchParam((ctx, model) => {
					return { status: 'USED' };
				}),
				this.field('movable').onChange((context, model, newVal) => {
					if (newVal) {
						// 开启：自动将当前工位加入设备站点（校验model.stationID防止getFieldCurrentOption返回缓存值）
						if (isNullOrUndefined(model.stationID) || isRefNone(model.stationID)) return;
						const station = context.getFieldCurrentOption('stationID');
						const stationID = station?.stationID ?? (typeof station === 'string' ? station : null);
						if (isNullOrUndefined(stationID) || isRefNone(stationID)) return;
						const exists = (model.stations ?? []).some(
							(item) => !MetaModel.deleted(item) && item.stationID === stationID
						);
						if (exists) return;
						let priority = maxStationPriority(model.stations);
						context.addSubGroupItems({
							target: model,
							group: 'stations',
							source: typeof station === 'object' ? station : { stationID },
							propsMapper: {
								lineID: (m: any) => {
									if (m?.prodLine?.lineName) {
										return { lineID: m.lineID, lineName: m.prodLine.lineName };
									}
									if (m?.lineName) {
										return { lineID: m.lineID, lineName: m.lineName };
									}
									const line = context.getFieldCurrentOption('lineID');
									return {
										lineID: line?.lineID ?? model.lineID,
										lineName: line?.lineName,
									};
								},
								priority: () => ++priority,
							},
						});
					} else {
						// 关闭前校验：存在多个工位时不允许关闭
						const stationCount = (model.stations ?? []).filter((item) => !MetaModel.deleted(item)).length;
						if (stationCount > 1) {
							context.setFieldValue('movable', true);
							context.uiBuilder.toast(context, {
								severity: 'warn',
								summary: context.t('dialog.title.prompt'),
								group: 'br',
								detail: context.t('equipment.clearMovableStationsFirst'),
								life: 3000,
							});
							return;
						}
						context.removeSubGroupItems('stations');
					}
				}),
				this.field('maintenancePlanID').onChange((ctx: UiViewContext<any>, model, newVal) => {
					if (isRefNone(newVal)) {
						ctx.setFieldValue('planToMaintain', '');
					} else {
						const currentOption = ctx.getFieldCurrentOption('maintenancePlanID')
						ctx.setFieldValue('planToMaintain', this.calculateNextMaintainDate(ctx, currentOption));
					}
				}),
				// this.field('bomID').setSearchParam((ctx, model) => {
				// 	return { status: '>-1' };
				// }),
				this.field('deviceID').setSearchParam((ctx, model) => {
					return { runningState: 'WORKING' };
				}),
				this.field('bomID').setSearchParam((ctx, model) => {
					return { status: 'APPROVED', bomUsage: `IN ${BomUsage.MAINTENANCE}` };
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
				this.group<EquipmentStation>('stations')
					.hideIf(model => !model.movable)
					.addCustomAction({
						name: 'createContractItem',
						label: 'action.add',
						icon: 'far fa-plus-circle',
						role: 'info',
						onAction: this.addEquipmentStation,
						visible: t => t.movable,
						view: UiViewOne.Edit,
					})
					.clearIf(() => true)
			)
			/**
			fields.push(
				this.group<I>('grpName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange((ctx: UiViewContext<any>,model,items)=>{ })
			);
			 */
		}
		return { fields, groups, customActions };
	}
	beforeDetails(): UiLogicFnResult<Equipment> {
		const { fields, groups, customActions } = super.beforeDetails();
		if (groups.length === 0) {
			groups.push(this.group<EquipmentStation>('stations').hideIf(model => !model.movable));
		}
		if (fields.length === 0) {
			fields.push(
				this.field('stationID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
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

									if (fldVal.stationID) {
										window.open(`/MES/Stations/${fldVal.stationID}`, '_blank');
									}
								},
							},
							fldVal?.stationName ?? ''
						),
					]);
				}),
				this.field('lineID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
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

									if (fldVal.lineID) {
										window.open(`/MES/ProductionLines/${fldVal.lineID}`, '_blank');
									}
								},
							},
							fldVal?.lineName ?? ''
						),
					]);
				}),
				this.field('maintenancePlanID').setCustomRenderer((fld, ctx: UiViewContext<any>, props) => {
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

									if (fldVal.planID) {
										window.open(`/MES/MaintenancePlans/${fldVal.planID}`, '_blank');
									}
								},
							},
							fldVal?.planName ?? ''
						),
					]);
				})
			)
		}
		return { fields, groups, customActions };
	}
	addEquipmentStation(context: UiContext<Equipment>, target: Equipment) {
		context.select<Station>({
			repository: 'Stations',
			selectionMode: 'multiple',
			searchParam: {
				pager: defaultPager(),
				queryParams: {
					equippingType: '>0'
				}
			},
			ctor: defineStation,
			selectableFn: (station: Station) =>
				!(target.stations && target.stations.find(
					(item) => !MetaModel.deleted(item) && item.stationID === station.stationID
				)),
		}).then((selection: Station[] | unknown) => {
			const list = Array.isArray(selection) ? selection : [];
			if (list.length === 0) return;
			// 获取最大优先级，新增项依次递增
			let priority = maxStationPriority(target.stations);
			context.addSubGroupItems({
				target,
				group: 'stations',
				source: list,
				propsMapper: {
					lineID: (m: any) => ({ lineID: m.lineID, lineName: m.prodLine?.lineName }),
					priority: () => ++priority,
				}
			});
		})
	}
	//设置详情逻辑
	//beforeDetails(){}
}

/**
 * 构造设备交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const EquipmentLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
	new EquipmentLogic({
		metaUiService: metaUiService,
		repository: 'Equipments',
		router,
		module: module || metaUiService.findModule('Equipment'),
	})
/**
 * 工位交互逻辑
 */
export class EquipmentStationLogic extends UiGroupLogic<EquipmentStation, Equipment> {
	constructor(parent: EquipmentLogic, master: Equipment) {
		super(defineEquipmentStation, parent, master, 'stations')
	}
	beforeEdit() {
		const { fields, groups, customActions } = super.beforeEdit();
		if (groups.length == 0) {
			// 隐藏概要信息(s9)
			groups.push(
				this.group('s9').hideIf(() => true)
			);
		}
		return { fields, groups, customActions };
	}
	beforeDetails() {
		const { fields, groups, customActions } = super.beforeDetails();
		if (groups.length == 0) {
			// 隐藏概要信息(s9)
			groups.push(
				this.group('s9').hideIf(() => true)
			);
		}
		return { fields, groups, customActions };
	}
}
//#endregion ~GENERATED PARTS END
