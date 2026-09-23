import { describe, expect, it } from "vitest";
import { SfRuiBuilder } from "../builder";

describe("SfRuiBuilder", () => {
  it("installs the skin plugins by default", () => {
    const builder = new SfRuiBuilder();
    expect(builder.hasPlugin("gantt")).toBe(true);
    expect(builder.hasPlugin("charts")).toBe(true);
    expect(builder.hasPlugin("scheduler")).toBe(true);
  });

  it("builds a group card node", () => {
    const builder = new SfRuiBuilder();
    const node = builder.buildGroupCard(
      { groupName: "base", groupLabel: "基础" } as any,
      "body",
    );
    expect(node).toBeTruthy();
  });
});
