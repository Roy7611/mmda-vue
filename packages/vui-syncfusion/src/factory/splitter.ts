import { defineComponent, h, ref, watch, type PropType } from "vue";
import type { UiSplitterPane, UiSplitterProps } from "@mmda/vui";
import { SplitterComponent } from "@syncfusion/ej2-vue-layouts";

const paneSettingsKey = (panes: UiSplitterPane[]) =>
  JSON.stringify(
    panes.map((pane) => ({
      size: pane.size,
      min: pane.min,
      max: pane.max,
      collapsible: pane.collapsible,
      resizable: pane.resizable,
      cssClass: pane.cssClass,
    })),
  );

const toPaneSettings = (panes: UiSplitterPane[]) =>
  panes.map((pane) => ({
    size: pane.size,
    min: pane.min,
    max: pane.max,
    collapsible: pane.collapsible,
    collapsed: false,
    resizable: pane.resizable,
    cssClass: pane.cssClass,
  }));

/** EJ2 collapsed/expanded 的 index 是 `[prev, next]`，不能 Number(数组)。 */
export const splitterEventIndex = (args?: { index?: number | number[] }) => {
  const raw = args?.index;
  if (Array.isArray(raw)) return Number(raw[0] ?? 0);
  return Number(raw ?? 0);
};

/** paneSettings 只在尺寸配置变时更新。collapsed 不写回 EJ2，否则 search 重渲会把右栏算成 0。 */
export const SfSplitter = defineComponent({
  name: "SfSplitter",
  props: {
    panes: { type: Array as PropType<UiSplitterPane[]>, required: true },
    orientation: { type: String as PropType<UiSplitterProps["orientation"]> },
    width: { type: String, default: "100%" },
    height: { type: String, default: "100%" },
    separatorSize: { type: Number, default: undefined },
    cssClass: { type: String, default: "" },
    collapseTick: { type: Number, default: 0 },
    onCollapsed: { type: Function as PropType<UiSplitterProps["onCollapsed"]> },
    onExpanded: { type: Function as PropType<UiSplitterProps["onExpanded"]> },
  },
  setup(props) {
    const splitterRef = ref<{
      collapse?: (index: number) => void;
      ej2Instances?: { collapse?: (index: number) => void };
    } | null>(null);
    const paneSettings = ref(toPaneSettings(props.panes));
    watch(
      () => paneSettingsKey(props.panes),
      () => {
        paneSettings.value = toPaneSettings(props.panes);
      },
    );
    watch(
      () => props.collapseTick,
      (tick, prev) => {
        if (!prev || tick <= prev) return;
        const inst = splitterRef.value?.ej2Instances ?? splitterRef.value;
        inst?.collapse?.(0);
      },
    );
    const emitCollapse = (
      collapsed: boolean,
      args?: { index?: number | number[] },
    ) => {
      const event = { index: splitterEventIndex(args), collapsed };
      if (collapsed) props.onCollapsed?.(event);
      else props.onExpanded?.(event);
    };
    return () =>
      h(
        SplitterComponent as any,
        {
          ref: splitterRef,
          orientation:
            props.orientation === "Vertical" ? "Vertical" : "Horizontal",
          width: props.width,
          height: props.height,
          separatorSize: props.separatorSize,
          cssClass: ["mmda-sf-splitter", props.cssClass]
            .filter(Boolean)
            .join(" "),
          paneSettings: paneSettings.value,
          onCollapsed: (args: { index?: number | number[] }) =>
            emitCollapse(true, args),
          onExpanded: (args: { index?: number | number[] }) =>
            emitCollapse(false, args),
        },
        {
          default: () =>
            props.panes.map((pane) =>
              h(
                "div",
                { class: "mmda-sf-splitter-pane", style: { height: "100%" } },
                [pane.content],
              ),
            ),
        },
      );
  },
});

export const createSplitterRenderer = () => (panes: any, props: any) =>
  h(SfSplitter, {
    panes,
    orientation: props?.orientation,
    width: props?.width,
    height: props?.height,
    separatorSize: props?.separatorSize,
    cssClass: props?.class,
    collapseTick: props?.collapseTick,
    onCollapsed: props?.onCollapsed,
    onExpanded: props?.onExpanded,
  });
