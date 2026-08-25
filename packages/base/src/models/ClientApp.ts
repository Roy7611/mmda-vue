/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 * 
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 * 
 */
import { Entity,defineEntity,defineEntityArray } from '@mmda/core';
import type { ModuleStatus } from '../enums/ModuleStatus';
import { type ClientAppModule, defineClientAppModule } from './ClientAppModule';
import { type ClientAppRelease, defineClientAppRelease } from './ClientAppRelease';
/**
 * 客户端应用
 * 
 * @remarks 客户端应用。定义一个客户端应用程序，可申请密钥，支持多种OAuth授权。
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-07-17 07:38:57.0
 * 
 */
export interface ClientApp extends Entity {
	//#region ~GENERATED PARTS BEGIN
	/**
	 * 应用标识
	 */
	appId: string;
	/**
	 * 应用商标
	 */
	appLogo?: string;
	/**
	 * 应用名称
	 */
	appName?: string;
	/**
	 * 应用标题
	 */
	appTitle?: string;
	/**
	 * 应用网址
	 */
	appUri?: string;
	/**
	 * 月租
	 */
	monthlyRent: number;
	/**
	 * 状态：0;DEV;开发中|1;TESTING;测试中|2;RELEASED;已发布|-1;REMOVED;已下架
	 */
	status: ModuleStatus;
	/**
	 * 最后发布于
	 */
	latestReleasedAt?: string;
	/**
	 * 最后发布版本
	 */
	latestReleasedVersion?: string;
	/**
	 * 应用密钥
	 */
	appSecret?: string;
	/**
	 * 客户端密钥颁布于
	 */
	appSecretExpiresAt?: string;
	/**
	 * 客户端认证方法：none|client_secret_basic|client_secret_post|client_secret_jwt|private_key_jwt|tls_client_auth|self_signed_tls_client_auth
	 */
	clientAuthenticationMethods: string;
	/**
	 * 授权类型：authorization_code|refresh_token|client_credentials|password|urn:ietf:params:oauth:grant-type:jwt-bearer|urn:ietf:params:oauth:grant-type:device_code|urn:ietf:params:oauth:grant-type:token-exchange
	 */
	authorizationGrantTypes: string;
	/**
	 * 重定向URIs
	 */
	redirectUris?: string;
	/**
	 * 登出后重定向URIs
	 */
	postLogoutRedirectUris?: string;
	/**
	 * 授权作用域
	 */
	scopes?: string;
	/**
	 * 客户端配置
	 */
	clientSettings?: string;
	/**
	 * 令牌配置
	 */
	tokenSettings?: string;
	/**
	 * 备注
	 */
	description?: string;
	/**
	 * 功能模块
	 */
	modules:  ClientAppModule[];
	/**
	 * 发布历史
	 */
	releases?:  ClientAppRelease[];
	//#endregion ~GENERATED PARTS END
}
/**
 * 客户端应用实体定义函数
 */
export const defineClientApp = (o: object) => {
	const e = defineEntity<ClientApp>(o);
	//定义id
	Object.defineProperty(e,'id',{
		get: function(){ return this.appId }
	});
	//功能模块
	e.modules = defineEntityArray(defineClientAppModule, e.modules);
	//发布历史
	e.releases = defineEntityArray(defineClientAppRelease, e.releases);
	return e;
}
