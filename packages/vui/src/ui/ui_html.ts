import {
  h,
  reactive,
  render,
  unref,
  type VNode,
  type VNodeArrayChildren,
} from "vue";
import {
  getFieldSearchOps,
  SqlDataType,
  type EntityFieldFilter,
  type EntityFilterModel,
  type MetaUi,
  type MetaUiField,
  type Module,
  type Pagination,
} from "@mmda/core";
import { AbstractUiBuilder } from "./ui_builder";
import type { UiViewContext } from "./ui_context";
import type {
  SigninFormProps,
  SigninFormSlots,
  SignupFormProps,
} from "./ui_auth";
import type {
  AppScaffoldProps,
  AppSideBarProps,
  AppTopBarProps,
  ModuleBreadcrumbProps,
  ModuleSearchbarProps,
  ModuleToolbarProps,
} from "./ui_app";
import type { UiAction } from "./ui_action";
import type {
  UiDialogPropsType,
  UiMessageBoxProps,
  UiMessageBoxResult,
  UiNotificationProps,
} from "./ui_dialog";
import type { UiFactory, UiFieldFactory } from "./ui_factory";
import type { PropData, UiLayout, UiSlots } from "./ui_layout";
import type { UiListPropsType, UiPaginatorPropsType } from "./ui_list";
import type { SearchForRelativeProps, UiSearchField } from "./ui_filter";

type UiContext = UiViewContext<any>;

const invoke = (value: unknown): any =>
  typeof value === "function" ? (value as () => unknown)() : value;

export const htmlLayout: UiLayout = {
  fieldLayout: "vertical",
  fieldMessage: true,
  wrapManyGroup: true,
  maxCols: 12,
  cell: (child, nCol = 1) =>
    h(
      "div",
      { class: "mmda-cell", style: { gridColumn: `span ${nCol}` } },
      child as any,
    ),
  row: (children, nCols, props = {}) =>
    h(
      "div",
      {
        class: "mmda-row",
        style: {
          display: "grid",
          gridTemplateColumns: nCols.map((n) => `${n}fr`).join(" "),
          gap: "0.75rem",
        },
        ...props,
      },
      children,
    ),
  column: (children, props = {}) =>
    h(
      "div",
      {
        class: "mmda-column",
        style: { display: "flex", flexDirection: "column", gap: "0.75rem" },
        ...props,
      },
      children,
    ),
  grid: (children, _nCols, props = {}) =>
    h(
      "div",
      {
        class: "mmda-grid",
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
          gap: "0.75rem",
        },
        ...props,
      },
      children,
    ),
  listTile: (slots) =>
    h("div", { class: "mmda-list-tile" }, [
      slots.leading?.(),
      h("div", [slots.title(), slots.subtitle?.()]),
      slots.trailing?.(),
    ]),
};

const listedFields = (metaui: MetaUi) => {
  const listed = metaui.getListedFields();
  return listed.length
    ? listed
    : metaui.groups.filter((g) => !g.many).flatMap((g) => g.fields);
};

export function createHtmlUiFactory(layout: UiLayout = htmlLayout): UiFactory {
  const button = (props: any, slots?: any) =>
    h(
      "button",
      {
        type: props.type ?? "button",
        title: props.tooltip,
        disabled: props.disabled === true || props.loading,
        class: ["mmda-button", props.colorRole && `is-${props.colorRole}`],
        onClick: props.onClick ?? props.onAction ?? props.command,
      },
      slots?.default?.() ?? [
        props.icon && h("span", { class: ["mmda-icon", props.icon] }),
        props.label,
      ],
    );

  const table = <T>(model: T[], metaui: MetaUi, props: UiListPropsType<T>) => {
    const fields = listedFields(metaui);
    const selected = [...((props as any).selectedItems ?? [])] as T[];
    const columnFilter = (field: MetaUiField) => {
      const filterModel = (props.filterModel ?? {}) as EntityFilterModel;
      const current = filterModel[field.fieldName];
      const availableOps = getFieldSearchOps(field);
      let operator =
        current && "operator" in current
          ? current.operator
          : (availableOps[0]?.name ?? "EQ");
      let value =
        current?.filterType === "set"
          ? current.values
          : current && "value" in current
            ? current.value
            : undefined;
      let valueTo =
        current && "valueTo" in current ? current.valueTo : undefined;

      const apply = (filter?: EntityFieldFilter) => {
        const next = { ...filterModel };
        if (filter) next[field.fieldName] = filter;
        else delete next[field.fieldName];
        props.onFilterModelChange?.(next);
      };
      const editor = field.reference?.isEnum
        ? h(
            "select",
            {
              multiple: true,
              value: current?.filterType === "set" ? current.values : [],
              onChange: (event: Event) => {
                value = Array.from(
                  (event.target as HTMLSelectElement).selectedOptions,
                ).map((option) => option.value);
              },
            },
            (field.reference.refOptions ?? []).map((option: any) =>
              h(
                "option",
                { value: field.reference!.valueOf(option) },
                field.reference!.labelOf(option),
              ),
            ),
          )
        : SqlDataType.isBool(field.dataType)
          ? h(
              "select",
              {
                value:
                  current?.filterType === "boolean"
                    ? String(current.value)
                    : "",
                onChange: (event: Event) => {
                  const raw = (event.target as HTMLSelectElement).value;
                  value = raw === "" ? null : raw === "true";
                },
              },
              [
                h("option", { value: "" }, props.filterLabels?.all ?? "All"),
                h(
                  "option",
                  { value: "true" },
                  props.filterLabels?.yes ?? "Yes",
                ),
                h("option", { value: "false" }, props.filterLabels?.no ?? "No"),
              ],
            )
          : h("div", [
              h(
                "select",
                {
                  value: operator,
                  onChange: (event: Event) => {
                    const select = event.target as HTMLSelectElement;
                    operator = select.value;
                    const parent = select.parentElement;
                    const noValue = [
                      "IS_NULL",
                      "IS_NOT_NULL",
                      "IS_ALL",
                    ].includes(operator);
                    const valueInput =
                      parent?.querySelector<HTMLInputElement>(
                        ".mmda-filter-value",
                      );
                    const valueToInput =
                      parent?.querySelector<HTMLInputElement>(
                        ".mmda-filter-value-to",
                      );
                    if (valueInput) valueInput.hidden = noValue;
                    if (valueToInput) {
                      valueToInput.hidden = operator !== "BETWEEN";
                    }
                  },
                },
                availableOps.map((op) =>
                  h("option", { value: op.name }, op.label ?? op.name),
                ),
              ),
              h("input", {
                class: "mmda-filter-value",
                hidden: ["IS_NULL", "IS_NOT_NULL", "IS_ALL"].includes(operator),
                type: SqlDataType.isDate(field.dataType)
                  ? "date"
                  : SqlDataType.isNum(field.dataType)
                    ? "number"
                    : "text",
                value: value ?? "",
                onInput: (event: Event) => {
                  value = (event.target as HTMLInputElement).value;
                },
              }),
              h("input", {
                class: "mmda-filter-value-to",
                hidden: operator !== "BETWEEN",
                type: SqlDataType.isDate(field.dataType) ? "date" : "number",
                value: valueTo ?? "",
                onInput: (event: Event) => {
                  valueTo = (event.target as HTMLInputElement).value;
                },
              }),
            ]);

      return h("details", { class: "mmda-column-filter" }, [
        h("summary", { title: field.displayLabel }, "⌄"),
        editor,
        h(
          "button",
          {
            type: "button",
            onClick: () => {
              if (field.reference?.isEnum) {
                apply({ filterType: "set", values: value as unknown[] });
              } else if (SqlDataType.isBool(field.dataType)) {
                apply(
                  value == null
                    ? undefined
                    : { filterType: "boolean", value: Boolean(value) },
                );
              } else {
                apply({
                  filterType: SqlDataType.isDate(field.dataType)
                    ? "date"
                    : SqlDataType.isNum(field.dataType)
                      ? "number"
                      : "text",
                  operator: operator as any,
                  value,
                  valueTo,
                });
              }
            },
          },
          props.filterLabels?.apply ?? "Apply",
        ),
        h(
          "button",
          { type: "button", onClick: () => apply(undefined) },
          props.filterLabels?.clear ?? "Clear",
        ),
      ]);
    };
    return h("table", { class: "mmda-table" }, [
      h("thead", [
        h("tr", [
          props.selectionMode && h("th"),
          ...fields.map((field) => h("th", field.displayLabel)),
        ]),
        props.filterDisplay !== "none" &&
          h("tr", { class: "mmda-column-filters" }, [
            props.selectionMode && h("th"),
            ...fields.map((field) => h("th", columnFilter(field))),
          ]),
      ]),
      h(
        "tbody",
        model.length
          ? model.map((row: any, index) =>
              h(
                "tr",
                {
                  key: props.itemKey?.(row) ?? row.id ?? row.rowNum ?? index,
                  onClick: () => props.onItemClick?.(row),
                  onDblclick: () => props.onItemDoubleClick?.(row),
                },
                [
                  props.selectionMode &&
                    h("td", [
                      h("input", {
                        type:
                          props.selectionMode === "single"
                            ? "radio"
                            : "checkbox",
                        name:
                          props.selectionMode === "single"
                            ? `${metaui.objName}-selection`
                            : undefined,
                        onChange: (event: Event) => {
                          const checked = (event.target as HTMLInputElement)
                            .checked;
                          if (props.selectionMode === "single") {
                            selected.splice(
                              0,
                              selected.length,
                              ...(checked ? [row] : []),
                            );
                          } else {
                            const index = selected.indexOf(row);
                            if (checked && index < 0) selected.push(row);
                            if (!checked && index >= 0)
                              selected.splice(index, 1);
                          }
                          props.onSelect?.([...selected], row);
                        },
                      }),
                    ]),
                  ...fields.map((field) =>
                    h(
                      "td",
                      props.renderCell
                        ? [props.renderCell(field, row, props)]
                        : props.customCellRenderers?.[field.fieldName]
                          ? [
                              props.customCellRenderers[field.fieldName](
                                field,
                                row,
                              ),
                            ]
                          : String(row[field.fieldName] ?? ""),
                    ),
                  ),
                ],
              ),
            )
          : [h("tr", [h("td", { colspan: fields.length + 1 }, "No data")])],
      ),
    ]);
  };

  return {
    layout,
    actionIcons: {},
    viewIcons: {},
    dialogIcons: {},
    resolveIcon: (icon) => icon,
    textSpan: (text, props) => h("span", props, text),
    label: (text, props) => h("label", props, text),
    image: (src, props) => h("img", { src, ...props }),
    icon: (icon, props) => h("span", { class: ["mmda-icon", icon], ...props }),
    title: (text, props) => h("h1", props, text),
    subtitle: (text, props) => h("h2", props, text),
    link: (props, slots) =>
      h(
        "a",
        props,
        slots?.default?.() ?? props.text ?? String(props.href ?? ""),
      ),
    input: (value, props = {}) =>
      h("input", {
        value: props.modelValue ?? value,
        ...props,
        onInput: (event: Event) =>
          props["onUpdate:modelValue"]?.(
            (event.target as HTMLInputElement).value,
          ),
      }),
    iconField: (value, props) => h("span", props, value),
    dropdown: (value, props = {}) =>
      h(
        "select",
        {
          value: props.modelValue ?? value,
          onChange: (event: Event) =>
            props["onUpdate:modelValue"]?.(
              (event.target as HTMLSelectElement).value,
            ),
        },
        (props.options ?? []).map((option: any) =>
          h(
            "option",
            { value: option[props.optionValue ?? "id"] },
            option[props.optionLabel ?? "label"],
          ),
        ),
      ),
    button,
    buttonGroup: (buttons, props) => h("div", props, buttons()),
    splitButton: (props, slots) => button(props, slots),
    menuButton: (props, actions) =>
      h("div", [
        button(props),
        h(
          "div",
          actions.map((action) => button(action)),
        ),
      ]),
    floatingActionButton: (props) => button(props),
    selectButton: (value, props) =>
      button({ ...props, label: String(value ?? props.label ?? "") }),
    actionButton: (action, _t, _resolve, props) =>
      button({ ...action, ...props, onClick: action.onAction }),
    paginator: (pagination: Pagination, props: UiPaginatorPropsType) => {
      const pageNo = pagination.pageNo ?? 1;
      const pageSize = pagination.pageSize ?? 10;
      const pageCount = Math.max(
        1,
        Math.ceil((pagination.recordCount ?? 0) / pageSize),
      );
      return h("nav", { class: "mmda-paginator" }, [
        button({
          label: "‹",
          disabled: pageNo <= 1,
          onClick: () => props.onPage({ pageNo: pageNo - 1, pageSize }),
        }),
        h("span", `${pageNo} / ${pageCount}`),
        button({
          label: "›",
          disabled: pageNo >= pageCount,
          onClick: () => props.onPage({ pageNo: pageNo + 1, pageSize }),
        }),
      ]);
    },
    list: <T>(model: T[], metaui: MetaUi, props: UiListPropsType<T>) =>
      h(
        "ul",
        { class: "mmda-list" },
        model.map((item, index) =>
          h(
            "li",
            {
              onClick: () => props.onItemClick?.(item),
              onDblclick: () => props.onItemDoubleClick?.(item),
            },
            (props.item?.(item, index) ??
              String(
                (item as any)[metaui.labelField ?? metaui.primaryKey] ?? "",
              )) as any,
          ),
        ),
      ),
    table,
    pagableTable: (loader, metadata, props) =>
      table(loader.model.list as any[], metadata.metaui, props as any),
    loading: (props) =>
      h("div", { class: "mmda-loading", ...props }, "Loading…"),
    scrollbar: (content, props) =>
      h("div", { style: { overflow: "auto" }, ...props }, content as any),
  } as UiFactory;
}

export function createHtmlFieldFactory(): UiFieldFactory {
  const fallbackDisplay = (
    field: MetaUiField,
    context: UiContext,
    props: PropData = {},
  ) =>
    h(
      "output",
      { class: "mmda-field-display", ...props },
      String(context.displayField(field, props.row) ?? ""),
    );

  const fallbackInput = (
    field: MetaUiField,
    context: UiContext,
    props = {},
  ) => {
    const value = context.getFieldValue(field);
    const isBool = SqlDataType.isBool(field.dataType);
    const isNumber = SqlDataType.isNum(field.dataType);
    const input = field.reference?.refOptions?.length
      ? h(
          "select",
          {
            value: field.reference.valueOf(value),
            disabled: context.isFieldReadonly(field),
            onChange: (event: Event) => {
              const selected = field.reference!.refOptions.find(
                (option) =>
                  String(field.reference!.valueOf(option)) ===
                  (event.target as HTMLSelectElement).value,
              );
              context.setFieldValue(field, selected);
            },
          },
          field.reference.refOptions.map((option) =>
            h(
              "option",
              { value: field.reference!.valueOf(option) },
              field.reference!.labelOf(option),
            ),
          ),
        )
      : h("input", {
          id: field.fieldName,
          name: field.fieldName,
          type: isBool ? "checkbox" : isNumber ? "number" : "text",
          value: isBool ? undefined : (value ?? ""),
          checked: isBool ? Boolean(value) : undefined,
          disabled: context.isFieldReadonly(field),
          required: context.isFieldRequired(field),
          onInput: (event: Event) => {
            const element = event.target as HTMLInputElement;
            context.setFieldValue(
              field,
              isBool
                ? element.checked
                : isNumber
                  ? element.valueAsNumber
                  : element.value,
            );
          },
        });
    return h("div", { class: "mmda-field-input", ...props }, input);
  };

  return { fallbackDisplay, fallbackInput };
}

export class HtmlUiBuilder extends AbstractUiBuilder {
  constructor(
    factory = createHtmlUiFactory(),
    fieldFactory = createHtmlFieldFactory(),
    layout = factory.layout,
  ) {
    super(factory, fieldFactory, layout);
  }

  buildContainer(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("div", { class: "mmda-container", ...props }, content);
  }

  buildHeader(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("header", props, content);
  }

  buildAside(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("aside", props, content);
  }

  buildMain(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("main", props, content);
  }

  buildFooter(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("footer", props, content);
  }

  buildAppScaffold(props: AppScaffoldProps = {}) {
    return super.buildAppScaffold(props);
  }

  buildAppTopBar(props: AppTopBarProps = { modules: [], logo: () => null }) {
    return h("header", { class: "mmda-app-topbar" }, [
      invoke(props.logo),
      h(
        "nav",
        props.modules.map((module) => h("span", module.moduleName)),
      ),
      invoke(props.actions),
    ]);
  }

  buildAppSideBar(
    props: AppSideBarProps = { modules: [], header: () => null },
  ) {
    return h("aside", { class: "mmda-app-sidebar" }, [
      invoke(props.header),
      this.buildAppMenu(props.modules),
      invoke(props.footer),
    ]);
  }

  buildAppMenu(modules: Module[], props?: PropData) {
    return h(
      "nav",
      props,
      modules.map((module) => h("a", { href: module.url }, module.moduleName)),
    );
  }

  buildLoading(_context: UiContext, props?: PropData) {
    return h("div", { class: "mmda-loading", ...props }, "Loading…");
  }

  buildError(context: UiContext, props?: PropData) {
    return h("div", { class: "mmda-error", ...props }, context.title);
  }

  buildModuleBreadcrumb(context: UiContext, props: ModuleBreadcrumbProps) {
    return h(
      "span",
      { class: "mmda-breadcrumb" },
      props.label || context.title,
    );
  }

  buildModuleToolbar(
    context: UiContext,
    props: ModuleToolbarProps,
    slots?: UiSlots,
  ) {
    const runtime = context as any;
    const defaults: UiAction[] =
      runtime.view === "index"
        ? [this.actionFactory.create(context)]
        : runtime.editing
          ? [
              this.actionFactory.save(context),
              this.actionFactory.cancel(context),
            ]
          : [
              this.actionFactory.edit(context),
              this.actionFactory.delete(context),
              this.actionFactory.back(context),
            ];
    const actions = [
      ...(runtime.customActions ?? []).map((action: any) =>
        this.actionFactory.action(context, action),
      ),
      ...(runtime.model?.actions ?? []).map((action: any) =>
        this.actionFactory.action(context, action),
      ),
    ];
    return h("div", { class: "mmda-toolbar" }, [
      props.showBreadcrumb !== false &&
        h("strong", null, (slots?.default?.() ?? context.title) as any),
      slots?.center &&
        h("div", { class: "mmda-toolbar-center" }, slots.center()),
      props.showActions !== false &&
        h(
          "div",
          { class: "mmda-toolbar-actions" },
          (actions.length ? actions : defaults)
            .filter((action) => action.visible == null || unref(action.visible))
            .map((action) =>
              this.factory.actionButton(action, (message) =>
                context.t(message),
              ),
            ),
        ),
    ]);
  }

  buildSearchField(field: UiSearchField, _context: UiContext, props: PropData) {
    return h("label", [
      field.field.displayLabel,
      h("input", {
        value: field.searchVal.value ?? "",
        ...props,
        onInput: (event: Event) => {
          field.searchVal.value = (event.target as HTMLInputElement).value;
        },
      }),
    ]);
  }

  buildSearchForm(context: UiContext, props?: PropData) {
    return h(
      "form",
      { ...props, onSubmit: (event: Event) => event.preventDefault() },
      ((context as any).searchFields ?? []).map((field: UiSearchField) =>
        this.buildSearchField(field, context, {}),
      ),
    );
  }

  buildModuleSearchbar(context: UiContext, props: ModuleSearchbarProps) {
    const runtime = context as any;
    const filters = (runtime.filters ?? []) as any[];
    const quickFilters = filters.map((filter) =>
      h(
        "div",
        {
          class: [
            "mmda-quick-filter",
            filter.metaUiFilter.fixed && "mmda-quick-filter-tabs",
          ],
          role: filter.metaUiFilter.fixed ? "tablist" : "group",
          "aria-label": filter.label,
        },
        [
          h("span", { class: "mmda-quick-filter-label" }, filter.label),
          ...filter.selectOptions.map((condition: any) => {
            const active = filter.selectedConditions.value.includes(condition);
            return h(
              "button",
              {
                type: "button",
                class: ["mmda-filter-option", active && "is-active"],
                role: filter.metaUiFilter.fixed ? "tab" : undefined,
                "aria-selected": filter.metaUiFilter.fixed ? active : undefined,
                "aria-pressed": filter.metaUiFilter.fixed ? undefined : active,
                onClick: () => {
                  runtime.toggleQuickFilter(
                    filter,
                    condition,
                    filter.metaUiFilter.fixed,
                  );
                  runtime.searchParam.pager.pageNo = 1;
                  void runtime.search?.();
                },
              },
              condition.displayLabel,
            );
          }),
        ],
      ),
    );
    const activeFilters = filters.flatMap((filter) =>
      filter.selectedConditions.value.map((condition: any) =>
        h(
          "button",
          {
            type: "button",
            class: "mmda-active-filter",
            onClick: () => {
              runtime.toggleQuickFilter(filter, condition);
              runtime.searchParam.pager.pageNo = 1;
              void runtime.search?.();
            },
          },
          `${filter.label}: ${condition.displayLabel} ×`,
        ),
      ),
    );
    return h(
      "form",
      {
        class: "mmda-searchbar",
        onSubmit: (event: Event) => {
          event.preventDefault();
          props.onSearch?.(runtime.searchParam?.searchWord ?? "");
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
        h("input", {
          type: "search",
          value: runtime.searchParam?.searchWord ?? "",
          placeholder: context.translate("action.search"),
          onInput: (event: Event) => {
            runtime.searchParam.searchWord = (
              event.target as HTMLInputElement
            ).value;
          },
        }),
        h("button", { type: "submit" }, context.translate("action.search")),
        (filters.length > 0 || runtime.searchFields?.length > 0) &&
          h(
            "button",
            {
              type: "button",
              onClick: () => void runtime.resetFilters?.(),
            },
            context.translate("action.reset"),
          ),
        activeFilters.length
          ? h("div", { class: "mmda-active-filters" }, activeFilters)
          : null,
      ],
    );
  }

  buildSearchForRelative(
    context: UiContext,
    field: MetaUiField,
    props: SearchForRelativeProps,
  ) {
    return h("div", { class: "mmda-relative-search" }, [
      h("input", {
        value: props.modelValue ?? "",
        onInput: (event: Event) =>
          props.onUpdate?.((event.target as HTMLInputElement).value),
      }),
      h(
        "button",
        {
          type: "button",
          onClick: () =>
            (context as any).searchRelative?.(field, props.modelValue),
        },
        context.translate("action.search"),
      ),
    ]);
  }

  buildSigninForm(props: SigninFormProps, slots?: SigninFormSlots) {
    const user = reactive({
      signinMode: props.mode ?? ("password" as const),
      username: "",
      password: "",
      agreed: true,
    });
    return h(
      "form",
      {
        onSubmit: (event: Event) => {
          event.preventDefault();
          props.onSubmit?.(user);
        },
      },
      [
        slots?.header?.(),
        h("input", {
          autocomplete: "username",
          onInput: (event: Event) =>
            (user.username = (event.target as HTMLInputElement).value),
        }),
        h("input", {
          type: "password",
          autocomplete: "current-password",
          onInput: (event: Event) =>
            (user.password = (event.target as HTMLInputElement).value),
        }),
        h("button", { type: "submit" }, "Sign in"),
      ],
    );
  }

  buildSignupForm(props: SignupFormProps) {
    const user = reactive({
      mobile: "",
      password: "",
      vcode: "",
      agreed: true,
    });
    return h(
      "form",
      {
        onSubmit: (event: Event) => {
          event.preventDefault();
          props.onSubmit?.(user);
        },
      },
      [
        h("input", {
          placeholder: "Mobile",
          onInput: (event: Event) =>
            (user.mobile = (event.target as HTMLInputElement).value),
        }),
        h("input", {
          type: "password",
          placeholder: "Password",
          onInput: (event: Event) =>
            (user.password = (event.target as HTMLInputElement).value),
        }),
        h("button", { type: "submit" }, "Sign up"),
      ],
    );
  }

  async toast(_context: UiContext, props: PropData) {
    if (typeof document === "undefined") return;
    const node = document.createElement("div");
    node.className = `mmda-toast is-${props.severity ?? "info"}`;
    node.textContent = props.detail ?? props.message ?? props.summary ?? "";
    document.body.append(node);
    setTimeout(() => node.remove(), props.life ?? 3000);
  }

  notify(props: UiNotificationProps) {
    if (typeof document === "undefined") return;
    const node = document.createElement("div");
    node.className = `mmda-notification is-${props.type}`;
    node.textContent = `${props.title}: ${String(props.message)}`;
    document.body.append(node);
    setTimeout(() => node.remove(), 3000);
  }

  confirm(_context: UiContext, props: UiMessageBoxProps): UiMessageBoxResult {
    if (typeof window === "undefined") return "no";
    return window.confirm(String(props.message ?? "Confirm?")) ? "yes" : "no";
  }

  async confirmMessage(context: UiContext, props: PropData) {
    return this.confirm(context, props as UiMessageBoxProps) === "yes";
  }

  confirmPopup(context: UiContext, props: PropData) {
    return this.confirmMessage(context, props);
  }

  confirmDialog(
    content: VNode,
    _context: UiContext,
    props: UiDialogPropsType,
  ): Promise<boolean> {
    if (typeof document === "undefined") return Promise.resolve(false);
    return new Promise((resolve) => {
      const host = document.createElement("div");
      document.body.append(host);
      const close = (accepted: boolean) => {
        render(null, host);
        host.remove();
        props.onClose?.();
        resolve(accepted);
      };
      const accept = async () => {
        if (props.accept && (await props.accept()) === false) return;
        props.onConfirm?.();
        close(true);
      };
      const reject = async () => {
        if (props.reject && (await props.reject()) === false) return;
        close(false);
      };
      render(
        h("div", { class: "mmda-dialog-backdrop" }, [
          h(
            "section",
            {
              class: "mmda-dialog",
              style: { width: props.width ?? "min(90vw, 60rem)" },
            },
            [
              h("header", props.title ?? props.name),
              h("main", [content]),
              h("footer", [
                h("button", { type: "button", onClick: reject }, "Cancel"),
                h("button", { type: "button", onClick: accept }, "OK"),
              ]),
            ],
          ),
        ]),
        host,
      );
      props.onOpen?.();
    });
  }
}
