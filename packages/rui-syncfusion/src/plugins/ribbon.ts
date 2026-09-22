import {
  createElement,
  lazy,
  Suspense,
  type ComponentType,
  type ReactElement,
} from 'react'
import {
  ribbonHookClass,
  UiPluginName,
  type UiPlugin,
  type UiRibbonItem,
  type UiRibbonMenuItem,
  type UiRibbonProps,
  type UiRibbonTab,
} from '@mmda/core'
import { joinClass, reactDomProps } from './utils'

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
        change: () => item.onClick?.(),
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

function MissingRibbon(): ReactElement {
  return createElement(
    'p',
    { className: 'mmda-ribbon-missing' },
    'Ribbon requires @syncfusion/ej2-react-ribbon',
  )
}

const RibbonImpl = lazy(async (): Promise<{
  default: ComponentType<any>
  services: any[]
}> => {
  try {
    // @ts-ignore -- optional peer；未安装时回落 MissingRibbon
    const mod: any = await import(/* @vite-ignore */ '@syncfusion/ej2-react-ribbon')
    return {
      default: mod.RibbonComponent as ComponentType<any>,
      services: [
        mod.RibbonButton,
        mod.RibbonCheckBox,
        mod.RibbonDropDown,
        mod.RibbonSplitButton,
      ],
    }
  } catch {
    return { default: MissingRibbon, services: [] }
  }
})

export function SfRibbon(props: UiRibbonProps): ReactElement {
  const {
    tabs,
    layout,
    activeTab,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props

  return createElement(
    Suspense,
    { fallback: null },
    createElement(RibbonImpl as any, {
      ...rest,
      ...options,
      ...reactDomProps(props),
      cssClass: joinClass(ribbonHookClass(className)),
      tabs: mapUiTabsToEj2(tabs),
      activeLayout: layout === 'simplified' ? 'Simplified' : 'Classic',
      selectedTab: activeTab ?? 0,
      htmlAttributes,
    }),
  )
}

export function createSfRibbonPlugin(): UiPlugin {
  return {
    name: UiPluginName.ribbon,
    buildUi(_context, props) {
      return SfRibbon(props as UiRibbonProps)
    },
  }
}
