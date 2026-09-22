import { describe, expect, it } from "vitest";
import { SfReactUiBuilder } from "../builder";

describe("SfReactUiBuilder", () => {
  it("installs the skin plugins by default", () => {
    const builder = new SfReactUiBuilder();
    expect(builder.hasPlugin("gantt")).toBe(true);
    expect(builder.hasPlugin("charts")).toBe(true);
    expect(builder.hasPlugin("scheduler")).toBe(true);
  });

  it("builds a group card node", () => {
    const builder = new SfReactUiBuilder();
    const node = builder.buildGroupCard(
      { groupName: "base", groupLabel: "基础" } as any,
      "body",
    );
    expect(node).toBeTruthy();
  });
});
