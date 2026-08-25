/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 质量状态
 * 
 * 0;UNKNOWN;-|1;NI;待检品|2;OK;合格品|4;AUC;让步接受|8;DG;瑕疵品|16;NG;不良品|32;SCRAP;废品
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum QaStatus{
	//#region ~GENERATED PARTS BEGIN
	UNKNOWN = 'UNKNOWN',  //0 -
	NI = 'NI',  //1 待检品
	OK = 'OK',  //2 合格品
	AUC = 'AUC',  //4 让步接受
	DG = 'DG',  //8 瑕疵品
	NG = 'NG',  //16 不良品
	SCRAP = 'SCRAP',  //32 废品
	
}
export const QaStatusEnum = {
	UNKNOWN_VALUE : 0,
	NI_VALUE : 1,
	OK_VALUE : 2,
	AUC_VALUE : 4,
	DG_VALUE : 8,
	NG_VALUE : 16,
	SCRAP_VALUE : 32,
	
	UNKNOWN_TEXT : '-',
	NI_TEXT : '待检品',
	OK_TEXT : '合格品',
	AUC_TEXT : '让步接受',
	DG_TEXT : '瑕疵品',
	NG_TEXT : '不良品',
	SCRAP_TEXT : '废品',

	valueOf(enumCode: QaStatus): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: QaStatus): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END
