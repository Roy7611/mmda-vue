import { describe, expect, it } from "vitest";
import {
  ApiError,
  isApiError,
  isApiErrorPayload,
  toApiError,
} from "../net/api_error";

describe("ApiError", () => {
  it("toApiError 对实例幂等", () => {
    const err = new ApiError("E1", undefined, "oops", undefined, 400);
    expect(toApiError(err)).toBe(err);
  });

  it("toApiError 把 payload 收成 ApiError，detail 作为 message", () => {
    const err = toApiError({
      code: "VAL",
      status: "422",
      detail: "bad field",
      validationErrors: [{ field: "name", error: "required" }],
    });
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe("VAL");
    expect(err.status).toBe(422);
    expect(err.message).toBe("bad field");
    expect(err.validationErrors).toEqual([{ field: "name", error: "required" }]);
  });

  it("isApiErrorPayload 只认 HTTP 业务错误体", () => {
    expect(isApiErrorPayload({ status: 400, message: "no" })).toBe(true);
    expect(isApiErrorPayload({ status: 200, message: "ok" })).toBe(false);
    expect(isApiErrorPayload({ ok: true })).toBe(false);
    expect(isApiErrorPayload(new ApiError("E", undefined, "x", undefined, 500))).toBe(
      false,
    );
    expect(isApiError(new ApiError("E"))).toBe(true);
  });

  it("toJSON 返回可序列化对象", () => {
    const err = new ApiError("E1", "fail", "msg", "root", 409);
    expect(err.toJSON()).toEqual({
      code: "E1",
      error: "fail",
      message: "msg",
      cause: "root",
      status: 409,
      validationErrors: undefined,
    });
    expect(JSON.parse(JSON.stringify(err))).toMatchObject({
      code: "E1",
      status: 409,
      message: "msg",
    });
  });
});
