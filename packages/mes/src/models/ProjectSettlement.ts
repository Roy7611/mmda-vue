/**
 * Copyright (c) 2006, 2024, www.mmda.cloud All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { ProjectSettlementStatus } from '../enums/ProjectSettlementStatus';
import { type ProjectSettlementItem, defineProjectSettlementItem } from './ProjectSettlementItem';
/**
 * 项目结算
 * 
 * @remarks 项目结算。按合同和变更与甲方最终结算出应收总金额，可能产生扣款，因此尾款按totalReceivable计算，税率按合同规定，结算后发起应收开票流程。同时内部核算出应付清单，最终计算实际毛利率%
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2025-06-24 13:19:54.0
 * 
 */
export interface ProjectSettlement extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 结算标识
	 */
	settlementID: string;
	/**
	 * 结算编号
	 */
	settlementNo: string;
	/**
	 * 结算日期
	 */
	settleDate?: string;
	/**
	 * 结算概要
	 */
	settlementSummary?: string;
	/**
	 * 项目标识
	 */
	projectID: string;
	/**
	 * 竣工总额
	 */
	totalSettledValue?: number;
	/**
	 * 甲方扣款总额
	 */
	deductedValue?: number;
	/**
	 * 甲方扣款原因描述
	 */
	deductDesc?: string;
	/**
	 * 应收总额
	 * totalSettledValue - deductedValue
	 */
	totalReceivable?: number;
	/**
	 * 应付总额
	 */
	totalPayable?: number;
	/**
	 * 进项税总额
	 */
	totalInputTax?: number;
	/**
	 * 总成本
	 * totalPayable - totalInputTax
	 */
	totalCost?: number;
	/**
	 * 项目毛利
	 * totalSettledValue - deductedValue - totalCost
	 */
	grossProfit?: number;
	/**
	 * 毛利率%
	 */
	grossProfitMargin?: number;
	/**
	 * 状态：0;NEW;新|1;SUBMITTED;已提交|2;APPROVED;已批准|3;DISAPPROVED;驳回|4;SETTLED;已结算|-1;CANCELED;已取消
	 */
	status: ProjectSettlementStatus;
	/**
	 * 备注
	 */
	remark?: string;
	/**
	 * 自定义
	 */
	customJson?: string;
	/**
	 * 创建人：REF User(userID,userName)
	 */
	creatorID?: string;
	/**
	 * 创建部门：REF Department(deptID,deptName)
	 */
	deptID?: string;
	/**
	 * 创建日期
	 */
	createDate?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 修改人：REF User(userID,userName)
	 */
	lastModifierID?: string;
	/**
	 * 负责人：REF User(userID,userName)
	 */
	ownerID?: string;
	/**
	 * 负责部门：REF Department(deptID,deptName)
	 */
	ownerDeptID?: string;
	/**
	 * 结算分项
	 */
	items:  ProjectSettlementItem[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 项目结算实体定义函数
 */
export const defineProjectSettlement = (o: object) => {
	const e = defineEntity<ProjectSettlement>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.settlementID }
	});
	//结算分项
	e.items = defineEntityArray(defineProjectSettlementItem, e.items);
	/**
	Object.defineProperty(e,'compute', {
	});
	*/	return e;
}
