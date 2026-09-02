import { h, unref, type VNode } from 'vue'
import {
  NBadge,
  NButton,
  NDrawer,
  NDropdown,
  NImage,
  NInput,
  NMenu,
  NModal,
  NPagination,
  NSelect,
  NSpin,
} from 'naive-ui'
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  type MetaUi,
  type Pagination,
} from '@mmda/core'
import type {
  PropData,
  UiAction,
  UiFactory,
  UiListPropsType,
  UiPaginatorPropsType,
  UiSlots,
} from '@mmda/vui'
import { createIconVNode, MATERIAL_SYMBOL_PREFIX } from '@mmda/vui'
import { agNaiveLayout } from './agnaive_layout'
import { MmdaAgGrid } from './components/MmdaAgGrid'

const invoke = (value: unknown) =>
  typeof value === 'function' ? (value as () => unknown)() : value

const naiveType = (role?: string) => {
  const roles: Record<string, 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'> = {
    primary: 'primary',
    secondary: 'default',
    success: 'success',
    info: 'info',
    warning: 'warning',
    warn: 'warning',
    danger: 'error',
    error: 'error',
  }
  return role ? roles[role] : undefined
}

const normalizeAction = (action: UiAction, t?: (key: string) => string) => ({
  label:
    action.label ??
    (action.name && t ? t(`action.${action.name}`) : action.name),
  key: action.name ?? action.label,
  icon: action.icon,
  disabled: action.disabled === true || action.disabled === 'true',
  command: action.onAction ?? action.command,
})

const dropdownOptions = (actions: UiAction[]) =>
  actions.map(action => {
    if (action.divider) return { type: 'divider' as const, key: `div-${action.name}` }
    const item = normalizeAction(action)
    return {
      label: item.label,
      key: String(item.key),
      disabled: item.disabled,
      icon: item.icon
        ? () => createIconVNode(item.icon as string)
        : undefined,
    }
  })

export function createAgNaiveUiFactory(): UiFactory {
  const button = (props: any, slots?: any) => {
    const iconName = props.icon as string | undefined
    const hideLabel = props.shape === 'circle' && !props.label
    return h(
      NButton,
      {
        attrType: props.type ?? 'button',
        type: naiveType(
          props.colorRole ??
            props.severity ??
            (props.buttonType === 'tonal' ? 'secondary' : undefined),
        ),
        secondary: props.buttonType === 'tonal',
        ghost: props.buttonType === 'outlined',
        text: props.buttonType === 'text' || props.buttonType === 'link',
        circle: props.shape === 'circle',
        round: props.shape === 'round',
        disabled: props.disabled === true || props.disabled === 'true',
        loading: props.loading,
        title: props.tooltip,
        size: props.size === 'small' ? 'small' : props.size === 'large' ? 'large' : 'medium',
        class: props.class,
        id: props.id,
        name: props.name,
        label: props.label,
        onClick: props.onClick ?? props.onAction ?? props.command,
      },
      {
        default: () =>
          slots?.default?.() ?? (hideLabel ? undefined : props.label),
        icon: iconName
          ? () => createIconVNode(factory.resolveIcon(iconName))
          : slots?.icon,
      },
    )
  }

  const factory: UiFactory = {
    layout: agNaiveLayout,
    integratedTablePaging: true,
    nativeInplaceEdit: true,
    defaultFilterDisplay: 'menu',
    actionIcons: {
      create: 'fas fa-plus',
      edit: 'fas fa-pencil-alt',
      save: 'fas fa-check',
      cancel: 'fas fa-times',
      delete: 'fas fa-trash-alt',
      refresh: 'fas fa-sync',
      search: 'fas fa-search',
      reset: 'fas fa-filter',
      back: 'fas fa-arrow-left',
      import: 'fas fa-upload',
      export: 'fas fa-download',
      'eye-slash': 'fas fa-eye-slash',
      'dnd-vert': `${MATERIAL_SYMBOL_PREFIX}drag_indicator`,
      'drag-indicator': `${MATERIAL_SYMBOL_PREFIX}drag_indicator`,
      'freeze-column-right': 'fas fa-arrow-right',
      'freeze-column-left': 'fas fa-arrow-left',
      unlock: 'fas fa-unlock',
      details: 'fas fa-eye',
      print: 'fas fa-print',
    },
    viewIcons: {
      index: 'fas fa-list',
      details: 'fas fa-eye',
      create: 'fas fa-plus',
      edit: 'fas fa-pencil-alt',
    },
    dialogIcons: {
      success: 'fas fa-check-circle',
      info: 'fas fa-info-circle',
      warning: 'fas fa-exclamation-triangle',
      error: 'fas fa-times-circle',
    },
    resolveIcon(icon: string) {
      if (!icon) return ''
      if (/\bfa[srbld]?\b|fa-/.test(icon)) return icon
      if (icon.startsWith(MATERIAL_SYMBOL_PREFIX)) return icon
      return factory.actionIcons[icon] ?? `fas fa-${icon}`
    },
    textSpan: (text, props) => h('span', props, text),
    label: (text, props) => h('label', props, text),
    image: (src, props) => h(NImage, { src, previewDisabled: !props?.preview, ...props }),
    icon: (name, props) => createIconVNode(factory.resolveIcon(name), props),
    badge: props =>
      h(NBadge, { value: props.value, type: naiveType(props.severity) as any, class: props.class }),
    title: (text, props) => h('h2', props, text),
    subtitle: (text, props) => h('h3', props, text),
    link: (props, slots) =>
      h(
        'a',
        { ...props, class: ['mmda-agnaive-link', props.class] },
        slots?.default?.() ?? props.text,
      ),
    input: (value, props = {}) =>
      h(NInput, {
        value: props.modelValue ?? props.value ?? value,
        'onUpdate:value': props['onUpdate:modelValue'] ?? props['onUpdate:value'] ?? props.onUpdate,
        ...props,
      }),
    iconField: (value, props = {}) =>
      h('span', { class: 'mmda-agnaive-icon-field' }, [
        props.icon && createIconVNode(factory.resolveIcon(props.icon)),
        h(NInput, {
          value: props.modelValue ?? props.value ?? value,
          'onUpdate:value':
            props['onUpdate:modelValue'] ?? props['onUpdate:value'] ?? props.onUpdate,
          ...props,
        }),
      ]),
    dropdown: (value, props = {}) =>
      h(NSelect, {
        value: props.modelValue ?? props.value ?? value,
        'onUpdate:value':
          props['onUpdate:modelValue'] ?? props['onUpdate:value'] ?? props.onUpdate,
        ...props,
      }),
    button,
    buttonGroup: (buttons, props) =>
      h(
        'div',
        {
          ...props,
          class: ['mmda-agnaive-button-group', props?.class],
          role: 'group',
        },
        buttons().filter(Boolean),
      ),
    splitButton: (props, slots) =>
      factory.menuButton(
        { ...props, label: props.label, icon: props.icon },
        props.actions ?? [],
        slots,
      ),
    menuButton: (props, actions, slots) => {
      const hideCaret =
        props.hideCaret === true ||
        props.shape === 'circle' ||
        (!props.label && Boolean(props.icon))
      const options = dropdownOptions(actions)
      return h(
        NDropdown,
        {
          trigger: 'click',
          options,
          label: props.label,
          class: props.class,
          onSelect: (key: string) => {
            const action = actions.find(item => (item.name ?? item.label) === key)
            ;(action?.onAction ?? action?.command)?.()
          },
        },
        {
          default: () =>
            button(
              {
                ...props,
                label: hideCaret ? undefined : props.label,
                shape: hideCaret ? 'circle' : props.shape,
                buttonType: props.buttonType ?? (hideCaret ? 'text' : undefined),
                colorRole: props.colorRole ?? (props.buttonType === 'tonal' ? 'secondary' : undefined),
                class: [
                  props.class,
                  hideCaret ? 'mmda-menu-button--icon-only' : '',
                  props.buttonType === 'tonal' ? 'mmda-btn-tonal' : '',
                ]
                  .filter(Boolean)
                  .join(' '),
              },
              slots,
            ),
        },
      )
    },
    floatingActionButton: props =>
      button({
        ...props,
        shape: 'circle',
        class: ['mmda-agnaive-fab', props.class],
      }),
    selectButton: (value, props, slots) =>
      h(
        NSelect,
        {
          value: props.modelValue ?? value,
          'onUpdate:value': props['onUpdate:modelValue'] ?? props.onUpdate,
          ...props,
        },
        slots,
      ),
    actionButton: (action, t, _resolve, props) =>
      button({
        ...action,
        ...normalizeAction(action, t),
        ...props,
        icon: factory.resolveIcon(action.icon ?? action.name ?? ''),
        onClick: action.onAction ?? action.command,
      }),
    paginator: (pagination: Pagination, props: UiPaginatorPropsType) =>
      h(NPagination, {
        page: pagination.pageNo ?? 1,
        pageSize: pagination.pageSize ?? DEFAULT_PAGE_SIZE,
        itemCount: pagination.recordCount ?? 0,
        pageSizes: props.pageSizeOptions ?? [...DEFAULT_PAGE_SIZE_OPTIONS],
        showSizePicker: true,
        'onUpdate:page': (page: number) =>
          props.onPage({
            pageNo: page,
            pageSize: pagination.pageSize ?? DEFAULT_PAGE_SIZE,
          }),
        'onUpdate:pageSize': (pageSize: number) =>
          props.onPage({ pageNo: 1, pageSize }),
      }),
    list: <T>(model: T[], metaui: MetaUi, props: UiListPropsType<T>) =>
      h(
        'div',
        { class: 'mmda-agnaive-list' },
        model.length
          ? model.map((item, index) =>
              h(
                'article',
                {
                  key:
                    props.itemKey?.(item) ??
                    String(
                      metaui.primaryKey ? (item as any)[metaui.primaryKey] : index,
                    ),
                  class: ['mmda-agnaive-list__item', props.itemClass?.(item)],
                  style: props.itemStyle?.(item),
                  onClick: () => props.onItemClick?.(item),
                  onDblclick: () => props.onItemDoubleClick?.(item),
                },
                invoke(props.item?.(item, index)) as any,
              ),
            )
          : props.empty?.() ?? '',
      ),
    table: <T>(model: T[], metaui: MetaUi, props: UiListPropsType<T>) =>
      h(MmdaAgGrid, { data: model, metaui, ...props } as any),
    pagableTable: (loader, metadata, props) =>
      h('div', { class: 'mmda-agnaive-pagable-table' }, [
        factory.table(loader.model.list as any[], metadata.metaui, props as any),
      ]),
    loading: props =>
      h('div', { class: 'mmda-agnaive-loading', ...props }, [h(NSpin)]),
    scrollbar: (content, props) =>
      h('div', { class: 'mmda-agnaive-scrollbar', ...props }, content as any),
    menu: (items, props) =>
      h(NMenu, {
        options: (items as any[]).map(item => ({
          label: item.label,
          key: item.key ?? item.moduleCode ?? item.label,
          icon: item.icon ? () => createIconVNode(factory.resolveIcon(item.icon)) : undefined,
          children: item.items,
        })),
        ...props,
      }),
    panelMenu: (items, props, slots) =>
      h(
        NMenu,
        {
          options: (items as any[]).map(item => ({
            label: item.label,
            key: item.key ?? item.label,
            children: item.items,
          })),
          ...props,
        },
        slots,
      ),
    menubar: (items, props, slots) =>
      h(
        NMenu,
        {
          mode: 'horizontal',
          options: (items as any[]).map(item => ({
            label: item.label,
            key: item.key ?? item.label,
            children: item.items,
          })),
          ...props,
        },
        slots,
      ),
    dialog: (
      props: PropData & {
        visible: boolean
        onUpdateVisible: (value: boolean) => void
      },
      slots?: UiSlots,
    ) =>
      h(
        NModal,
        {
          show: props.visible,
          preset: 'dialog',
          title: props.header ?? props.title,
          'onUpdate:show': props.onUpdateVisible,
          ...props,
        },
        slots,
      ),
    drawer: (props, slots) =>
      h(
        NDrawer,
        {
          show: props.visible ?? props.show,
          'onUpdate:show': props.onUpdateVisible ?? props['onUpdate:show'],
          ...props,
        },
        slots,
      ),
    searchForRelative: (props, slots) =>
      h(
        NModal,
        {
          show: props.visible,
          preset: 'dialog',
          title: props.title,
          'onUpdate:show': props.onUpdateVisible,
        },
        slots,
      ),
  }

  return factory
}
