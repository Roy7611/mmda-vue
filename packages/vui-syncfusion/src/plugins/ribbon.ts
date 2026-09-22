/*
 * Ribbon 是 Builder 插件，不进 chrome UiFactory。
 * App / 皮肤：builder.use(createSfRibbonPlugin())
 */
import { defineComponent, h, provide } from 'vue'
import type { UiRibbonItem, UiRibbonMenuItem, UiRibbonProps, UiRibbonTab } from '@mmda/vui'
import { ribbonHookClass, UiPluginName, type UiPlugin } from '@mmda/vui'
// @ts-ignore -- optional peer，未安装时由测试跳过
import { RibbonButton, RibbonCheckBox, RibbonDropDown, RibbonSplitButton } from '@syncfusion/ej2-ribbon'
// @ts-ignore -- optional peer，未安装时由测试跳过
import { RibbonComponent } from '@syncfusion/ej2-vue-ribbon'
import { uiRenderProps } from '@mmda/core'

function ej2MenuItems(items: UiRibbonMenuItem[] | undefined) {
  return (items ?? []).map((item) => ({
    text: item.label,
    iconCss: item.icon,
    disabled: item.disabled,
  }))
}

function ej2ItemType(type: UiRibbonItem['type']): string {
  if (type === 'dropDown') return 'DropDown'
  if (type === 'splitButton') return 'SplitButton'
  if (type === 'checkBox') return 'CheckBox'
  return 'Button'
}

function ej2RibbonItem(item: UiRibbonItem): Record<string, unknown> {
  const type = ej2ItemType(item.type)
  const base: Record<string, unknown> = {
    id: item.id,
    type,
    disabled: item.disabled,
  }
  if (type === 'DropDown') {
    return {
      ...base,
      dropDownSettings: {
        content: item.label,
        iconCss: item.icon,
        items: ej2MenuItems(item.items),
        select: (args: { item?: { text?: string } }) => {
          const picked = item.items?.find((m) => m.label === args.item?.text)
          picked?.onClick?.()
        },
      },
    }
  }
  if (type === 'SplitButton') {
    return {
      ...base,
      splitButtonSettings: {
        content: item.label,
        iconCss: item.icon,
        items: ej2MenuItems(item.items),
        click: item.onClick,
        select: (args: { item?: { text?: string } }) => {
          const picked = item.items?.find((m) => m.label === args.item?.text)
          picked?.onClick?.()
        },
      },
    }
  }
  if (type === 'CheckBox') {
    return {
      ...base,
      checkBoxSettings: {
        label: item.label,
        checked: item.checked === true,
        change: (args: { checked?: boolean }) => {
          item.onClick?.()
          void args
        },
      },
    }
  }
  return {
    ...base,
    buttonSettings: {
      content: item.label,
      iconCss: item.icon,
      clicked: item.onClick,
    },
  }
}

export function mapUiTabsToEj2(tabs: UiRibbonTab[]): Record<string, unknown>[] {
  return (tabs ?? []).map((tab) => ({
    header: tab.header,
    groups: (tab.groups ?? []).map((group) => ({
      header: group.header,
      collections: (group.collections ?? []).map((collection) => ({
        items: (collection.items ?? []).map(ej2RibbonItem),
      })),
    })),
  }))
}

const SfRibbon = defineComponent({
  name: 'MmdaSfRibbon',
  inheritAttrs: false,
  setup(_, { attrs }) {
    provide('ribbon', [
      RibbonButton,
      RibbonDropDown,
      RibbonSplitButton,
      RibbonCheckBox,
    ])
    return () => h(RibbonComponent as any, { ...attrs })
  },
})

function renderRibbon(props: UiRibbonProps) {
  const {
    tabs,
    layout,
    activeTab,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  return h(SfRibbon, {
    ...rest,
    ...options,
    htmlAttributes: uiRenderProps(props).attributes,
    class: ribbonHookClass(className),
    tabs: mapUiTabsToEj2(tabs),
    activeLayout: layout === 'simplified' ? 'Simplified' : 'Classic',
    selectedTab: activeTab ?? 0,
  })
}

export function createSfRibbonPlugin(): UiPlugin {
  return {
    name: UiPluginName.ribbon,
    buildUi(_context, props) {
      return renderRibbon(props as UiRibbonProps)
    },
  }
}
