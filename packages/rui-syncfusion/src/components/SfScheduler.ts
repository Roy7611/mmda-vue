import {
  createElement,
  lazy,
  Suspense,
  type ComponentType,
  type ReactNode,
} from "react";
import { mapUiEventsToEj2 } from "../plugins/scheduler";

// @ts-ignore - @syncfusion/ej2-react-schedule is an optional peer
const ScheduleComponent = lazy(
  async (): Promise<{ default: ComponentType<any> }> => {
    // @ts-ignore - optional peer may be absent; the skin falls back gracefully
    const mod = await import(
      /* @vite-ignore */ "@syncfusion/ej2-react-schedule"
    );
    return { default: (mod as any).ScheduleComponent };
  },
);

export function SfScheduler(props: {
  events?: unknown[];
  currentView?: string;
  children?: ReactNode;
}): ReactNode {
  return createElement(
    Suspense,
    {
      fallback: createElement(
        "div",
        { className: "mmda-scheduler-fallback" },
        "Scheduler 组件加载中",
      ),
    },
    createElement(
      ScheduleComponent,
      {
        eventSettings: { dataSource: mapUiEventsToEj2(props.events as any) },
        currentView: props.currentView ?? "Week",
      },
      props.children,
    ),
  );
}
