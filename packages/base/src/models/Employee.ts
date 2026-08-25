/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { Gender } from '../enums/Gender';
import type { EmployeeStatus } from '../enums/EmployeeStatus';
import type { Department } from './Department';
/**
 * 职员
 * 
 * @remarks 职员。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:58.0
 * 
 */
export interface Employee extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 职员标识
	 */
	empID: string;
	/**
	 * 头像
	 */
	avatar?: string;
	/**
	 * 工号
	 */
	empNo: string;
	/**
	 * 姓名
	 */
	empName: string;
	/**
	 * 性别：0;UNKNOWN;-|1;MALE;男|2;FEMALE;女
	 */
	gender: Gender;
	/**
	 * 手机
	 */
	mobile?: string;
	/**
	 * 短号
	 */
	shortNumber?: string;
	/**
	 * QQ
	 */
	qq?: string;
	/**
	 * 电子邮箱
	 */
	email?: string;
	/**
	 * 微信号
	 */
	wechat?: string;
	/**
	 * 钉钉号，可不同于mobile
	 */
	dingtalk?: string;
	/**
	 * 工作部门：HAS_ONE Department(deptID,deptName,parentDeptID) AS workDepartment WHERE(status>0)
	 */
	workDeptID: string;
	/**
	 * 职务
	 */
	titleName?: string;
	/**
	 * 办公电话
	 */
	officeTel?: string;
	/**
	 * 状态：0;NEW;新员工|1;ON_BOARD;在岗|-1;LEAVE;离岗
	 */
	status: EmployeeStatus;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 创建部门：REF Department(deptID,deptName,parentDeptID)
	 */
	deptID?: string;
	/**
	 * 创建日期
	 */
	createDate?: string;
	/**
	 * 修改人：REF User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 工作部门
	 */
	workDepartment?: Department;
	//#endregion ~GENERATED PARTS END
}
/**
 * 职员实体定义函数
 */
export const defineEmployee = (o: object) => {
	const e = defineEntity<Employee>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.empID }
	});
	return e;
}
