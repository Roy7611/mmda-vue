import { describe, expect, it, vi } from "vitest";
import { invokeSignin } from "../ui/factory/auth";

describe("invokeSignin", () => {
  it("awaits the provided handler even when it rejects", async () => {
    const fail = vi.fn(async () => {
      throw new Error("HTTP 500");
    });
    await expect(
      invokeSignin(
        () => undefined,
        {
          signinMode: "password",
          username: "a",
          password: "b",
          agreed: true,
        },
        [fail],
      ),
    ).rejects.toThrow("HTTP 500");
    expect(fail).toHaveBeenCalledOnce();
  });
});
