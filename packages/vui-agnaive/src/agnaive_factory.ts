import { h, unref, type VNode } from 'vue'
import { NImage, NMenu, NPagination } from 'naive-ui'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, type MetaUi } from '@mmda/core'
import type { UiProps, UiAction, VuiFactory, VuiListPropsType, UiPaginatorProps, VuiTileSlots } from '@mmda/vui'
import { assembleTreeGridRows, createIconVNode, MATERIAL_SYMBOL_PREFIX, bindListDisplayRenderers, wrapListFamilyPaginator, renderSearchForRelativeField, createFileUploader, createFilesUploader, createImageUploader, createImagesUploader, renderFileLink, resolveActionButtonIcon, createErrorRetry, vuiUpdateOf } from '@mmda/vui'
import { agNaiveLayout } from './agnaive_layout'
import { AgGrid } from './components/AgGrid'
import { createTree } from './factory/tree'
import { createBadge } from './factory/badge'
import { createMessage } from './factory/message'
import { createAvatar } from './factory/avatar'
import { createBarcode } from './factory/barcode'
import { createQrCode } from './factory/qrcode'
import { createBreadcrumb } from './factory/breadcrumb'
import { createCalendar } from './factory/calendar'
import { createCarousel } from './factory/carousel'
import { createCheckBox } from './factory/checkbox'
import { createSwitch } from './factory/switch'
import { createCheckBoxList, createBitCheckBoxList } from './factory/check_box_list'
import { createChips } from './factory/chips'
import { createContextMenu } from './factory/context_menu'
import { createCard } from './factory/card'
import { createDivider } from './factory/divider'
import { createTooltip } from './factory/tooltip'

type FormFieldProps = UiProps & {
  label?: string | VNode
  modelValue?: string
  value?: string
  onChange?: (value: string) => void
}

type IconFieldProps = UiProps & { icon?: string; modelValue?: string; value?: string }
import { createInplaceEditor } from './factory/inplace_editor'
import { createColorPicker } from './factory/color_picker'
import { createMaskedTextBox } from './factory/masked_text_box'
import { createOneTimePasswordInput } from './factory/one_time_password_input'
import { createQueryBuilder } from './factory/query_builder'
import { createSlider } from './factory/slider'
import { createRating } from './factory/rating'
import { createTabs } from './factory/tabs'
import { createToolbar } from './factory/toolbar'
import { createDrawer, createSidebar } from './factory/sidebar'
import { createSplitter } from './factory/splitter'
import { createNumberInput } from './factory/number_input'
import { createTextArea } from './factory/text_area'
import { createTextInput } from './factory/text_input'
import { createProgressBar } from './factory/progress_bar'
import { createSignaturePad } from './factory/signature_pad'
import { createStepper } from './factory/stepper'
import { createTimeline } from './factory/timeline'
import { createSkeleton } from './factory/skeleton'
import { createLoading } from './factory/loading'
import { createSpeechToText } from './factory/speech_to_text'
import { createDatePicker } from './factory/date_picker'
import { createDateTimePicker } from './factory/date_time_picker'
import { createTimePicker } from './factory/time_picker'
import { createDateRangePicker } from './factory/date_range_picker'
import { createDropDownList } from './factory/drop_down_list'
import { createRadioButtonGroup } from './factory/radio_button_group'
import {
  createMultiSelect,
  createMultiItemSelect,
  createMultiValueSelect,
  createMultiTextSelect,
  createMultiBitSelect,
} from './factory/multi_select'
import { createTreeSelect } from './factory/tree_select'
import { createComboBox } from './factory/combo_box'
import { createAutoComplete } from './factory/autocomplete'
import { createTagAutoComplete } from './factory/tag_auto_complete'
import { createButton } from './factory/button'
import { createButtonGroup } from './factory/button_group'
import { createSelectButtonGroup } from './factory/select_button_group'
import {
  createDropDownButton,
  createMoreMenuButton,
} from './factory/drop_down_button'
import { createSplitButton } from './factory/split_button'
import { createFloatingActionButton } from './factory/floating_action_button'
const invoke = (value: unknown) =>
  typeof value === 'function' ? (value as () => unknown)() : value

const normalizeAction = (action: UiAction, t?: (key: string) => string) => ({
  label:
    action.label ??
    (action.name && t ? t(`action.${action.name}`) : action.name),
  key: action.name ?? action.label,
  icon: action.icon,
  disabled: action.disabled === true,
  command: action.onAction,
})

export function createAgNaiveUiFactory(): VuiFactory {
  const button = (props: any, slots?: any) =>
    createButton(props, slots, (name) => factory.resolveIcon(name))
  const table = <T>(props: VuiListPropsType<T> = {}) =>
    h(AgGrid, { data: props.rows ?? [], fields: props.fields ?? [], primaryKey: props.primaryKey, ...props } as any)

  const factory: VuiFactory = {
    nativeInplaceEdit: true,
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
      'align-left': 'fas fa-align-left',
      'align-center': 'fas fa-align-center',
      'align-right': 'fas fa-align-right',
      details: 'fas fa-eye',
      print: 'fas fa-print',
      execute: 'fas fa-play',
      do: 'fas fa-play',
      more: 'fas fa-ellipsis-v',
      /** 详情页壳 cards ↔ tabs */
      'page-layout': 'fas fa-th-large',
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
      if (!icon) return factory.actionIcons.execute
      if (/\bfa[srbld]?\b|fa-/.test(icon)) return icon
      if (icon.startsWith(MATERIAL_SYMBOL_PREFIX)) return icon
      return factory.actionIcons[icon] ?? `fas fa-${icon}`
    },
    textSpan: (props) => h('span', props, props.text),
    label: (props) => h('label', props, props.text),
    image: (props) => h(NImage, { ...props, src: props.src, previewDisabled: !props.preview }),
    icon: (props) =>
      createIconVNode(
        factory.resolveIcon(props.iconClass ?? ''),
        props as Record<string, unknown>,
      ),
    badge: props => createBadge(props),
    message: props => createMessage(props),
    avatar: props => createAvatar(props, name => factory.resolveIcon(name)),
    barcode: props => createBarcode(props),
    qrCode: props => createQrCode(props),
    breadcrumb: props => createBreadcrumb(props, name => factory.resolveIcon(name)),
    calendar: props => createCalendar(props),
    carousel: props => createCarousel(props),
    checkBox: props => createCheckBox(props),
    switch: (props) => createSwitch(props ?? {}),
    checkBoxList: props => createCheckBoxList(props),
    bitCheckBoxList: props => createBitCheckBoxList(props),
    chips: props => createChips(props, name => factory.resolveIcon(name)),
    contextMenu: props =>
      createContextMenu(props, name => factory.resolveIcon(name)),
    card: (props, slots) => createCard(props, slots),
    divider: (props = {}) => createDivider(props),
    tooltip: (props = {}, slots) => createTooltip(props, slots),
    inplaceEditor: (props = {}, slots) => createInplaceEditor(props, slots),
    fileLink: (props = {}) => renderFileLink(props),
    Url: (props = {}) => renderFileLink(props),
    FileLink: (props = {}) => renderFileLink(props),
    fileUploader: (props = {}) => createFileUploader(props),
    filePicker: (props = {}) => createFileUploader(props),
    FileUploader: (props = {}) => createFileUploader(props),
    filesUploader: (props = {}) => createFilesUploader(props),
    fileUpload: (props = {}) => createFilesUploader(props),
    FileUpload: (props = {}) => createFilesUploader(props),
    imageUploader: (props = {}) => createImageUploader(props),
    imagePicker: (props = {}) => createImageUploader(props),
    ImagePicker: (props = {}) => createImageUploader(props),
    imagesUploader: (props = {}) => createImagesUploader(props),
    colorPicker: props => createColorPicker(props),
    maskedTextBox: props => createMaskedTextBox(props),
    oneTimePasswordInput: props => createOneTimePasswordInput(props),
    queryBuilder: props => createQueryBuilder(props),
    slider: props => createSlider(props),
    rating: props => createRating(props),
    tabs: props => createTabs(props),
    toolbar: (props, slots) => createToolbar(props, slots),
    sidebar: (props, slots) => createSidebar(props, slots),
    drawer: (props, slots) => createDrawer(props, slots),
    numberInput: props => createNumberInput(props),
    textInput: props => createTextInput(props),
    textArea: props => createTextArea(props),
    progressBar: props => createProgressBar(props),
    signaturePad: props => createSignaturePad(props),
    stepper: props => createStepper(props, name => factory.resolveIcon(name)),
    timeline: props => createTimeline(props, name => factory.resolveIcon(name)),
    skeleton: (props = {}) => createSkeleton(props),
    loading: (props = {}) => createLoading(props),
    error: (props = {}) => createErrorRetry(props),
    speechToText: (props = {}) =>
      createSpeechToText(props, name => factory.resolveIcon(name)),
    datePicker: props => createDatePicker(props),
    monthPicker: props =>
      createDatePicker({
        ...props,
        precision: 'month',
        format: props.format ?? 'yyyy-MM',
      }),
    dateTimePicker: props => createDateTimePicker(props),
    timePicker: props => createTimePicker(props),
    dateRangePicker: props => createDateRangePicker(props),
    dropDownList: props => createDropDownList(props),
    radioButtonGroup: props => createRadioButtonGroup(props),
    multiSelect: props => createMultiSelect(props),
    multiItemSelect: props => createMultiItemSelect(props),
    multiValueSelect: props => createMultiValueSelect(props),
    multiTextSelect: props => createMultiTextSelect(props),
    multiBitSelect: props => createMultiBitSelect(props),
    treeSelect: createTreeSelect,
    dropDownTree: createTreeSelect,
    comboBox: props => createComboBox(props),
    title: (props) => h('h2', props, props.text),
    subtitle: (props) => h('h3', props, props.text),
    link: (props, slots) =>
      h(
        'a',
        { ...props, class: ['mmda-link', props.class] },
        slots?.default?.() ?? props.text,
      ),
    iconField: (value, props = {}) => {
      const p = props as IconFieldProps
      return h('span', { class: 'mmda-icon-field' }, [
        p.icon && createIconVNode(factory.resolveIcon(p.icon)),
        createTextInput({
          ...props,
          value: p.modelValue ?? p.value ?? value,
        }),
      ])
    },
    autoComplete: (props = {}) => createAutoComplete(props),
    tagAutoComplete: (props = {}) => createTagAutoComplete(props),
    button,
    buttonGroup: (props = {}, slots) =>
      createButtonGroup(slots?.default ?? (() => []), props),
    selectButtonGroup: (props) =>
      createSelectButtonGroup(props.modelValue, props, factory.resolveIcon),
    splitButton: (props, slots) => createSplitButton(props, slots, button),
    dropDownButton: (props, slots) =>
      createDropDownButton(props, props.actions ?? [], slots, button),
    moreMenuButton: (props, slots) =>
      createMoreMenuButton(props, props.actions ?? [], slots, button),
    floatingActionButton: (props, slots) =>
      createFloatingActionButton(props, slots, (name) =>
        factory.resolveIcon(name),
      ),
    actionButton: (action, t, _resolve, props) =>
      button({
        ...action,
        ...normalizeAction(action, t),
        ...props,
        // 显式保留元数据 colorRole（normalizeAction 不含此字段；props 可覆盖）
        colorRole: props?.colorRole ?? action.colorRole,
        icon: resolveActionButtonIcon(
          factory.resolveIcon,
          factory.actionIcons,
          action,
        ),
        onClick: action.onAction,
      }),
    paginator: (props: UiPaginatorProps) =>
      h(NPagination, {
        page: props.pagination.pageNo ?? 1,
        pageSize: props.pagination.pageSize ?? DEFAULT_PAGE_SIZE,
        itemCount: props.pagination.recordCount ?? 0,
        pageSizes: props.pageSizeOptions ?? [...DEFAULT_PAGE_SIZE_OPTIONS],
        showSizePicker: true,
        'onUpdate:page': (page: number) =>
          props.onPage({
            pageNo: page,
            pageSize: props.pagination.pageSize ?? DEFAULT_PAGE_SIZE,
          }),
        'onUpdate:pageSize': (pageSize: number) =>
          props.onPage({ pageNo: 1, pageSize }),
      }),
    tree: (props) => createTree(props),
    treeGrid: <T>(props: any) => {
      const model = (props.rows ?? []) as T[];
      if (props.rowDetail) {
        return h(AgGrid, { data: model, fields: props.fields ?? [], primaryKey: props.primaryKey, ...props, treeData: false } as any)
      }
      const { assembled } = assembleTreeGridRows(model, { primaryKey: props.primaryKey } as MetaUi, {
        ...props,
        bindShape: props.bindShape ?? 'dataPath',
      })
      return h(AgGrid, {
        data: assembled.rows,
        fields: props.fields ?? [],
        primaryKey: props.primaryKey,
        ...props,
        treeData: true,
        getDataPath: assembled.getDataPath,
      } as any)
    },
    list: <T>(props: VuiListPropsType<T> = {}) =>
      h(
        'div',
        { class: 'mmda-list' },
        (props.rows ?? []).length
          ? (props.rows ?? []).map((item, index) =>
              h(
                'article',
                {
                  key:
                    props.itemKey?.(item) ??
                    String(
                      props.primaryKey ? (item as any)[props.primaryKey] : index,
                    ),
                  class: ['mmda-list__item', props.itemClass?.(item)],
                  style: props.itemStyle?.(item),
                  onClick: () => props.onItemClick?.(item),
                  onDblclick: () => props.onItemDoubleClick?.(item),
                },
                invoke(props.item?.(item, index)) as any,
              ),
            )
          : props.empty?.() ?? '',
      ),
    table,
    grid: table,
    pagableTable: (loader, metadata, props) =>
      factory.table({
        ...props,
        rows: loader.model.list as any[],
        fields: props.fields ?? metadata.getListedFields(),
        primaryKey: props.primaryKey ?? metadata.primaryKey,
        objName: props.objName ?? metadata.objName,
        pagination: props.pagination ?? loader.model.pagination,
        onPage: props.onPage,
      }),
    scrollbar: (content, props) =>
      h('div', { class: 'mmda-scrollbar', ...props }, content as any),
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
    splitter: (props, slots) =>
      createSplitter(slots?.default?.() ?? [], props),
    searchRelative: (props) =>
      renderSearchForRelativeField(props as any),
    formField: (props: UiProps = {}, slots?: VuiTileSlots) => {
      const p = props as FormFieldProps
      return h(
        'div',
        { class: ['mmda-form-field', 'mmda-form-field', p.class], style: p.style },
        [
          p.label
            ? h('label', { class: 'mmda-form-field__label' }, String(p.label))
            : null,
          slots?.default?.() ??
            createTextInput({
              ...props,
              value: p.modelValue ?? p.value,
              onChange: p.onChange ?? vuiUpdateOf(props),
            }),
        ],
      )
    },
  }
  wrapListFamilyPaginator(factory, ['list'], 'mmda-pagable')
  bindListDisplayRenderers(factory)
  return factory
}
