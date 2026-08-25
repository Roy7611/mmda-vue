/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 紧急性
 * 
 * 0;NORMAL;普通|1;SENIOR;优先|2;URGENT;紧急
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum Urgency {
	//#region ~GENERATED PARTS BEGIN
	NORMAL = 'NORMAL',  //0 普通
	SENIOR = 'SENIOR',  //1 优先
	URGENT = 'URGENT',  //2 紧急

}
export const UrgencyEnum = {
	NORMAL_VALUE: 0,
	SENIOR_VALUE: 1,
	URGENT_VALUE: 2,

	NORMAL_TEXT: '普通',
	SENIOR_TEXT: '优先',
	URGENT_TEXT: '紧急',

	valueOf(enumCode: Urgency): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: Urgency): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;

export const urgencyList = [
	{
		label: '全部',
		value: null,
	},
	{
		label: UrgencyEnum.textOf(Urgency.NORMAL),
		value: UrgencyEnum.valueOf(Urgency.NORMAL),
	},
	{
		label: UrgencyEnum.textOf(Urgency.SENIOR),
		value: UrgencyEnum.valueOf(Urgency.SENIOR),
	},
	{
		label: UrgencyEnum.textOf(Urgency.URGENT),
		value: UrgencyEnum.valueOf(Urgency.URGENT),
	},
]

export const urgencyLevel = (urgency: Urgency) => {
	let level = 'info'
	switch (UrgencyEnum.valueOf(urgency)) {
		case 0:
			level = 'info'
			break;
		case 1:
			level = 'warn'
			break;
		case 2:
			level = 'error'
			break;

		default:
			break;
	}
	return level
}
export const urgencyIcon = (urgency: Urgency) => {
	let icon = 'pi pi-exclamation-circle'
	switch (UrgencyEnum.valueOf(urgency)) {
		case 0:
			icon = 'pi pi-exclamation-circle'
			break;
		case 1:
			icon = 'pi pi-exclamation-triangle'
			break;
		case 2:
			icon = 'pi pi-times-circle'
			break;

		default:
			break;
	}
	return icon
}
//#endregion ~GENERATED PARTS END