import { h } from 'vue'
import { NTabPane, NTabs } from 'naive-ui'
import type { UiNormalizedTabItem, UiTabsProps } from '@mmda/vui'
import { emitTabsChange, htmlAttributesOf, tabsHostStyle, tabsItemContentOf, tabsItemsOf, tabsModifierClasses, tabsNaivePlacementOf, tabsValueOf } from '@mmda/vui'

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
    loadOn: _loadOn,
    headerStyle: _headerStyle,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props

  const items = tabsItemsOf(props)
  const selected = tabsValueOf(props)
  const selectedName =
    items[selected]?.name ?? items[0]?.name ?? String(selected)

  return h(
    NTabs,
    {
      ...rest,
      ...htmlAttributesOf(props),
      value: selectedName,
      placement: tabsNaivePlacementOf(props),
      class: tabsModifierClasses(props).flat(),
      style: tabsHostStyle(props),
      'onUpdate:value': (next: unknown) => {
        const idx = items.findIndex((item) => item.name === next)
        emitTabsChange(props, idx >= 0 ? idx : next)
      },
    },
    {
      default: () =>
        items.map((item, index) => {
          const name = item.name || `content${index}`
          return h(
            NTabPane,
            {
              key: name,
              name,
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
          )
        }),
    },
  )
}
