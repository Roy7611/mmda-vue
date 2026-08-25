import { ApiClient, type ApiConfig } from "./api_client";
import type { HttpClient, HttpErrorHandler } from "./http";

export interface OAuthUser {
  userId: string;
  username: string;
  userType: number;
  mobile?: string;
  scope?: string;
  portrait?: string;
  tenantId?: string;
  orgId?: string;
  deptId?: string;
  email?: string;
  signOn?: number;
  expiryOn?: number;
}

/**
 * 支持OAuth认证的API客户端
 */
export class OAuthApiClient extends ApiClient {
  private authenticatorInstalled = false;
  private refreshInFlight?: Promise<boolean>;

  constructor(http: HttpClient, config: ApiConfig) {
    super(http, config);
  }

  private applyTokenResponse(data: Record<string, any>) {
    this.config.accessToken = data.access_token;
    if (data.refresh_token) this.config.refreshToken = data.refresh_token;
    const expiresInSec = Number(data.expires_in) || 24 * 60 * 60 * 1000;
    const expiryAt = Date.now() + expiresInSec * 1000;
    this.config.expiresIn = expiryAt;
  }

  /**
   * OAuth 认证，提供用户名和密码获取访问令牌
   */
  authenticate(
    username: string,
    password: string,
    clientId: string,
    clientSecret: string,
    redirectUris?: string,
  ) {
    if (!clientId?.trim() || !clientSecret?.trim()) {
      return Promise.reject(
        new Error("OAuth clientId and clientSecret are required"),
      );
    }

    const url = this.buildEntityURL({
      service: "auth",
      repository: "authorize",
    });

    return this.http
      .postJson(
        url,
        {
          grant_type: "password",
          username: username,
          password: password,
          scope: "Inbound,Outbound",
          client_id: clientId,
          client_secret: clientSecret,
          redirectUris: redirectUris,
        },
        {
          beforeSend: (ctx) => {
            ctx.skipAuthRefresh = true;
          },
        },
      )
      .then((data) => {
        this.applyTokenResponse(data);
        this.setAuthenticator();
        const now = Date.now();
        const expiresInSec = Number(data.expires_in) || 0;
        const user: OAuthUser = {
          userId: data.userID,
          username: encodeURIComponent(data.username),
          userType: data.acct_type,
          mobile: data.mobile,
          portrait: data.portrait,
          orgId: data.org_id,
          deptId: data.dept_id,
          email: data.email,
          scope: data.scope,
          signOn: now,
          expiryOn: now + expiresInSec * 1000,
          tenantId: data.tenantID,
        };
        return user;
      });
  }

  /**
   * 用 refresh_token 换新的 access_token。并发调用会合并为一次请求。
   */
  refreshToken(): Promise<boolean> {
    if (!this.config.refreshToken) {
      return Promise.resolve(false);
    }
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.doRefresh().finally(() => {
        this.refreshInFlight = undefined;
      });
    }
    return this.refreshInFlight;
  }

  private doRefresh(): Promise<boolean> {
    const url = this.buildEntityURL({
      service: "auth",
      repository: "authorize",
    });
    return this.http
      .postJson(
        url,
        {
          grant_type: "refresh_token",
          refresh_token: this.config.refreshToken,
        },
        {
          beforeSend: (ctx) => {
            ctx.skipAuthRefresh = true;
          },
        },
      )
      .then((data) => {
        this.applyTokenResponse(data);
        this.setAuthenticator();
        return true;
      })
      .catch(() => false);
  }

  /**
   * 挂上认证拦截器：只追加 Authorization，不覆盖其它 beforeRequest。
   * 可重复调用，只安装一次。
   */
  setAuthenticator() {
    if (this.authenticatorInstalled) return;
    this.authenticatorInstalled = true;
    this.http.useBeforeRequest((ctx) => {
      const token = this.config.accessToken;
      if (!token) return;
      ctx.options.headers = this.http.mergeHeaders(ctx.options.headers, {
        Authorization: `Bearer ${token}`,
      });
    });
    this.http.refreshHandler = () => this.refreshToken();
  }

  /**
   * 在每次请求前设置认证信息
   * @remarks
   * 如果认证失败了,那么就使用refresh token来刷新access token
   *
   * @example
   * import { OAuthApiClient } from '@mmda/core'
   * const apiClient = new OAuthApiClient({
   *   clientId: 'my_client',
   *   clientSecret: 'my_secret',
   *   authorizationUrl: 'http://example.com/auth',
   *   tokenUrl: 'http://example.com/token',
   *   refreshToken: 'my_refresh_token'
   * })
   * apiClient.setUnauthorizedErrorHandler()
   */
  setUnauthorizedErrorHandler(handleFn: HttpErrorHandler) {
    this.http.unauthorizedErrorHandler = handleFn;
  }
}
