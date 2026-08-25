/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { DepartmentType } from '../enums/DepartmentType';
import type { WorkLane } from '../enums/WorkLane';
import type { DepartmentStatus } from '../enums/DepartmentStatus';
/**
 * 部门
 * 
 * @remarks 部门。部门及分支机构，包括加盟公司
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface Department extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 部门标识
	 */
	deptID: string;
	/**
	 * 部门编码
	 */
	deptCode?: string;
	/**
	 * 部门名称
	 */
	deptName: string;
	/**
	 * 部门全称
	 * concat(ifnull(deptCode,'_'),' ',deptName)
	 */
	deptCodeName?: string;
	/**
	 * 简称
	 */
	shortName?: string;
	/**
	 * 部门类型：0;DEPARTMENT;内设部门|1;DIVISION;子公司|2;AFFILIATED;关联公司|3;FRANCHISED;加盟公司
	 */
	deptType: DepartmentType;
	/**
	 * 业务条线：0;GENERAL;总|1;MARKETING;市场|2;SALES;销售|4;SERVICE;服务|8;DESIGN;方案设计|16;OPERATION;运营|32;RESEARCHING;技研|64;PURCHASING;采购|128;PRODUCTION;生产|256;LOGISTICS;物流512;DELIVERING;交付|1024;RMA;售后|2048;HR;人力资源|4096;FINANCIAL;财务|8192;IT;信息|16384;OTHER;其他
	 */
	workLane?: WorkLane;
	/**
	 * 部门经理：REF Employee(empID,empName)
	 */
	leaderID?: string;
	/**
	 * 状态：0;BUILDING;组建中|1;RUNNING;运作中|-1;CLOSED;已关闭
	 */
	status: DepartmentStatus;
	/**
	 * 上级部门：REF Department(deptID,deptName,parentDeptID)
	 */
	parentDeptID?: string;
	/**
	 * 地区：REF ProvinceNCity(regionCode,regionFullName,parentRegionCode)
	 */
	regionCode?: string;
	/**
	 * 地址
	 */
	addr?: string;
	/**
	 * 电话
	 */
	tel?: string;
	/**
	 * 传真
	 */
	fax?: string;
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
	//#endregion ~GENERATED PARTS END
}
/**
 * 部门实体定义函数
 */
export const defineDepartment = (o: object) => {
	const e = defineEntity<Department>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.deptID }
	});
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
