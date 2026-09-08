import { h } from "vue";
import { TabComponent } from "@syncfusion/ej2-vue-navigations";
import type { UiTabsProps } from "@mmda/vui";
import {
  emitTabsChange,
  htmlAttributesOf,
  tabsHeaderPlacementOf,
  tabsHeightAdjustModeOf,
  tabsItemContentOf,
  tabsItemsOf,
  tabsModifierClasses,
  tabsOverflowModeOf,
  tabsValueOf,
} from "@mmda/vui";

export function createTabs(props: UiTabsProps) {
  const {
    items: _items,
    value: _value,
    modelValue: _modelValue,
    headerPlacement: _headerPlacement,
    scrollable: _scrollable,
    heightAdjustMode: _heightAdjustMode,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const cssClass = tabsModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  const items = tabsItemsOf(props).map((item) => ({
    header: {
      text: item.header.text,
      iconCss: item.header.iconCss,
    },
    content: () => tabsItemContentOf(item),
    disabled: item.disabled,
  }));

  return h(TabComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    items,
    selectedItem: tabsValueOf(props),
    headerPlacement: tabsHeaderPlacementOf(props),
    overflowMode: tabsOverflowModeOf(props),
    heightAdjustMode: tabsHeightAdjustModeOf(props),
    cssClass,
    selected: (args: { selectedIndex?: unknown }) =>
      emitTabsChange(props, args),
  });
}
