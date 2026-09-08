import { h, unref, type VNode } from 'vue'
import { NImage, NMenu, NPagination } from 'naive-ui'
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
import {
  assembleTreeGridRows,
  createIconVNode,
  MATERIAL_SYMBOL_PREFIX,
  bindListDisplayRenderers,
  wrapListFamilyPaginator,
  renderSearchForRelativeField,
  switchArgs,
  createFileUploader,
  createFilesUploader,
  createImageUploader,
  createImagesUploader,
  renderFileLink,
} from '@mmda/vui'
import { agNaiveLayout } from './agnaive_layout'
import { AgGrid } from './components/AgGrid'
import { createTree } from './factory/tree'
import { createBadge } from './factory/badge'
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
import { createInplaceEditor } from './factory/inplace_editor'
import { createColorPicker } from './factory/color_picker'
import { createMaskedTextBox } from './factory/maskedTextBox'
import { createOneTimePasswordInput } from './factory/oneTimePasswordInput'
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
import { createButtonGroup } from './factory/buttonGroup'
import { createSelectButtonGroup } from './factory/selectButtonGroup'
import {
  createDropDownButton,
  createMoreMenuButton,
} from './factory/dropDownButton'
import { createSplitButton } from './factory/splitButton'
import { createFloatingActionButton } from './factory/floatingActionButton'

const invoke = (value: unknown) =>
  typeof value === 'function' ? (value as () => unknown)() : value

const normalizeAction = (action: UiAction, t?: (key: string) => string) => ({
  label:
    action.label ??
    (action.name && t ? t(`action.${action.name}`) : action.name),
  key: action.name ?? action.label,
  icon: action.icon,
  disabled: action.disabled === true || action.disabled === 'true',
  command: action.onAction ?? action.command,
})

export function createAgNaiveUiFactory(): UiFactory {
  const button = (props: any, slots?: any) =>
    createButton(props, slots, (name) => factory.resolveIcon(name))

  const factory: UiFactory = {
    layout: agNaiveLayout,
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
    badge: props => createBadge(props),
    avatar: props => createAvatar(props, name => factory.resolveIcon(name)),
    barcode: props => createBarcode(props),
    qrCode: props => createQrCode(props),
    breadcrumb: props => createBreadcrumb(props, name => factory.resolveIcon(name)),
    calendar: props => createCalendar(props),
    carousel: props => createCarousel(props),
    checkBox: props => createCheckBox(props),
    switch: (value, props) => createSwitch(switchArgs(value, props)),
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
    title: (text, props) => h('h2', props, text),
    subtitle: (text, props) => h('h3', props, text),
    link: (props, slots) =>
      h(
        'a',
        { ...props, class: ['mmda-agnaive-link', props.class] },
        slots?.default?.() ?? props.text,
      ),
    iconField: (value, props = {}) =>
      h('span', { class: 'mmda-agnaive-icon-field' }, [
        props.icon && createIconVNode(factory.resolveIcon(props.icon)),
        createTextInput({
          ...props,
          value: props.modelValue ?? props.value ?? value,
        }),
      ]),
    autoComplete: (value, props = {}) => createAutoComplete(value, props),
    tagAutoComplete: (value, props = {}) => createTagAutoComplete(value, props),
    button,
    buttonGroup: createButtonGroup,
    selectButtonGroup: createSelectButtonGroup,
    splitButton: (props, slots) => createSplitButton(props, slots, button),
    dropDownButton: (props, actions, slots) =>
      createDropDownButton(props, actions, slots, button),
    moreMenuButton: (props, actions, slots) =>
      createMoreMenuButton(props, actions, slots, button),
    floatingActionButton: (props, slots) =>
      createFloatingActionButton(props, slots, (name) =>
        factory.resolveIcon(name),
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
    tree: (props) => createTree(props),
    treeGrid: <T>(model: T[], metaUi: MetaUi, props: any) => {
      if (props.rowDetail) {
        return h(AgGrid, { data: model, metaUi, ...props, treeData: false } as any)
      }
      const { assembled } = assembleTreeGridRows(model, metaUi, {
        ...props,
        bindShape: props.bindShape ?? 'dataPath',
      })
      return h(AgGrid, {
        data: assembled.rows,
        metaUi,
        ...props,
        treeData: true,
        getDataPath: assembled.getDataPath,
      } as any)
    },
    list: <T>(model: T[], metaUi: MetaUi, props: UiListPropsType<T>) =>
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
                      metaUi.primaryKey ? (item as any)[metaUi.primaryKey] : index,
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
    table: <T>(model: T[], metaUi: MetaUi, props: UiListPropsType<T>) =>
      h(AgGrid, { data: model, metaUi, ...props } as any),
    pagableTable: (loader, metadata, props) =>
      factory.table(loader.model.list as any[], metadata.metaUi, {
        ...props,
        pagination: props.pagination ?? loader.model.pagination,
        onPage: props.onPage,
      }),
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
    splitter: (panes, props) => createSplitter(panes, props),
    searchForRelative: (props) =>
      renderSearchForRelativeField(props as any),
    formField: (props: PropData = {}, slots?: UiSlots) =>
      h(
        'div',
        { class: ['mmda-form-field', 'mmda-agnaive-form-field', props.class], style: props.style },
        [
          props.label
            ? h('label', { class: 'mmda-form-field__label' }, String(props.label))
            : null,
          slots?.default?.() ??
            createTextInput({
              ...props,
              value: props.modelValue ?? props.value,
              onChange:
                props.onChange ??
                props.onUpdate ??
                props['onUpdate:modelValue'],
            }),
        ],
      ),
  }

  wrapListFamilyPaginator(factory, ['list'], 'mmda-agnaive-pagable')
  bindListDisplayRenderers(factory)
  return factory
}
