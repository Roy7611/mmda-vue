/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 品控阶段
 * 
 * 0;TQC;全程品控|1;IQC;来料品控|2;IPQC;在制品控|3;FQC;产终品控|4;OQC;出货品控
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum QcPhase{
	//#region ~GENERATED PARTS BEGIN
	QA = 'QA',  //0 品质保证
	IQC = 'IQC',  //1 来料品检
	IPQC = 'IPQC',  //2 制程品质管控
	PQC = 'PQC',  //3 半成品检验
	FQC = 'FQC',  //4 产终检验
	OQC = 'OQC',  //5 出货检验
	
}
export const QcPhaseEnum = {
	QA_VALUE : 0,
	IQC_VALUE : 1,
	IPQC_VALUE : 2,
	PQC_VALUE : 3,
	FQC_VALUE : 4,
	OQC_VALUE : 5,
	
	QA_TEXT : '品质保证',
	IQC_TEXT : '来料品检',
	IPQC_TEXT : '制程品质管控',
	PQC_TEXT : '半成品检验',
	FQC_TEXT : '产终检验',
	OQC_TEXT : '出货检验',

	valueOf(enumCode: QcPhase): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: QcPhase): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END