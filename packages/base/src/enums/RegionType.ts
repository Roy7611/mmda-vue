/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 区域类型
 * 
 * 0;COUNTRY;国家|1;PROVINCE;省|2;CITY;市|3;COUNTY;县
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum RegionType{
	//#region ~GENERATED PARTS BEGIN
	COUNTRY = 'COUNTRY',  //0 国家
	PROVINCE = 'PROVINCE',  //1 省
	CITY = 'CITY',  //2 市
	COUNTY = 'COUNTY',  //3 县
	
}
export const RegionTypeEnum = {
	COUNTRY_VALUE : 0,
	PROVINCE_VALUE : 1,
	CITY_VALUE : 2,
	COUNTY_VALUE : 3,
	
	COUNTRY_TEXT : '国家',
	PROVINCE_TEXT : '省',
	CITY_TEXT : '市',
	COUNTY_TEXT : '县',

	valueOf(enumCode: RegionType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: RegionType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END