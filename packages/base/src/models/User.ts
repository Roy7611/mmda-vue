/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { UserStatus } from '../enums/UserStatus';
import type { MessageChannel } from '../enums/MessageChannel';
import type { Person } from './Person';
import { type UserRole, defineUserRole } from './UserRole';
import { type UserDevice, defineUserDevice } from './UserDevice';
import { type UserOpenIdentity, defineUserOpenIdentity } from './UserOpenIdentity';
import { type UserRelation, defineUserRelation } from './UserRelation';
/**
 * 用户
 * 
 * @remarks 用户，每个租户下可注册多个用户账号，用户可以是租户自己公司员工或者其贸易伙伴联系人。通过personID关联标识，职员empID，联系人contactorID
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:59.0
 * 
 */
export interface User extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 用户ID
	 */
	userID: string;
	/**
	 * 用户名称
	 */
	username?: string;
	/**
	 * 头像
	 */
	avatar?: string;
	/**
	 * 电话区号
	 */
	telPrefix?: string;
	/**
	 * 手机号
	 */
	mobile?: string;
	/**
	 * 邮箱
	 */
	email?: string;
	/**
	 * 关联人：HAS_ONE Person(personID,personName)
	 */
	personID?: string;
	/**
	 * 员工否
	 */
	staff: boolean;
	/**
	 * 部门：REF Department(deptID,deptName)
	 */
	deptID?: string;
	/**
	 * 登录密码
	 */
	signInPwd: string;
	/**
	 * 登录密码过期
	 */
	signInPwdExpiredAt?: string;
	/**
	 * 状态：0;NEW;新注册|1;ACTIVATED;已激活|-1;LOCKED;锁定|-2;DEACTIVATED;已注销
	 */
	status: UserStatus;
	/**
	 * 标签
	 */
	tags?: string;
	/**
	 * 通知订阅通道：0;SYSTEM;系统|1;MAIL;邮件|2;SMS;短信|4;PUSH;推送消息
	 */
	subscribedChannels: MessageChannel;
	/**
	 * 创建人
	 */
	creator?: string;
	/**
	 * 创建时间
	 */
	createdDate?: string;
	/**
	 * 修改人
	 */
	lastModifier?: string;
	/**
	 * 最后修改
	 */
	lastModified?: string;
	/**
	 * 角色
	 */
	roles?:  UserRole[];
	/**
	 * 设备
	 */
	devices?:  UserDevice[];
	/**
	 * 开放标识
	 */
	openIdentities?:  UserOpenIdentity[];
	/**
	 * 用户关系
	 */
	relations?:  UserRelation[];
	/**
	 * 关联人
	 */
	person?: Person;
	//#endregion ~GENERATED PARTS END
}
/**
 * 用户实体定义函数
 */
export const defineUser = (o: object) => {
	const e = defineEntity<User>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.userID }
	});
	//角色
	e.roles = defineEntityArray(defineUserRole, e.roles);
	//设备
	e.devices = defineEntityArray(defineUserDevice, e.devices);
	//开放标识
	e.openIdentities = defineEntityArray(defineUserOpenIdentity, e.openIdentities);
	//用户关系
	e.relations = defineEntityArray(defineUserRelation, e.relations);
	return e;
}
