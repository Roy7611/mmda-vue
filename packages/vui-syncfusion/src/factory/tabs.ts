import { h, type VNode } from "vue";
import {
  TabComponent,
  TabItemDirective,
  TabItemsDirective,
} from "@syncfusion/ej2-vue-navigations";
import type { UiTabsProps } from "@mmda/vui";
import {
  emitTabsChange,
  tabsHeaderPlacementOf,
  tabsHeaderStyleOf,
  tabsHeightAdjustModeOf,
  tabsHostStyle,
  tabsItemContentOf,
  tabsItemsOf,
  tabsLoadOnOf,
  tabsModifierClasses,
  tabsOverflowModeOf,
  tabsValueOf
} from "@mmda/vui";
import { uiRenderProps } from "@mmda/core"

const EJ2_HEADER_STYLE: Record<string, string | undefined> = {
  fill: "e-fill",
  background: "e-background",
  accent: "e-accent",
  default: undefined,
};

/**
 * EJ2 Tab 的 `items[].content` 只吃 HTML 字符串或 `{ template }`；
 * 塞 `() => VNode` 会在 ej2-vue-base 里读 `_context.components` 炸。
 * Vue 节点走 TabItemDirective 的 content 具名插槽；槽名必须用 item.name，
 * 不能共用 "content"（否则每页都渲染第一页）。
 */
export function createTabs(props: UiTabsProps): VNode {
  const {
    items: _items,
    value: _value,
    modelValue: _modelValue,
    headerPlacement: _headerPlacement,
    scrollable: _scrollable,
    heightAdjustMode: _heightAdjustMode,
    loadOn: _loadOn,
    headerStyle: _headerStyle,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    style: _style,
    ...rest
  } = props;

  const cssClass = [
    ...tabsModifierClasses(props).flat().filter(Boolean),
    EJ2_HEADER_STYLE[tabsHeaderStyleOf(props)],
  ]
    .filter(Boolean)
    .join(" ");

  const hostStyle = {
    ...(tabsHostStyle(props) ?? {}),
    ...((typeof _style === "object" && _style) || {}),
  };

  const items = tabsItemsOf(props);

  return h(
    TabComponent as any,
    {
      ...rest,
      ...uiRenderProps(props).attributes,
      selectedItem: tabsValueOf(props),
      headerPlacement: tabsHeaderPlacementOf(props),
      overflowMode: tabsOverflowModeOf(props),
      heightAdjustMode: tabsHeightAdjustModeOf(props),
      loadOn: tabsLoadOnOf(props),
      cssClass,
      style: Object.keys(hostStyle).length > 0 ? hostStyle : undefined,
      selected: (args: { selectedIndex?: unknown }) =>
        emitTabsChange(props, args),
    },
    {
      default: () =>
        h(TabItemsDirective as any, null, {
          default: () =>
            items.map((item, index) => {
              const slotName = item.name || `content${index}`;
              const content = tabsItemContentOf(item);
              if (typeof content === "string") {
                return h(TabItemDirective as any, {
                  key: slotName,
                  header: {
                    text: item.header.text,
                    iconCss: item.header.iconCss,
                  },
                  content,
                  disabled: item.disabled,
                  tabIndex: 0,
                });
              }
              return h(
                TabItemDirective as any,
                {
                  key: slotName,
                  header: {
                    text: item.header.text,
                    iconCss: item.header.iconCss,
                  },
                  content: slotName,
                  disabled: item.disabled,
                  tabIndex: 0,
                },
                {
                  [slotName]: () => content,
                },
              );
            }),
        }),
    },
  );
}
