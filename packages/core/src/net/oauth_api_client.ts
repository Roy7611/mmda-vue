import { ApiClient, type ApiClientConfig } from "./api_client";
import {
  OAuthBearerAuthProvider,
  type FetchApi,
} from "./fetch_api";
import { FetchApiHttp } from "./fetch_api_http";
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

function applyTokenResponse(
  config: ApiClientConfig,
  data: Record<string, any>,
) {
  config.accessToken = data.access_token;
  if (data.refresh_token) config.refreshToken = data.refresh_token;
  // expires_in 为秒；缺省按 24h
  const expiresInSec = Number(data.expires_in);
  const seconds =
    Number.isFinite(expiresInSec) && expiresInSec > 0
      ? expiresInSec
      : 24 * 60 * 60;
  config.expiresIn = Date.now() + seconds * 1000;
}

function oauthUserFromToken(data: Record<string, any>): OAuthUser {
  const now = Date.now();
  const expiresInSec = Number(data.expires_in);
  const seconds =
    Number.isFinite(expiresInSec) && expiresInSec > 0
      ? expiresInSec
      : 24 * 60 * 60;
  return {
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
    expiryOn: now + seconds * 1000,
    tenantId: data.tenantID,
  };
}

function requireOAuthClient(clientId: string, clientSecret: string) {
  if (!clientId?.trim() || !clientSecret?.trim()) {
    return Promise.reject(
      new Error("OAuth clientId and clientSecret are required"),
    );
  }
  return Promise.resolve();
}

/**
 * 支持OAuth认证的API客户端（HttpClient 拦截器：追加 Bearer，401 由
 * {@link HttpClient.refreshHandler} 刷新）。
 * @deprecated 使用 {@link OAuth2ApiClient}。
 */
export class OAuthApiClient extends ApiClient {
  private authenticatorInstalled = false;
  private refreshInFlight?: Promise<boolean>;

  constructor(http: HttpClient, config: ApiClientConfig) {
    super(http, config);
  }

  private applyTokenResponse(data: Record<string, any>) {
    applyTokenResponse(this.config, data);
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
        return oauthUserFromToken(data);
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

/**
 * 走 {@link FetchApi} + {@link OAuthBearerAuthProvider} 的 OAuth 客户端。
 *
 * 构造时把 Bearer 注入与并发 401 单飞刷新装到 `fetchApi.auth`。登录 / refresh
 * 设 `skipAuthRefresh`，适配器映射为 `auth: false`，避免 token 请求再走刷新。
 * 业务 CRUD 仍用 {@link ApiClient}（经 {@link FetchApiHttp}）。
 *
 * 传入的 {@link FetchApi} 不能已有 `auth`；也不要再叠 {@link OAuthApiClient} 拦截器。
 *
 * @example
 * ```ts
 * const fetchApi = new FetchApi({
 *   baseUrl: 'https://api.example.com/',
 *   credentials: 'include',
 * })
 * const api = new OAuth2ApiClient(fetchApi, { service: 'wms' })
 * await api.authenticate('alice', 'p', 'cid', 'csec')
 * const item = await api.getOne('1', { repository: 'items' })
 * ```
 */
export class OAuth2ApiClient extends ApiClient {
  readonly fetchApi: FetchApi;
  private refreshInFlight?: Promise<boolean>;

  constructor(fetchApi: FetchApi, config: ApiClientConfig) {
    if (fetchApi.auth) {
      throw new Error(
        "OAuth2ApiClient installs OAuthBearerAuthProvider on FetchApi; pass a FetchApi without auth",
      );
    }
    super(
      new FetchApiHttp(fetchApi, undefined, undefined, undefined, true),
      config,
    );
    this.fetchApi = fetchApi;
    fetchApi.auth = new OAuthBearerAuthProvider({
      getAccessToken: () => this.config.accessToken,
      refreshAccessToken: () => this.refreshToken(),
    });
  }

  /**
   * OAuth 认证，提供用户名和密码获取访问令牌。
   * Token 请求不带全局 Bearer（`auth: false`）。
   */
  authenticate(
    username: string,
    password: string,
    clientId: string,
    clientSecret: string,
    redirectUris?: string,
  ) {
    return requireOAuthClient(clientId, clientSecret).then(() => {
      const url = this.buildEntityURL({
        service: "auth",
        repository: "authorize",
      });
      return this.http
        .postJson(
          url,
          {
            grant_type: "password",
            username,
            password,
            scope: "Inbound,Outbound",
            client_id: clientId,
            client_secret: clientSecret,
            redirectUris,
          },
          {
            beforeSend: (ctx) => {
              ctx.skipAuthRefresh = true;
            },
          },
        )
        .then((data) => {
          applyTokenResponse(this.config, data);
          return oauthUserFromToken(data);
        });
    });
  }

  /**
   * 用 refresh_token 换新的 access_token。并发调用合并为一次请求。
   * 由 {@link OAuthBearerAuthProvider} 在 401 时调用。
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
        applyTokenResponse(this.config, data);
        return true;
      })
      .catch(() => false);
  }

  setUnauthorizedErrorHandler(handleFn: HttpErrorHandler) {
    this.http.unauthorizedErrorHandler = handleFn;
  }
}
