/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 工作站点类型
 * 
 * 0;WAREHOUSE;仓库|1;PRODUCTION_LINE;产线|2;STATION;工位|4;PROJECT_SITE;项目工地
 * 
 * @author syclive code robot 
 * @version 3.0.0 
 * 
 */
export const enum WorksiteType{
	//#region ~GENERATED PARTS BEGIN
	UNKNOWN = 'UNKNOWN',  //0 -
	WAREHOUSE = 'WAREHOUSE',  //1 仓库
	PRODUCTION_LINE = 'PRODUCTION_LINE',  //2 产线
	STATION = 'STATION',  //4 工位
	PROJECT_SITE = 'PROJECT_SITE',  //8 项目工地
	
}
export const WorksiteTypeEnum = {
	UNKNOWN_VALUE : 0,
	WAREHOUSE_VALUE : 1,
	PRODUCTION_LINE_VALUE : 2,
	STATION_VALUE : 4,
	PROJECT_SITE_VALUE : 8,
	
	UNKNOWN_TEXT : '-',
	WAREHOUSE_TEXT : '仓库',
	PRODUCTION_LINE_TEXT : '产线',
	STATION_TEXT : '工位',
	PROJECT_SITE_TEXT : '项目工地',

	valueOf(enumCode: WorksiteType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: WorksiteType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END