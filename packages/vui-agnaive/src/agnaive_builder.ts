import {

  h,

  reactive,

  type VNode,

} from 'vue'

import { DATE_RANGE_FILTER_KINDS, SqlDataType, pluralize, type MetaUiGroup, type Module } from '@mmda/core'

import { VueUiBuilder, GroupCard, assembleMenuItems, createIconVNode, pageLayoutMenuItems, paintIndexTopbar, paintDetailsTopbar, chartAsPlugin, timelineAsPlugin, type AppSideBarProps, type AppTopBarProps, type ImportAndExportActionProps, type ModuleSearchbarProps, type UiProps, type SigninFormProps, type SigninFormSlots, type SignupFormProps, type UiAction, type VueUiFactory, type VueUiFieldFactory, type UiSearchField, type UiSlots, type VueUiContext, ListSearchField } from '@mmda/vui'

import {

  NButton,

  NDatePicker,

  NInput,

  NInputNumber,

  NSelect,

} from 'naive-ui'

import { AgNaiveOverlayHost } from './components/AgNaiveOverlayHost'

import { NAppSideMenu } from './components/NAppSideMenu'

import { BpmnModeler } from './components/BpmnModeler'

import { SigninForm } from './components/SigninForm'

import { createAgNaiveOverlay } from './agnaive_overlay'

import { createAgNaiveFieldFactory } from './agnaive_field_factory'

import { createAgNaiveUiFactory } from './agnaive_factory'

import { agNaiveLayout } from './agnaive_layout'
import { createAgPivotPlugin } from './plugins/pivot_table'
import { createAgChartFactory } from './plugins/chart'

import { wrapNaiveConfig } from './agnaive_provider'

import { naiveSkinState, refreshNaiveThemeFromCss } from './agnaive_theme'



const invoke = (value: unknown): any =>

  typeof value === 'function' ? (value as () => unknown)() : value



type UiContext = VueUiContext<any>



export class AgNaiveUiBuilder extends VueUiBuilder {

  declare readonly factory: VueUiFactory



  constructor(

    factory = createAgNaiveUiFactory(),

    fieldFactory: VueUiFieldFactory = createAgNaiveFieldFactory(),

  ) {

    super(

      factory,

      fieldFactory,

      agNaiveLayout,

      createAgNaiveOverlay(),

    )
    this.use(createAgPivotPlugin())
    this.use(chartAsPlugin(createAgChartFactory()))
    if (typeof factory.timeline === 'function') {
      this.use(timelineAsPlugin((props) => factory.timeline!(props)))
    }

  }



  get overlayHost() {

    return AgNaiveOverlayHost

  }



  override setColorScheme(dark: boolean) {

    super.setColorScheme(dark)

    naiveSkinState.dark = dark

    if (typeof document !== 'undefined') {

      document.documentElement.classList.toggle('n-dark', dark)

      refreshNaiveThemeFromCss()

    }

  }



  override setColorPalette(palette: any) {

    super.setColorPalette(palette)

    refreshNaiveThemeFromCss()

  }



  override setFontScale(scale: any) {

    super.setFontScale(scale)

    refreshNaiveThemeFromCss()

  }



  override buildGroupCard(

    group: MetaUiGroup,

    body: VNode | VNode[],

    props: UiProps = {},

  ) {

    const {

      container: _container,

      region: _region,

      many: _many,

      direction: _direction,

      cols: _cols,

      class: _className,

      headerActions,

      ...rest

    } = props

    return h(

      GroupCard,

      {

        title: group.groupLabel,

        expanded: group.expanded !== false,

        class: this.groupWrapClass(group, props),

        ...rest,

      },

      {

        default: () => this.wrapGroupContent(body),

        actions: headerActions ? () => headerActions : undefined,

      },

    )

  }



  override buildAppScaffold(props?: any) {

    return wrapNaiveConfig(super.buildAppScaffold(props))

  }



  override buildListView(context: UiContext, props?: any) {

    return wrapNaiveConfig(super.buildListView(context, props))

  }



  override buildView(context: UiContext, props?: any) {

    return wrapNaiveConfig(super.buildView(context, props))

  }



  buildAppTopBar(props: AppTopBarProps = { modules: [], logo: () => null }) {

    const items = props.modules.map(module => ({

      label: module.moduleName ?? module.moduleLabel,

      url: module.moduleUrl ?? (module as any).url,

    }))

    return h('div', { class: 'mmda-topbar' }, [

      invoke(props.logo),

      this.factory.menubar(items),

      h('div', { class: 'mmda-topbar__actions' }, invoke(props.actions)),

    ])

  }



  buildAppSideBar(

    props: AppSideBarProps = { modules: [], header: () => null },

  ) {

    return this.buildAppSideMenu({

      modules: props.modules,

      logo: props.header,

      footer: props.footer,

    })

  }



  buildAppSideMenu(props: import('@mmda/core').UiAppSideMenuProps<VNode> = {}) {

    return h(NAppSideMenu, props as any)

  }



  buildAppMenu(modules: Module[], props?: UiProps) {

    const { item, expand, ...rest } = props ?? {}

    if (expand === false) {

      return this.factory.menubar(assembleMenuItems(modules), {

        class: 'mmda-app-menu',

        ...rest,

      }, item ? { item } : undefined)

    }

    return this.buildAppSideMenu({

      modules,

      class: 'mmda-app-menu',

      ...rest,

    })

  }



  buildImportOrExportAction(

    context: UiContext,

    props: ImportAndExportActionProps,

  ): VNode {

    const runtime = context as any

    const repository = runtime.isRoot

      ? runtime.logic.repository

      : pluralize(context.metaUi.objName)

    const { role, handlerFn, importFn, exportFn } = props

    const action =

      role === 'import'

        ? this.actionFactory.import(context, { repository, handlerFn, importFn })

        : this.actionFactory.export(context, { repository, handlerFn, exportFn })

    const templates = runtime.templates ?? []

    if (templates.length > 0) {

      return this.factory.splitButton({

        label: action.label,

        icon: this.factory.resolveIcon(action.icon ?? role ?? ''),

        severity: action.colorRole === 'danger' ? 'danger' : undefined,

        size: 'small',

        onClick: action.onAction,

        actions: templates.map((template: any) => ({

          label: template.templateName,

          icon: 'fas fa-file',

          command: () => {

            runtime.currentTemplate = template

            if (role === 'import') {

              void (runtime.many

                ? runtime.importFiles?.({ repository, importFn })

                : runtime.importFile?.({ repository, importFn }))

            } else {

              void (runtime.many

                ? runtime.exportFiles?.({ repository, exportFn })

                : runtime.exportFile?.({ repository, exportFn }))

            }

          },

        })),

      })

    }

    return this.toolbarActionButton(context, action)

  }



  private listLayoutMenuItems(context: UiContext) {

    return [

      {

        name: 'tableSettings',

        label: context.t('action.tableSettings'),

        icon: this.factory.resolveIcon('cog'),

        onAction: () => void this.openTableSettings(context),

      },

    ]

  }



  private toolbarActionButton(
    context: UiContext,
    action: UiAction,
    props?: UiProps,
  ) {
    return this.factory.actionButton(
      action,
      (message) => context.t(message),
      false,
      {
        size: 'small',
        ...props,
      },
    )
  }

  buildIndexTopbar(
    context: UiContext,
    props?: Parameters<VueUiBuilder['buildIndexTopbar']>[1],
    slots?: UiSlots,
  ) {
    return paintIndexTopbar(
      this,
      context,
      props ?? {},
      slots,
      this.listLayoutMenuItems(context),
    )
  }

  buildDetailsTopbar(
    context: UiContext,
    props?: Parameters<VueUiBuilder['buildDetailsTopbar']>[1],
    slots?: UiSlots,
  ) {
    return paintDetailsTopbar(
      this,
      context,
      props ?? {},
      slots,
      pageLayoutMenuItems(context as any).map((item) =>
        item.divider
          ? item
          : {
              ...item,
              icon: this.factory.resolveIcon(item.icon ?? 'page-layout'),
              onAction: item.onAction ?? item.command,
            },
      ),
    )
  }

  buildSearchField(field: UiSearchField, _context: UiContext, props: UiProps) {

    const meta = field.field

    const common = {

      value: field.searchVal.value,

      placeholder: meta.displayLabel,

      size: 'small' as const,

      'onUpdate:value': (value: any) => {

        field.searchVal.value = value

      },

      ...props,

    }

    let editor: VNode

    if (meta.reference?.refOptions?.length) {

      editor = h(NSelect, {

        ...common,

        options: meta.reference.refOptions.map((option: any) => ({

          label: meta.reference!.labelOf(option),

          value: meta.reference!.valueOf(option),

        })),

        clearable: true,

      })

    } else if (SqlDataType.isBool(meta.dataType)) {

      editor = h(NSelect, {

        ...common,

        options: [

          { label: 'Yes', value: true },

          { label: 'No', value: false },

        ] as any,

        clearable: true,

      })

    } else if (SqlDataType.isDate(meta.dataType) && field.currentOp === 'WITHIN') {

      editor = h(NSelect, {

        ...common,

        options: DATE_RANGE_FILTER_KINDS.map((kind) => ({

          label: _context.translate(`dateRange.${kind}`),

          value: kind,

        })),

        clearable: true,

      })

    } else if (SqlDataType.isDate(meta.dataType)) {

      editor = h(NDatePicker, { ...common, type: 'date' })

    } else if (SqlDataType.isNum(meta.dataType)) {

      editor = h(NInputNumber, common)

    } else {

      editor = h(NInput, common)

    }

    return h('label', { class: 'mmda-search-field' }, [

      h('span', meta.displayLabel),

      editor,

    ])

  }



  buildModuleSearchbar(context: UiContext, rawProps?: UiProps) {
    // 契约型 `UiProps` → 具体形状在实现内收敛（同 `buildFilterBar` 的写法）
    const props = (rawProps ?? {}) as ModuleSearchbarProps;

    const runtime = context as any

    const searchLabel = context.translate('action.search')

    const refreshLabel = context.translate('action.refresh')

    const filters = runtime.filters ?? []

    const submitFuzzySearch = () => {

      const word = String(runtime.searchParam?.searchWord ?? '').trim()

      runtime.searchParam.searchWord = word

      runtime.searchParam.pager.pageNo = 1

      if (!word) {

        void runtime.resetFilters?.()

        return

      }

      props.onSearch?.(word)

    }

    const refreshSearch = () => {

      if (props.onRefresh) {

        props.onRefresh()

        return

      }

      void runtime.search?.()

    }

    const addonButton = (icon: string, title: string, onClick: () => void) =>

      h(

        'button',

        {

          type: 'button',

          class: 'mmda-searchbar__addon',

          title,

          'aria-label': title,

          onClick: (event: Event) => {

            event.preventDefault()

            event.stopPropagation()

            onClick()

          },

        },

        [createIconVNode(icon)],

      )

    const quickFilters = filters.map((filter: any) =>

      h('div', { class: 'mmda-quick-filter' }, [

        h('span', { class: 'mmda-quick-filter__label' }, filter.label),

        h(NSelect, {

          value: filter.metaUiFilter.fixed

            ? filter.selectedConditions.value[0]

            : filter.selectedConditions.value,

          options: filter.selectOptions,

          labelField: 'displayLabel',

          valueField: 'value',

          multiple: !filter.metaUiFilter.fixed,

          clearable: true,

          'onUpdate:value': (condition: any) => {

            if (filter.metaUiFilter.fixed) {

              if (condition) runtime.toggleQuickFilter(filter, condition, true)

              else filter.selectedConditions.value = []

            } else {

              filter.selectedConditions.value = condition

              runtime.syncQuickFilters?.()

            }

            runtime.searchParam.pager.pageNo = 1

            void runtime.search?.()

          },

        }),

      ]),

    )

    return h(

      'form',

      {

        class: 'mmda-searchbar',

        onSubmit: (event: Event) => {

          event.preventDefault()

          submitFuzzySearch()

        },

      },

      [

        ...quickFilters,

        ...(runtime.searchFields ?? []).map((field: UiSearchField) =>

          this.buildSearchField(field, context, {}),

        ),

        ...(runtime.customSearchFields ?? []).map((field: any) =>

          field.renderer(context, field),

        ),

        h(ListSearchField, {

          context: runtime,

          onFuzzySearch: submitFuzzySearch,

        }, {

          default: () => h('span', { class: 'mmda-searchbar__addons' }, [

            addonButton(

              this.factory.resolveIcon('search'),

              searchLabel,

              submitFuzzySearch,

            ),

            addonButton(

              this.factory.resolveIcon('refresh'),

              refreshLabel,

              refreshSearch,

            ),

          ]),

        }),

        (filters.length > 0 || runtime.searchFields?.length > 0) &&

          h(

            NButton,

            {

              attrType: 'button',

              size: 'small',

              text: true,

              onClick: () => void runtime.resetFilters?.(),

            },

            { default: () => context.translate('action.reset') },

          ),

      ],

    )

  }



  buildBpmnDiagram(flowTrails: any[], _context: UiContext, props: UiProps = {}) {

    return h('section', { class: 'mmda-flow', ...props }, [

      props.xml

        ? h(BpmnModeler, {

            xml: props.xml,

            readonly: props.readonly ?? true,

            height: props.height,

            'onUpdate:xml': props.onUpdateXml,

          })

        : undefined,

      flowTrails?.length

        ? h(

            'ol',

            { class: 'mmda-flow__trails' },

            flowTrails.map(item =>

              h('li', { key: item.id ?? item.name }, item.label ?? item.name ?? String(item)),

            ),

          )

        : undefined,

    ])

  }



  buildSigninForm(props: SigninFormProps, slots?: SigninFormSlots) {

    return h(SigninForm, props, slots)

  }



  buildSignupForm(props: SignupFormProps) {

    const user = reactive({

      mobile: '',

      password: '',

      vcode: '',

      agreed: true,

    })

    return h(

      'form',

      {

        class: 'mmda-auth-form',

        onSubmit: (event: Event) => {

          event.preventDefault()

          props.onSignup?.(user)

        },

      },

      [

        h(NInput, {

          placeholder: 'Mobile',

          value: user.mobile,

          'onUpdate:value': (value: string) => (user.mobile = value),

        }),

        h(NInput, {

          type: 'password',

          placeholder: 'Password',

          value: user.password,

          'onUpdate:value': (value: string) => (user.password = value),

        }),

        h(NInput, {

          placeholder: 'Verification code',

          value: user.vcode,

          'onUpdate:value': (value: string) => (user.vcode = value),

        }),

        h(NButton, { attrType: 'submit', type: 'primary' }, { default: () => 'Sign up' }),

      ],

    )

  }

}

