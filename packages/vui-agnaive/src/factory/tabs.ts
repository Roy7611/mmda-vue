import { h } from 'vue'
import { NTabPane, NTabs } from 'naive-ui'
import type { UiNormalizedTabItem, UiTabsProps } from '@mmda/vui'
import {
  emitTabsChange,
  htmlAttributesOf,
  tabsHostStyle,
  tabsItemContentOf,
  tabsItemsOf,
  tabsModifierClasses,
  tabsNaivePlacementOf,
  tabsValueOf,
} from '@mmda/vui'

function tabLabel(item: UiNormalizedTabItem) {
  return item.header.text ?? ''
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
    class: _className,
    ...rest
  } = props

  const items = tabsItemsOf(props)

  return h(
    NTabs,
    {
      ...rest,
      ...htmlAttributesOf(props),
      value: tabsValueOf(props),
      placement: tabsNaivePlacementOf(props),
      class: tabsModifierClasses(props).flat(),
      style: tabsHostStyle(props),
      'onUpdate:value': (next: unknown) => emitTabsChange(props, next),
    },
    {
      default: () =>
        items.map((item, index) =>
          h(
            NTabPane,
            {
              key: index,
              name: index,
              tab: tabLabel(item),
              disabled: item.disabled,
            },
            {
              ...(item.header.iconCss
                ? {
                    tab: () => [
                      h('i', { class: item.header.iconCss }),
                      tabLabel(item),
                    ],
                  }
                : {}),
              default: () => tabsItemContentOf(item),
            },
          ),
        ),
    },
  )
}
