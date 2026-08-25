/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 地理方向
 * 
 * 0;EAST;东（→）|1;SOUTH;南（↓）|2;WEST;西（←）|3;NORTH;北（↑）
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum GeographicDirection{
	//#region ~GENERATED PARTS BEGIN
	EAST = 'EAST',  //0 东（→）
	SOUTH = 'SOUTH',  //1 南（↓）
	WEST = 'WEST',  //2 西（←）
	NORTH = 'NORTH',  //3 北（↑）
	
}
export const GeographicDirectionEnum = {
	EAST_VALUE : 0,
	SOUTH_VALUE : 1,
	WEST_VALUE : 2,
	NORTH_VALUE : 3,
	
	EAST_TEXT : '东（→）',
	SOUTH_TEXT : '南（↓）',
	WEST_TEXT : '西（←）',
	NORTH_TEXT : '北（↑）',

	valueOf(enumCode: GeographicDirection): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: GeographicDirection): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
