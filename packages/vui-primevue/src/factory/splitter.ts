import { h } from "vue";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import type { UiSplitterPane, UiSplitterProps } from "@mmda/vui"
import { emitSplitterResize, htmlAttributesOf, splitterEnabledOf, splitterModifierClasses, splitterOrientationOf } from "@mmda/vui"

function paneSizePercent(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return fallback;
  return value.endsWith("%") ? n : fallback;
}

export function createSplitter(
  panes: UiSplitterPane[],
  props: UiSplitterProps = {},
) {
  const orientation = splitterOrientationOf(props);
  return h(
    Splitter,
    {
      ...htmlAttributesOf(props),
      layout: orientation === "Vertical" ? "vertical" : "horizontal",
      gutterSize: props.separatorSize,
      disabled: !splitterEnabledOf(props),
      class: [
        "mmda-prime-splitter",
        ...splitterModifierClasses(props).flat(),
      ],
      onResizeend: () => emitSplitterResize(props, "stop", { index: 0 }),
    },
    {
      default: () =>
        panes.map((pane, index) =>
          h(
            SplitterPanel,
            {
              size: pane.collapsed
                ? 0
                : paneSizePercent(pane.size, index === 0 ? 20 : 80),
              minSize: paneSizePercent(pane.min, index === 0 ? 12 : 20),
              class: pane.cssClass,
              style: pane.size?.endsWith("rem")
                ? {
                    flexBasis: pane.collapsed ? "0" : pane.size,
                    flexGrow: pane.collapsed ? 0 : undefined,
                  }
                : undefined,
            },
            { default: () => pane.content },
          ),
        ),
    },
  );
}
