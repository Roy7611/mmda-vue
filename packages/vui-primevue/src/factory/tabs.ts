import { h } from "vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import type { UiNormalizedTabItem, UiTabsProps } from "@mmda/vui";
import {
  emitTabsChange,
  htmlAttributesOf,
  tabsHostStyle,
  tabsItemContentOf,
  tabsItemsOf,
  tabsModifierClasses,
  tabsScrollableOf,
  tabsValueOf,
} from "@mmda/vui";

function headerNodes(item: UiNormalizedTabItem) {
  const text = item.header.text ?? "";
  if (!item.header.iconCss) return text;
  return [h("i", { class: item.header.iconCss }), text];
}

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
    ...rest
  } = props;

  const items = tabsItemsOf(props);
  const value = tabsValueOf(props);

  return h(
    Tabs,
    {
      ...rest,
      ...htmlAttributesOf(props),
      value,
      scrollable: tabsScrollableOf(props),
      class: tabsModifierClasses(props).flat(),
      style: tabsHostStyle(props),
      "onUpdate:value": (next: unknown) => emitTabsChange(props, next),
    },
    {
      default: () => [
        h(
          TabList,
          {},
          () =>
            items.map((item, index) =>
              h(
                Tab,
                {
                  key: index,
                  value: index,
                  disabled: item.disabled,
                },
                () => headerNodes(item),
              ),
            ),
        ),
        h(
          TabPanels,
          {},
          () =>
            items.map((item, index) =>
              h(
                TabPanel,
                { key: index, value: index },
                { default: () => tabsItemContentOf(item) },
              ),
            ),
        ),
      ],
    },
  );
}
