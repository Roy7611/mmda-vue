import { describe, expect, it } from "vitest";
import { createSfGanttPlugin, mapUiTasksToEj2 } from "../plugins/gantt";

describe("createSfGanttPlugin", () => {
  it("maps unified gantt tasks onto EJ2 fields", () => {
    const rows = mapUiTasksToEj2(
      [
        {
          id: 1,
          name: "Cut",
          startDate: "2026-01-01",
          parentId: null,
          type: "task",
        },
        {
          id: 2,
          name: "Pack",
          startDate: "2026-01-02",
          parentId: 1,
          type: "milestone",
        },
      ],
      [{ source: 1, target: 2, type: "FS" }],
    );
    expect(rows[1].Predecessor).toBe("1FS");
    expect(rows[1].Milestone).toBe(true);
    expect(rows[0].TaskName).toBe("Cut");
  });

  it("builds a gantt node from unified props", () => {
    const plugin = createSfGanttPlugin();
    const node = plugin.buildUi(
      {} as any,
      { tasks: [{ id: 1, name: "Cut" }] } as any,
    );
    expect(node).toBeTruthy();
  });
});
