import {
  h,
  reactive,
  ref,
  unref,
  watch,
  type VNode,
  type VNodeArrayChildren,
} from "vue";
import {
  debounce,
  pluralize,
  type MetaUiField,
  type MetaUiGroup,
  type Module,
  type ModuleAction,
  type ModuleAuth,
} from "@mmda/core";
import {
  AbstractUiBuilder,
  MmdaGroupCard,
  UiViewMany,
  hasSystemModules,
  type AppScaffoldProps,
  type AppSideBarProps,
  type AppTopBarProps,
  type ImportAndExportActionProps,
  type ModuleBreadcrumbProps,
  type ModuleSearchbarProps,
  type ModuleToolbarProps,
  type SyncfusionUiFactory,
  type PropData,
  type SearchForRelativeProps,
  type SigninFormProps,
  type SigninFormSlots,
  type SignupFormProps,
  type UiAction,
  type UiFieldFactory,
  type UiSearchField,
  type UiSlots,
  type UiViewContext,
  type UiGanttChartProps,
  type UiGanttViewProps,
} from "@mmda/vui";
import { ComboBoxComponent } from "@syncfusion/ej2-vue-dropdowns";
import { SfOverlayHost } from "../components/SfOverlayHost";
import { createSyncfusionOverlay } from "../syncfusion_overlay";
import { SfAttachmentPanel } from "../components/SfAttachmentPanel";
import { createSyncfusionFieldFactory } from "../syncfusion_field_factory";
import { createSyncfusionUiFactory, autoFitSyncfusionListGrid } from "../syncfusion_factory";
import { syncfusionLayout } from "../syncfusion_layout";

import {
  UI_NAME,
  invoke,
  moduleAuth,
  visibleActions,
  type UiContext,
} from "./utils";
import { buildImportOrExportAction as renderImportOrExportAction } from "./import-export";
import {
  buildModuleBreadcrumb as renderModuleBreadcrumb,
  buildModuleSearchbar as renderModuleSearchbar,
  buildModuleToolbar as renderModuleToolbar,
  buildSearchField as renderSearchField,
  buildSearchForm as renderSearchForm,
} from "./module-bar";
import {
  buildGanttView as renderGanttView,
  buildBpmnDiagram as renderBpmnDiagram,
  buildQrcode as renderQrcode,
  buildBarcode as renderBarcode,
  buildSigninForm as renderSigninForm,
  buildSignupForm as renderSignupForm,
} from "./features";
import {
  applyColorScheme,
  renderAppMenu,
  renderAside,
  renderContainer,
  renderError,
  renderFooter,
  renderHeader,
  renderLoading,
  renderMain,
} from "./shell";

export class SyncfusionUiBuilder extends AbstractUiBuilder {
  declare readonly factory: SyncfusionUiFactory;

  constructor(
    factory = createSyncfusionUiFactory(),
    fieldFactory: UiFieldFactory = createSyncfusionFieldFactory(),
  ) {
    super(
      factory,
      fieldFactory,
      factory.layout ?? syncfusionLayout,
      createSyncfusionOverlay(),
    );
  }

  get overlayHost() {
    return SfOverlayHost;
  }

  override setColorScheme(dark: boolean) {
    super.setColorScheme(dark);
    applyColorScheme(dark);
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
    } = props;
    return h(
      MmdaGroupCard,
      {
        tag: "div",
        title: group.groupLabel,
        expanded: group.expanded !== false,
        class: [this.groupWrapClass(group, props), "e-card"],
        headerClass: "e-card-header",
        toggleIcon: "e-icons e-chevron-down",
        ...rest,
      },
      {
        header: ({ title }: { title: string }) =>
          h("div", { class: "e-card-header-caption" }, [
            h("div", { class: "e-card-header-title mmda-group-title" }, title),
          ]),
        // Card 只做壳；字段/表格布局由 .mmda-group__content 管
        default: () => this.wrapGroupContent(body),
        actions: headerActions ? () => headerActions : undefined,
      },
    );
  }

  override buildAttachmentGroup(
    context: UiViewContext<any>,
    props: PropData = {},
  ): VNode {
    const panel = ref<{ choose: () => void }>();
    const title = context.translate("attachments") || "附件";
    return this.wrapGroup(
      {
        groupLabel: title,
        many: false,
        expanded: true,
        isSecondary: () => true,
        isTails: () => false,
      } as MetaUiGroup,
      h(SfAttachmentPanel, {
        ref: panel,
        context: context as any,
      }),
      {
        region: "secondary",
        class: "mmda-attachments",
        ...props,
        headerActions: this.factory.button({
          id: "attachment-upload-button",
          icon: this.factory.resolveIcon("fas fa-paperclip"),
          label: "",
          tooltip:
            context.translate("action.uploadAttachment") || "上传附件",
          "aria-label":
            context.translate("action.uploadAttachment") || "上传附件",
          buttonType: "text",
          shape: "round",
          class: "mmda-group-action",
          onClick: () => panel.value?.choose(),
        }),
      },
    );
  }

  buildContainer(content: VNode | VNodeArrayChildren, props?: PropData) {
    return renderContainer(content, props);
  }

  buildHeader(content: VNode | VNodeArrayChildren, props?: PropData) {
    return renderHeader(content, props);
  }

  buildAside(content: VNode | VNodeArrayChildren, props?: PropData) {
    return renderAside(content, props);
  }

  buildMain(content: VNode | VNodeArrayChildren, props?: PropData) {
    return renderMain(content, props);
  }

  buildFooter(content: VNode | VNodeArrayChildren, props?: PropData) {
    return renderFooter(content, props);
  }

  buildAppTopBar(props: AppTopBarProps = { modules: [], logo: () => null }) {
    const items = props.modules.map((module) => ({
      label: module.moduleName ?? module.moduleLabel,
      url: module.moduleUrl ?? (module as any).url,
    }));
    return h("div", { class: "mmda-sf-topbar" }, [
      h("div", { class: "mmda-sf-topbar__start" }, [
        invoke(props.logo),
        this.factory.menubar(items),
      ]),
      h("div", { class: "mmda-sf-topbar__end" }, invoke(props.actions)),
    ]);
  }

  /**
   * Official Sidebar layout: sidebar and main content are siblings under a
   * target shell (not a CSS-grid nav column). See Target + Dock docs.
   *   .mmda-sf-shell
   *     #mmda-sf-dock-sidebar
   *     .mmda-sf-maincontent
   */
  override buildAppScaffold(props: AppScaffoldProps = {}) {
    const variant =
      props.layout ?? (props.model === "Mobile" ? "topBarFull" : "sidebarLeft");
    if (variant !== "sidebarLeft") {
      return super.buildAppScaffold(props);
    }
    return h("div", { id: "mmda-sf-shell", class: "mmda-sf-shell" }, [
      invoke(props.sideBar),
      h(
        "div",
        { class: "mmda-sf-maincontent", role: "main" },
        [invoke(props.body)],
      ),
    ]);
  }

  buildAppSideBar(
    props: AppSideBarProps = { modules: [], header: () => null },
  ) {
    const systems = hasSystemModules(props.modules);
    // Systems: SfAppMenu owns EJ2 Sidebar enableDock (+ logo/footer).
    if (systems) {
      return this.buildAppMenu(props.modules, {
        logo: props.header,
        footer: props.footer,
      });
    }
    return h("aside", { class: "mmda-sf-sidebar" }, [
      h("div", { class: "mmda-sf-sidebar__header" }, invoke(props.header)),
      h("div", { class: "mmda-sf-sidebar__body" }, [
        this.buildAppMenu(props.modules),
      ]),
      h("div", { class: "mmda-sf-sidebar__footer" }, invoke(props.footer)),
    ]);
  }

  buildAppMenu(modules: Module[], props?: PropData) {
    return renderAppMenu(modules, props);
  }

  buildLoading(_context: UiContext, props?: PropData) {
    return renderLoading(props);
  }

  buildError(context: UiContext, props?: PropData) {
    return renderError(context, props);
  }

  buildModuleBreadcrumb(context: UiContext, props: ModuleBreadcrumbProps) {
    return renderModuleBreadcrumb.call(this, context, props);
  }

  buildImportOrExportAction(
    context: UiContext,
    props: ImportAndExportActionProps,
  ): VNode {
    return renderImportOrExportAction.call(this as any, context, props);
  }

  private importOrExportMenuItem(
    context: UiContext,
    role: "import" | "export",
  ) {
    const runtime = context as any;
    const repository = runtime.isRoot
      ? runtime.logic.repository
      : pluralize(context.metaui.objName);
    const action =
      role === "import"
        ? this.actionFactory.import(context, { repository })
        : this.actionFactory.export(context, { repository });
    const icon = this.factory.resolveIcon(action.icon ?? role);
    const templates = runtime.templates ?? [];

    if (!templates.length) {
      return {
        label: action.label,
        icon,
        command: action.onAction,
      };
    }

    return {
      label: action.label,
      icon,
      items: [
        {
          label: action.label,
          icon,
          command: action.onAction,
        },
        ...templates.map((template: any) => ({
          label: template.templateName,
          icon: this.factory.resolveIcon("file"),
          command: () => {
            runtime.currentTemplate = template;
            if (role === "import") {
              void (runtime.many
                ? runtime.importFiles?.({ repository })
                : runtime.importFile?.({ repository }));
            } else {
              void (runtime.many
                ? runtime.exportFiles?.({ repository })
                : runtime.exportFile?.({ repository }));
            }
          },
        })),
      ],
    };
  }

  private assembleMoreButton(context: UiContext, items: any[]): VNode[] {
    return this.moreMenuButton(context, items);
  }

  private assembleMultipleSelectionButtons(
    context: UiContext,
    actions: UiAction[],
  ): VNode[] {
    if (!actions.length) return [];
    const render = (action: UiAction) =>
      this.toolbarActionButton(
        context,
        {
          ...action,
          onAction: () => {
            if (action.onAction) action.onAction();
            else (context as any).doAction?.(action, context.model);
          },
        },
        { id: `${action.name}-button` },
      );

    if (actions.length === 1) return [render(actions[0]!)];

    return [
      this.dropdownMenuButton(
        {
          label: context.t("action.batchOperation"),
          class: "mmda-batch-menu-button",
        },
        actions.map((action) => ({
          name: action.name,
          label: action.label,
          icon: action.icon,
          onAction: () => {
            if (action.onAction) action.onAction();
            else (context as any).doAction?.(action, context.model);
          },
        })),
      ),
    ];
  }

  private toolbarActionButton(
    context: UiContext,
    action: UiAction,
    props?: PropData,
  ) {
    return this.factory.actionButton(
      action,
      (message) => context.t(message),
      false,
      { size: "small", ...props },
    );
  }

  private listLayoutMenuItems(context: UiContext) {
    return [
      {
        name: "autoFitColumns",
        label: context.t("action.autoFitColumns"),
        icon: this.factory.resolveIcon("auto-fit-columns"),
        command: () => void autoFitSyncfusionListGrid(context),
      },
      {
        name: "listSettings",
        label: context.t("action.listSettings"),
        icon: this.factory.resolveIcon("settings"),
        command: () => void this.openListSettings(context),
      },
    ];
  }

  private indexViewActionButtons(context: UiContext): VNode[] {
    const runtime = context as any;
    const { globalProps, selectionMode, customActions, view } = runtime;
    const { $t } = globalProps ?? { $t: (m: string) => context.t(m) };
    const auth = moduleAuth(context);
    const children: VNode[] = [];
    const moreItems: any[] = [];

    const inBatchMode =
      view === UiViewMany.SelectMany ||
      view === UiViewMany.EditMany ||
      selectionMode === "multiple";

    if (inBatchMode) {
      children.push(
        this.toolbarActionButton(context, this.actionFactory.cancel(context)),
        this.toolbarActionButton(context, this.actionFactory.confirm(context)),
      );
      return children;
    }

    if (!auth) {
      children.push(
        ...this.assembleMoreButton(context, this.listLayoutMenuItems(context)),
      );
      return children;
    }

    if (auth.allowImport) {
      moreItems.push(this.importOrExportMenuItem(context, "import"));
    }
    if (auth.allowExport) {
      moreItems.push(this.importOrExportMenuItem(context, "export"));
    }
    if (auth.allowCreate) {
      children.push(
        this.toolbarActionButton(context, this.actionFactory.create(context)),
      );
    }
    if (auth.allowPrint) {
      const action = this.actionFactory.print(context);
      moreItems.push({
        label: action.label,
        icon: this.factory.resolveIcon(action.icon ?? "print"),
        command: action.onAction,
      });
    }

    const listActions: UiAction[] = [];
    const multipleSelectActions: UiAction[] = [];

    if (auth.authorizedActions?.length) {
      multipleSelectActions.push(
        ...auth.authorizedActions
          .filter(
            (action: ModuleAction) =>
              action.actionModes === 4 &&
              action.promptType === "MULTIPLE_SELECT",
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
      );
      listActions.push(
        ...auth.authorizedActions
          .filter(
            (action: ModuleAction) =>
              action.actionModes === 4 &&
              action.promptType !== "MULTIPLE_SELECT",
          )
          .map((action: ModuleAction) =>
            this.actionFactory.action(context, {
              id: `${action.actionName}-button`,
              name: action.actionName,
              icon: action.displayIcon,
              label: action.displayLabel,
              role: action.displayHint,
              executableExpression: action.executableExpression,
            }),
          ),
      );
    }

    if (auth.allowDelete) {
      multipleSelectActions.unshift({
        id: "delete-all-button",
        name: "deleteAll",
        role: `${UI_NAME}-delete-all-action`,
        label: $t("action.deleteAll"),
        icon: "fas fa-trash-alt",
        colorRole: "danger",
        onAction: () => this.actionFactory.deleteAll(context).onAction?.(),
      });
    }

    children.push(
      ...this.assembleMultipleSelectionButtons(context, multipleSelectActions),
    );

    if (
      customActions?.length &&
      (view === UiViewMany.SelectMany || selectionMode !== "multiple")
    ) {
      listActions.push(
        ...customActions
          .filter((action: UiAction) =>
            auth.authorizedActions?.some(
              (item: ModuleAction) => item.actionName === action.name,
            ),
          )
          .map((action: UiAction) =>
            this.actionFactory.action(context, action as any),
          ),
      );
    }

    moreItems.push(
      ...visibleActions(listActions).map((action) => ({
        label: action.label,
        icon: this.factory.resolveIcon(action.icon ?? action.name ?? ""),
        disabled: action.disabled,
        command: action.onAction,
      })),
    );
    if (moreItems.length) moreItems.push({ divider: true });
    moreItems.push(...this.listLayoutMenuItems(context));
    children.push(...this.assembleMoreButton(context, moreItems));

    return children;
  }

  private detailsViewActionButtons(context: UiContext): VNode[] {
    const runtime = context as any;
    const { model, customActions } = runtime;
    const auth = moduleAuth(context);
    const entityAuth = runtime.getModuleAuth?.(model) ?? auth;
    const children: VNode[] = [
      this.toolbarActionButton(context, this.actionFactory.back(context)),
    ];
    const moreItems: any[] = [];
    if (!entityAuth) return children;

    if (entityAuth.allowEdit && model?.editable !== false) {
      children.push(
        this.toolbarActionButton(context, this.actionFactory.edit(context)),
      );
    }
    if (entityAuth.allowCreate) {
      children.push(
        this.toolbarActionButton(context, this.actionFactory.create(context)),
      );
    }
    if (entityAuth.allowDelete && model?.deletable !== false) {
      children.push(
        this.toolbarActionButton(context, this.actionFactory.delete(context)),
      );
    }
    if (model?.actions?.length) {
      children.push(
        ...model.actions.map((action: any) =>
          this.toolbarActionButton(
            context,
            this.actionFactory.action(context, action as any),
            {
              id: `${action.name ?? action.actionName}-button`,
            },
          ),
        ),
      );
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
              this.actionFactory.action(context, action as any),
              {
                id: `${action.name}-button`,
              },
            ),
          ),
      );
    }
    if (entityAuth.allowPrint) {
      const action = this.actionFactory.print(context);
      moreItems.push({
        label: action.label,
        icon: this.factory.resolveIcon(action.icon ?? "print"),
        command: action.onAction,
      });
    }
    if (entityAuth.allowExport) {
      moreItems.push(this.importOrExportMenuItem(context, "export"));
    }
    if (entityAuth.allowImport) {
      moreItems.push(this.importOrExportMenuItem(context, "import"));
    }
    children.push(...this.assembleMoreButton(context, moreItems));
    return children;
  }

  private editViewActionButtons(context: UiContext): VNode[] {
    const runtime = context as any;
    const { customActions } = runtime;
    const auth = moduleAuth(context);
    const children: VNode[] = [
      this.toolbarActionButton(context, this.actionFactory.back(context)),
    ];
    if (auth?.allowImport) {
      children.push(
        this.buildImportOrExportAction(context, { role: "import" }),
      );
    }
    children.push(
      this.toolbarActionButton(context, {
        ...this.actionFactory.save(context),
        disabled: runtime.uploading?.value,
      }),
    );
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
              this.actionFactory.action(context, action as any),
              {
                id: `${action.name}-button`,
              },
            ),
          ),
      );
    }
    return children;
  }

  private toolbarActionButtons(context: UiContext): VNode[] {
    const runtime = context as any;
    if (runtime.many) return this.indexViewActionButtons(context);
    if (runtime.editing) return this.editViewActionButtons(context);
    return this.detailsViewActionButtons(context);
  }

  buildModuleToolbar(
    context: UiContext,
    props: ModuleToolbarProps,
    slots?: UiSlots,
  ) {
    return renderModuleToolbar.call(this as any, context, props, slots);
  }

  buildSearchField(field: UiSearchField, _context: UiContext, props: PropData) {
    return renderSearchField(field, _context, props);
  }

  buildSearchForm(context: UiContext, props?: PropData) {
    return renderSearchForm(context, props);
  }

  buildModuleSearchbar(context: UiContext, props: ModuleSearchbarProps) {
    return renderModuleSearchbar.call(this, context, props);
  }

  buildSearchForRelative(
    context: UiContext,
    field: MetaUiField,
    props: SearchForRelativeProps,
  ) {
    const reference = field.reference
    const refFlds = reference?.refFlds?.length
      ? reference.refFlds
      : ['value', 'text']
    // valueField / labelField = EJ2 fields.value / fields.text（属性名）
    const valueField =
      (props as any).valueField ??
      (props.dataKey as string) ??
      refFlds[0] ??
      'value'
    const labelField =
      (props as any).labelField ??
      (typeof props.optionLabel === 'string' ? props.optionLabel : null) ??
      refFlds[1] ??
      valueField
    const options = (props.options as any[]) ?? []
    const current = props.modelValue
    const selectedValue =
      current != null && typeof current === 'object'
        ? (reference?.valueOf(current) ?? current?.[valueField])
        : typeof current === 'object'
          ? null
          : current

    /** 保证 options 上有 labelField，供 EJ2 fields.text 读取（元数据标签字段名可能与实体字段不完全一致）。 */
    const resolveLabel = (item: any): string => {
      if (item == null || typeof item !== 'object') return ''
      const direct = item[labelField]
      if (direct != null && String(direct) !== '' && String(direct) !== 'undefined') {
        return String(direct)
      }
      const fromRef = reference?.labelOf?.(item)
      if (fromRef != null && String(fromRef) !== '' && String(fromRef) !== 'undefined') {
        return String(fromRef)
      }
      for (const key of [refFlds[1], 'categoryName', 'name', 'label', 'text']) {
        if (!key) continue
        const v = item[key]
        if (v != null && String(v) !== '' && String(v) !== 'undefined') return String(v)
      }
      return ''
    }
    const withLabel = (item: any) => {
      if (!item || typeof item !== 'object') return item
      const label = resolveLabel(item)
      if (label && item[labelField] !== label) item[labelField] = label
      return item
    }

    const selectedText =
      current != null && typeof current === 'object' ? resolveLabel(current) : ''

    const comboOptions = (
      current != null &&
      typeof current === 'object' &&
      !options.some(
        (option) =>
          (reference?.valueOf(option) ?? option?.[valueField]) ===
          selectedValue,
      )
        ? [current, ...options]
        : options
    ).map(withLabel)

    let ej2: any = null
    let pendingFilterArgs: any = null

    // 输入联想：防抖后远程查选项，再回填 ComboBox 下拉（勿触发 Vue 重渲染）
    const runRemoteFilter = debounce(async (text: string) => {
      try {
        await (context as any).searchRelative?.(field, text)
      } catch (error) {
        console.error(error)
      }
      const next = (context.getFieldOptions(field).selectOptions ?? []).map(
        withLabel,
      )
      try {
        pendingFilterArgs?.updateData?.(next)
        if (ej2 && !ej2.isDestroyed && Array.isArray(next)) {
          ej2.dataSource = next
        }
      } catch (error) {
        console.error(error)
      }
    }, 400)

    const openPickDialog = async (event?: Event) => {
      event?.preventDefault?.()
      event?.stopPropagation?.()
      try {
        if (typeof props.toSearch === 'function') {
          await props.toSearch(event as Event)
        } else {
          await (context as any).pickRelative?.(field)
        }
      } catch (error) {
        console.error(error)
        context.uiBuilder?.toast?.(context, {
          severity: 'error',
          summary: context.translate?.('dialog.title.error') ?? '错误',
          detail: error instanceof Error ? error.message : String(error),
          group: 'br',
          life: 3000,
        })
      }
    }

    /** 对齐老 SearchBox：下拉箭头换成放大镜，点击打开选择对话框（不是再挂一个按钮）。 */
    const bindSearchIcon = () => {
      const root =
        ej2?.inputWrapper?.container ??
        ej2?.overAllWrapper ??
        ej2?.element?.closest?.('.e-input-group') ??
        ej2?.element?.parentElement
      const icon = root?.querySelector?.(
        '.e-input-group-icon.e-ddl-icon, .e-ddl-icon',
      ) as HTMLElement | null
      if (!icon || icon.dataset.mmdaSearchBound === '1') return
      icon.dataset.mmdaSearchBound = '1'
      icon.className = 'e-input-group-icon e-icons e-search mmda-sf-search-pick'
      icon.setAttribute(
        'title',
        context.translate?.('action.search') ?? '搜索',
      )
      icon.setAttribute('aria-label', icon.getAttribute('title') ?? '搜索')
      icon.addEventListener(
        'mousedown',
        (event: MouseEvent) => {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          void openPickDialog(event)
        },
        true,
      )
    }

    const comboValue =
      selectedValue === 0 || selectedValue === '0' ? null : selectedValue

    return h(
      ComboBoxComponent as any,
      {
        // 稳定 key：输入过滤时不能重挂，否则 EJ2 filtering 中途 vnode 被拆掉
        key: `mmda-search-${field.fieldName}`,
        dataSource: comboOptions,
        fields: { text: labelField, value: valueField },
        value: comboValue,
        text: selectedText || null,
        allowFiltering: true,
        allowCustom: false,
        showClearButton: props.showClear !== false && field.nullable,
        placeholder:
          props.placeholder ??
          context.translate?.('action.select') ??
          '请选择',
        cssClass: [
          'mmda-sf-search-combo',
          props.invalid ? 'e-error' : '',
        ]
          .filter(Boolean)
          .join(' '),
        ref: (comp: any) => {
          ej2 = comp?.ej2Instances ?? comp ?? null
        },
        created: () => {
          queueMicrotask(bindSearchIcon)
          setTimeout(bindSearchIcon, 0)
        },
        filtering: (args: any) => {
          // 关闭本地过滤，改走远程 searchRelative（与老 AutoComplete 一致）
          args.preventDefaultAction = true
          pendingFilterArgs = args
          const text = String(args?.text ?? '').trim()
          if (!text) {
            args.updateData?.(
              (context.getFieldOptions(field).selectOptions ?? []).map(
                withLabel,
              ),
            )
            return
          }
          runRemoteFilter(text)
        },
        change: (args: any) => {
          const value = args?.value
          // 优先用 selectOptions 完整对象，勿把 EJ2 残缺 itemData 写回模型
          const item =
            context
              .getFieldOptions(field)
              .selectOptions.find(
                (option: any) =>
                  (reference?.valueOf(option) ?? option?.[valueField]) ===
                  value,
              ) ??
            (args?.itemData &&
            (reference?.valueOf(args.itemData) ??
              args.itemData?.[valueField]) != null
              ? args.itemData
              : null)
          props.onChange?.(item)
        },
      },
    )
  }

  buildGanttView(_context: UiContext, props: UiGanttViewProps) {
    return renderGanttView(_context, props);
  }

  buildGanttChart(context: UiContext, props: UiGanttChartProps) {
    return this.buildGanttView(context, props);
  }

  buildBpmnDiagram(flowTrails: any[], _context: UiContext, props: PropData = {}) {
    return renderBpmnDiagram(flowTrails, _context, props);
  }

  buildQrcode(value: string, props: PropData = {}) {
    return renderQrcode(value, props);
  }

  buildBarcode(value: string, props: PropData = {}) {
    return renderBarcode(value, props);
  }

  buildSigninForm(props: SigninFormProps, slots?: SigninFormSlots) {
    return renderSigninForm(props, slots);
  }

  buildSignupForm(props: SignupFormProps) {
    return renderSignupForm(props);
  }
}
