import { afterEach, describe, expect, it, vi } from "vitest";
import { FetchClient } from "../net/http";
import { OAuthApiClient } from "../net/oauth_api_client";
import { ApiError } from "../net/api_error";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

async function requestJson(input: RequestInfo | URL, init?: RequestInit) {
  const req =
    input instanceof Request ? input.clone() : new Request(input, init);
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

function requestUrl(input: RequestInfo | URL) {
  return String(input instanceof Request ? input.url : input);
}

describe("beforeRequest interceptors", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("追加拦截器互不覆盖", async () => {
    const seen: string[][] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const req =
          input instanceof Request ? input : new Request(input, init);
        seen.push([
          req.headers.get("X-Locale") ?? "",
          req.headers.get("Authorization") ?? "",
        ]);
        return jsonResponse({ ok: true });
      }),
    );

    const http = new FetchClient("http://example.test");
    http.useBeforeRequest((ctx) => {
      ctx.options.headers = http.mergeHeaders(ctx.options.headers, {
        "X-Locale": "zh-CN",
      });
    });
    http.useBeforeRequest((ctx) => {
      ctx.options.headers = http.mergeHeaders(ctx.options.headers, {
        Authorization: "Bearer t1",
      });
    });

    await http.getJson("/items");
    expect(seen[0]).toEqual(["zh-CN", "Bearer t1"]);
  });
});

describe("OAuthApiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("authenticate 用 expires_in 秒计算 expiryOn，且不默认 client_secret", async () => {
    let body: Record<string, unknown> | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        body = await requestJson(input, init);
        return jsonResponse({
          access_token: "acc",
          refresh_token: "ref",
          expires_in: 3600,
          userID: "u1",
          username: "alice",
          acct_type: 0,
          tenantID: "t1",
        });
      }),
    );

    const http = new FetchClient("http://example.test");
    const api = new OAuthApiClient(http, { service: "api" });
    const before = Date.now();
    const user = await api.authenticate("alice", "p", "cid", "csec");
    const after = Date.now();

    expect(body?.client_id).toBe("cid");
    expect(body?.client_secret).toBe("csec");
    expect(user.expiryOn).toBeGreaterThanOrEqual(before + 3600_000);
    expect(user.expiryOn).toBeLessThanOrEqual(after + 3600_000);
    expect(api.config.expiresIn).toBeGreaterThanOrEqual(before + 3600_000);
    expect(api.config.expiresIn).toBeLessThanOrEqual(after + 3600_000);
  });

  it("缺少 clientId / clientSecret 时拒绝认证", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const api = new OAuthApiClient(new FetchClient("http://example.test"), {
      service: "api",
    });
    await expect(api.authenticate("a", "b", "", "secret")).rejects.toThrow(
      /clientId and clientSecret/,
    );
    await expect(api.authenticate("a", "b", "id", "  ")).rejects.toThrow(
      /clientId and clientSecret/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("并发 401 只刷新一次 token 后重试", async () => {
    let refreshCount = 0;
    let dataHits = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = requestUrl(input);
        const body = await requestJson(input, init);
        if (url.includes("auth/authorize") && body?.grant_type === "refresh_token") {
          refreshCount += 1;
          await new Promise((r) => setTimeout(r, 30));
          return jsonResponse({
            access_token: "new-acc",
            refresh_token: "ref",
            expires_in: 60,
          });
        }
        dataHits += 1;
        if (dataHits <= 2) {
          return jsonResponse({ message: "unauthorized" }, 401);
        }
        return jsonResponse({ ok: true });
      }),
    );

    const http = new FetchClient("http://example.test");
    const api = new OAuthApiClient(http, {
      service: "api",
      accessToken: "old",
      refreshToken: "ref",
    });
    api.setAuthenticator();

    const [a, b] = await Promise.all([
      api.getOne("1", { repository: "items" }),
      api.getOne("2", { repository: "items" }),
    ]);

    expect(refreshCount).toBe(1);
    expect(dataHits).toBe(4);
    expect(a).toEqual({ ok: true });
    expect(b).toEqual({ ok: true });
    expect(api.config.accessToken).toBe("new-acc");
  });

  it("没有 refresh_token 时 refreshToken 返回 false 且不发请求", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const api = new OAuthApiClient(new FetchClient("http://example.test"), {
      service: "api",
      accessToken: "acc",
    });
    await expect(api.refreshToken()).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refresh 失败时返回 false 且保留旧 access_token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ message: "invalid" }, 400)),
    );
    const api = new OAuthApiClient(new FetchClient("http://example.test"), {
      service: "api",
      accessToken: "old",
      refreshToken: "bad",
    });
    await expect(api.refreshToken()).resolves.toBe(false);
    expect(api.config.accessToken).toBe("old");
  });

  it("HTTP 4xx 与 200 业务错误都 reject 为 ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = requestUrl(input);
        if (url.includes("/http-fail")) {
          return jsonResponse({ code: "GONE", message: "missing" }, 404);
        }
        return jsonResponse({ status: 409, code: "DUP", message: "exists" }, 200);
      }),
    );

    const http = new FetchClient("http://example.test");
    const api = new OAuthApiClient(http, { service: "api", repository: "items" });

    await expect(http.getJson("/http-fail")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      code: "GONE",
      message: "missing",
    });
    await expect(http.getJson("/http-fail")).rejects.toBeInstanceOf(ApiError);

    await expect(api.getOne("1")).rejects.toBeInstanceOf(ApiError);
    await expect(api.getOne("1")).rejects.toMatchObject({
      status: 409,
      code: "DUP",
    });
  });
});
