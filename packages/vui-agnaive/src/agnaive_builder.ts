import {
  h,
  reactive,
  unref,
  type VNode,
  type VNodeArrayChildren,
} from 'vue'
import { RouterLink } from 'vue-router'
import {
  SqlDataType,
  pluralize,
  type MetaUiField,
  type MetaUiGroup,
  type Module,
  type ModuleAction,
  type ModuleAuth,
} from '@mmda/core'
import {
  AbstractUiBuilder,
  AppSideMenu,
  MmdaGroupCard,
  UiViewMany,
  assembleMenuItems,
  type AppSideBarProps,
  type AppTopBarProps,
  type ImportAndExportActionProps,
  type ModuleBreadcrumbProps,
  type ModuleSearchbarProps,
  type ModuleToolbarProps,
  type PropData,
  type SearchForRelativeProps,
  type SigninFormProps,
  type SigninFormSlots,
  type SignupFormProps,
  type UiAction,
  type UiFactory,
  type UiFieldFactory,
  type UiSearchField,
  type UiSlots,
  type UiViewContext,
} from '@mmda/vui'
import {
  NAlert,
  NButton,
  NDatePicker,
  NInput,
  NInputNumber,
  NSelect,
  NSpin,
} from 'naive-ui'
import { AgNaiveOverlayHost } from './components/AgNaiveOverlayHost'
import { BpmnModeler } from './components/BpmnModeler'
import { CodeImage } from './components/CodeImage'
import { SigninForm } from './components/SigninForm'
import { createAgNaiveOverlay } from './agnaive_overlay'
import { createAgNaiveFieldFactory } from './agnaive_field_factory'
import { createAgNaiveUiFactory } from './agnaive_factory'
import { agNaiveLayout } from './agnaive_layout'
import { wrapNaiveConfig } from './agnaive_provider'
import { naiveSkinState, refreshNaiveThemeFromCss } from './agnaive_theme'

const UI_NAME = 'mmda'

const invoke = (value: unknown): any =>
  typeof value === 'function' ? (value as () => unknown)() : value

const moduleChain = (module: Module): Module[] => {
  const chain: Module[] = [module]
  let parent = (module as Module & { parent?: Module }).parent
  while (parent) {
    chain.unshift(parent)
    parent = (parent as Module & { parent?: Module }).parent
  }
  const withoutSystem = chain.filter(item => item.moduleType !== 'SYSTEM')
  return withoutSystem.length ? withoutSystem : chain
}

type UiContext = UiViewContext<any>

const moduleOf = (context: UiContext): Module | undefined => {
  const runtime = context as any
  return (runtime.module ?? runtime.logic?.module) as Module | undefined
}

const moduleAuth = (context: UiContext): ModuleAuth | undefined =>
  moduleOf(context)?.authority

const visibleActions = (actions: UiAction[]) =>
  actions.filter(action => action.visible == null || unref(action.visible))

export class AgNaiveUiBuilder extends AbstractUiBuilder {
  declare readonly factory: UiFactory

  constructor(
    factory = createAgNaiveUiFactory(),
    fieldFactory: UiFieldFactory = createAgNaiveFieldFactory(),
  ) {
    super(
      factory,
      fieldFactory,
      factory.layout ?? agNaiveLayout,
      createAgNaiveOverlay(),
    )
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

  override buildGroupCard(
    group: MetaUiGroup,
    body: VNode | VNode[],
    props: PropData = {},
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
      MmdaGroupCard,
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

  buildContainer(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h('div', { class: 'mmda-agnaive-container', ...props }, content)
  }

  buildHeader(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h('header', { class: 'mmda-agnaive-header', ...props }, content)
  }

  buildAside(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h('aside', { class: 'mmda-agnaive-aside', ...props }, content)
  }

  buildMain(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h('main', { class: 'mmda-agnaive-main', ...props }, content)
  }

  buildFooter(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h('footer', { class: 'mmda-agnaive-footer', ...props }, content)
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
    return h('div', { class: 'mmda-agnaive-topbar' }, [
      invoke(props.logo),
      this.factory.menubar(items),
      h('div', { class: 'mmda-agnaive-topbar__actions' }, invoke(props.actions)),
    ])
  }

  buildAppSideBar(
    props: AppSideBarProps = { modules: [], header: () => null },
  ) {
    return h('aside', { class: 'mmda-agnaive-sidebar' }, [
      h('div', { class: 'mmda-agnaive-sidebar__header' }, invoke(props.header)),
      h('div', { class: 'mmda-agnaive-sidebar__body' }, [
        h(AppSideMenu, { modules: props.modules }),
      ]),
      h('div', { class: 'mmda-agnaive-sidebar__footer' }, invoke(props.footer)),
    ])
  }

  buildAppMenu(modules: Module[], props?: PropData) {
    const { item, expand, ...rest } = props ?? {}
    if (expand === false) {
      return this.factory.menubar(assembleMenuItems(modules), {
        class: 'mmda-agnaive-app-menu',
        ...rest,
      }, item ? { item } : undefined)
    }
    return h(AppSideMenu, {
      modules,
      class: 'mmda-agnaive-app-menu',
      ...rest,
    })
  }

  buildLoading(_context: UiContext, props?: PropData) {
    return h('div', { class: 'mmda-agnaive-loading', ...props }, [h(NSpin)])
  }

  buildError(context: UiContext, props?: PropData) {
    return h(
      NAlert,
      { type: 'error', class: 'mmda-agnaive-error', ...props },
      { default: () => context.title },
    )
  }

  buildModuleBreadcrumb(context: UiContext, props: ModuleBreadcrumbProps) {
    const { module, label } = props
    if (!module) {
      return h('span', { class: 'mmda-agnaive-breadcrumb' }, label || context.title)
    }
    const model = moduleChain(module).map((item, index, items) => ({
      key: item.moduleCode,
      label: item.moduleLabel ?? (item as any).moduleName,
      icon: item.moduleIcon ?? '',
      route: item.moduleUrl ?? '',
      leaf: index === items.length - 1 && !label,
    }))
    if (label) {
      model.push({
        key: `${module.moduleCode}-title`,
        label,
        icon: '',
        route: '',
        leaf: true,
      })
    }
    return h(
      'nav',
      { class: 'mmda-agnaive-breadcrumb' },
      model.map((item, index) =>
        h('span', { key: item.key, class: 'mmda-breadcrumb__item' }, [
          index > 0 ? h('span', { class: 'mmda-breadcrumb__sep' }, '/') : null,
          item.leaf || !item.route
            ? h('span', item.label)
            : h(RouterLink, { to: item.route!, class: 'mmda-breadcrumb__link' }, () => item.label),
        ]),
      ),
    )
  }

  buildImportOrExportAction(
    context: UiContext,
    props: ImportAndExportActionProps,
  ): VNode {
    const runtime = context as any
    const repository = runtime.isRoot
      ? runtime.logic.repository
      : pluralize(context.metaui.objName)
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

  private importOrExportMenuItem(context: UiContext, role: 'import' | 'export') {
    const runtime = context as any
    const repository = runtime.isRoot
      ? runtime.logic.repository
      : pluralize(context.metaui.objName)
    const action =
      role === 'import'
        ? this.actionFactory.import(context, { repository })
        : this.actionFactory.export(context, { repository })
    const icon = this.factory.resolveIcon(action.icon ?? role)
    const templates = runtime.templates ?? []
    if (!templates.length) {
      return { label: action.label, icon, name: action.name, command: action.onAction }
    }
    return {
      label: action.label,
      icon,
      name: action.name,
      items: [
        { label: action.label, icon, command: action.onAction },
        ...templates.map((template: any) => ({
          label: template.templateName,
          icon: 'fas fa-file',
          command: () => {
            runtime.currentTemplate = template
            if (role === 'import') {
              void (runtime.many
                ? runtime.importFiles?.({ repository })
                : runtime.importFile?.({ repository }))
            } else {
              void (runtime.many
                ? runtime.exportFiles?.({ repository })
                : runtime.exportFile?.({ repository }))
            }
          },
        })),
      ],
    }
  }

  private assembleMoreButton(context: UiContext, items: any[]): VNode[] {
    return this.moreMenuButton(context, items)
  }

  private assembleMultipleSelectionButtons(
    context: UiContext,
    actions: UiAction[],
  ): VNode[] {
    if (!actions.length) return []
    const render = (action: UiAction) =>
      this.toolbarActionButton(
        context,
        {
          ...action,
          onAction: () => {
            if (action.onAction) action.onAction()
            else (context as any).doAction?.(action, context.model)
          },
        },
        { id: `${action.name}-button` },
      )
    if (actions.length === 1) return [render(actions[0]!)]
    return [
      this.dropdownMenuButton(
        {
          label: context.t('action.batchOperation'),
          class: 'mmda-batch-menu-button',
        },
        actions.map(action => ({
          name: action.name,
          label: action.label,
          icon: action.icon,
          onAction: () => {
            if (action.onAction) action.onAction()
            else (context as any).doAction?.(action, context.model)
          },
        })),
      ),
    ]
  }

  private toolbarActionButton(
    context: UiContext,
    action: UiAction,
    props?: PropData,
  ) {
    return this.factory.actionButton(action, message => context.t(message), false, {
      size: 'small',
      ...props,
    })
  }

  private indexViewActionButtons(context: UiContext): VNode[] {
    const runtime = context as any
    const { globalProps, selectionMode, customActions, view } = runtime
    const { $t } = globalProps ?? { $t: (m: string) => context.t(m) }
    const auth = moduleAuth(context)
    const children: VNode[] = []
    const moreItems: any[] = []
    const inBatchMode =
      view === UiViewMany.SelectMany ||
      view === UiViewMany.EditMany ||
      selectionMode === 'multiple'

    if (inBatchMode) {
      children.push(
        this.toolbarActionButton(context, this.actionFactory.cancel(context)),
        this.toolbarActionButton(context, this.actionFactory.confirm(context)),
      )
      return children
    }
    if (!auth) return children
    if (auth.allowImport) moreItems.push(this.importOrExportMenuItem(context, 'import'))
    if (auth.allowExport) moreItems.push(this.importOrExportMenuItem(context, 'export'))
    if (auth.allowCreate) {
      children.push(this.toolbarActionButton(context, this.actionFactory.create(context)))
    }
    if (auth.allowPrint) {
      const action = this.actionFactory.print(context)
      moreItems.push({
        label: action.label,
        icon: this.factory.resolveIcon(action.icon ?? 'print'),
        command: action.onAction,
      })
    }
    const listActions: UiAction[] = []
    const multipleSelectActions: UiAction[] = []
    if (auth.authorizedActions?.length) {
      multipleSelectActions.push(
        ...auth.authorizedActions
          .filter(
            (action: ModuleAction) =>
              action.actionModes === 4 &&
              action.promptType === 'MULTIPLE_SELECT',
          )
          .map(
            (action: ModuleAction) =>
              ({
                id: `${action.actionName}-button`,
                name: action.actionName,
                role: `${UI_NAME}-${action.actionName}-action`,
                icon: action.displayIcon,
                label: action.displayLabel,
              }) as UiAction,
          ),
      )
      listActions.push(
        ...auth.authorizedActions
          .filter(
            (action: ModuleAction) =>
              action.actionModes === 4 &&
              action.promptType !== 'MULTIPLE_SELECT',
          )
          .map((action: ModuleAction) =>
            this.actionFactory.action(context, {
              id: `${action.actionName}-button`,
              name: action.actionName,
              icon: action.displayIcon,
              label: action.displayLabel,
              role: action.displayHint,
            }),
          ),
      )
    }
    if (auth.allowDelete) {
      multipleSelectActions.unshift({
        id: 'delete-all-button',
        name: 'deleteAll',
        role: `${UI_NAME}-delete-all-action`,
        label: $t('action.deleteAll'),
        icon: 'fas fa-trash-alt',
        colorRole: 'danger',
        onAction: () => this.actionFactory.deleteAll(context).onAction?.(),
      })
    }
    children.push(...this.assembleMultipleSelectionButtons(context, multipleSelectActions))
    if (
      customActions?.length &&
      (view === UiViewMany.SelectMany || selectionMode !== 'multiple')
    ) {
      listActions.push(
        ...customActions
          .filter((action: UiAction) =>
            auth.authorizedActions?.some(
              (item: ModuleAction) => item.actionName === action.name,
            ),
          )
          .map((action: UiAction) =>
            this.actionFactory.action(context, {
              ...action,
              name: action.name ?? '',
            } as any),
          ),
      )
    }
    moreItems.push(
      ...visibleActions(listActions).map(action => ({
        label: action.label,
        icon: this.factory.resolveIcon(action.icon ?? action.name ?? ''),
        disabled: action.disabled,
        command: action.onAction,
      })),
    )
    children.push(...this.assembleMoreButton(context, moreItems))
    return children
  }

  private detailsViewActionButtons(context: UiContext): VNode[] {
    const runtime = context as any
    const { model, customActions } = runtime
    const auth = moduleAuth(context)
    const entityAuth = runtime.getModuleAuth?.(model) ?? auth
    const children: VNode[] = [
      this.toolbarActionButton(context, this.actionFactory.back(context)),
    ]
    const moreItems: any[] = []
    if (!entityAuth) return children
    if (entityAuth.allowEdit && model?.editable !== false) {
      children.push(this.toolbarActionButton(context, this.actionFactory.edit(context)))
    }
    if (entityAuth.allowCreate) {
      children.push(this.toolbarActionButton(context, this.actionFactory.create(context)))
    }
    if (entityAuth.allowDelete && model?.deletable !== false) {
      children.push(this.toolbarActionButton(context, this.actionFactory.delete(context)))
    }
    if (model?.actions?.length) {
      children.push(
        ...model.actions.map((action: any) =>
          this.toolbarActionButton(context, this.actionFactory.action(context, action), {
            id: `${action.name ?? action.actionName}-button`,
          }),
        ),
      )
    }
    if (customActions?.length) {
      children.push(
        ...customActions
          .filter((action: UiAction) =>
            entityAuth.authorizedActions?.some(
              (item: ModuleAction) => item.actionName === action.name,
            ),
          )
          .map((action: UiAction) =>
            this.toolbarActionButton(
              context,
              this.actionFactory.action(context, {
                ...action,
                name: action.name ?? '',
              } as any),
              {
              id: `${action.name}-button`,
            },
            ),
          ),
      )
    }
    if (entityAuth.allowPrint) {
      const action = this.actionFactory.print(context)
      moreItems.push({
        label: action.label,
        icon: this.factory.resolveIcon(action.icon ?? 'print'),
        command: action.onAction,
      })
    }
    if (entityAuth.allowExport) moreItems.push(this.importOrExportMenuItem(context, 'export'))
    if (entityAuth.allowImport) moreItems.push(this.importOrExportMenuItem(context, 'import'))
    children.push(...this.assembleMoreButton(context, moreItems))
    return children
  }

  private editViewActionButtons(context: UiContext): VNode[] {
    const runtime = context as any
    const { customActions } = runtime
    const auth = moduleAuth(context)
    const children: VNode[] = [
      this.toolbarActionButton(context, this.actionFactory.back(context)),
    ]
    if (auth?.allowImport) {
      children.push(this.buildImportOrExportAction(context, { role: 'import' }))
    }
    children.push(
      this.toolbarActionButton(context, {
        ...this.actionFactory.save(context),
        disabled: runtime.uploading?.value,
      }),
    )
    if (customActions?.length && auth?.authorizedActions?.length) {
      children.push(
        ...customActions
          .filter((action: UiAction) =>
            auth.authorizedActions!.some(
              (item: ModuleAction) => item.actionName === action.name,
            ),
          )
          .map((action: UiAction) =>
            this.toolbarActionButton(
              context,
              this.actionFactory.action(context, {
                ...action,
                name: action.name ?? '',
              } as any),
              {
              id: `${action.name}-button`,
            },
            ),
          ),
      )
    }
    return children
  }

  private toolbarActionButtons(context: UiContext): VNode[] {
    const runtime = context as any
    if (runtime.many) return this.indexViewActionButtons(context)
    if (runtime.editing) return this.editViewActionButtons(context)
    return this.detailsViewActionButtons(context)
  }

  buildModuleToolbar(
    context: UiContext,
    props: ModuleToolbarProps,
    slots?: UiSlots,
  ) {
    const runtime = context as any
    const module = moduleOf(context)
    const hasCenter = !!slots?.center
    return h('div', { class: 'mmda-agnaive-toolbar' }, [
      h('div', { class: 'mmda-agnaive-toolbar__start' }, [
        props.showBreadcrumb === false
          ? undefined
          : slots?.default
            ? slots.default()
            : module
              ? this.buildModuleBreadcrumb(context, {
                  module,
                  label: props.breadcrumbLeaf || (runtime.many ? '' : context.title),
                })
              : h('strong', context.title),
      ]),
      hasCenter
        ? h('div', { class: 'mmda-agnaive-toolbar-center' }, slots!.center!())
        : undefined,
      props.showActions === false
        ? undefined
        : this.factory.buttonGroup(() => this.toolbarActionButtons(context), {
            class: 'mmda-agnaive-toolbar-actions',
            role: `${UI_NAME}-toolbar-action-group`,
          }),
    ])
  }

  buildSearchField(field: UiSearchField, _context: UiContext, props: PropData) {
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
    } else if (SqlDataType.isDate(meta.dataType)) {
      editor = h(NDatePicker, { ...common, type: 'date' })
    } else if (SqlDataType.isNum(meta.dataType)) {
      editor = h(NInputNumber, common)
    } else {
      editor = h(NInput, common)
    }
    return h('label', { class: 'mmda-agnaive-search-field' }, [
      h('span', meta.displayLabel),
      editor,
    ])
  }

  buildSearchForm(context: UiContext, props?: PropData) {
    return h(
      'form',
      {
        class: 'mmda-agnaive-search-form',
        ...props,
        onSubmit: (event: Event) => event.preventDefault(),
      },
      ((context as any).searchFields ?? []).map((field: UiSearchField) =>
        this.buildSearchField(field, context, {}),
      ),
    )
  }

  buildModuleSearchbar(context: UiContext, props: ModuleSearchbarProps) {
    const runtime = context as any
    const filters = runtime.filters ?? []
    const quickFilters = filters.map((filter: any) =>
      h('div', { class: 'mmda-agnaive-quick-filter' }, [
        h('span', { class: 'mmda-agnaive-quick-filter__label' }, filter.label),
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
        class: 'mmda-agnaive-searchbar',
        onSubmit: (event: Event) => {
          event.preventDefault()
          props.onSearch?.(runtime.searchParam?.searchWord ?? '')
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
        h(NInput, {
          value: runtime.searchParam?.searchWord ?? '',
          placeholder: context.translate('action.search'),
          size: 'small',
          'onUpdate:value': (value: string) => {
            runtime.searchParam.searchWord = value
          },
        }),
        h(
          NButton,
          { attrType: 'submit', size: 'small', type: 'primary' },
          { default: () => context.translate('action.search') },
        ),
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

  buildSearchForRelative(
    context: UiContext,
    field: MetaUiField,
    props: SearchForRelativeProps,
  ) {
    const reference = field.reference
    const options = ((props.options as any[]) ?? []).map(option => ({
      label:
        typeof props.optionLabel === 'function'
          ? props.optionLabel(option)
          : reference
            ? reference.labelOf(option)
            : String(option),
      value: reference ? reference.valueOf(option) : option,
    }))
    const openPick = async (event?: Event) => {
      event?.preventDefault()
      event?.stopPropagation()
      try {
        if (typeof props.toSearch === 'function') {
          await props.toSearch(event as Event)
          return
        }
        await (context as any).pickRelative?.(field)
      } catch (error) {
        console.error(error)
      }
    }
    return h(NSelect, {
      options,
      value: props.modelValue,
      filterable: true,
      clearable: props.showClear !== false && field.nullable,
      placeholder: props.placeholder ?? context.translate?.('action.select') ?? '请选择',
      status: props.invalid ? 'error' : undefined,
      class: 'mmda-agnaive-search-combo',
      'onUpdate:value': (value: any) => props.onChange?.(value),
      onSearch: (text: string) => {
        props.onInput?.(text)
        void (context as any).searchRelative?.(field, text)
      },
    })
  }

  buildBpmnDiagram(flowTrails: any[], _context: UiContext, props: PropData = {}) {
    return h('section', { class: 'mmda-agnaive-flow', ...props }, [
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
            { class: 'mmda-agnaive-flow__trails' },
            flowTrails.map(item =>
              h('li', { key: item.id ?? item.name }, item.label ?? item.name ?? String(item)),
            ),
          )
        : undefined,
    ])
  }

  buildQrcode(value: string, props: PropData = {}) {
    return h(CodeImage, { value, type: 'qr', ...props })
  }

  buildBarcode(value: string, props: PropData = {}) {
    return h(CodeImage, { value, type: 'barcode', ...props })
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
        class: 'mmda-agnaive-auth-form',
        onSubmit: (event: Event) => {
          event.preventDefault()
          props.onSubmit?.(user)
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
