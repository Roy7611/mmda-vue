/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 物料追踪方式
 * 
 * 0;NONE;-|1;LOT;批次|2;SN;序列号
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum MaterialTracingMode{
	//#region ~GENERATED PARTS BEGIN
	NONE = 'NONE',  //0 -
	LOT = 'LOT',  //1 批次
	SN = 'SN',  //2 序列号
	
}
export const MaterialTracingModeEnum = {
	NONE_VALUE : 0,
	LOT_VALUE : 1,
	SN_VALUE : 2,
	
	NONE_TEXT : '-',
	LOT_TEXT : '批次',
	SN_TEXT : '序列号',

	valueOf(enumCode: MaterialTracingMode): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: MaterialTracingMode): string {
		return this[`${enumCode}_TEXT`];
	},
  // 根据值获取文本
  textOfValue(value: number): string {
    switch (value) {
      case this.NONE_VALUE:
        return this.NONE_TEXT;
      case this.LOT_VALUE:
        return this.LOT_TEXT;
      case this.SN_VALUE:
        return this.SN_TEXT;
      default:
        return '';
    }
  }
} as const;
//#endregion ~GENERATED PARTS END