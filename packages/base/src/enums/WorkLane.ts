/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 业务条线
 * 
 * 0;MANAGE;综合管理|1;MARKETING;市场拓展|2;SALES;销售业务|3;DESIGN;设计研发|4;QUOTATION;预结算|5;CONSTRUCTION;工程施工|6;PURCHASE;采购供应|7;MANUFACTURE;生产制造|8;LOGISTICS;物流后勤|9;FINANCE;财务管理|10;HR;人力资源|11;ENGINEER;工程技术|12;SERVICE;售后服务|13;IT;信息技术|99;OTHER;其他
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum WorkLane{
	//#region ~GENERATED PARTS BEGIN
	GENERAL = 'GENERAL',  //0 总
	MARKETING = 'MARKETING',  //1 市场
	SALES = 'SALES',  //2 销售
	SERVICE = 'SERVICE',  //4 服务
	DESIGN = 'DESIGN',  //8 方案设计
	OPERATION = 'OPERATION',  //16 运营
	RESEARCHING = 'RESEARCHING',  //32 技研
	PURCHASING = 'PURCHASING',  //64 采购
	PRODUCTION = 'PRODUCTION',  //128 生产
	LOGISTICS = 'LOGISTICS',  //256 物流512
	RMA = 'RMA',  //1024 售后
	HR = 'HR',  //2048 人力资源
	FINANCIAL = 'FINANCIAL',  //4096 财务
	IT = 'IT',  //8192 信息
	OTHER = 'OTHER',  //16384 其他
	
}
export const WorkLaneEnum = {
	GENERAL_VALUE : 0,
	MARKETING_VALUE : 1,
	SALES_VALUE : 2,
	SERVICE_VALUE : 4,
	DESIGN_VALUE : 8,
	OPERATION_VALUE : 16,
	RESEARCHING_VALUE : 32,
	PURCHASING_VALUE : 64,
	PRODUCTION_VALUE : 128,
	LOGISTICS_VALUE : 256,
	RMA_VALUE : 1024,
	HR_VALUE : 2048,
	FINANCIAL_VALUE : 4096,
	IT_VALUE : 8192,
	OTHER_VALUE : 16384,
	
	GENERAL_TEXT : '总',
	MARKETING_TEXT : '市场',
	SALES_TEXT : '销售',
	SERVICE_TEXT : '服务',
	DESIGN_TEXT : '方案设计',
	OPERATION_TEXT : '运营',
	RESEARCHING_TEXT : '技研',
	PURCHASING_TEXT : '采购',
	PRODUCTION_TEXT : '生产',
	LOGISTICS_TEXT : '物流512',
	RMA_TEXT : '售后',
	HR_TEXT : '人力资源',
	FINANCIAL_TEXT : '财务',
	IT_TEXT : '信息',
	OTHER_TEXT : '其他',

	valueOf(enumCode: WorkLane): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: WorkLane): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END