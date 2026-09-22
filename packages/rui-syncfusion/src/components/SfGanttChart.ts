import { createElement, type ReactNode } from "react";
import { GanttComponent } from "@syncfusion/ej2-react-gantt";
import { mapUiTasksToEj2 } from "../plugins/gantt";

export const GANTT_VIEW_MODES = {
  day: "Day",
  week: "Week",
  month: "Month",
} as const;

export function SfGanttChart(props: {
  tasks?: unknown[];
  links?: unknown[];
  view?: keyof typeof GANTT_VIEW_MODES;
  children?: ReactNode;
}): ReactNode {
  return createElement(
    GanttComponent as any,
    {
      dataSource: mapUiTasksToEj2(props.tasks as any, props.links as any),
      taskFields: {
        id: "TaskID",
        name: "TaskName",
        startDate: "StartDate",
        endDate: "EndDate",
        duration: "Duration",
        progress: "Progress",
        dependency: "Predecessor",
        parentID: "parentID",
      },
      timelineViewMode: props.view ?? "Week",
    },
    props.children,
  );
}
