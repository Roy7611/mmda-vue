import { defineComponent, h, ref, watch, type PropType } from "vue";
import type { UiSplitterPane, UiSplitterProps } from "@mmda/vui"
import { emitSplitterResize, splitterEnabledOf, splitterEventIndex, splitterHeightOf, splitterModifierClasses, splitterOrientationOf, splitterReversePanesOf, splitterWidthOf } from "@mmda/vui"
import { SplitterComponent } from "@syncfusion/ej2-vue-layouts";

export { splitterEventIndex };

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

/** paneSettings 只在尺寸配置变时更新。collapsed 不写回 EJ2，否则 search 重渲会把右栏算成 0。 */
export const SfSplitter = defineComponent({
  name: "SfSplitter",
  props: {
    panes: { type: Array as PropType<UiSplitterPane[]>, required: true },
    orientation: { type: String as PropType<UiSplitterProps["orientation"]> },
    width: { type: String, default: undefined },
    height: { type: String, default: undefined },
    separatorSize: { type: Number, default: undefined },
    cssClass: { type: String, default: "" },
    enabled: { type: Boolean, default: undefined },
    enableReversePanes: { type: Boolean, default: undefined },
    collapseTick: { type: Number, default: 0 },
    onCollapsed: { type: Function as PropType<UiSplitterProps["onCollapsed"]> },
    onExpanded: { type: Function as PropType<UiSplitterProps["onExpanded"]> },
    onResizeStart: {
      type: Function as PropType<UiSplitterProps["onResizeStart"]>,
    },
    onResizing: { type: Function as PropType<UiSplitterProps["onResizing"]> },
    onResizeStop: {
      type: Function as PropType<UiSplitterProps["onResizeStop"]>,
    },
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
    const chromeProps = (): UiSplitterProps => ({
      orientation: props.orientation,
      class: props.cssClass,
      enabled: props.enabled,
      enableReversePanes: props.enableReversePanes,
      onCollapsed: props.onCollapsed,
      onExpanded: props.onExpanded,
      onResizeStart: props.onResizeStart,
      onResizing: props.onResizing,
      onResizeStop: props.onResizeStop,
    });
    const emitCollapse = (
      collapsed: boolean,
      args?: { index?: number | number[] },
    ) => {
      const event = { index: splitterEventIndex(args), collapsed };
      if (collapsed) props.onCollapsed?.(event);
      else props.onExpanded?.(event);
    };
    return () => {
      const applied = chromeProps();
      const cssClass = [
        "mmda-splitter",
        ...splitterModifierClasses(applied).flat().filter(Boolean),
      ].join(" ");
      return h(
        SplitterComponent as any,
        {
          ref: splitterRef,
          orientation: splitterOrientationOf(applied),
          width: splitterWidthOf({ width: props.width }),
          height: splitterHeightOf({ height: props.height }),
          separatorSize: props.separatorSize,
          enabled: splitterEnabledOf(applied),
          enableReversePanes: splitterReversePanesOf(applied),
          cssClass,
          paneSettings: paneSettings.value,
          onCollapsed: (args: { index?: number | number[] }) =>
            emitCollapse(true, args),
          onExpanded: (args: { index?: number | number[] }) =>
            emitCollapse(false, args),
          resizeStart: (args: { index?: number | number[]; paneSize?: number[] }) =>
            emitSplitterResize(applied, "start", args),
          resizing: (args: { index?: number | number[]; paneSize?: number[] }) =>
            emitSplitterResize(applied, "resizing", args),
          resizeStop: (args: { index?: number | number[]; paneSize?: number[] }) =>
            emitSplitterResize(applied, "stop", args),
        },
        {
          default: () =>
            props.panes.map((pane) =>
              h(
                "div",
                { class: "mmda-splitter-pane", style: { height: "100%" } },
                [pane.content],
              ),
            ),
        },
      );
    };
  },
});

export const createSplitterRenderer = () => (panes: any, props: any = {}) =>
  h(SfSplitter, {
    class: splitterModifierClasses(props).flat(),
    panes,
    orientation: props.orientation,
    width: props.width,
    height: props.height,
    separatorSize: props.separatorSize,
    cssClass: props.class,
    enabled: props.enabled,
    enableReversePanes: props.enableReversePanes,
    collapseTick: props.collapseTick,
    onCollapsed: props.onCollapsed,
    onExpanded: props.onExpanded,
    onResizeStart: props.onResizeStart,
    onResizing: props.onResizing,
    onResizeStop: props.onResizeStop,
  });
