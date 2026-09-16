import {
  h,
  reactive,
  ref,
  unref,
  watch,
  type VNode,
  type VNodeArrayChildren,
} from "vue";
import { debounce, uiCssClass, type MetaUiField, type MetaUiGroup, type Module } from "@mmda/core";
import { VueUiBuilder, GroupCard, canDeleteNamedQuery, deleteNamedQuery, indexTableMetaUi, listFixedFilterFieldNames, promptSaveNamedQuery, writeListFilterModel, pageLayoutMenuItems, type AppScaffoldProps, type AppSideBarProps, type AppTopBarProps, type ImportAndExportActionProps, type MmdaFontScale, type ModuleSearchbarProps, type ModuleToolbarProps, type SyncfusionUiFactory, type UiProps, type SearchForRelativeProps, type SigninFormProps, type SigninFormSlots, type SignupFormProps, type UiFieldFactory, type UiSearchField, type UiSlots, type UiViewContext } from "@mmda/vui"
import { ComboBoxComponent } from "@syncfusion/ej2-vue-dropdowns";
import { SfGridFilterBar } from "../components/SfGridFilterBar";
import { SfOverlayHost } from "../components/SfOverlayHost";
import { createSyncfusionOverlay } from "../syncfusion_overlay";
import { SfAttachmentPanel } from "../components/SfAttachmentPanel";
import { createSyncfusionFieldFactory } from "../syncfusion_field_factory";
import { createSyncfusionUiFactory, autoFitSyncfusionListGrid } from "../syncfusion_factory";
import { syncfusionLayout } from "../syncfusion_layout";

import {
  invoke,
  type UiContext,
} from "./utils";
import { buildImportOrExportAction as renderImportOrExportAction } from "./import_export";
import {
  buildModuleSearchbar as renderModuleSearchbar,
  buildSearchField as renderSearchField,
} from "./module_bar";
import { SfIndexToolBar } from "../components/SfIndexToolBar";
import { SfDetailsToolBar } from "../components/SfDetailsToolBar";
import { SfEditToolBar } from "../components/SfEditToolBar";
import {
  buildBpmnDiagram as renderBpmnDiagram,
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
  renderMain,
} from "./shell";
import { refreshSyncfusionSkin } from "../syncfusion_skin";

export class SyncfusionUiBuilder extends VueUiBuilder {
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

  override setFontScale(scale: MmdaFontScale) {
    super.setFontScale(scale);
    refreshSyncfusionSkin();
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
    } = props;
    return h(
      GroupCard,
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
            h("div", { class: ["e-card-header-title", uiCssClass("group", "title")] }, title),
          ]),
        // Card 只做壳；字段/表格布局由 .mmda-group__content 管
        default: () => this.wrapGroupContent(body),
        actions: headerActions ? () => headerActions : undefined,
      },
    );
  }

  override buildAttachmentGroup(
    context: UiViewContext<any>,
    props: UiProps = {},
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
          class: uiCssClass("group", "action"),
          onClick: () => panel.value?.choose(),
        }),
      },
    );
  }

  buildContainer(content: VNode | VNodeArrayChildren, props?: UiProps) {
    return renderContainer(content, props);
  }

  buildHeader(content: VNode | VNodeArrayChildren, props?: UiProps) {
    return renderHeader(content, props);
  }

  buildAside(content: VNode | VNodeArrayChildren, props?: UiProps) {
    return renderAside(content, props);
  }

  buildMain(content: VNode | VNodeArrayChildren, props?: UiProps) {
    return renderMain(content, props);
  }

  buildFooter(content: VNode | VNodeArrayChildren, props?: UiProps) {
    return renderFooter(content, props);
  }

  buildAppTopBar(props: AppTopBarProps = { modules: [], logo: () => null }) {
    const items = props.modules.map((module) => ({
      label: module.moduleName ?? module.moduleLabel,
      url: module.moduleUrl ?? (module as any).url,
    }));
    return h("div", { class: "mmda-topbar" }, [
      h("div", { class: "mmda-topbar__start" }, [
        invoke(props.logo),
        this.factory.menubar(items),
      ]),
      h("div", { class: "mmda-topbar__end" }, invoke(props.actions)),
    ]);
  }

  /**
   * 兼容旧调用；真源是 SyncfusionLayout.scaffold（AppShell 直接调 layout）。
   * sidebarLeft：nav 与 .mmda-app-page.e-main-content 为兄弟（EJ2 Push / Pad compact）。
   */
  override buildAppScaffold(props: AppScaffoldProps = {}) {
    const variant =
      props.layout ?? (props.model === "Mobile" ? "topBarFull" : "sidebarLeft");
    return this.layout.scaffold({
      variant,
      topBar: invoke(props.topBar) as VNode | undefined,
      nav: invoke(props.sideBar) as VNode | undefined,
      page: invoke(props.body) as VNode | undefined,
      bottomBar: invoke(props.bottomBar) as VNode | undefined,
    });
  }

  buildAppSideBar(
    props: AppSideBarProps = { modules: [], header: () => null },
  ) {
    return this.buildAppSideMenu({
      modules: props.modules,
      logo: props.header,
      footer: props.footer,
    });
  }

  buildAppSideMenu(props: import("@mmda/core").UiAppSideMenuProps<VNode> = {}) {
    return renderAppMenu(props.modules ?? [], props);
  }

  buildAppMenu(modules: Module[], props?: UiProps) {
    return this.buildAppSideMenu({ modules, ...props });
  }

  buildLoading(_context: UiContext, props?: UiProps) {
    return this.factory.loading(props);
  }

  buildError(context: UiContext, props?: UiProps) {
    return renderError(context, props);
  }

  buildImportOrExportAction(
    context: UiContext,
    props: ImportAndExportActionProps,
  ): VNode {
    return renderImportOrExportAction.call(this as any, context, props);
  }

  private listLayoutMenuItems(context: UiContext) {
    return [
      {
        name: "autoFitColumns",
        label: context.t("action.autoFitColumns"),
        icon: this.factory.resolveIcon("auto-fit-columns"),
        onAction: () => void autoFitSyncfusionListGrid(context),
      },
      {
        name: "tableSettings",
        label: context.t("action.tableSettings"),
        icon: this.factory.resolveIcon("settings"),
        onAction: () => void this.openTableSettings(context),
      },
    ];
  }

  buildIndexToolbar(
    context: UiContext,
    props?: ModuleToolbarProps,
    slots?: UiSlots,
  ) {
    return h(SfIndexToolBar, {
      builder: this,
      context,
      toolbarProps: props ?? {},
      slots,
      extraMore: this.listLayoutMenuItems(context),
    });
  }

  buildDetailsToolbar(
    context: UiContext,
    props?: ModuleToolbarProps,
    slots?: UiSlots,
  ) {
    return h(SfDetailsToolBar, {
      builder: this,
      context,
      toolbarProps: props ?? {},
      slots,
      extraMore: pageLayoutMenuItems(context as any).map((item) =>
        item.divider
          ? item
          : {
              ...item,
              icon: this.factory.resolveIcon(item.icon ?? "page-layout"),
              onAction: item.onAction ?? item.command,
            },
      ),
    });
  }

  buildEditToolbar(
    context: UiContext,
    props?: ModuleToolbarProps,
    slots?: UiSlots,
  ) {
    return h(SfEditToolBar, {
      builder: this,
      context,
      toolbarProps: props ?? {},
      slots,
    });
  }

  buildSearchField(field: UiSearchField, _context: UiContext, props: UiProps) {
    return renderSearchField(field, _context, props);
  }

  buildModuleSearchbar(context: UiContext, props: ModuleSearchbarProps) {
    return renderModuleSearchbar.call(this, context, props);
  }

  override buildFilterBar(context: UiContext, props?: Record<string, unknown>) {
    const extra = (props as { chips?: () => unknown })?.chips?.();
    const extraNodes =
      extra == null ? [] : Array.isArray(extra) ? extra : [extra];
    const runtime = context as any;
    return h(SfGridFilterBar, {
      filterModel: runtime.searchParam?.filterModel,
      metaUi: indexTableMetaUi(runtime),
      labels: {
        filter: context.t("action.filter"),
        all: context.t("action.all"),
        clearFilters: context.t("action.clearFilters"),
        saveQuery: context.t("action.saveQuery"),
        deleteQuery: context.t("action.deleteQuery"),
      },
      t: (key: string) => context.t(key),
      chips: (chipProps: Record<string, unknown>) =>
        this.factory.chips?.(chipProps as any),
      button: (btnProps: Record<string, unknown>) =>
        this.factory.button(btnProps as any),
      resolveIcon: (icon: string) => this.factory.resolveIcon(icon),
      skipFields: listFixedFilterFieldNames(runtime),
      extra: extraNodes,
      queryID: runtime.searchParam?.queryID,
      canDeleteQuery: canDeleteNamedQuery({
        predifined: runtime.searchParam?.queryPredifined,
        queryID: runtime.searchParam?.queryID,
      }),
      onFilterModelChange: (model) => {
        writeListFilterModel(runtime.searchParam, model);
        delete runtime.searchParam.queryID;
        delete runtime.searchParam.queryName;
        return runtime.search?.();
      },
      onSaveQuery: () => void promptSaveNamedQuery(runtime, this.factory),
      onDeleteQuery: () =>
        void deleteNamedQuery(runtime, {
          queryID: runtime.searchParam.queryID,
          queryName: runtime.searchParam.queryName,
          predifined: runtime.searchParam.queryPredifined,
        }),
    });
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
          await (context as any).select(field)
        }
      } catch (error) {
        console.error(error)
        context.uiBuilder?.toast?.(context, {
          severity: 'error',
          title: context.translate?.('dialog.title.error') ?? '错误',
          message: error instanceof Error ? error.message : String(error),
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
      icon.className = 'e-input-group-icon e-icons e-search mmda-search-pick'
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
          'mmda-search-combo',
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

  buildBpmnDiagram(flowTrails: any[], _context: UiContext, props: UiProps = {}) {
    return renderBpmnDiagram(flowTrails, _context, props);
  }

  buildSigninForm(props: SigninFormProps, slots?: SigninFormSlots) {
    return renderSigninForm(props, slots);
  }

  buildSignupForm(props: SignupFormProps) {
    return renderSignupForm(props);
  }
}
