/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2025-07-01 15:29:28
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2025-07-16 15:08:05
 * @FilePath: /mmda-vue/packages/base/src/models/RoleModuleAuth.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity, defineEntity, defineEntityArray } from '@mmda/core';
import type { ModuleAuthScope } from '../enums/ModuleAuthScope';
/**
 * 角色功能权限
 * 
 * @remarks 角色功能权限
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface RoleModuleAuth extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 角色标识
	 */
	roleID: string;
	/**
	 * 模块编码
	 */
	moduleCode: string;
	/**
	 * 读取
	 */
	allowRead: boolean;
	/**
	 * 创建
	 */
	allowCreate: boolean;
	/**
	 * 编辑
	 */
	allowEdit: boolean;
	/**
	 * 删除
	 */
	allowDelete: boolean;
	/**
	 * 打印
	 */
	allowPrint: boolean;
	/**
	 * 导入
	 */
	allowImport: boolean;
	/**
	 * 导出
	 */
	allowExport: boolean;
	/**
	 * 上传模版
	 */
	allowUpload: boolean;
	/**
	 * 权限范围：0;SELF;本人|1;GROUP;组|2;DEPARTMENT;部门|4;DIVISION;子公司|8;ALL;全局
	 */
	authScope: ModuleAuthScope;
	/**
	 * 权限操作，多个逗号隔开
	 */
	authActions?: string;
	/**
	 * 权限规则
	 */
	authRule?: string;
	//#endregion ~GENERATED PARTS END
}
/**
 * 角色功能权限实体定义函数
 */
export const defineRoleModuleAuth = (o: object) => {
	const e = defineEntity<RoleModuleAuth>(o);
	//定义id
	Object.defineProperty(e, 'id', {
		get: function () { return `${this.roleID},${this.moduleCode}` }
	});
	return e;
}
