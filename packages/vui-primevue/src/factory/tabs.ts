import { h } from "vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import type { UiNormalizedTabItem, UiTabsProps } from "@mmda/vui"
import { emitTabsChange, htmlAttributesOf, tabsHostStyle, tabsItemContentOf, tabsItemsOf, tabsModifierClasses, tabsScrollableOf, tabsValueOf } from "@mmda/vui"

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
    loadOn: _loadOn,
    headerStyle: _headerStyle,
    onChange: _onChange,
    htmlAttributes,
    ...rest
  } = props;

  const items = tabsItemsOf(props);
  const index = tabsValueOf(props);
  const value = items[index]?.name ?? items[0]?.name ?? index;

  return h(
    Tabs,
    {
      ...rest,
      ...htmlAttributesOf(props),
      value,
      scrollable: tabsScrollableOf(props),
      class: tabsModifierClasses(props).flat(),
      style: tabsHostStyle(props),
      "onUpdate:value": (next: unknown) => {
        const idx = items.findIndex((item) => item.name === next);
        emitTabsChange(props, idx >= 0 ? idx : next);
      },
    },
    {
      default: () => [
        h(
          TabList,
          {},
          () =>
            items.map((item, i) => {
              const name = item.name || `content${i}`;
              return h(
                Tab,
                {
                  key: name,
                  value: name,
                  disabled: item.disabled,
                },
                () => headerNodes(item),
              );
            }),
        ),
        h(
          TabPanels,
          {},
          () =>
            items.map((item, i) => {
              const name = item.name || `content${i}`;
              return h(
                TabPanel,
                { key: name, value: name },
                { default: () => tabsItemContentOf(item) },
              );
            }),
        ),
      ],
    },
  );
}
