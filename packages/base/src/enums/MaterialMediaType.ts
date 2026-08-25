/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
/**
 * 媒体类型
 * 
 * 0;PICTURE;图片|1;BROCHURE;说明书|2;DRAWING;二维图纸|3;MODEL;三维模型|4;VIDEO;视频|9;OTHER;其他文档
 * 
 * @author mmda code robot
 * @version 4.0.0
 * 
 */
export const enum MaterialMediaType{
	//#region ~GENERATED PARTS BEGIN
	PICTURE = 'PICTURE',  //0 图片
	BROCHURE = 'BROCHURE',  //1 说明书
	DRAWING = 'DRAWING',  //2 二维图纸
	MODEL = 'MODEL',  //3 三维模型
	VIDEO = 'VIDEO',  //4 视频
	OTHER = 'OTHER',  //9 其他文档
	
}
export const MaterialMediaTypeEnum = {
	PICTURE_VALUE : 0,
	BROCHURE_VALUE : 1,
	DRAWING_VALUE : 2,
	MODEL_VALUE : 3,
	VIDEO_VALUE : 4,
	OTHER_VALUE : 9,
	
	PICTURE_TEXT : '图片',
	BROCHURE_TEXT : '说明书',
	DRAWING_TEXT : '二维图纸',
	MODEL_TEXT : '三维模型',
	VIDEO_TEXT : '视频',
	OTHER_TEXT : '其他文档',

	valueOf(enumCode: MaterialMediaType): number {
		return this[`${enumCode}_VALUE`];
	},
	textOf(enumCode: MaterialMediaType): string {
		return this[`${enumCode}_TEXT`];
	},
} as const;
//#endregion ~GENERATED PARTS END